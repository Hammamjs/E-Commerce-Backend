import AsyncHandler from 'express-async-handler';
import Wishlist from '../model/Wishlist.js';
import { User } from '../model/User.js';
import AppError from '../utils/AppError.js';
import Product from '../model/Product.js';
import { getAll } from './FactoryHandler.js';
import { getIo } from '../utils/socket.js';

export const getAllWishlist = getAll(Wishlist, {
  path: 'items.product',
  select: 'name price images image',
});

export const addToWishlist = AsyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!productId) return next(new AppError(400, 'Product ID required'));

  const io = getIo();

  const [user, product] = await Promise.all([
    User.findById(userId).lean().select('_id'),
    Product.findById(productId).lean().select('_id'),
  ]);
  if (!user) return next(new AppError(403, 'Unauthorized. please login'));
  if (!product) return next(new AppError(404, 'Product not found'));

  let wishlist = await Wishlist.findOneAndUpdate(
    { user: userId },
    { $addToSet: { items: { productId, addedAt: Date.now() } } },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  ).populate('items.product');

  io.emit('wishlistUpdate', {
    action: 'add',
    userId,
    productId,
  });
  res.status(200).json({ message: 'success', data: wishlist });
});

export const deleteFromWishList = AsyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user._id;

  const io = getIo();

  if (!productId) return next(new AppError(400, 'Product ID required'));

  const user = await User.findById(userId).select('_id').lean();
  if (!user) return next(new AppError(403, 'Unauthorized user please login'));

  const wishlist = await Wishlist.findByIdAndUpdate(
    { user: userId },
    {
      $pull: { items: { product: productId } },
    },
    { new: true }
  );

  // delete wishlist if empty
  if (wishlist && !wishlist.items.length) {
    await Wishlist.deleteOne({ _id: wishlist._id });
  }

  io.emit('wishlistUpdate', {
    action: 'remove',
    userId,
    productId,
  });

  res.status(200).json({ message: 'success', data: null });
});
