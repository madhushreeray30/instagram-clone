import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { validateRequest } from '../utils/validation';
import { schemas } from '../utils/validation';

const authService = new AuthService();

export async function register(req: Request, res: Response) {
  const { error, value } = schemas.register.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
    });
  }

  const result = await authService.register(value);

  return res.status(201).json({
    success: true,
    data: result,
    message: 'User registered successfully',
  });
}

export async function login(req: Request, res: Response) {
  const { error, value } = schemas.login.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
    });
  }

  const result = await authService.login(value.email, value.password);

  return res.status(200).json({
    success: true,
    data: result,
    message: 'Login successful',
  });
}

export async function verifyEmail(req: Request, res: Response) {
  const { error, value } = schemas.verifyEmail.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
    });
  }

  await authService.verifyEmail(value.email, value.otp);

  return res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
}

export function logout(req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
}
