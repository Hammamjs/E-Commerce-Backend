import { Schema, model } from 'mongoose';

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      min: [3, 'Name should be at least 3 charcters'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tag: {
      type: String,
      default: 'new',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    features: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discountPrice: Number,
    inStock: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
    },
    image: {
      type: String,
      required: true,
    },
    brand: String,
    sales: {
      type: Number,
      default: 0,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: { type: Number, default: 0 },
    },
    attributes: {
      colors: {
        type: [String],
        required: true,
      },
      size: [String],
    },
  },
  { timestamps: true, versionKey: false }
);

ProductSchema.pre(/^find/, function (next) {
  this.populate([
    { path: 'user', select: 'firstname' },
    { path: 'category', select: 'name' },
  ]);
  next();
});

export default model('Product', ProductSchema);
