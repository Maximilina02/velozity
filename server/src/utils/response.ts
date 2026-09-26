import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code?: string;
    details?: any;
  };
}

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode = 200): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    ...(message ? { message } : {}),
    data,
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errorCode?: string,
  details?: any
): Response => {
  const payload: ApiResponse = {
    success: false,
    message,
    error: {
      code: errorCode,
      details,
    },
  };
  return res.status(statusCode).json(payload);
};
