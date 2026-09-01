const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app/server"); // Adjust the path as needed
const brands = require("../initial-data/brands.json");

const should = chai.should();
chai.use(chaiHttp);

// TODO: Write tests for the server

//Test for GET /api/brands
describe("Brands", () => {
  it("it should return all brands from brands.json ", (done) => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.deep.equal(brands);
        done();
      });
  });
});

//Get products based on id
describe("Brand Products per ID", () => {
  it("should return products for a specific brand", (done) => {
    chai
      .request(server)
      .get("/api/brands/1/products")
      .end((err, res) => {
        res.should.have.status(200);

        done();
      });
  });
});

//Test for POST /api/login
describe("Login", () => {
  it("it should test if a user successfully logs in", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        username: "greenlion235",
        password: "waters",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("token");
        res.body.should.have.property("message").eql("Auth successful");

        done();
      });
  });

  it("it should fail login with incorrect password", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        username: "testuser",
        password: "wrongpassword",
      })
      .end((err, res) => {
        res.should.have.status(401);
        res.body.should.have
          .property("message")
          .eql("User not found" || "Incorrect Password");
        done();
      });
  });
});

// Test to add to cart
describe("Add to Cart", () => {
  before((done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({
        username: "greenlion235",
        password: "waters",
      })
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  it("it should add an item to the cart", (done) => {
    chai
      .request(server)
      .post("/api/addToCart")
      .set("Authorization", `Bearer ${token}`)
      .send(
        {
          productId: 5,
          quantity: 20,
        },
        { productId: 8, quantity: 30 },
      )
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        done();
      });
  });
});

// Test for GET /api/mycart
describe("Get cart", () => {
  let token;

  before(async () => {
    const res = await chai.request(server).post("/api/login").send({
      username: "greenlion235",
      password: "waters",
    });

    token = res.body.token;
  });

  it("it should retrieve the cart", async () => {
    const res = await chai
      .request(server)
      .get("/api/myCart")
      .set("Authorization", `Bearer ${token}`);

    res.should.have.status(200);
    res.body.should.be.an("array");
  });
});

//Delete from cart
describe("Delete an item from cart", () => {
  it("it should delete an item from the cart", (done) => {
    const cartItem = {
      productId: 20,
      quantity: 2,
    };

    chai
      .request(server)
      .post("/api/myCart")
      .send(cartItem)
      .end((err, postRes) => {
        chai
          .request(server)
          .delete("/api/cart/delete/:id")
          .send(cartItem)
          .end((err, res) => {
            res.should.have.status(200);
          });
        done();
      });
  });
});

//Test to update quantity

describe("Update Cart Quantity", () => {
  it("it should update the cart quantity", (done) => {
    const cartProduct = {
      productId: 1,
      quantity: 1,
    };

    chai
      .request(server)
      .post("/api/myCart")
      .send(cartProduct)
      .end((err, postRes) => {
        chai
          .request(server)
          .put("/api/cart/productQuantity/:id")
          .send({
            quantity: 100,
          })
          .end((err, res) => {
            res.should.have.status(200);
          });
      });
    done();
  });
});
