import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';
import { Post } from './Post';

export enum NotificationType {
  LIKE = 'like',
  COMMENT = 'comment',
  FOLLOW = 'follow',
  MENTION = 'mention',
}

@Entity('notifications')
@Index(['userId', 'isRead', 'createdAt'])
export class Notification {
  @PrimaryColumn('uuid')
  notificationId: string = uuidv4();

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  triggeredByUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'triggeredByUserId' })
  triggeredByUser: User;

  @Column({ type: 'enum', enum: NotificationType })
  notificationType: NotificationType;

  @Column('uuid', { nullable: true })
  relatedPostId: string | null;

  @ManyToOne(() => Post, { nullable: true })
  @JoinColumn({ name: 'relatedPostId' })
  relatedPost: Post | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
