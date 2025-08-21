import { check, param } from 'express-validator';
import validatorMiddleware from '../../middleware/validatorMiddleware.js';

export const createCategoryValidation = [
  check('name')
    .notEmpty()
    .withMessage('name cannot be empty')
    .isString()
    .withMessage('Category name must be string'),
];

export const updateCategoryValidation = [
  param('id').isMongoId().withMessage('Invalid id'),
  validatorMiddleware,
];

export const deleteCategoryValidation = [
  param('id').isMongoId().withMessage('Invalid id'),
  validatorMiddleware,
];
