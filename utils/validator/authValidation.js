import { body, check } from 'express-validator';
import validatorMiddleware from '../../middleware/validatorMiddleware.js';

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  needsUpercase: true,
  needsSpecialChar: true,
  needsNumber: true,
};

const validatePassword = (fieldName = 'password') => [
  body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isLength({ min: PASSWORD_REQUIREMENTS.minLength })
    .withMessage(
      `${fieldName} must be at least ${PASSWORD_REQUIREMENTS.minLength} charcters`
    )
    .custom((val) => {
      if (PASSWORD_REQUIREMENTS.needsUpercase && !/[A-Z]/.test(val))
        throw new Error(`${fieldName} must be at least contain one uppercase`);
      if (PASSWORD_REQUIREMENTS.needsNumber && !/0-9/)
        throw new Error(`${fieldName} must be at least contain one number`);

      if (PASSWORD_REQUIREMENTS.needsNumber && !/[^A-Za-z0-9]/)
        throw new Error(
          `${fieldName} must be at least contain one special char`
        );
      return true;
    }),
];

const validateEmail = (fieldName = 'email') => [
  body(fieldName)
    .notEmpty()
    .withMessage(`${fieldName} is required`)
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

export const registerValidation = [
  check('username')
    .notEmpty()
    .withMessage('username is required')
    .isLength({ min: 3 })
    .withMessage('username must be at least')
    .trim()
    .escape(),
  ...validateEmail(),
  check('confirmPassword')
    .notEmpty()
    .withMessage('Passsword is required')
    .custom((val, { req }) => {
      if (val !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
  ...validatePassword(),
  validatorMiddleware,
];

export const authValidation = [
  ...validateEmail(),
  check('password').notEmpty().withMessage('Password is required'),
  validatorMiddleware,
];

export const changePasswordValidation = [
  check('currentPassword')
    .notEmpty()
    .withMessage('currentPassword is required'),
  ...validateEmail(),
  ...validatePassword('newPassword'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((val, { req }) => {
      if (val !== req.body.newPassword)
        throw new Error('Passwords do not match');
      return true;
    }),
  validatorMiddleware,
];

export const forgotPasswordValidation = [
  ...validateEmail(),
  validatorMiddleware,
];

export const verifyResetCodeValidation = [
  check('resetCode')
    .notEmpty()
    .withMessage('Reset code is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('Reset code must be 6 digits'),
  validatorMiddleware,
];

export const changeUserPasswordValidation = [
  ...validateEmail(),
  ...validatePassword('newPassword'),
  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((val, { req }) => {
      if (val !== req.body.newPassword)
        throw new Error('Passwords do not match');
      return true;
    }),
];
