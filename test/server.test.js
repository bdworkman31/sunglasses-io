const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app/server"); 
const brands = require("../initial-data/brands.json");

const should = chai.should();
chai.use(chaiHttp);

describe("Search Glasses", () => {
  it("it should fail with a name is not contained in the products json file", (done) => {
    chai
      .request(server)
      .get("/api/glassesSearch")
      .query({ name: "xxxxxxxxxxxx" })
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property("message").equal("Glasses not found!");
        done();
      });
  });

  it("it should pass with a name that is in the products json file", (done) => {
    chai
      .request(server)
      .get("/api/glassesSearch")
      .query({ name: "Habanero" })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property("name").equal("Habanero");
        done();
      });
  });
});


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


describe("Add to Cart", () => {
  let token;

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
      .send({
        productId: 5,
        quantity: 20,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.a("array");
        done();
      });
  });
});


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


describe("Delete an item from cart", () => {
  let token;

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
  it("it should delete an item from the cart", (done) => {
    const cartItem = {
      productId: 5,
      quantity: 2,
    };

    chai
      .request(server)
      .post("/api/addToCart")
      .set("Authorization", `Bearer ${token}`)
      .send(cartItem)
      .end((err, postRes) => {
        postRes.should.have.status(200);

        chai
          .request(server)
          .delete("/api/cart/delete/" + cartItem.productId)
          .set("Authorization", `Bearer ${token}`)
          .send(cartItem)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");

            const deletedItem = res.body.find(
              (item) => item.productId == cartItem.productId,
            );

            should.not.exist(deletedItem);
            done();
          });
      });
  });
});


describe("Update Cart Quantity", () => {
  let token;

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
  it("it should update the cart quantity", (done) => {
    const cartProduct = {
      productId: 1,
      quantity: 1,
    };

    chai
      .request(server)
      .post("/api/addToCart")
      .set("Authorization", `Bearer ${token}`)
      .send(cartProduct)
      .end((err, postRes) => {
        postRes.should.have.status(200);
        chai
          .request(server)
          .put(`/api/cart/productQuantity/${cartProduct.productId}`)
          .set("Authorization", `Bearer ${token}`)
          .send({
            quantity: 100,
          })
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an("array");

            const updatedProduct = res.body.find(
              (item) => item.productId == cartProduct.productId,
            );

            updatedProduct.should.exist;
            updatedProduct.quantity.should.equal(100);
          });
        done();
      });
  });
});


describe("Subscribe with email", () => {
  it("it should subscribe when email is entered", (done) => {
    const emailToAdd = "bworkman@gmail.com";

    chai
      .request(server)
      .post("/api/subscribe")
      .send({ email: emailToAdd })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.include(emailToAdd);
      });

    done();
  });
});
