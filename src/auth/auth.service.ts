import { Body, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError,
  PrismaClientValidationError } from '@prisma/client/runtime';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signup(@Body() dto: AuthDto) {
    let hash: string;
    let user;

    try {
      hash = await argon.hash(dto.password);

      user = await this.prisma.users.create({
        data: {
          email: dto.email,
          hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      delete user.hash;
      return user;
    } catch (err) {
      if (err.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      throw err;
    }
  }

  async signin(@Body() dto: AuthDto) {
    const user = await this.prisma.users.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials not found');

    const pwMatches = argon.verify(user.hash, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials not found');

    delete user.hash;
    return user;
  }
}
