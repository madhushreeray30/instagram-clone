import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';
import { Post } from '../models/Post';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class InteractionService {
  private likeRepository: Repository<Like>;
  private commentRepository: Repository<Comment>;
  private postRepository: Repository<Post>;

  constructor() {
    this.likeRepository = AppDataSource.getRepository(Like);
    this.commentRepository = AppDataSource.getRepository(Comment);
    this.postRepository = AppDataSource.getRepository(Post);
  }

  async likePost(userId: string, postId: string): Promise<Like> {
    const post = await this.postRepository.findOne({ where: { postId } });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { userId, postId },
    });

    if (existingLike) {
      throw new AppError(409, 'ALREADY_LIKED', 'Post already liked');
    }

    const like = this.likeRepository.create({
      userId,
      postId,
    });

    await this.likeRepository.save(like);
    logger.info(`Post liked: ${postId} by user ${userId}`);

    return like;
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const like = await this.likeRepository.findOne({
      where: { userId, postId },
    });

    if (!like) {
      throw new AppError(404, 'LIKE_NOT_FOUND', 'Post not liked');
    }

    await this.likeRepository.remove(like);
    logger.info(`Post unliked: ${postId} by user ${userId}`);
  }

  async getLikes(postId: string, page: number = 1, limit: number = 20): Promise<{
    likes: Like[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [likes, total] = await this.likeRepository.findAndCount({
      where: { postId },
      skip,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return { likes, total };
  }

  async createComment(userId: string, postId: string, data: {
    content: string;
    parentCommentId?: string;
  }): Promise<Comment> {
    const post = await this.postRepository.findOne({ where: { postId } });

    if (!post) {
      throw new AppError(404, 'POST_NOT_FOUND', 'Post not found');
    }

    if (data.content.length > 300) {
      throw new AppError(400, 'COMMENT_TOO_LONG', 'Comment must be 300 characters or less');
    }

    const comment = this.commentRepository.create({
      userId,
      postId,
      content: data.content,
      parentCommentId: data.parentCommentId,
    });

    await this.commentRepository.save(comment);
    logger.info(`Comment created: ${comment.commentId}`);

    return comment;
  }

  async getComments(postId: string, page: number = 1, limit: number = 20): Promise<{
    comments: Comment[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { postId, isDeleted: false },
      skip,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return { comments, total };
  }

  async updateComment(commentId: string, userId: string, data: {
    content: string;
  }): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { commentId },
    });

    if (!comment) {
      throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found');
    }

    if (comment.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You can only edit your own comments');
    }

    if (data.content.length > 300) {
      throw new AppError(400, 'COMMENT_TOO_LONG', 'Comment must be 300 characters or less');
    }

    comment.content = data.content;

    await this.commentRepository.save(comment);
    logger.info(`Comment updated: ${commentId}`);

    return comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { commentId },
    });

    if (!comment) {
      throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found');
    }

    if (comment.userId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You can only delete your own comments');
    }

    comment.isDeleted = true;

    await this.commentRepository.save(comment);
    logger.info(`Comment deleted: ${commentId}`);
  }
}
