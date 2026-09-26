import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { config } from '../config/env';
import {
  generateAccessToken,
  generateRefreshTokenString,
  getRefreshTokenCookieOptions,
} from '../utils/token';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest, Role, TokenPayload } from '../types';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      sendError(res, 'Invalid email or password', 401, 'INVALID_CREDENTIALS');
      return;
    }

    // Generate access token payload
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshTokenString = generateRefreshTokenString();

    // Store refresh token in PostgreSQL database
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() + config.JWT_REFRESH_EXPIRY_DAYS
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt,
      },
    });

    // Set HttpOnly cookie for Refresh Token
    res.cookie(
      'refreshToken',
      refreshTokenString,
      getRefreshTokenCookieOptions()
    );

    sendSuccess(
      res,
      {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatarUrl: user.avatarUrl,
        },
      },
      'Login successful'
    );
  }

  public static async refresh(
    req: Request,
    res: Response
  ): Promise<void> {
    const rawCookieToken = req.cookies?.refreshToken;

    if (!rawCookieToken) {
      sendError(
        res,
        'Refresh token cookie missing',
        401,
        'REFRESH_TOKEN_REQUIRED'
      );
      return;
    }

    // Look up token in DB
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: rawCookieToken },
      include: { user: true },
    });

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.expiresAt < new Date()
    ) {
      res.clearCookie(
        'refreshToken',
        getRefreshTokenCookieOptions()
      );

      sendError(
        res,
        'Invalid or expired refresh token',
        401,
        'INVALID_REFRESH_TOKEN'
      );
      return;
    }

    // Rotate refresh token: revoke old one, create new one
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const newRefreshTokenString = generateRefreshTokenString();

    const newExpiresAt = new Date();
    newExpiresAt.setDate(
      newExpiresAt.getDate() + config.JWT_REFRESH_EXPIRY_DAYS
    );

    await prisma.refreshToken.create({
      data: {
        token: newRefreshTokenString,
        userId: storedToken.userId,
        expiresAt: newExpiresAt,
      },
    });

    // Set new HttpOnly cookie
    res.cookie(
      'refreshToken',
      newRefreshTokenString,
      getRefreshTokenCookieOptions()
    );

    // Generate new Access Token
    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role as Role,
      name: storedToken.user.name,
    });

    sendSuccess(
      res,
      {
        accessToken,
        user: {
          id: storedToken.user.id,
          email: storedToken.user.email,
          name: storedToken.user.name,
          role: storedToken.user.role,
          avatarUrl: storedToken.user.avatarUrl,
        },
      },
      'Token refreshed successfully'
    );
  }

  public static async logout(
    req: Request,
    res: Response
  ): Promise<void> {
    const rawCookieToken = req.cookies?.refreshToken;

    if (rawCookieToken) {
      // Mark token revoked in database
      await prisma.refreshToken.updateMany({
        where: { token: rawCookieToken },
        data: { revoked: true },
      });
    }

    // Clear HttpOnly cookie
    res.clearCookie(
      'refreshToken',
      getRefreshTokenCookieOptions()
    );

    sendSuccess(res, null, 'Logged out successfully');
  }

  public static async me(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    if (!req.user) {
      sendError(
        res,
        'Not authenticated',
        401,
        'UNAUTHORIZED'
      );
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      sendError(
        res,
        'User not found',
        404,
        'NOT_FOUND'
      );
      return;
    }

    sendSuccess(res, { user });
  }
}