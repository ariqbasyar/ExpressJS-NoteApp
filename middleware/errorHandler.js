const errorHandler = (err, req, res, next) => {
  console.error(err.message);  // Log the error message (optional)

  res.setHeader('Content-Type', 'application/json'); // Set content type to JSON

  if (err.message.includes('not found')) {
    return res.status(404).json({ error: err.message });  // Not Found Error
  }

  // Fallback for unhandled errors
  res.status(500).json({ error: err.message });
}

module.exports = errorHandler;