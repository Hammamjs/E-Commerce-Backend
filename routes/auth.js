import { Router } from 'express';
import {
  handleChangeUserPassword,
  handleForgotPassword,
  handleLogout,
  handleRefreshLogin,
  handleResetPasswordWithLink,
  handleSignin,
  handleSignup,
  handleUpdateUserPaasword,
  handleVerifiedResetCode,
} from '../controllers/authController.js';
import {
  authValidation,
  changePasswordValidation,
  changeUserPasswordValidation,
  forgotPasswordValidation,
  registerValidation,
  verifyResetCodeValidation,
} from '../utils/validator/authValidation.js';
import { verifyJwt } from '../middleware/verifyJwt.js';
import { authLimiter, passwordResetLimiter } from '../middleware/limiter.js';

const router = Router();

router.post('/sign-up', authLimiter, registerValidation, handleSignup);
router.post('/', authLimiter, authValidation, handleSignin);
router.get('/refresh', verifyJwt, handleRefreshLogin);

router.put(
  '/change-password',
  changePasswordValidation,
  handleUpdateUserPaasword
);
router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotPasswordValidation,
  handleForgotPassword
);

router.get('/logout', verifyJwt, handleLogout);

router.post('/verify-code', verifyResetCodeValidation, handleVerifiedResetCode); // /verify-code

router.patch(
  '/reset-password',
  changeUserPasswordValidation,
  handleChangeUserPassword
);

router.patch('/reset-password/:token', handleResetPasswordWithLink);
export default router;
