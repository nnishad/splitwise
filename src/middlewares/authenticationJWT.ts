import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
      if (err) {
        return res.sendStatus(403);  // Forbidden
      }

      // Attach user info to the request object
      req.user = user;
      next();
    });
  } else {
    return res.sendStatus(401);  // Unauthorized
  }
};

export const checkRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as { role: string };

    if (!user || user.role !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }

    next();
  };
};
