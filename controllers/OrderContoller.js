import { config } from 'dotenv';
import Stripe from 'stripe';
import AsyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
import Order from '../model/Order.js';
import Cart from '../model/Cart.js';
import { getAll, updateOrderStatus } from './FactoryHandler.js';
import { User } from '../model/User.js';
import Product from '../model/Product.js';
import mongoose from 'mongoose';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` }); // .env

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createOrder = AsyncHandler(async (req, res, next) => {
  const { cartId } = req.body;

  if (!cartId) retur(new AppError(400, 'Cart id not provided'));

  const cart = await Cart.findOne({ _id: cartId }).populate('items.product');

  if (!cart) return next(new AppError(400, 'Cart empty or not found'));

  if (cart.items.length === 0) return next(new AppError(400, 'Cart is empty'));

  const order = new Order({
    items: cart.items,
    quantity: cart.items.reduce((sum, item) => sum + item, 0),
    user: cart.user._id,
    totalPrice,
  });

  await order.save();

  await cart.deleteOne({ _id: cart._id });

  res.status(200).json({
    message: 'Order submitted',
    clientSecret: paymentIntent.client_secret,
    session,
  });
});

export const checkoutSession = AsyncHandler(async (req, res, next) => {
  const { cartId } = req.body;
  const TAX_RATE = 0.5;
  const SHIPPING_COST = 5;
  // Transaction for data consistency
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // check if cart exist
    const cart = await Cart.findOne({ _id: cartId })
      .populate('items.product')
      .session(session);

    if (!cart || cart.length === 0)
      return next(new AppError(404, 'Cart not found or empty'));

    // get user
    const user = await User.findById(req.user._id)
      .populate('address')
      .session(session);

    // check if user set address
    if (!user?.address) return next(new AppError(400, 'Address not set'));

    // calculate totals
    const taxAmount = cart.totalPrice + TAX_RATE;
    const totalAmount = SHIPPING_COST + taxAmount;

    // Create order
    const [order] = await Order.create(
      [
        {
          user: user._id,
          items: cart.items,
          shippingAddress: user.address,
          totalPrice: totalAmount,
          status: 'pending',
          isPaid: true,
          quantity: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      ],
      { session }
    );
    // if order created change products QTY
    if (order) {
      const bulkOption = cart.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: {
            $inc: { quantity: -item.quantity, sold: item.quantity },
          },
        },
      }));
      await Product.bulkWrite(bulkOption, { session });

      // Clear Cart
      await Cart.findOneAndDelete({ _id: cartId }, { session });
    }

    console.log('Order ID ', order._id.toString());

    // Create Stripe session with order ID in metadata
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cart.items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.name,
            images: [item.product.image],
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
      metadata: {
        orderId: order._id.toString(), // Critical connection point
      },
    });

    await session.commitTransaction();

    res
      .status(201)
      .json({ status: 'success', data: order, sessionId: stripeSession.id });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
});

export const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const orderPrice = session.amount_total / 100;

  const cart = await Cart.findById(cartId);
  const user = await User.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await Order.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: orderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: 'card',
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Cart.findByIdAndDelete(cartId);
  }
};

export const webhook = AsyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const endpoints = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpoints);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'checkout.session.completed') {
    // 1. Find and update the existing order
    const order = await Order.findByIdAndUpdate(
      session.metadata.orderId, // Get order ID from metadata
      {
        status: 'paid',
        isPaid: true,
        paidAt: new Date(),
        paymentMethodType: 'card',
      },
      { new: true }
    );

    // 2. Additional fulfillment logic if needed
    if (order) {
      // Update product quantities
      const bulkOptions = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product },
          update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
        },
      }));
      await Product.bulkWrite(bulkOptions);

      // Clear cart if you're storing it separately
      await Cart.findOneAndDelete({ user: order.user });
    }
  }
  res.status(200).json({ received: true });
});

// for any reason that make product return to first state
export const changeOrderStatusPending = updateOrderStatus(Order, 'pending');

export const changeOrderStatusShipped = updateOrderStatus(Order, 'shipped');

export const changeOrderStatusDelivered = updateOrderStatus(Order, 'delivered');

export const OrderHistory = getAll(Order, [
  {
    path: 'items.product',
    select: 'name price',
  },
  {
    path: 'user',
    select: 'username email',
  },
]);
