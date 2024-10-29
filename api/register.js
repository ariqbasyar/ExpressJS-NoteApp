const express = require('express')
const User = require('../models/User')
const router = express.Router()

router.post('/', async (req, res, next) => {
  const { username, email, authType, password } = req.body;
  try {
    const newUser = await User.register(username, email, authType, password);
    return res.json(newUser);
  } catch (error) {
    next(error);
  }
})

module.exports = router