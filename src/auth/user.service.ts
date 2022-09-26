import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './repository/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from 'src/domain/user.entity';
import { RegisterUserDto } from './dto/registerUser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}

  async findByFields(options: FindOneOptions): Promise<User | undefined> {
    return await this.userRepository.findOne(options);
  }

  async createUser(userDto: RegisterUserDto): Promise<void> {
    await this.transformPassword(userDto);
    const nUser = new User();
    nUser.email = userDto.email;
    nUser.username = userDto.username;
    nUser.password = userDto.password;
    nUser.save();
    return;
  }

  async transformPassword(user: RegisterUserDto): Promise<void> {
    user.password = await bcrypt.hash(user.password, 10);
    return Promise.resolve();
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
}
