import { model, Schema } from 'mongoose';

const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      required: true,
      min: [3, 'Review text cannot less than 3 charcters'],
    },
  },
  { timestamps: true, versionKey: false }
);

export default model('Review', ReviewSchema);
