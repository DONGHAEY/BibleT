import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';
import { RoleFormat } from 'src/domain/train-profile.entity';

export class TrainMembersValidationPipe implements PipeTransform {
  readonly StatusOptions = [RoleFormat.CREW, RoleFormat.VIEWER];

  transform(value: any, metadata: ArgumentMetadata) {
    value = value.toUpperCase();
    if (!this.isStatusValid(value)) {
      throw new BadRequestException(
        `${value}역할은 기차 프로필 역할 안에 없는 역할입니다`,
      );
    }
    return value;
  }

  private isStatusValid(status: any) {
    const index = this.StatusOptions.indexOf(status);
    return index !== -1;
  }
}
