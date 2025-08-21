import Category from '../model/Category.js';
import { createOne, deleteOne, getAll, updateOne } from './FactoryHandler.js';

export const createCategory = createOne(Category);

export const getCategories = getAll(Category);

export const updateCategory = updateOne(Category);

export const deleteCategory = deleteOne(Category);
