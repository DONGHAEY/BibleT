import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Payload } from '../types/payload.interface';
import { Request } from 'express';
import { UserService } from '../user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies.accessToken,
      ]),
      ignoreExpiration: false, //만료기한을 무시할것인가
      secretOrKey: process.env.ACCESSTOKEN_SECRET_KEY,
    });
  }

  async validate(payload: Payload, done: VerifiedCallback): Promise<any> {
    const user = await this.userService.getUserById(payload.id);
    return done(null, user);
  }
}

// npm install --save @nestjs/passport passport passport-local
// $ npm install --save-dev @types/passport-local
