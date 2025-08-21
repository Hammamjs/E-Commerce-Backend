import Router from 'express';
import {
  addAddress,
  removeAddress,
} from '../controllers/AddressesContoller.js';
import { allowedTo } from '../middleware/allowedTo.js';
import { verifyJwt } from '../middleware/verifyJwt.js';

const router = Router();

router
  .route('/')
  .patch(verifyJwt, allowedTo('USER'), addAddress)
  .delete(verifyJwt, allowedTo('USER'), removeAddress);

export default router;
