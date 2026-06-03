export default function errorHandler(err, req, res, next) {
  console.error('Error encountered:', err.stack || err.message || err);

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Something went wrong on our end. We are fixing it.',
    error: process.env.NODE_ENV === 'development' ? err : undefined
  });
}
