import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Entity('posts')
@Index(['userId', 'createdAt'])
@Index(['createdAt'])
export class Post {
  @PrimaryColumn('uuid')
  postId: string = uuidv4();

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  caption: string | null;

  @Column({ type: 'json', default: [] })
  imageUrls: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
