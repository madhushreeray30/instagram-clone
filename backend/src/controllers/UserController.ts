import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { UserService } from '../services/UserService';
import { AppError } from '../middleware/errorHandler';

const userService = new UserService();

export async function getUserProfile(req: Request, res: Response) {
  const { userId } = req.params;

  const user = await userService.getUserProfile(userId);

  return res.status(200).json({
    success: true,
    data: user,
  });
}

export async function getUserByUsername(req: Request, res: Response) {
  const { username } = req.params;

  const user = await userService.getUserByUsername(username);

  return res.status(200).json({
    success: true,
    data: user,
  });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const user = await userService.updateProfile(req.userId, req.body);

  return res.status(200).json({
    success: true,
    data: user,
    message: 'Profile updated successfully',
  });
}

export async function getFollowers(req: Request, res: Response) {
  const { userId } = req.params;
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');

  const result = await userService.getFollowers(userId, page, limit);

  return res.status(200).json({
    success: true,
    data: {
      followers: result.followers,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    },
  });
}

export async function getFollowing(req: Request, res: Response) {
  const { userId } = req.params;
  const page = parseInt((req.query.page as string) || '1');
  const limit = parseInt((req.query.limit as string) || '20');

  const result = await userService.getFollowing(userId, page, limit);

  return res.status(200).json({
    success: true,
    data: {
      following: result.following,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    },
  });
}

export async function followUser(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const { userId: followingId } = req.params;

  await userService.followUser(req.userId, followingId);

  return res.status(201).json({
    success: true,
    message: 'User followed successfully',
  });
}

export async function unfollowUser(req: AuthRequest, res: Response) {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');
  }

  const { userId: followingId } = req.params;

  await userService.unfollowUser(req.userId, followingId);

  return res.status(200).json({
    success: true,
    message: 'User unfollowed successfully',
  });
}
