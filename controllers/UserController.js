import AsyncHandler from 'express-async-handler';
import { User } from '../model/User.js';
import AppError from '../utils/AppError.js';
import { deleteOne, getAll, updateOne } from './FactoryHandler.js';
import userObject from '../utils/user.js';
import { ROLES_LIST } from '../config/ROLES_LIST.js';

export const createUser = AsyncHandler(async (req, res, next) => {
  const { username, password, email, bio } = req.body;
  if (username || !password || !email)
    return next(new AppError(400, 'User name and password, email is required'));
  // check if user exist or username
  const isUserExist = await User.findOne({ $or: [{ username }, { email }] });

  if (isUserExist)
    return next(new AppError(400, 'Email or username already exist'));

  const user = await User.create({
    username,
    password,
    email,
    bio,
    role: ROLES_LIST.USER,
  });
  res.status(201).json({ message: 'Account created!', data: userObject(user) });
});

export const getUsers = getAll(User);

export const updateUser = updateOne(User);

export const deleteUser = deleteOne(User, 'userDeleted');
