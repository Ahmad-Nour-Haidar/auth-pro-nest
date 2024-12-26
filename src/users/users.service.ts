import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BcryptService } from '../common/services/bcrypt.service';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Roles } from '../admins/enums/roles.enum';
import { CreateMethod } from './enums/create-method.enum';
import { MailService } from '../common/services/mail.service';
import { RandomService } from '../common/services/random.service';
import { TranslationKeys } from '../i18n/translation-keys';
import { CustomI18nService } from '../common/services/custom-i18n.service';
import { FileManagerService } from '../file-manager/file-manager.service';
import { FileStorageService } from '../file-manager/enums/file-storage-service.enum';
import { FileMetadata } from '../file-manager/classes/file-metadata';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly bcryptService: BcryptService,
    private readonly mailService: MailService,
    private readonly randomService: RandomService,
    private readonly i18n: CustomI18nService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if the email or username already exists
    await this.checkForExistingUser(createUserDto);

    // Hash the password
    createUserDto.password = await this.bcryptService.hash(
      createUserDto.password,
    );

    const verifyCode = this.randomService.getRandomNumericString(6);
    const user = this.usersRepository.create({
      ...createUserDto,
      verify_code: verifyCode,
      create_method: CreateMethod.localEmail,
      roles: [Roles.user],
    });

    await this.mailService.sendMail({
      username: user.username,
      to: user.email,
      subject: 'Verification Code',
      text: `Your verification code is: ${verifyCode}`,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      withDeleted: true,
    });
  }

  async findOne(id: string): Promise<User> {
    return this.getUserById({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { profile_image, cover_image, ...dto } = updateUserDto;

    try {
      let user = await this.getUserById({ id });

      if (dto.delete_cover_image || dto.delete_profile_image) {
        const filesToDelete: FileMetadata[] = [];
        if (dto.delete_cover_image) {
          filesToDelete.push(user.cover_image);
          user.cover_image = null;
        }
        if (dto.delete_profile_image) {
          filesToDelete.push(user.profile_image);
          user.profile_image = null;
        }

        await this.fileManagerService.delete(...filesToDelete);
      }

      // Filter non-null files
      const filesToSave = [cover_image, profile_image].filter(Boolean);
      if (filesToSave.length > 0) {
        const results = await this.fileManagerService.save({
          files: filesToSave,
          service: FileStorageService.Cloudinary,
        });

        // Assign saved files to the user object
        if (cover_image) {
          user.cover_image = results.shift();
        }

        if (profile_image) {
          user.profile_image = results.shift();
        }
      }

      // Save updated user data
      user = await this.usersRepository.save({ ...user, ...dto });

      return user;
    } catch (error) {
      if (error.code === '23505') {
        // Unique constraint violation error code for PostgreSQL
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

  async softDelete(id: string): Promise<User> {
    const user = await this.getUserById({ id, withDeleted: true });
    if (user.deleted_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.account_already_soft_deleted, {
          args: { id },
        }),
      );
    }
    user.deleted_at = new Date();
    return this.usersRepository.save(user);
  }

  async restore(id: string): Promise<User> {
    const user = await this.getUserById({ id, withDeleted: true });

    if (!user.deleted_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.account_not_soft_deleted, {
          args: { id },
        }),
      );
    }

    const result = await this.usersRepository.restore(id);

    if (result.affected === 1) {
      user.deleted_at = null;
      return user;
    } else {
      throw new InternalServerErrorException(
        this.i18n.tr(TranslationKeys.account_restore_error, {
          args: { id },
        }),
      );
    }
  }

  async hardDelete(id: string): Promise<User> {
    const user = await this.getUserById({ id });
    return this.usersRepository.remove(user);
  }

  async blockUser(id: string): Promise<User> {
    const user = await this.getUserById({ id, withDeleted: true });
    if (user.blocked_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.account_already_blocked, {
          args: { id },
        }),
      );
    }
    user.blocked_at = new Date();

    return this.usersRepository.save(user);
  }

  async unblockUser(id: string): Promise<User> {
    const user = await this.getUserById({ id, withDeleted: true });
    if (!user.blocked_at) {
      throw new ConflictException(
        this.i18n.tr(TranslationKeys.account_not_blocked, {
          args: { id },
        }),
      );
    }
    user.blocked_at = null;
    return this.usersRepository.save(user);
  }

  async checkForExistingUser(createUserDto: CreateUserDto): Promise<void> {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException(this.i18n.tr(TranslationKeys.email_in_use));
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException(
          this.i18n.tr(TranslationKeys.username_in_use),
        );
      }
    }
  }

  private async getUserById({
    id,
    withDeleted = true,
  }: {
    id: string;
    withDeleted?: boolean;
  }): Promise<User> {
    // await this.usersRepository.findOneBy({ id }, { withDeleted: true });
    const user = await this.usersRepository.findOne({
      where: { id },
      withDeleted: withDeleted,
    });
    if (!user) {
      throw new NotFoundException(
        this.i18n.tr(TranslationKeys.account_not_found_with_id, {
          args: { id },
        }),
      );
    }
    return user;
  }
}
