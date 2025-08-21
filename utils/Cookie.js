export const setCookie = (res, name, value, options = {}) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const defaults = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
  };

  res.cookie(name, value, {
    ...defaults,
    ...options,
    maxAge: options.maxAge || 24 * 60 * 60 * 1000, // def => 1 Day
  });
};

export const clearCookie = (res, name) => {
  res.clearCookie(name, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
};
