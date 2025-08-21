import Product from '../model/Product.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './FactoryHandler.js';

export const createProduct = createOne(Product);

export const getProduct = getOne(Product);

export const getProducts = getAll(Product);

export const updateProduct = updateOne(Product);

export const deleteProduct = deleteOne(Product);
