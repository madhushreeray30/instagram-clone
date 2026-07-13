import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';
import { hashPassword, comparePasswords, validatePasswordStrength } from '../utils/password';
import { generateAccessToken, generateRefreshToken, JwtPayload } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: Partial<User>; accessToken: string; refreshToken: string }> {
    const { username, email, password, fullName } = data;

    if (!validatePasswordStrength(password)) {
      throw new AppError(
        400,
        'WEAK_PASSWORD',
        'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      );
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (existingUser) {
      throw new AppError(
        409,
        'USER_EXISTS',
        existingUser.email === email ? 'Email already registered' : 'Username already taken',
      );
    }

    const passwordHash = await hashPassword(password);

    const user = this.userRepository.create({
      username,
      email,
      passwordHash,
      fullName,
      isEmailVerified: false,
    });

    await this.userRepository.save(user);

    const payload: JwtPayload = { userId: user.userId, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    logger.info(`User registered: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(email: string, password: string): Promise<{
    user: Partial<User>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    const payload: JwtPayload = { userId: user.userId, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    logger.info(`User logged in: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async verifyEmail(email: string, otp: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    if (user.emailVerificationOtp !== otp) {
      throw new AppError(400, 'INVALID_OTP', 'Invalid OTP');
    }

    if (user.emailVerificationExpiry && user.emailVerificationExpiry < new Date()) {
      throw new AppError(400, 'OTP_EXPIRED', 'OTP has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationOtp = null;
    user.emailVerificationExpiry = null;

    await this.userRepository.save(user);

    logger.info(`Email verified: ${email}`);
  }

  private sanitizeUser(user: User): Partial<User> {
    const { passwordHash, emailVerificationOtp, emailVerificationExpiry, ...sanitized } = user;
    return sanitized;
  }
}
