import Connect from '../config/DBConn.js';
import { config } from 'dotenv';
import Category from '../model/Category.js';
import { category as dummyData } from '../data/category.js';
import mongoose from 'mongoose';
// dotenv
config();

const CategorySeeds = async () => {
  try {
    // Connect database
    Connect();
    console.log('Connected to database');
    // remove all old categories
    await Category.deleteMany();
    console.log('All Categories removed');
    console.log('/---------------------/');

    // we need to add _ids before uploaded it to database
    const categoriesWithIds = dummyData.map((category) => ({
      ...category,
      _id: new mongoose.Types.ObjectId(), // add _id to categoy
    }));

    await Category.insertMany(categoriesWithIds);
    console.log('All Categories insetrted');
    console.log('/---------------------/');
    // exit from operation
    process.exit(1);
  } catch (err) {
    console.log(err);
  }
};

CategorySeeds();
