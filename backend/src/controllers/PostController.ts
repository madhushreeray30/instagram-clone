import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PostService } from '../services/PostService';
import { AppError } from '../middleware/errorHandler';

const postService = new PostService();

export async function createPost(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const post = await postService.createPost(req.userId, {
    caption: req.body.caption,
    imageUrls: req.body.imageUrls || [],
    videoUrl: req.body.videoUrl,
    location: req.body.location,
  });

  return res.status(201).json({
    success: true,
    data: post,
    message: 'Post created successfully',
  });
}

export async function getPost(req: Request, res: Response) {
  const { postId } = req.params;

  const post = await postService.getPost(postId);

  return res.status(200).json({
    success: true,
    data: post,
  });
}

export async function getFeed(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');

  const result = await postService.getFeed(req.userId, page, limit);

  return res.status(200).json({
    success: true,
    data: {
      posts: result.posts,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    },
  });
}

export async function getUserPosts(req: Request, res: Response) {
  const { userId } = req.params;
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');

  const result = await postService.getUserPosts(userId, page, limit);

  return res.status(200).json({
    success: true,
    data: {
      posts: result.posts,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    },
  });
}

export async function updatePost(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const { postId } = req.params;

  const post = await postService.updatePost(postId, req.userId, {
    caption: req.body.caption,
  });

  return res.status(200).json({
    success: true,
    data: post,
    message: 'Post updated successfully',
  });
}

export async function deletePost(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const { postId } = req.params;

  await postService.deletePost(postId, req.userId);

  return res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
}
