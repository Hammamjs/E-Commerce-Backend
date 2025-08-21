import AsyncHandler from 'express-async-handler';
import { User } from '../model/User.js';
import { getIo } from '../utils/socket.js';

export const addAddress = AsyncHandler(async (req, res, next) => {
  const { address } = req.body;
  const io = getIo();

  const user = await User.findById(req.user.userInfo._id);

  user.address.push(address);
  await user.save();

  io.emit('addedAddress', user);

  res.status(201).json({ message: 'Address added' });
});

export const removeAddress = AsyncHandler(async (req, res, next) => {
  const { address } = req.body;
  const io = getIo();
  const user = await User.findById(req.user.userInfo._id);

  const removeOne = user.addresses.filter((addr) => addr !== address);

  user.addresses = removeOne;
  await user.save();

  // real time refresh socket.io
  io.emit('removeAddress', user);
  res.status(200).json({ message: 'Address removed' });
});
