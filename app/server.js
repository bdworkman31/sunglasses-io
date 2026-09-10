const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
const app = express();

app.use(bodyParser.json());

const users = require("../initial-data/users.json");
const brands = require("../initial-data/brands.json");
const products = require("../initial-data/products.json");
const articles = require("../initial-data/articles.json")

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

app.get("/api/glassesSearch", (req, res) => {
  const glasses = req.query.name;

  const glassName = products.find((item) => item.name === glasses);

  if (!glassName) {
    return res.status(404).json({ message: "Glasses not found!" });
  }

  res.status(200).json(glassName);
});

app.get("/api/brands", (req, res) => {
  res.status(200).json(brands);
});

app.get("/api/brands/:id/products", (req, res) => {
  const id = req.params.id;

  const brand = brands.find((brand) => brand.id == id);

  if (!brand) {
    return res.status(404).json({
      message: "Brand not found",
    });
  }

  const brandProducts = products.filter(
    (product) => product.brandId == id
  );

  return res.status(200).json(brandProducts);
});


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

app.post("/api/me/cart", authenticate, (req, res) => {
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

app.post("/api/me/cart/:productId", authenticate, (req, res) => {
  const id = req.params.productId;
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

app.get("/api/me/cart", authenticate, (req, res) => {
  res.status(200).json(cart);
});

app.delete("/api/me/cart/:productId", authenticate, (req, res) => {
  const id = req.params.productId;

  const cartProduct = cart.find((product) => product.productId == id);

  if (!cartProduct) {
    return res.status(404).json({
      message: "Product not found in cart",
    });
  }

  cart = cart.filter((product) => product.productId != id);

  res.status(200).json(cart);
});

app.post("/api/subscribe", (req, res) => {
  const newEmail = req.body.email;

  subscribedEmails.push(newEmail);

  res.status(200).json(subscribedEmails);
});

app.get("/api/articles", (req, res) => {
  res.status(200).json(articles);
});

app.get("/api/articles/:id", (req, res) => {
  const article = articles.find((article) => article.id == req.params.id);

  if (!article) {
    return res.status(404).json({ message: "Article not found!" });
  }

  res.status(200).json(article.content);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
