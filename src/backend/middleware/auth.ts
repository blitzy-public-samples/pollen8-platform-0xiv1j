import { Request, Response, NextFunction } from 'express';
import { AuthService } from 'src/backend/services/AuthService';
import { AuthError } from 'src/backend/errors/AuthError';
import { JWT_SECRET } from 'src/backend/config/jwt';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AuthError('No authorization header provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthError('No token provided');
    }

    const authService = new AuthService();
    const decodedUser = await authService.verifyToken(token);

    if (!decodedUser) {
      throw new AuthError('Invalid token');
    }

    // Attach the decoded user information to the request object
    req.user = decodedUser;

    next();
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(401).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};