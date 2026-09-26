import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, Role } from '../types';
import { sendError } from '../utils/response';

export const requireRoles = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'User is not authenticated', 401, 'UNAUTHORIZED');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]`,
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
};

export const requireAdmin = requireRoles(Role.ADMIN);
export const requireAdminOrPM = requireRoles(Role.ADMIN, Role.PROJECT_MANAGER);
export const requireAnyRole = requireRoles(Role.ADMIN, Role.PROJECT_MANAGER, Role.DEVELOPER);
