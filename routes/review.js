import { Router } from 'express';
import {
  createReview,
  deleteReview,
  getReviews,
  updateReview,
} from '../controllers/reviewController.js';
import {
  createFilterObj,
  setProductFilter,
} from '../controllers/FactoryHandler.js';
import {
  deleteReviewValidation,
  createReviewValidation,
  updateReviewValidation,
  getReviewValidation,
} from '../utils/validator/reviewValidation.js';
import { verifyJwt } from '../middleware/verifyJwt.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(setProductFilter, getReviews)
  .post(verifyJwt, createReviewValidation, createReview);

router
  .route('/:id')
  .put(verifyJwt, updateReviewValidation, updateReview)
  .delete(verifyJwt, deleteReviewValidation, deleteReview);

export default router;
