import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { Payload } from './security/payload.interface';
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
    private mailService: MailService,
  ) {}

  async modifyPassword(username: string, resetedPassword: string) {
    let userFind: User = await this.userService.findByFields({
      where: { username },
    });
    resetedPassword = randomBytes(4).toString('hex');
    userFind.password = resetedPassword;
    await this.userService.transformPassword(userFind);
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
      await this.mailService.sendUserConfirmation(nUser, 'abcdefg');
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

  async validateUser(userDto: UserDto): Promise<any | undefined> {
    let userFind: User = await this.userService.findByFields({
      where: { username: userDto.username },
    });

    const validatedPassword = await bcrypt.compare(
      userDto.password,
      userFind.password,
    );

    if (!userFind || !validatedPassword) {
      throw new UnauthorizedException();
    }

    this.convertInAuthorities(userFind);

    const payload: Payload = {
      id: userFind.id,
      username: userFind.username,
      authorities: userFind.authorities,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: userFind,
    };
  }

  async tokenValidateUser(payload: Payload): Promise<UserDto | undefined> {
    const userFind = await this.userService.findByFields({
      where: { id: payload.id },
    });
    this.flatAuthorities(userFind);
    return userFind;
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
