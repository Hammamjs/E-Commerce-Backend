import { Router } from 'express';
import {
  addToWishlist,
  deleteFromWishList,
  getAllWishlist,
} from '../controllers/WishlistController.js';
import { ROLES_LIST } from '../config/ROLES_LIST.js';
import { allowedTo } from '../middleware/allowedTo.js';
import { verifyJwt } from '../middleware/verifyJwt.js';

const router = Router();

router
  .route('/')
  .get(verifyJwt, allowedTo('USER'), getAllWishlist)
  .post(verifyJwt, allowedTo('USER'), addToWishlist)
  .delete(verifyJwt, allowedTo('USER'), deleteFromWishList);

export default router;
