import { getAll } from './FactoryHandler.js';
import Cart from '../model/Cart.js';
import AsyncHandler from 'express-async-handler';
import { User } from '../model/User.js';
import AppError from '../utils/AppError.js';
import Product from '../model/Product.js';
import { getIo } from '../utils/socket.js';
import mongoose from 'mongoose';

const MIN_QTY = 1;
const CART_ERRORS = {
  USER_NOT_FOUND: 'User not found',
  PRODUCT_NOT_FOUND: 'Product not found',
  INSUFFICIENT_STOCK: 'Insufficient product quantity in stock',
  CART_NOT_FOUND: 'Cart not found',
  ITEM_NOT_IN_CART: 'Item not in cart',
};

export const getCarts = getAll(Cart);
export const getUserCart = AsyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId })
    .lean()
    .populate('items.product');
  if (!cart) {
    return res.status(200).json({
      data: {
        items: [],
        totalItems: 0,
        totalPrice: 0,
      },
    });
  }
  return res.status(200).json({ data: cart });
});

export const AddToCart = AsyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { items } = req.body;

    const userId = req.user._id;
    if (!userId) return next(new AppError(403, 'Authentication is required.'));

    // sure not negative value
    const quantity = Math.min(MIN_QTY, Math.abs(Number(items.quantity)));

    console.log('Quantity', quantity);

    const user = await User.findById(userId).select('_id').lean();

    if (!user) {
      await session.abortTransaction();
      return next(new AppError(404, CART_ERRORS.USER_NOT_FOUND));
    }

    const product = await Product.findById(items.product);
    if (!product) {
      await session.abortTransaction();
      return next(new AppError(404, CART_ERRORS.PRODUCT_NOT_FOUND));
    }
    // check if user quantity not exceed the inventory
    if (product.inStock < quantity) {
      await session.abortTransaction();
      return next(
        new AppError(
          400,
          `${CART_ERRORS.INSUFFICIENT_STOCK}. available ${product.inStock}`
        )
      );
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: user._id,
        items: [],
        totalPrice: 0,
        totalItems: 0,
      });
    }

    // get specific product from cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product._id.toString() === items.product._id.toString()
    );

    if (itemIndex !== -1) {
      // Mean item exist in cart
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].total =
        (+product.discountPrice ?? +product.price) * quantity;
    } else {
      // product not in cart so we added it
      cart.items.push({
        price: product.price,
        product: items.product,
        name: product.name,
        total: (product.discountPrice ?? product.price) * quantity,
        quantity,
      });
    }

    // update cart after the previos operation
    cart.totalPrice = cart.items.reduce((sum, item) => {
      console.log(item.total);
      return sum + item.total;
    }, 0);
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    await cart.save({ session });
    await product.save({ session });
    await session.commitTransaction();

    getIo().emit('addToCart', {
      userId: user?._id,
      action: 'add',
      cart: await Cart.findById(cart._id).populate('items.product'),
    });
    res.status(200).json({ message: 'Added to cart', cart });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    await session.endSession();
  }
});

export const updateCart = AsyncHandler(async (req, res, next) => {
  // start session
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { items } = req.body;

    if (!items || !items._id || !items.quantity) {
      await session.abortTransaction();
      return next(new AppError(401, 'Product ID and quantity are required.'));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      await session.abortTransaction();
      return next(new AppError(403, CART_ERRORS.USER_NOT_FOUND));
    }

    const product = await Product.findById(items._id).session(session);
    if (!product) {
      await session.abortTransaction();
      return next(new AppError(404, CART_ERRORS.PRODUCT_NOT_FOUND));
    }

    const cart = await Cart.findOne({ user: req.user._id }).session(session);

    if (!cart) {
      await session.abortTransaction();
      return next(new AppError(400, CART_ERRORS.CART_NOT_FOUND));
    }

    // find the product in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === items._id
    );

    if (itemIndex === -1) {
      await session.abortTransaction();
      return next(new AppError(404, CART_ERRORS.ITEM_NOT_IN_CART));
    }

    // to track which operation state decrement or increment
    let oldQuantity = cart.items[itemIndex].quantity;
    let newQuantity = Math.max(MIN_QTY, Math.abs(Number(items.quantity)));

    const quantityDiff = newQuantity - oldQuantity;

    if (quantityDiff > 0 && quantityDiff > product.inStock) {
      await session.abortTransaction();
      return next(
        new AppError(
          404,
          `${CART_ERRORS.INSUFFICIENT_STOCK} Available ${product.inStock}`
        )
      );
    }

    if (newQuantity < MIN_QTY) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity += items.quantity;
      cart.items[itemIndex].total =
        cart.items[itemIndex].quantity *
        (product.discountPrice ?? product.price);
      console.log('Total ', cart.items[itemIndex].total);
    }

    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.totalItems = cart.items.reduce((sum, item) => {
      return sum + +item.quantity;
    }, 0);

    await cart.save({ session });
    await product.save({ session });
    await session.commitTransaction();

    // Emit socket event
    getIo().emit('cartUpdate', {
      userId: user?._id,
      action: 'update',
      cart: await Cart.findById(cart._id).populate('items.product'),
    });
    res.status(200).json({ message: 'Cart updated', cart });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
});

export const deleteFromCart = AsyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // delete cart and return and update product
    const { id } = req.params;

    if (!id) {
      await session.abortTransaction();
      return next(new AppError(402, 'Product ID required'));
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();
      return next(new AppError(404, CART_ERRORS.USER_NOT_FOUND));
    }

    const product = await Product.findById(id).session(session);
    if (!product) {
      await session.abortTransaction();
      return next(new AppError(402, CART_ERRORS.PRODUCT_NOT_FOUND));
    }

    const cart = await Cart.findOne({ user: user._id }).session(session);
    if (!cart) {
      await session.abortTransaction();
      return next(new AppError(402, CART_ERRORS.CART_NOT_FOUND));
    }

    const itemIndex = cart.items.findIndex((item) => {
      return item.product._id.toString() === id;
    });

    if (itemIndex === -1) {
      await session.abortTransaction();
      return next(new AppError(403, CART_ERRORS.ITEM_NOT_IN_CART));
    }

    const removedItem = cart.items[itemIndex];

    // update cart
    cart.totalItems = cart.totalItems - removedItem.quantity;
    cart.totalPrice =
      cart.totalPrice - removedItem.quantity * removedItem.price;

    cart.items.splice(itemIndex, 1);

    await cart.save({ session });
    await product.save({ session });
    await session.commitTransaction();
    getIo().emit('cartUpdate', {
      userId: user?._id,
      action: 'remove',
      cart: await Cart.findById(cart._id).populate('items.product'),
    });
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
});

export const deleteCart = AsyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const { id } = req.params;

    if (!id) {
      await session.abortTransaction();
      return next(new AppError(402, 'Id is required'));
    }

    const user = await User.findById(req.user._id).session(session);
    if (!user) {
      await session.abortTransaction();
      return next(new AppError(403, CART_ERRORS.USER_NOT_FOUND));
    }

    const cart = await Cart.findByIdAndDelete(id).session(session);
    if (!cart) {
      await session.abortTransaction();
      return next(new AppError(402, CART_ERRORS.CART_NOT_FOUND));
    }

    // commitedTransaction = true;
    await session.commitTransaction();

    getIo().emit('updateCart', {
      userId: user?._id,
      action: 'clear',
      cart: null,
    });
    res.status(200).json({ message: 'Cart removed' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});
