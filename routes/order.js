import { raw, Router } from 'express';
import {
  changeOrderStatusPending,
  changeOrderStatusDelivered,
  changeOrderStatusShipped,
  createOrder,
  OrderHistory,
  webhook,
  checkoutSession,
} from '../controllers/OrderContoller.js';
import { verifyJwt } from '../middleware/verifyJwt.js';
import { allowedTo } from '../middleware/allowedTo.js';
import { createFilterObj } from '../controllers/FactoryHandler.js';

const router = Router();

router
  .route('/')
  .post(verifyJwt, createOrder)
  .get(verifyJwt, createFilterObj, OrderHistory);

router.post(
  '/checkout-session',
  verifyJwt,
  allowedTo('USER', 'ADMIN'),
  checkoutSession
);

router.post('/stripe-hook', raw({ type: 'application/json' }), webhook);
router.use(verifyJwt);
router.patch('/shipped', allowedTo('ADMIN'), changeOrderStatusShipped);
router.patch('/delivered', allowedTo('ADMIN'), changeOrderStatusDelivered);
router.patch('/pending', allowedTo('ADMIN'), changeOrderStatusPending);

export default router;
