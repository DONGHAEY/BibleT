import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { Payload } from '../types/payload.interface';
import { UserService } from '../user.service';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private readonly userService: UserService) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies.Refresh,
      ]),
      ignoreExpiration: false, //만료기한을 무시할것인가
      secretOrKey: process.env.REFERESHTOKEN_SECRET_KEY,
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: Payload,
    done: VerifiedCallback,
  ): Promise<any> {
    const refreshToken = req.cookies.refreshToken;
    const user = await this.userService.getUserIfRefreshTokenMatches(
      payload.id,
      refreshToken,
    );
    return done(null, user);
  }
}
