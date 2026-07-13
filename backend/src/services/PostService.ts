import { Repository, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Post } from '../models/Post';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';
import { Follow } from '../models/Follow';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class PostService {
  private postRepository: Repository<Post>;
  private likeRepository: Repository<Like>;
  private commentRepository: Repository<Comment>;
  private followRepository: Repository<Follow>;

  constructor() {
    this.postRepository = AppDataSource.getRepository(Post);
    this.likeRepository = AppDataSource.getRepository(Like);
    this.commentRepository = AppDataSource.getRepository(Comment);
    this.followRepository = AppDataSource.getRepository(Follow);
  }

  async createPost(
    userId: string,
    data: {
      caption?: string;
      imageUrls: string[];
      videoUrl?: string;
      location?: string;
    },
  ): Promise<Post> {
    if (!data.imageUrls || data.imageUrls.length === 0) {
      throw new AppError(400, 'NO_IMAGES', 'At least one image is required');
    }

    if (data.imageUrls.length > 10) {
      throw new AppError(400, 'TOO_MANY_IMAGES', 'Maximum 10 images per post');
    }

    const post = this.postRepository.create({
      userId,
      caption: data.caption,
      imageUrls: data.imageUrls,
      videoUrl: data.videoUrl,
      location: data.location,
    });

    await this.postRepository.save(post);
    logger.info(`Post created: ${post.postId}`);

    return post;
  }

  async getPost(postId: string): Promise<Post & { likes: number; comments: number }> {
    const post = await this.postRepository.findOne({
      where: { postId },
    });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
    }

    const likes = await this.likeRepository.count({ where: { postId } });
    const comments = await this.commentRepository.count({ where: { postId } });

    return { ...post, likes, comments };
  }

  async getFeed(userId: string, page: number = 1, limit: number = 20): Promise<{
    posts: (Post & { likes: number; comments: number; isLiked: boolean })[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const followedUsers = await this.followRepository.find({
      where: { followerId: userId },
    });

    const followedIds = followedUsers.map((f) => f.followingId);
    followedIds.push(userId);

    const [posts, total] = await this.postRepository.findAndCount({
      where: { userId: In(followedIds), isArchived: false },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });

    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const likes = await this.likeRepository.count({ where: { postId: post.postId } });
        const comments = await this.commentRepository.count({ where: { postId: post.postId } });
        const userLike = await this.likeRepository.findOne({
          where: { userId, postId: post.postId },
        });
        return { ...post, likes, comments, isLiked: !!userLike };
      }),
    );

    return { posts: postsWithStats, total };
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 20): Promise<{
    posts: (Post & { likes: number; comments: number })[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await this.postRepository.findAndCount({
      where: { userId, isArchived: false },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const likes = await this.likeRepository.count({ where: { postId: post.postId } });
        const comments = await this.commentRepository.count({ where: { postId: post.postId } });
        return { ...post, likes, comments };
      }),
    );

    return { posts: postsWithStats, total };
  }

  async updatePost(postId: string, userId: string, data: { caption?: string }): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { postId } });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
    }

    if (post.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You can only edit your own posts');
    }

    const now = new Date();
    const createdAt = new Date(post.createdAt);
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      throw new AppError(400, 'EDIT_EXPIRED', 'Posts can only be edited within 24 hours');
    }

    if (data.caption) post.caption = data.caption;

    await this.postRepository.save(post);
    logger.info(`Post updated: ${postId}`);

    return post;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findOne({ where: { postId } });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
    }

    if (post.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You can only delete your own posts');
    }

    await this.postRepository.remove(post);
    logger.info(`Post deleted: ${postId}`);
  }
}
