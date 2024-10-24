const express = require("express")
const router = express.Router()

router.route('/')
.all((req, res, next) => {
  res.statusCode = 200;
  // Log the request URL
  console.log('Request URL:', req.url);

  // Log the request method
  console.log('Request Method:', req.method);

  // Log the request headers
  // console.log('Request Headers:', req.headers);
  next();
})
.get((req, res, next) => {
  res.render("index.ejs", { username: 'Guest' });
})
.post((req, res, next) => {
  console.log(req.body)
  res.render("index.ejs", { username: req.body.username });
})
.put((req, res, next) => {
  throw new Error("error if you use put method");
  res.end('When a PUT request is made, then this '
        + 'is the response sent to the client!');
})
.delete((req, res, next) => {
  res.end('When a DELETE request is made, then this '
        + 'is the response sent to the client!');
});

module.exports = router