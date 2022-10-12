import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TrainModule } from './train/train.module';
import { User } from './domain/user.entity';
import { UserAuthority } from './domain/user-authority.entity';
import { Train } from './domain/train.entitiy';
import { TrainProfile } from './domain/train-profile.entity';
import { Bible } from './domain/bible.entity';
import { TrackModule } from './track/track.module';
import { BibleTrack } from './domain/bible-track.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CheckStamp } from './domain/check-stamp.entity';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./env/${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: false,
      entities: [
        UserAuthority,
        User,
        Train,
        TrainProfile,
        Bible,
        BibleTrack,
        CheckStamp,
      ],
      logging: true,
    }),
    // RouterModule.forRoutes(routes),
    AuthModule,
    TrainModule,
    TrackModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
