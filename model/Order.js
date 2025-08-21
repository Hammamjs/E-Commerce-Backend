import { Schema, model } from 'mongoose';

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered'],
      required: true,
      default: 'pending',
    },
    PaidAt: {
      type: Date,
      default: Date.now(),
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    PaymentMethodType: {
      type: String,
      default: 'card',
    },
  },
  { timestamps: true, versionKey: false }
);

export default model('Order', OrderSchema);
