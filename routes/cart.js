import { Router } from 'express';
import {
  AddToCart,
  deleteCart,
  deleteFromCart,
  getCarts,
  getUserCart,
  updateCart,
} from '../controllers/CartController.js';
import { verifyJwt } from '../middleware/verifyJwt.js';
import { createFilterObj } from '../controllers/FactoryHandler.js';
import {
  AddToCartValidation,
  deleteCartValidation,
  getCartValidation,
} from '../utils/validator/cart.js';
import { addIdParamToBody } from '../controllers/FactoryHandler.js';
import { ROLES_LIST } from '../config/ROLES_LIST.js';
import { allowedTo } from '../middleware/allowedTo.js';

const router = Router({ mergeParams: true });

router
  .route('/')
  .get(
    verifyJwt,
    allowedTo('ADMIN'),
    createFilterObj,
    getCartValidation,
    getCarts
  )
  .post(verifyJwt, addIdParamToBody, AddToCartValidation, AddToCart);

router
  .route('/:id')
  .patch(
    verifyJwt,
    allowedTo('ADMIN', 'USER'),
    // createFilterObj,
    deleteCartValidation,
    deleteFromCart
  )
  .delete(verifyJwt, deleteCart)
  .put(verifyJwt, allowedTo('ADMIN', 'USER'), updateCart);
router.get('/user', verifyJwt, getUserCart);

export default router;
