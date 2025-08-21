import { check, param } from 'express-validator';
import validatorMiddleware from '../../middleware/validatorMiddleware.js';
import { User } from '../../model/User.js';
import Cart from '../../model/Cart.js';
import Product from '../../model/Product.js';

export const getCartValidation = [
  check('user')
    .optional()
    .isMongoId()
    .withMessage('user id not valid')
    .custom(async (val) => {
      const user = await User.findById(val);
      if (!user) throw new Error('user not exsit');
      return true;
    }),
  validatorMiddleware,
];

export const AddToCartValidation = [
  check('items.product._id') // productId
    .isMongoId()
    .withMessage('Product id not valid')
    .bail()
    .custom(async (val) => {
      console.log(val);
      const product = await Product.findById(val);
      if (!product) throw new Error('Product not exsit');
      return true;
    }),
  validatorMiddleware,
];

export const updateCartValidation = [
  check('user')
    .isMongoId()
    .withMessage('user id not valid')
    .custom(async (val) => {
      const user = await User.findById(val);
      if (!user) throw new Error('user not exsit');
      return true;
    }),
  check('items._id')
    .isMongoId()
    .withMessage('Product id not valid')
    .custom(async (val) => {
      const product = await Product.findById(val);
      if (!product) throw new Error('Product not exsit');
      return true;
    }),
  check('cart')
    .isMongoId()
    .withMessage('cart id not valid')
    .custom(async (val) => {
      const cart = await Cart.findById(val);
      if (!cart) throw new Error('Cart id not valid');
      return true;
    }),
  validatorMiddleware,
];

export const deleteCartValidation = [
  param('id').isMongoId().withMessage('cart id not valid'), // Product id
  validatorMiddleware,
];
