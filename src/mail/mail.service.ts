import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../domain/user.entity';
import { RegisterUserDto } from 'src/auth/dto/registerUser.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendForResetPassword(user: RegisterUserDto, token: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'BibleT 비밀번호를 변경하시려면 이 인증메일을 확인하세요',
      template: './confirmation',
      context: {
        username: user.username,
        token: 'http://localhost:8000/api/auth/resetPassword?token=' + token,
      },
    });
  }

  async sendForResetedPassword(user: User, resetedPassword: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: `${user.username}님, BibleT에서 변경된 비밀번호를 확인하세요`,
      template: './resetedPassword',
      context: {
        username: user.username,
        resetedPassword,
      },
    });
  }
}
