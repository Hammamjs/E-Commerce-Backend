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
import { upload } from '../middleware/initMulter.js';
import { convertImagesToWebp } from '../middleware/convertImgsToWebp.js';

const router = Router();

router
  .route('/')
  .get(getCategories)
  .post(
    verifyJwt,
    allowedTo('USER'),
    createCategoryValidation,
    upload.fields([{ name: 'image', maxCount: 1 }]),
    convertImagesToWebp,
    createCategory,
  );

router
  .route('/:id')
  .put(
    verifyJwt,
    allowedTo('USER'),
    updateCategoryValidation,
    upload.fields([{ name: 'image', maxCount: 1 }]),
    convertImagesToWebp,
    updateCategory,
  )
  .delete(
    verifyJwt,
    allowedTo('USER'),
    deleteCategoryValidation,
    deleteCategory,
  );

export default router;
