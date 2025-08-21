export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = Number(err.statusCode) || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development')
    return handleDevelopmentErrors(err, res);
  else return handleProductionError(err, res);
};

const handleDevelopmentErrors = (err, res) => {
  const cleanErrror = {
    message: err.message,
    stack: err.stack,
    status: err.status,
    statusCode: err.statusCode,
  };
  return res.status(err.statusCode).json({
    message: err.message,
    error: cleanErrror,
    stack: err.stack,
    status: err.status,
  });
};

const handleProductionError = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      message: err.message,
      status: err.status,
    });
  } else {
    console.log('Error 💥 ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};
