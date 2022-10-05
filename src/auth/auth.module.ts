import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './repository/user.repository';
import { UserService } from './user.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/passport.jwt.strategy';
import { UserAuthorityRepository } from './repository/user-authority.repository';
import { AuthGuard } from './guards/auth.guard';
import { MailModule } from 'src/mail/mail.module';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository, UserAuthorityRepository]),
    JwtModule,
    PassportModule,
    MailModule,
  ],
  exports: [TypeOrmModule],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
