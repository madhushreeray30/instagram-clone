import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Entity('follows')
@Unique(['followerId', 'followingId'])
@Index(['followingId'])
export class Follow {
  @PrimaryColumn('uuid')
  followId: string = uuidv4();

  @Column('uuid')
  followerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Column('uuid')
  followingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followingId' })
  following: User;

  @Column({ type: 'boolean', default: false })
  isBlocked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
