import Product from '../model/Product.js';
import { config } from 'dotenv';
import Connect from '../config/DBConn.js';
import { products as dummyProducts } from '../data/product.js';
import mongoose from 'mongoose';
import { log } from '../utils/logSatuts.js';
import Category from '../model/Category.js';

config();

const seedProducts = async () => {
  const { success, info, error } = log;

  try {
    // Connect to database
    Connect();
    success('DB Connected');
    // delete all products first
    await Product.deleteMany();
    info('Delete old products');

    // get Categories id
    info('We trying to get categories ...');
    const categories = await Category.find({});
    success('categories retrived ...');
    if (!categories.length)
      throw new Error('Categories is empty fill it First');
    // before insert any data to db we need to add _id cause it won't added manually

    const productIdCategoryId = dummyProducts.map((product) => {
      const matched = categories.find(
        (category) =>
          category.name.toLowerCase() === product.category.toLowerCase()
      );

      return {
        ...product,
        category: matched ? matched?._id : null,
        _id: new mongoose.Types.ObjectId(),
      };
    });

    success("Category id's set in products");
    success("Product id's set in products");
    // Add all new Products
    await Product.insertMany(productIdCategoryId);
    success('New products added');
    process.exit(1);
  } catch (err) {
    error('Failed to upload products ', err);
    console.log(err);
    process.exit(1);
  }
};

seedProducts();
