import jwt from 'jsonwebtoken';
import { User } from '../model/User.js';
import AsyncHandler from 'express-async-handler';
import AppError from '../utils/AppError.js';
import { compare, hash } from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { SendEmail } from '../utils/SendEmail.js';
import userObject from '../utils/user.js';

import { clearCookie, setCookie } from '../utils/Cookie.js';

const TOKEN_CONFIG = {
  access: {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15min',
    secret: process.env.ACCESS_TOKEN_SECRET,
  },
  refresh: {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '1d',
    secret: process.env.REFRESH_TOKEN_SECRET,
  },
};

// registeration route

export const handleSignup = AsyncHandler(async (req, res, next) => {
  const { sign } = jwt;
  const { username, password, email } = req.body;
  if (!username || !password || !email)
    return next(new AppError(400, 'All fields are required'));

  const userExist = await User.findOne({ email });

  if (userExist)
    return next(new AppError(400, 'This email address is already exist'));

  const user = await User.create({
    username,
    email,
    password,
  });

  const accessToken = sign(
    { role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: '1min',
    }
  );
  const RefreshToken = sign(
    {
      _id: user._id,
      role: user.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '1d',
    }
  );

  user.refreshToken = RefreshToken;
  await user.save();
  const maxAge = 24 * 60 * 60 * 1000;
  setCookie(res, 'jwt', RefreshToken, maxAge);

  res.status(200).json({
    message: 'Regestration completed!',
    accessToken,
    user: userObject(user),
  });
});

export const handleSignin = AsyncHandler(async (req, res, next) => {
  const { sign } = jwt;
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password').exec();

  if (!user || !(await user.comparePassword(password)))
    return next(new AppError(401, 'Invalid credentials'));

  const accessToken = sign(
    {
      _id: user.id,
      role: user.role,
    },
    TOKEN_CONFIG.access.secret,
    {
      expiresIn: TOKEN_CONFIG.access.expiresIn,
    }
  );

  const RefreshToken = sign(
    {
      _id: user._id,
      role: user.role,
    },
    TOKEN_CONFIG.refresh.secret,
    {
      expiresIn: TOKEN_CONFIG.refresh.expiresIn,
    }
  );

  const hashedToken = createHash('sha256').update(RefreshToken).digest('hex');

  user.refreshToken = hashedToken;
  await user.save();
  // set cookie
  const maxAge = 24 * 60 * 60 * 1000; // 1 Day
  setCookie(res, 'jwt', RefreshToken, maxAge);

  res.status(200).json({
    message: 'You are Logged in',
    accessToken,
    user: userObject(user),
  });
});

// Refresh token
export const handleRefreshLogin = AsyncHandler(async (req, res, next) => {
  const cookies = req.cookies;

  if (cookies?.jwt) {
    return next(new AppError(401, 'Refresh token required'));
  }

  const refreshToken = cookies.jwt;
  const hashedToken = createHash('sha265').update(refreshToken).digest('hex');
  // find user
  const user = await User.findOne({ refreshToken: hashedToken })
    .select('role _id')
    .lean();
  if (!user) {
    return next(new AppError(403, 'Invalid refresh token'));
  }

  // verify token
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err || !decoded._id || !user._id) {
        return next(new AppError(403, 'Token verification failed'));
      }
      const [newAccessToken, newRefreshToken] = await Promise.all([
        jwt.sign(
          {
            _id: user._id,
            role: user.role,
          },
          TOKEN_CONFIG.access.secret,
          { expiresIn: TOKEN_CONFIG.access.expiresIn }
        ),
        jwt.sign({ _id: user._id }, TOKEN_CONFIG.refresh.secret, {
          expiresIn: TOKEN_CONFIG.refresh.secret,
        }),
      ]);
      const newHashedToken = createHash('sha265')
        .update(refreshToken)
        .digest('hex');
      await User.findOneAndUpdate(
        { _id: user._id },
        { refreshToken: newHashedToken }
      );
      setCookie(res, 'jwt', newRefreshToken, 7 * 24 * 60 * 60 * 1000);

      res.json({
        status: 'success',
        accessToken: newAccessToken,
      });
    }
  );
});

// Logout
export const handleLogout = AsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.userInfo._id);
  if (!user) {
    clearCookie(res, 'jwt');
    return next(new AppError(400, 'User not found'));
  }

  user.refreshToken = '';
  await user.save();

  clearCookie(res, 'jwt');

  res.status(201).json({ message: 'You logged out' });
});

export const handleUpdateUserPaasword = AsyncHandler(async (req, res, next) => {
  const { email, currentPassword, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new AppError(404, 'User not found'));

  const isCorrectPass = await compare(currentPassword, user.password);

  if (!isCorrectPass)
    return next(new AppError(403, 'Current password incorrect'));

  user.password = newPassword;
  await user.save();
  res.status(200).json({ message: 'Password updated' });
});

export const handleForgotPassword = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) return next(new AppError(400, 'User not found'));

  const token = randomBytes(32).toString('hex');
  const dateToExpired = new Date(Date.now() + 10 * 60 * 1000);
  // reset link
  user.passwordResetToken = token;
  user.passwordResetTokenExpiry = dateToExpired; // 10Min

  // reset code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // create random reset code
  // hashed reset code
  user.passwordResetCode = createHash('sha256').update(resetCode).digest('hex');
  user.passwordResetCodeExpiry = dateToExpired;
  await user.save();

  const passwordResetLink = `${req.protocol}://${req.hostname}:${process.env.PORT}/${req.baseUrl}/${token}`;

  const options = {
    username: user.username,
    email: user.email,
    resetCode,
    resetLink: passwordResetLink,
  };

  SendEmail(options);
  res.status(200).json({ message: 'Verification sent review your email' });
});

export const handleResetPasswordWithLink = AsyncHandler(
  async (req, res, next) => {
    const { token, newPassword } = req.params;
    if (!token) return next(new AppError(400, 'Token not provided'));
    const user = await User.findOne({
      token,
      passwordResetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return next(new AppError(400, 'Invalid or expired token'));

    const hashedPassword = await hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiry = undefined;
    user.passwordResetCode = undefined;
    user.passwordResetCodeVerified = false;
    user.passwordResetCodeExpiry = undefined;

    await user.save();

    res.status(200).json({ message: 'Password updated' });
  }
);

export const handleVerifiedResetCode = AsyncHandler(async (req, res, next) => {
  const resetCode = createHash('sha256')
    .update(req.body.resetCode)
    .digest('hex');

  const user = await User.findOne({
    passwordResetCode: resetCode,
    passwordResetCodeExpiry: { $gt: Date.now() },
  });
  if (!user) return next(new AppError(400, 'Invalid or expired code'));

  user.passwordResetCodeVerified = true;
  await user.save();
  res.status(200).json({ message: 'Reset code verified' });
});

export const handleChangeUserPassword = AsyncHandler(async (req, res, next) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new AppError(400, 'User not exist'));

  if (!user.passwordResetCodeVerified)
    return next(new AppError(400, 'Reset code not verified'));

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;
  user.passwordResetCode = undefined;
  user.passwordResetCodeVerified = false;
  user.passwordResetCodeExpiry = undefined;
  await user.save();

  res.status(200).json({ message: 'Password updated' });
});
