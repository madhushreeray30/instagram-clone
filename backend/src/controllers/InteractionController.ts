import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { InteractionService } from '../services/InteractionService';
import { AppError } from '../middleware/errorHandler';

const interactionService = new InteractionService();

export async function likePost(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const { postId } = req.params;

  await interactionService.likePost(req.userId, postId);

  return res.status(201).json({
    success: true,
    message: 'Post liked successfully',
  });
}

export async function unlikePost(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const { postId } = req.params;

  await interactionService.unlikePost(req.userId, postId);

  return res.status(200).json({
    success: true,
    message: 'Post unliked successfully',
  });
}

export async function getLikes(req: Request, res: Response) {
  const { postId } = req.params;
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');

  const result = await interactionService.getLikes(postId, page, limit);

  return res.status(200).json({
    success: true,
    data: {
      likes: result.likes,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    },
  });
}

export async function createComment(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const { postId } = req.params;

  const comment = await interactionService.createComment(req.userId, postId, {
    content: req.body.content,
    parentCommentId: req.body.parentCommentId,
  });

  return res.status(201).json({
    success: true,
    data: comment,
    message: 'Comment created successfully',
  });
}

export async function getComments(req: Request, res: Response) {
  const { postId } = req.params;
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');

  const result = await interactionService.getComments(postId, page, limit);

  return res.status(200).json({
    success: true,
    data: {
      comments: result.comments,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    },
  });
}

export async function updateComment(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const { commentId } = req.params;

  const comment = await interactionService.updateComment(commentId, req.userId, {
    content: req.body.content,
  });

  return res.status(200).json({
    success: true,
    data: comment,
    message: 'Comment updated successfully',
  });
}

export async function deleteComment(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const { commentId } = req.params;

  await interactionService.deleteComment(commentId, req.userId);

  return res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
  });
}
