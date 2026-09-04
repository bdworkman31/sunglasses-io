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
let subscribedEmails = [];

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

//Get list of products based on ID
app.get("/api/brands/:id/products", (req, res) => {
  const id = req.params.id;

  res.status(200).json({
    brandId: id,
  });
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

//Update Quantity in Cart
app.put("/api/cart/productQuantity/:id", authenticate, (req, res) => {
  const id = req.params.id;
  const quantity = req.body.quantity;

  const cartProduct = cart.find((product) => product.productId == id);

  if (!cartProduct) {
    return res.status(404).json({
      message: "Product not found in cart",
    });
  }

  cartProduct.quantity = quantity;

  res.status(200).json(cart);
});

//Retrieve the cart
app.get("/api/mycart", authenticate, (req, res) => {
  res.status(200).json(cart);
});

//Delete an item from the cart
app.delete("/api/cart/delete/:id", authenticate, (req, res) => {
  const id = req.params.id;

  const cartProduct = cart.find((product) => product.productId == id);

  if (!cartProduct) {
    return res.status(404).json({
      message: "Product not found in cart",
    });
  }

  cart = cart.filter((product) => product.productId != id);

  res.status(200).json(cart);
});

//Subscribe
app.post("/api/subscribe", (req, res) => {
  const newEmail = req.body.email;

  subscribedEmails.push(newEmail);

  res.status(200).json(subscribedEmails);
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
