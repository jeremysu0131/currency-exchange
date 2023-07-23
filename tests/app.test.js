const request = require("supertest");
const app = require("../src/app");

describe("GET /", () => {
  it("should respond with status 200", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
  });
});

describe("GET /exchange", () => {
  it("should return error for missing source", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ target: "JPY", amount: "$1,525" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The field 'source' should not be empty and only support TWD,JPY,USD"
    );
  });

  it("should return error for missing target", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "TWD", amount: "$1,525" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The field 'target' should not be empty and only support TWD,JPY,USD"
    );
  });

  it("should return error for invalid amount with letters", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "TWD", target: "JPY", amount: "$1,52a" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The field 'amount' should be greater than 0 and the format should be $1,234.56"
    );
  });

  it("should return error for invalid amount with special characters", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "TWD", target: "JPY", amount: "$^#&" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The field 'amount' should be greater than 0 and the format should be $1,234.56"
    );
  });

  it("should return correct converted amount for valid USD to JPY conversion", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "USD", target: "JPY", amount: "$1,525" });
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("success");
    expect(response.body.amount).toBe("$170,496.53");
  });

  it("should return error for negative amount", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "USD", target: "JPY", amount: "$-1,525" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The field 'amount' should be greater than 0 and the format should be $1,234.56"
    );
  });

  it("should return correct converted amount for valid USD to TWD conversion", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "USD", target: "TWD", amount: "$0.01" });
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("success");
    expect(response.body.amount).toBe("$0.30");
  });

  it("should return correct converted amount for valid USD to TWD conversion with large amount", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "USD", target: "TWD", amount: "$999,999,999.99" });
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("success");
    expect(response.body.amount).toBe("$30,443,999,999.70");
  });

  it("should return error for target amount less than $0.01", async () => {
    const response = await request(app)
      .get("/exchange")
      .query({ source: "USD", target: "TWD", amount: "$0.00001" });
    expect(response.status).toBe(400);
    expect(response.body.msg).toBe(
      "The rate of the target amount is less than $0.01"
    );
  });
});
