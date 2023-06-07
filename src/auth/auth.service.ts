import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signin() {
    return { msg: 'Sign in handler enpoint' };
  }

  signup() {
    return { msg: 'Sign up handler enpoint' };
  }
}
