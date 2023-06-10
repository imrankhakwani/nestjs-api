import { IsNotEmpty, IsEmail } from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
  firstName: string;
  lastName: string;
}
