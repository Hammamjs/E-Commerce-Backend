import { Schema, model } from 'mongoose';

const WishlistSchema = new Schema(
  {
    user: {
      ref: 'user',
      required: true,
      type: Schema.Types.ObjectId,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'product',
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

export default model('Wishlist', WishlistSchema);
