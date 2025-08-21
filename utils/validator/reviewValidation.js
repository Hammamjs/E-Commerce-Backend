import { check, param } from 'express-validator';
import validatorMiddleware from '../../middleware/validatorMiddleware.js';
import { User } from '../../model/User.js';
import Product from '../../model/Product.js';

export const getReviewValidation = [
  param('user').optional().isMongoId().withMessage('user id not valid'),
  validatorMiddleware,
];

export const createReviewValidation = [
  check('comment')
    .notEmpty()
    .withMessage('Review cannot be empty')
    .isLength({ min: 3 })
    .withMessage('Review text is too short'),
  check('user._id').isMongoId().withMessage('user id not valid'),
  check('product').isMongoId().withMessage('product id not valid'),
  validatorMiddleware,
];

export const updateReviewValidation = [
  check('comment')
    .notEmpty()
    .isString()
    .withMessage('Review should be string')
    .withMessage('Review cannot be empty')
    .isLength({ min: 3 })
    .withMessage('Review text is too short'),
  check('id').isMongoId().withMessage('user id not valid'),
  validatorMiddleware,
];

export const deleteReviewValidation = [
  param('user').optional().isMongoId().withMessage('user id not valid'),
  check('id').optional().isMongoId().withMessage('Review id not valid'),
  validatorMiddleware,
];
