const express = require('express');
const User = require('../models/User');
const router = express.Router()

router.post('/', async (req, res, next) => {
  const { username, email, authType, password } = req.body;
  try {
    const userAndToken = await User.login(username, email, authType, password);
    if (userAndToken === false)
      return res.status(403).json({ error: 'Username or email does not match with given password'})
    return res.json(userAndToken);
  } catch (error) {
    next(error);
  }
})

module.exports = router