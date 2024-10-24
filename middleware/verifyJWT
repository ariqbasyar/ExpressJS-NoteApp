const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'token is required' });
  }

  // The token might be in the format: 'Bearer <token>', so split it.
  const splitToken = token.split(' ');

  if (splitToken.length !== 2 || splitToken[0] !== 'Bearer') {
    return res.status(403).json({ error: 'invalid token format' });
  }

  jwt.verify(splitToken[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: err.message });
    }

    // Save the decoded user information to request for use in later routes
    req.user = decoded.user;
    next();
  });
};

module.exports = verifyJWT;