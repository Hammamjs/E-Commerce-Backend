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
  .get(
    verifyJwt,
    allowedTo(ROLES_LIST.USER, ROLES_LIST.ADMIN),
    createFilterObj,
    getFavorites,
  )
  .post(
    verifyJwt,
    allowedTo(ROLES_LIST.USER, ROLES_LIST.ADMIN),
    addProductToFavorite,
  )
  .patch(
    verifyJwt,
    allowedTo(ROLES_LIST.USER, ROLES_LIST.ADMIN),
    deleteItemFromFavorites,
  );
router.get(
  '/user',
  verifyJwt,
  allowedTo(ROLES_LIST.USER, ROLES_LIST.ADMIN),
  getUserFav,
);

export default router;
