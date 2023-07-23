const request = require("supertest");
const app = require("../src/app");

describe("Test the root path", () => {
  test("It should response the GET method", (done) => {
    request(app)
      .get("/")
      .then((response) => {
        expect(response.statusCode).toBe(200);
        done();
      });
  });
});

describe("GET /exchange", () => {
  it("should return error for missing source", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ target: "JPY", amount: "$100" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The field 'source' should not be empty and only support TWD,JPY,USD"
    );
  });

  it("should return error for missing target", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "TWD", amount: "$100" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The field 'target' should not be empty and only support TWD,JPY,USD"
    );
  });

  it("should return error for invalid amount", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "TWD", target: "JPY", amount: "123a" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The field 'amount' should be greater than 0 and the format should be $1,234.56"
    );
  });

  it("should return correct converted amount", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "USD", target: "JPY", amount: "$1,525" });
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("success");
    expect(response.body.amount).toBe("$170,496.53");
  });

  // Add more test cases for different scenarios if needed
});
