import { ConflictException, Injectable } from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BcryptService } from '../common/services/bcrypt.service';
import { Admin } from './entities/admin.entity';
import { isSuperAdmin, Roles } from './enums/roles.enum';
import { Repository } from 'typeorm';
import { MailService } from '../common/services/mail.service';
import { RandomService } from '../common/services/random.service';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { TranslationKeys } from '../i18n/translation-keys';
import { MulterFile } from '../file-manager/types/file.types';
import { FileMetadata } from '../file-manager/classes/file-metadata';
import { FileStorageService } from '../file-manager/enums/file-storage-service.enum';
import { FileManagerService } from '../file-manager/file-manager.service';
import { ConfigService } from '@nestjs/config';
import { transformToDto } from '../common/util/transform.util';
import { AdminResponseDto } from './dto/admin-response.dto';
import { GenericRepository } from '../common/abstractions/generic-repository.repository';

@Injectable()
export class AdminsService extends GenericRepository<Admin> {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    private readonly bcryptService: BcryptService,
    private readonly mailService: MailService,
    private readonly randomService: RandomService,
    private readonly i18n: CustomI18nService,
    private readonly fileManagerService: FileManagerService,
    private readonly configService: ConfigService,
  ) {
    super(adminsRepository);
  }

  async findAll(query?: Record<string, any>) {
    const { data, pagination } = await super.paginate({
      query,
      allowedFields: {
        username: 'string',
        full_name: 'string',
        email: 'string',
        roles: { type: 'enum', enum: Roles },
      },
    });

    return {
      admins: data.map((admin) => transformToDto(AdminResponseDto, admin)),
      pagination,
    };
  }

  async findOne(id: string): Promise<Admin> {
    return super.get_one({ id });
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    // Check if the email or username already exists
    await this.checkForExistingAdmin(createAdminDto);

    // Hash the password
    createAdminDto.password = await this.bcryptService.hash(
      createAdminDto.password,
    );

    const verifyCode = this.randomService.getRandomNumericString(6);
    const admin = this.adminsRepository.create({
      ...createAdminDto,
      verify_code: verifyCode,
    });

    await this.mailService.sendMail({
      username: admin.username,
      to: admin.email,
      subject: 'Verification Code',
      text: `Your verification code is: ${verifyCode}`,
    });

    return this.adminsRepository.save(admin);
  }

  async update(id: string, updateAdminDto: UpdateAdminDto): Promise<Admin> {
    const {
      profile_image,
      cover_image,
      delete_profile_image,
      delete_cover_image,
      ...dto
    } = updateAdminDto;

    let admin = await super.get_one({ id });

    // Check if the target admin is a super admin
    if (isSuperAdmin(admin.roles)) {
      delete dto.roles;
    }

    try {
      const filesToSave: MulterFile[] = [];
      const filesToDelete: FileMetadata[] = [];
      if (cover_image) {
        filesToSave.push(cover_image);
      }
      if ((cover_image || delete_cover_image) && admin.cover_image) {
        filesToDelete.push(admin.cover_image);
        admin.cover_image = null;
      }

      if (profile_image) {
        filesToSave.push(profile_image);
      }
      if ((profile_image || delete_profile_image) && admin.profile_image) {
        filesToDelete.push(admin.profile_image);
        admin.profile_image = null;
      }

      if (filesToDelete.length)
        await this.fileManagerService.delete(...filesToDelete);

      if (filesToSave.length > 0) {
        const results = await this.fileManagerService.save({
          files: filesToSave,
          service: this.configService.get<FileStorageService>(
            'FILE_STORAGE_SERVICES',
          ),
        });

        // Assign saved files to the user object
        if (cover_image) {
          admin.cover_image = results.shift();
        }

        if (profile_image) {
          admin.profile_image = results.shift();
        }
      }

      // Save updated user data
      admin = await this.adminsRepository.save({ ...admin, ...dto });

      return admin;
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation error code for PostgresSQL
        if (error.detail.includes('email')) {
          throw new ConflictException(
            this.i18n.tr(TranslationKeys.email_in_use),
          );
        }
        if (error.detail.includes('username')) {
          throw new ConflictException(
            this.i18n.tr(TranslationKeys.username_in_use),
          );
        }
      }
      throw error; // Re-throw the error if it's not a unique constraint violation
    }
  }

  async softDelete(id: string): Promise<void> {
    return super.soft_delete(id);

    // const admin = await super.get_one({ id });
    // if (admin.deleted_at) {
    //   throw new ConflictException(
    //     this.i18n.tr(TranslationKeys.account_already_soft_deleted, {
    //       args: { id },
    //     }),
    //   );
    // }
    // admin.deleted_at = new Date();
    // return this.adminsRepository.save(admin);
  }

  async restore(id: string): Promise<Admin> {
    await super.restore_entity(id);
    return await super.get_one({ id });

    // // Check if the admin exists and is soft deleted
    // const admin = await super.get_one({ id });
    //
    // if (!admin.deleted_at) {
    //   throw new ConflictException(
    //     this.i18n.tr(TranslationKeys.account_not_soft_deleted, {
    //       args: { id },
    //     }),
    //   );
    // }
    //
    // // Restore the admin
    // const result = await this.adminsRepository.restore(id);
    //
    // if (result.affected === 1) {
    //   admin.deleted_at = null;
    //   return admin;
    // } else {
    //   throw new InternalServerErrorException(
    //     this.i18n.tr(TranslationKeys.account_restore_error, {
    //       args: { id },
    //     }),
    //   );
    // }
  }

  async hardDelete(id: string): Promise<void> {
    return super.hard_delete(id);
  }

  async blockAdmin(id: string): Promise<Admin> {
    const admin = await super.get_one({ id });
    if (admin.blocked_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.account_already_blocked, {
          args: { id },
        }),
      );
    }
    admin.blocked_at = new Date();

    return this.adminsRepository.save(admin);
  }

  async unblockAdmin(id: string): Promise<Admin> {
    const admin = await super.get_one({ id });
    if (!admin.blocked_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.account_not_blocked, {
          args: { id },
        }),
      );
    }
    admin.blocked_at = null;
    return this.adminsRepository.save(admin);
  }

  private async checkForExistingAdmin(
    createAdminDto: CreateAdminDto,
  ): Promise<void> {
    const existingAdmin = await this.adminsRepository.findOne({
      where: [
        { email: createAdminDto.email },
        { username: createAdminDto.username },
      ],
    });

    if (existingAdmin) {
      if (existingAdmin.email === createAdminDto.email) {
        throw new ConflictException(this.i18n.tr(TranslationKeys.email_in_use));
      }
      if (existingAdmin.username === createAdminDto.username) {
        throw new ConflictException(
          this.i18n.tr(TranslationKeys.username_in_use),
        );
      }
    }
  }
}

/// if (!admin) {
//       throw new NotFoundException(
//         this.i18n.tr(TranslationKeys.account_not_found_with_id, {
//           args: { id },
//         }),
//       );
//     }
