import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}

  signin() {
    return { msg: 'Sign in handler enpoint' };
  }

  signup() {
    return { msg: 'Sign up handler enpoint' };
  }
}
