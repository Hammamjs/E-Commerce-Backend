import AsyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';

export const allowedTo = (...roles) =>
  AsyncHandler((req, res, next) => {
    if (!req.user._id) return next(new AppError('Authentication required'));

    if (!roles.includes(req.user.role))
      return next(
        new AppError(403, `Forbidden. Required rules ${roles.join(', ')}`)
      );
    next();
  });
