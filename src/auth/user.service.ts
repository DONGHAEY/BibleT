import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './repository/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from 'src/domain/user.entity';
import { RegisterUserDto } from './dto/registerUser.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}

  async findByFields(options: FindOneOptions): Promise<User | undefined> {
    return await this.userRepository.findOne(options);
  }

  async createUser(userDto: RegisterUserDto): Promise<User | undefined> {
    await this.transformPassword(userDto);
    const nUser = new User();
    nUser.email = userDto.email;
    nUser.username = userDto.username;
    nUser.password = userDto.password;
    nUser.save();
    return nUser;
  }

  async transformPassword(user): Promise<void> {
    user.password = await bcrypt.hash(user.password, 10);
    return Promise.resolve();
  }

  async verifyPassword(plainTextPassword: string, hashedPassword: string) {
    const isPasswordMatch = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('비밀번호가 올바르지않습니다');
    }
  }

  async setCurrentRefreshToken(id: number, refreshToken: string) {
    const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(id, { currentHashedRefreshToken });
  }

  async getUserById(userId: number) {
    const user = await this.userRepository.findOne({
      id: userId,
    });
    if (!user) {
      throw new UnauthorizedException('존재하지 않는 유저입니다');
    }
    return user;
  }

  async getUserIfRefreshTokenMatches(id: number, refreshToken: string) {
    const user = await this.getUserById(id);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (isRefreshTokenMatching) {
      return user;
    }
    return null;
  }

  async removeRefreshToken(id: number) {
    return this.userRepository.update(id, {
      currentHashedRefreshToken: null,
    });
  }
}

// async deleteUser(userId : number) {
//     const {myProfiles} = await this.userRepository.findOne(userId, {relations : ['myProfiles']});
//     myProfiles.forEach(async (myProfile) => {
//         this.trainService.deleteTrainProfile(userId, myProfile.trainId);
//     })
//     await this.userRepository.delete({
//         id:userId
//     });
// }
