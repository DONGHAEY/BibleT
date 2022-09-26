import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bible')
export class Bible extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'varchar',
  })
  chapter: string;

  @Column({
    type: 'varchar',
  })
  sign: string;
  @Column({
    type: 'int',
  })
  page: number;
}
