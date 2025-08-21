import { body, check } from 'express-validator';
import validatorMiddleware from '../../middleware/validatorMiddleware.js';
import { User } from '../../model/User.js';

export const createUserValidation = [
  check('username')
    .notEmpty()
    .withMessage('username is required')
    .isLength({ min: 3 })
    .withMessage('username should be at least 3 charcters'),
  check('password')
    .notEmpty()
    .withMessage('Password cannot be empty')
    .isLength({ min: 8 })
    .withMessage('Password should be at least 8 characters')
    .custom((val, { req }) => {
      if (val !== req.body.passConfirm)
        throw new Error('Password and password confirm not matched');
      return true;
    })
    .withMessage('Paasword and password confirm should matched'),
  check('email')
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Email not valid')
    .custom(async (val) => {
      const user = await User.findOne({ email: val }).exec();
      if (user) throw new Error('User already exisit');
      return true;
    }),
  validatorMiddleware,
];

export const updateUserValidation = [
  check('id').isMongoId().withMessage('id not valid'),
  validatorMiddleware,
];

export const deleteUserValidation = [
  check('id').isMongoId().withMessage('id not valid'),
  validatorMiddleware,
];
