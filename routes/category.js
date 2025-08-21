import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../controllers/CategoryController.js';
import {
  createCategoryValidation,
  deleteCategoryValidation,
  updateCategoryValidation,
} from '../utils/validator/categoryValidation.js';

import { allowedTo } from '../middleware/allowedTo.js';
import { verifyJwt } from '../middleware/verifyJwt.js';

const router = Router();

router
  .route('/')
  .get(getCategories)
  .post(verifyJwt, allowedTo('USER'), createCategoryValidation, createCategory);

router
  .route('/:id')
  .put(verifyJwt, allowedTo('USER'), updateCategoryValidation, updateCategory)
  .delete(
    verifyJwt,
    allowedTo('USER'),
    deleteCategoryValidation,
    deleteCategory
  );

export default router;
