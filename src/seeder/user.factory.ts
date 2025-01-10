import { faker } from '@faker-js/faker';
import { setSeederFactory } from 'typeorm-extension';
import { User } from '../users/entities/user.entity';
import { FileStorageService } from '../file-manager/enums/file-storage-service.enum';

export const UserFactory = setSeederFactory(User, () => {
  const user = new User();
  user.username = faker.internet.username();
  user.full_name = faker.person.firstName() + ' ' + faker.person.lastName();
  user.email = faker.internet.email();
  user.cover_image = {
    fileStorageService: FileStorageService.LOCAL,
    mimetype: '',
    originalname: '',
    path: '',
    size: '',
    uniqueName: '',
    url: faker.image.avatar(),
  };
  user.password = '1@Aaasas';
  return user;
});
