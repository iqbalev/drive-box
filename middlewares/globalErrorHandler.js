function globalErrorHandler(err, req, res, next) {
  console.log(err.stack);
  const statusCode = err.statusCode || 500;
  const errorMessage =
    statusCode === 500 ? "Internal Server Error" : err.message;

  return res.status(statusCode).render("error", { statusCode, errorMessage });
}

export default globalErrorHandler;
