import Product from '../model/Product.js';
import { config } from 'dotenv';
import Connect from '../config/DBConn.js';
import { products as dummyProducts } from '../data/product.js';
import mongoose from 'mongoose';
import Category from '../model/Category.js';

config({ path: '.env.development' });

const seedProducts = async () => {
  try {
    // Connect to database
    Connect();
    console.warn('DB Connected');
    // delete all products first
    // await Product.deleteMany();
    console.info('Delete old products');

    // get Categories id
    console.info('We trying to get categories ...');
    const categories = await Category.find({});
    console.warn('categories retrived ...');
    if (!categories.length)
      throw new Error('Categories is empty fill it First');
    // before insert any data to db we need to add _id cause it won't added manually

    const productIdCategoryId = dummyProducts.map((product) => {
      const matched = categories.find(
        (category) =>
          category.name.toLowerCase() === product.category.toLowerCase(),
      );

      return {
        ...product,
        category: matched ? matched?._id : null,
        _id: new mongoose.Types.ObjectId(),
      };
    });

    console.warn("Category id's set in products");
    console.warn("Product id's set in products");
    // Add all new Products
    await Product.insertMany(productIdCategoryId);
    console.warn('New products added');
    process.exit(1);
  } catch (err) {
    console.error('Failed to upload products ', err);
    console.error(err);
    process.exit(1);
  }
};

seedProducts();
