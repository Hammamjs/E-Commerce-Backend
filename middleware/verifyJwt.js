import AppError from '../utils/AppError.js';
import jwt from 'jsonwebtoken';

export const verifyJwt = async (req, res, next) => {
  const cookie = req.cookies?.jwt || req.headers?.authorization?.split(' ')[1];

  if (!cookie) return next(new AppError(401, 'Unauthorized: Token not found'));
  const token = cookie;

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return next(new AppError(403, 'Forbidden'));
    req.user = decoded;
    next();
  });
};
