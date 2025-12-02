import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../../middlewares/error.handler';

const authService = new AuthService();

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  res.json({
    status: 'success',
    data: result,
  });
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const result = await authService.refresh(refreshToken);

  res.json({
    status: 'success',
    data: result,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  await authService.logout(refreshToken);

  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({
      status: 'error',
      message: 'Unauthorized',
    });
    return;
  }

  const prisma = (await import('../../../config/db')).default;
  const user: any = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
          description: true,
          rolePermissions: {
            select: {
              permission: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Extract permissions
  const permissions = user.role?.rolePermissions?.map((rp: any) => rp.permission.name) || [];

  res.json({
    status: 'success',
    data: {
      ...user,
      permissions,
    },
  });
});
