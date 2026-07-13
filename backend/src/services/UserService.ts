import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { Follow } from '../models/Follow';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class UserService {
  private userRepository: Repository<User>;
  private followRepository: Repository<Follow>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.followRepository = AppDataSource.getRepository(Follow);
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  }

  async getUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: {
      fullName?: string;
      bio?: string;
      website?: string;
      phone?: string;
      isPrivate?: boolean;
    },
  ): Promise<User> {
    const user = await this.getUserProfile(userId);

    if (data.fullName) user.fullName = data.fullName;
    if (data.bio) user.bio = data.bio;
    if (data.website) user.websiteUrl = data.website;
    if (data.phone) user.phoneNumber = data.phone;
    if (data.isPrivate !== undefined) user.isPrivate = data.isPrivate;

    await this.userRepository.save(user);
    logger.info(`User profile updated: ${user.email}`);

    return user;
  }

  async updateProfilePicture(userId: string, pictureUrl: string): Promise<User> {
    const user = await this.getUserProfile(userId);
    user.profilePictureUrl = pictureUrl;
    await this.userRepository.save(user);
    logger.info(`Profile picture updated: ${user.email}`);
    return user;
  }

  async followUser(followerId: string, followingId: string): Promise<Follow> {
    if (followerId === followingId) {
      throw new AppError(400, 'CANNOT_FOLLOW_SELF', 'Cannot follow yourself');
    }

    const userExists = await this.userRepository.findOne({
      where: { userId: followingId },
    });

    if (!userExists) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User to follow not found');
    }

    const existingFollow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (existingFollow) {
      throw new AppError(409, 'ALREADY_FOLLOWING', 'Already following this user');
    }

    const follow = this.followRepository.create({
      followerId,
      followingId,
    });

    await this.followRepository.save(follow);
    logger.info(`User ${followerId} followed user ${followingId}`);

    return follow;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });

    if (!follow) {
      throw new AppError(404, 'NOT_FOLLOWING', 'Not following this user');
    }

    await this.followRepository.remove(follow);
    logger.info(`User ${followerId} unfollowed user ${followingId}`);
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<{
    followers: User[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [followers, total] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      followers: followers.map((f) => f.follower),
      total,
    };
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<{
    following: User[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const [following, total] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      following: following.map((f) => f.following),
      total,
    };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: { followerId, followingId },
    });
    return !!follow;
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, emailVerificationOtp, emailVerificationExpiry, ...sanitized } = user;
    return sanitized;
  }
}
