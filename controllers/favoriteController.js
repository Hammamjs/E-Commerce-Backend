import AsyncHandler from 'express-async-handler';
import Favorite from '../model/Favorite.js';
import { User } from '../model/User.js';
import Product from '../model/Product.js';
import AppError from '../utils/AppError.js';
import { getAll } from './FactoryHandler.js';

export const getFavorites = getAll(Favorite);

export const getUserFav = AsyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  console.log(userId);

  if (!userId) return next(new AppError(403, 'Unauthorized, Please login'));

  const favorite = await Favorite.findOne({ user: userId }).populate(
    'items.product'
  );

  if (!favorite) return next(new AppError(400, 'Favorite not found'));
  res.status(200).json({ data: favorite });
});

export const addProductToFavorite = AsyncHandler(async (req, res, next) => {
  const { product } = req.body;
  const userId = req.user._id;

  if (!product) return next(new AppError(400, 'Product ID required'));

  const [user, productExist] = await Promise.all([
    User.findById(userId).select('_id').lean(),
    Product.findById(product).select('_id').lean(),
  ]);

  if (!user) return next(new AppError(401, 'User not authorized'));
  if (!productExist) return next(new AppError(404, 'Product bot found'));

  let favorite = await Favorite.findOneAndUpdate(
    { user: userId },
    { $addToSet: { items: { product } } },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  ).populate('items.product');

  res.status(200).json({ status: 'success', favorite });
});

export const deleteItemFromFavorites = AsyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) return next(new AppError(403, 'Unauthorized. please login'));

  const product = await Product.findById(productId);

  if (!product) return next(new AppError(404, 'Item not fonud.'));

  await Favorite.updateOne(
    { user },
    { $pull: { items: { product: product._id } } }
  );

  res.status(200).json({ message: 'Product removed from favorite list' });
});
