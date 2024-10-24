class BadRequestError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InternalServerError';
    this.statusCode = 500;
  }
}

// You can add more classes if needed, like NotFoundError, UnauthorizedError, etc.
module.exports = { BadRequestError, InternalServerError };