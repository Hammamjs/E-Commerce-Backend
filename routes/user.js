import { Router } from 'express';

import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '../controllers/UserController.js';
import {
  createUserValidation,
  deleteUserValidation,
  updateUserValidation,
} from '../utils/validator/userValidation.js';
import { verifyJwt } from '../middleware/verifyJwt.js';
import { allowedTo } from '../middleware/allowedTo.js';
import ProductsRoute from '../routes/product.js';
import cartRoute from '../routes/cart.js';
import ReviewsRoute from '../routes/review.js';
import favoritesRoute from '../routes/favorite.js';
import { upload } from '../middleware/initMulter.js';
import { convertImagesToWebp } from '../middleware/convertImgsToWebp.js';

const router = Router();

router.use('/:userId/favorites', favoritesRoute);
router.use('/:userId/cart', cartRoute);
router.use('/:userId/products', verifyJwt, ProductsRoute);
router.use('/:userId/reviews', ReviewsRoute);

router
  .route('/')
  .get(verifyJwt, allowedTo('ADMIN'), getUsers)
  .post(createUserValidation, createUser);
router
  .route('/:id')
  .put(
    verifyJwt,
    allowedTo('ADMIN', 'USER'),
    upload.fields([{ name: 'profileImg', maxCount: 1 }]),
    convertImagesToWebp({ single: 'profileImg' }),
    updateUserValidation,
    updateUser,
  )
  .delete(verifyJwt, allowedTo('ADMIN'), deleteUserValidation, deleteUser);

export default router;
