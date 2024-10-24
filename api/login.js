const express = require("express");
const User = require("../models/User");
const router = express.Router()

router.post("/", async (req, res, next) => {
  const { username, email, authType, password } = req.body;
  try {
    const userAndToken = await User.login(username, email, authType, password);
    return res.json(userAndToken);
  } catch (error) {
    next(error);
  }
})

module.exports = router