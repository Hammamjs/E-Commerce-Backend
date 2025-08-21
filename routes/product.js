import { Router } from 'express';
import {
  deleteProduct,
  createProduct,
  getProducts,
  updateProduct,
  getProduct,
} from '../controllers/ProductController.js';
import {
  deleteProductValidation,
  createProductValidation,
  updateProductValidation,
} from '../utils/validator/productValidation.js';
import { allowedTo } from '../middleware/allowedTo.js';
import { createFilterObj } from '../controllers/FactoryHandler.js';
import { upload } from '../middleware/initMulter.js';
import { verifyJwt } from '../middleware/verifyJwt.js';
import ReviewRoute from './review.js';

const router = Router({ mergeParams: true });

// get specific reviews for product
router.use('/:productId/reviews', ReviewRoute);

router
  .route('/')
  .get(createFilterObj, getProducts)
  .post(
    verifyJwt,
    allowedTo('ADMIN'),
    createFilterObj,
    createProductValidation,
    createProduct
  );

router
  .route('/:id')
  .get(getProduct)
  .put(
    verifyJwt,
    allowedTo('ADMIN'),
    upload.array('imgs', 10),
    updateProductValidation,
    updateProduct
  )
  .delete(
    verifyJwt,
    allowedTo('ADMIN'),
    deleteProductValidation,
    deleteProduct
  );

export default router;
