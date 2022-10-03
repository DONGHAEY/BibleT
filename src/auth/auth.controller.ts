import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Render,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Request } from 'express';
import { UserDto } from './dto/user.dto';
import { AuthGuard } from './security/auth.guard';
import { RolesGuard } from './security/roles.guard';
import { Roles } from './decorator/role.decorator';
import { RoleType } from './role-type';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { randomBytes } from 'crypto';
import { GetUser } from './decorator/userinfo.decorator';
import { User } from 'src/domain/user.entity';
import { MailService } from 'src/mail/mail.service';

@Controller('/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailService: MailService,
  ) {}

  @Post('/register')
  @UsePipes(ValidationPipe)
  async registerAccount(
    @Req() req: Request,
    @Body() userDto: RegisterUserDto,
  ): Promise<any> {
    return await this.authService.registerUser(userDto);
  }

  @Post('/login')
  async login(@Body() userDto: UserDto, @Res() res: Response): Promise<any> {
    const jwt = await this.authService.validateUser(userDto);
    // res.setHeader('Authorization', 'Bearer ' + jwt.accessToken);
    res.cookie('accessToken', jwt.accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });
    return res.json({
      success: true,
      token: jwt.accessToken,
      user: jwt.user,
    });
  }

  @Post('/logout')
  logout(@Req() req: Request, @Res() res: Response): any {
    // res.setHeader('Authorization', 'Bearer ');
    res.cookie('accessToken', '', {
      maxAge: 0,
    });
    return res.send({
      success: true,
    });
  }

  @Post('/authenticate')
  @UseGuards(AuthGuard)
  isAuthenticated(@Req() req: Request): any {
    const user: any = req.user;
    return {
      user,
      success: true,
    };
  }

  @Get('/admin-role')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(RoleType.ADMIN, RoleType.USER)
  adminRoleCheck(@Req() req: Request): any {
    const user: any = req.user;
    return user;
  }

  @Post('/sendResetPasswordMail')
  async sendResetPasswordMail(@Body('username') username: string) {
    const jwt = await this.authService.resetPasswordToken(username);
    await this.mailService.sendForResetPassword(jwt.user, jwt.token);
  }

  @Get('/resetPassword')
  @Render('resetedStatus.ejs')
  async resetPassword(@Query('token') token: string) {
    const resetPassword = randomBytes(4).toString('hex');
    const modifiedUser = await this.authService.resetPassword(
      token,
      resetPassword,
    );
    if (!modifiedUser) {
      return { username: '', status: false };
    }
    await this.mailService.sendForResetedPassword(modifiedUser, resetPassword);
    return {
      username: modifiedUser.username,
      status: true,
    };
  }

  @Put('/modifyPassword')
  @UseGuards(AuthGuard) //로그인이 되어있는 상태에서만 비밀번호를 변경 할 수 있다.
  async modifyPassword(
    @GetUser() user: User,
    @Body('password') password: string,
    @Body('newPassword') newPassword: string,
    @Res() res: Response,
  ) {
    const userDto: UserDto = {
      username: user.username,
      password: password,
    };
    const jwt = await this.authService.validateUser(userDto);
    await this.authService.modifyPassword(jwt.user.username, newPassword);
    res.cookie('accessToken', '', {
      //다시 로그인을 하도록 유도
      maxAge: 0,
    });
  }

  // @Delete('/secession')
  // @UseGuards(AuthGuard)
  // async deleteUser( @GetUser() user : User) {
  //     await this.userService.deleteUser(user.id);
  // }
}
