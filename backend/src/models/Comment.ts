import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';
import { Post } from './Post';

@Entity('comments')
@Index(['postId', 'createdAt'])
@Index(['userId'])
export class Comment {
  @PrimaryColumn('uuid')
  commentId: string = uuidv4();

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  postId: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column('uuid', { nullable: true })
  parentCommentId: string | null;

  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parentCommentId' })
  parentComment: Comment | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
