const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require("./swagger.json");

// Importing all the routes
const homeRoutes = require('./routes/home')
const loginRoutes = require('./api/login')
const registerRoutes = require('./api/register')
const noteRoutes = require('./api/notes');
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');

app.set('view engine', 'ejs');
app.use(express.static('public'));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON data
app.use(express.json());

// Handling routes request
app.use('/', homeRoutes)
app.use('/api/login', loginRoutes)
app.use('/api/register', registerRoutes)
app.use('/api/notes', verifyJWT, noteRoutes)

// // Serve swagger.json
// app.get("/swagger.json", (req, res) => {
//   res.sendFile(path.join(__dirname, "swagger.json"));
// });

// Serve Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware to handle errors
app.use(errorHandler);

app.listen(8000, () => {
  console.log(`Server is listening at http://localhost:8000`);
});

module.exports = app