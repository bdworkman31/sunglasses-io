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

// Test for GET /api/me.cart
describe("Cart", () => {});
