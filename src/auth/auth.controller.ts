import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
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
    res.cookie('jwt', jwt.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 100,
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
    res.cookie('jwt', '', {
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

  @Get('/ResetPassword')
  async resetPassword(@Query('token') token: string) {
    this.authService.resetPassword(token);
  }

  @Put('/modifyPassword')
  @UseGuards(AuthGuard)
  async modifyPassword(
    @GetUser() user: User,
    @Body('password') password: string,
    @Body('newPassword') newPassword: string,
  ) {
    const userDto: UserDto = {
      username: user.username,
      password: password,
    };
    const jwt = await this.authService.validateUser(userDto);
    await this.authService.modifyPassword(jwt.user.username, newPassword);
  }

  // @Delete('/secession')
  // @UseGuards(AuthGuard)
  // async deleteUser( @GetUser() user : User) {
  //     await this.userService.deleteUser(user.id);
  // }
}
