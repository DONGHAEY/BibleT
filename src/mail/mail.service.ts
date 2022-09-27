import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../domain/user.entity';
import { RegisterUserDto } from 'src/auth/dto/registerUser.dto';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendModifiedPassword(user: RegisterUserDto, modifyedPassword: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: '변경된 비밀번호를 알려드립니다',
      template: './confirmation',
      context: {
        username: user.username,
        newPassword: modifyedPassword,
      },
    });
  }
}
