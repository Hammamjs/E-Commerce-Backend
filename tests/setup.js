import mongoose from 'mongoose';
process.env.NODE_ENV = 'test';
mongoose.set('strictQuery', false);
