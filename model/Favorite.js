import { Schema, model } from 'mongoose';

const FavoritesSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
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

export default model('Favorite', FavoritesSchema);
