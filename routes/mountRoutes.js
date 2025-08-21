// Routes
import userRoute from './user.js';
import productRoute from './product.js';
import categoryRoute from './category.js';
import authRoute from './auth.js';
import cartRoute from './cart.js';
import reviewRoute from './review.js';
import wishlistRoute from './wishlist.js';
import favoriteRoute from './favorite.js';
import addressRoute from './address.js';
import ordersRoute from './order.js';
import AppError from '../utils/AppError.js';
import { apiLimiter } from '../middleware/limiter.js';

const mountRoutes = (app) => {
  app.use(apiLimiter);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/users', userRoute);
  app.use('/api/v1/orders', ordersRoute);
  app.use('/api/v1/cart', cartRoute);
  app.use('/api/v1/favorites', favoriteRoute);
  app.use('/api/v1/wishlist', wishlistRoute);
  app.use('/api/v1/categories', categoryRoute);
  app.use('/api/v1/addresses', addressRoute);
  app.use('/api/v1/products', productRoute);
  app.use('/api/v1/reviews', reviewRoute);

  app.all('*', (req, res, next) => {
    next(new AppError(404, 'No route matched'));
  });
};

export default mountRoutes;
