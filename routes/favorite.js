import { Router } from 'express';
import {
  addProductToFavorite,
  deleteItemFromFavorites,
  getFavorites,
  getUserFav,
} from '../controllers/favoriteController.js';
import { createFilterObj } from '../controllers/FactoryHandler.js';
import { ROLES_LIST } from '../config/ROLES_LIST.js';
import { allowedTo } from '../middleware/allowedTo.js';
import { verifyJwt } from '../middleware/verifyJwt.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(verifyJwt, allowedTo('USER', 'ADMIN'), createFilterObj, getFavorites)
  .post(verifyJwt, allowedTo('USER', 'ADMIN'), addProductToFavorite)
  .patch(verifyJwt, allowedTo('USER', 'ADMIN'), deleteItemFromFavorites);
router.get('/user', verifyJwt, allowedTo('USER', 'ADMIN'), getUserFav);

export default router;
