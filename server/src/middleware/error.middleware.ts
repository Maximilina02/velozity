import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error internally for monitoring without leaking to client
  console.error('[Global Error Handler]:', err.stack || err.message || err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.isPublic ? err.message : (statusCode === 500 ? 'An unexpected internal server error occurred' : err.message || 'Request failed');
  const errorCode = err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST');

  sendError(res, message, statusCode, errorCode);
};
