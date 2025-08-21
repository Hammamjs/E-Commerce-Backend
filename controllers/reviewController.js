import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './FactoryHandler.js';
import Review from '../model/Review.js';
import AsyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
import Product from '../model/Product.js';
import { User } from '../model/User.js';
import { getIo } from '../utils/socket.js';

export const getReview = getOne(Review);

export const getReviews = getAll(Review, {
  path: 'user',
  select: '_id, profileImg, username',
});

export const createReview = AsyncHandler(async (req, res, next) => {
  const { user, product, comment, rating } = req.body;
  if (!user || !product)
    return next(new AppError(404, 'User id and product id is missing'));
  const userExist = await User.findById(user);
  if (!userExist) return next(new AppError(403, 'User not authorized'));
  const productExist = await Product.findById(product);
  if (!productExist) return next(new AppError(404, 'Product not exist'));

  const io = getIo();

  const userReview = await Review.create({
    user,
    product,
    comment,
    rating,
  });

  io.emit('reviewCreated', userReview);
  res.status(200).json({ message: 'Your comment is added!', userReview });
});

export const updateReview = updateOne(Review);

export const deleteReview = deleteOne(Review);
