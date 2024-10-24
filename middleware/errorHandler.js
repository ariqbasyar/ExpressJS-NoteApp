const errorHandler = (err, req, res, next) => {
  console.error(err.message);  // Log the error message (optional)

  res.setHeader('Content-Type', 'application/json'); // Set content type to JSON

  if (err.statusCode) {
    // If the error has a statusCode property, send it as the response status
    res.status(err.statusCode).json({ error: err.message });
  } else {
    // Otherwise, default to 500 (Internal Server Error)
    res.status(500).json({ error: 'an unexpected error occurred' });
  }
}

module.exports = errorHandler;