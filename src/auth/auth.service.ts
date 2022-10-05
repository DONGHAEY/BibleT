import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { Payload } from './types/payload.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/domain/user.entity';
import { RegisterUserDto } from './dto/registerUser.dto';
import { MailService } from 'src/mail/mail.service';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async resetPasswordToken(username: string) {
    const userInfo: User = await this.userService.findByFields({
      where: {
        username,
      },
    });
    if (!userInfo) {
      throw new HttpException('없는 유저입니다', HttpStatus.NOT_FOUND);
    }

    return {
      token: this.jwtService.sign(
        {
          username: userInfo.username,
          email: userInfo.email,
        },
        {
          secret: 'SECRET_KEY2',
          expiresIn: '300s',
        },
      ),
      user: userInfo,
    };
  }

  async resetPassword(token: string, resetetPassword: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: 'SECRET_KEY2',
      });
      await this.userService.removeRefreshToken(decoded.id);
      return await this.modifyPassword(decoded.username, resetetPassword);
    } catch (e) {
      if (e.message === 'jwt expired') {
        throw new UnauthorizedException('토큰이 만료되었습니다');
      }
    }
  }

  async modifyPassword(username: string, resetedPassword: string) {
    let userFind: User = await this.userService.findByFields({
      where: { username },
    });
    if (!userFind) {
      throw new HttpException('유저를 찾을 수 없습니다', HttpStatus.NOT_FOUND);
    }
    userFind.password = resetedPassword;
    await this.userService.transformPassword(userFind);
    return await userFind.save();
  }

  async registerUser(newUser: RegisterUserDto) {
    let userFind: User =
      (await this.userService.findByFields({
        where: { username: newUser.username },
      })) ||
      (await this.userService.findByFields({
        where: { email: newUser.email },
      }));
    if (userFind) {
      throw new HttpException(
        '아이디 또는 이메일이 이미 사용중입니다!',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const nUser: User = await this.userService.createUser(newUser);
      return {
        success: true,
      };
    } catch (e) {
      return {
        success: false,
        error: e,
      };
    }
  }
  async validateUser(userDto: UserDto): Promise<any> {
    let userFind: User = await this.userService.findByFields({
      where: { username: userDto.username },
    });
    if (!userFind) {
      throw new UnauthorizedException('아이디가 잘못되었습니다');
    }
    await this.userService.verifyPassword(userDto.password, userFind.password);

    return userFind;

    // return {
    //   accessToken: await this.getAccessToken(payload),
    //   refereshToken: await this.getRefreshToken(payload),
    //   user: userFind,
    // };
  }

  async getAccessToken(user: User) {
    this.flatAuthorities(user);
    const payload: Payload = {
      id: user.id,
      username: user.username,
      authorities: user.authorities,
    };
    return this.jwtService.sign(payload, {
      secret: 'ACCESSTOKEN_SECRET_KEY',
      expiresIn: '1h',
    });
  }

  async getRefreshToken(user: User) {
    this.flatAuthorities(user);
    const payload: Payload = {
      id: user.id,
      username: user.username,
      authorities: user.authorities,
    };
    return this.jwtService.sign(payload, {
      secret: 'REFERESHTOKEN_SECRET_KEY',
      expiresIn: '60d',
    });
  }

  private flatAuthorities(user: any): User {
    if (user && user.authorities) {
      const authorities: string[] = [];
      user.authorities.forEach((authority) =>
        authorities.push(authority.authorityName),
      );
      user.authorities = authorities;
    }
    return user;
  }

  private convertInAuthorities(user: any): User {
    if (user && user.authorities) {
      const authorities: any[] = [];
      user.authorities.forEach((authority) =>
        authorities.push({ name: authority.authorityName }),
      );
      user.authorities = authorities;
    }
    return user;
  }
}
