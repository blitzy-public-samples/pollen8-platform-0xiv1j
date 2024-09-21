import { Request, Response, NextFunction } from 'express';
import { AuthError } from 'src/backend/errors/AuthError';
import { UserError } from 'src/backend/errors/UserError';
import { ConnectionError } from 'src/backend/errors/ConnectionError';
import { InviteError } from 'src/backend/errors/InviteError';
import { NetworkValueError } from 'src/backend/errors/NetworkValueError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error details
  console.error('Error:', err);

  // Determine the error type and set appropriate status code
  let statusCode = 500;
  let errorType = 'InternalServerError';

  if (err instanceof AuthError) {
    statusCode = 401;
    errorType = 'AuthError';
  } else if (err instanceof UserError) {
    statusCode = 400;
    errorType = 'UserError';
  } else if (err instanceof ConnectionError) {
    statusCode = 400;
    errorType = 'ConnectionError';
  } else if (err instanceof InviteError) {
    statusCode = 400;
    errorType = 'InviteError';
  } else if (err instanceof NetworkValueError) {
    statusCode = 400;
    errorType = 'NetworkValueError';
  }

  // Create an error response object
  const errorResponse = {
    status: statusCode,
    type: errorType,
    message: err.message,
  };

  // If in development environment, include stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse['stack'] = err.stack;
  }

  // Send the error response to the client
  res.status(statusCode).json(errorResponse);
};