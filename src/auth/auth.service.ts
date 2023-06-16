import { Body, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

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

      const token = await this.signedToken(user.id, user.email);
      return { access_token: token };
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

    const pwMatches = await argon.verify(user.hash, dto.password);

    if (!pwMatches) throw new ForbiddenException('Credentials not found');

    return await this.signedToken(user.id, user.email);
  }

  async signedToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: this.config.get('TOKEN_EXPIRY'),
      secret,
    });

    return { access_token: token };
  }
}
