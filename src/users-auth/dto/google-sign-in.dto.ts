import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleSignInDto {
  @IsNotEmpty({ message: 'idToken is required.' })
  @IsString({ message: 'idToken must be a string.' })
  idToken: string;
}
