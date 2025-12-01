import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { env } from '../../../config/env';
import prisma from '../../../config/db';
import { AppError } from '../../../middlewares/error.handler';
import { logger } from '../../../utils/logger';

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken({
      sub: user.id,
      role: user.role,
      permissions: this.getRolePermissions(user.role),
    });

    const refreshToken = await this.generateRefreshToken(user.id);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    logger.info(`User ${user.email} logged in successfully`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    if (!storedToken.user.isActive) {
      throw new AppError('User is inactive', 401);
    }

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Generate new tokens
    const newAccessToken = this.generateAccessToken({
      sub: storedToken.user.id,
      role: storedToken.user.role,
      permissions: this.getRolePermissions(storedToken.user.role),
    });

    const newRefreshToken = await this.generateRefreshToken(storedToken.user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);

    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });

    logger.info('User logged out successfully');
  }

  async register(input: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }): Promise<AuthResponse> {
    const { email, password, name, role = 'RECEPTION' } = input;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role: role as any,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken({
      sub: user.id,
      role: user.role,
      permissions: this.getRolePermissions(user.role),
    });

    const refreshToken = await this.generateRefreshToken(user.id);

    logger.info(`New user registered: ${user.email}`);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  private generateAccessToken(payload: { sub: string; role: string; permissions: string[] }): string {
    return jwt.sign(payload, env.jwtSecret as string, {
      expiresIn: env.jwtAccessExpiration,
    } as jwt.SignOptions);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return token;
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRolePermissions(role: string): string[] {
    const permissions: Record<string, string[]> = {
      ADMIN: ['*'],
      MANAGER: [
        'appointments:*',
        'clients:*',
        'staff:read',
        'payments:*',
        'reports:read',
        'services:*',
      ],
      RECEPTION: [
        'appointments:create',
        'appointments:read',
        'appointments:update',
        'clients:*',
        'payments:create',
        'payments:read',
      ],
      STAFF: [
        'appointments:read',
        'clients:read',
        'schedule:read',
      ],
      CLIENT: [
        'appointments:create',
        'appointments:read',
        'profile:update',
      ],
    };

    return permissions[role] || [];
  }
}
