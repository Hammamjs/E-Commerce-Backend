import { check, param } from 'express-validator';
import validatorMiddleware from '../../middleware/validatorMiddleware.js';

export const createProductValidation = [
  check('name')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 3 })
    .withMessage('Product name should be at least 3 charcters'),
  check('user')
    .isMongoId()
    .withMessage('Product should belong to specific user'),
  check('category')
    .isMongoId()
    .withMessage('Product should be under specific category'),
  check('description')
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isString()
    .withMessage('Description must be string')
    .isLength({ min: 20 })
    .withMessage('Description should be at least 20 charcters'),
  check('price')
    .notEmpty()
    .withMessage('Price is required')
    .isDecimal()
    .withMessage('Price should be integer'),
  check('discountPrice')
    .optional()
    .isDecimal()
    .withMessage('Discount must be number'),
  check('inStock')
    .notEmpty()
    .withMessage('Inventory cannot be empty')
    .isInt()
    .withMessage('Product Inventory cannot be empty'),
  check('images').notEmpty().withMessage('Product images cannot be empty'),
  check('brand').isString().withMessage('Brand must be string').optional(),

  validatorMiddleware,
];

export const updateProductValidation = [
  param('id').isMongoId().withMessage('Invalid product id'),
  validatorMiddleware,
];

export const deleteProductValidation = [
  param('id').isMongoId().withMessage('Invalid product id'),
  validatorMiddleware,
];
