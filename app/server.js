const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml"); // Replace './swagger.yaml' with the path to your Swagger file
const app = express();

app.use(bodyParser.json());

// Importing the data from JSON files
const users = require("../initial-data/users.json");
const brands = require("../initial-data/brands.json");
const products = require("../initial-data/products.json");

let cart = [];

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, "yoursecretkey");
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "User Authentication Failed" });
  }
};

// Get /api/brands

app.get("/api/brands", (req, res) => {
  res.status(200).json(brands);
});

//Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((user) => user.login.username == username);

  if (!user) {
    return res.status(401).json({
      message: "User not found",
    });
  }

  if (user.login.password !== password) {
    return res.status(401).json({
      message: "Incorrect Password",
    });
  }

  const token = jwt.sign({ userId: user.login.username }, "yoursecretkey");

  res.status(200).json({
    message: "Auth successful",
    token: token,
  });
});

//Add to the cart
app.post("/api/addToCart", authenticate, (req, res) => {
  const { productId, quantity } = req.body;

  const product = products.find((product) => product.id == productId);

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  cart.push({
    productId: product.id,
    quantity: quantity,
  });

  res.status(200).json(cart);
});

//Retrieve the cart
app.get("/api/getCart", authenticate, (req, res) => {
  res.status(200).json(cart);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
