import request from "supertest";
import {
  describe,
  expect,
  it,
} from "vitest";

import { app } from "../app.js";

const validPayment = {
  cardNumber: "1234123412341234",
  expirationDate: "12/26",
  cvv: "543",
  fullName: "Luis Eduardo Gonzalez",
  amount: 500,
  payerId: "user-123",
  payerEmail: "test@example.com",
};

describe("SnailPay API", () => {
  describe("POST /api/snailpay/charge", () => {
    it("should approve a transaction with valid payment data", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .send(validPayment);

      expect(response.status).toBe(200);

      expect(response.body).toMatchObject({
        status: "approved",
        status_detail: "accredited",
        transaction_amount: 500,
        payer_id: "user-123",
        payer_email: "test@example.com",
        card_number: "1234123412341234",
        cvv: "543",
      });

      expect(response.body.id).toEqual(
        expect.any(String),
      );

      expect(response.body.reference).toEqual(
        expect.any(String),
      );

      expect(
        response.body.authorization_code,
      ).toEqual(
        expect.any(String),
      );

      expect(response.body.date_created).toEqual(
        expect.any(String),
      );
    });

    it("should reject a transaction when the card data does not match the approved payment data", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .send({
          ...validPayment,
          cardNumber: "1111111111111111",
        });

      expect(response.status).toBe(402);

      expect(response.body).toMatchObject({
        status: "rejected",
        status_detail: "card_declined",
        transaction_amount: 500,
        authorization_code: null,
      });
    });

    it("should return an internal system error when the error simulation header is enabled", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .set(
          "x-simulate-system-error",
          "true",
        )
        .send(validPayment);

      expect(response.status).toBe(500);

      expect(response.body).toMatchObject({
        status: "error",
        status_detail:
          "internal_processing_error",
        transaction_amount: 500,
        authorization_code: null,
      });
    });

    it("should reject a transaction when the amount is zero", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .send({
          ...validPayment,
          amount: 0,
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        status: "rejected",
        status_detail: "invalid_request",
      });
    });

    it("should reject a transaction when the amount is negative", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .send({
          ...validPayment,
          amount: -100,
        });

      expect(response.status).toBe(400);

      expect(response.body.status).toBe(
        "rejected",
      );

      expect(
        response.body.status_detail,
      ).toBe("invalid_request");
    });

    it("should reject a transaction when the card number does not contain 16 digits", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .send({
          ...validPayment,
          cardNumber: "12345678",
        });

      expect(response.status).toBe(400);

      expect(response.body.status).toBe(
        "rejected",
      );

      expect(
        response.body.status_detail,
      ).toBe("invalid_request");
    });

    it("should reject a transaction when the CVV does not contain 3 digits", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .send({
          ...validPayment,
          cvv: "12",
        });

      expect(response.status).toBe(400);

      expect(response.body.status).toBe(
        "rejected",
      );

      expect(
        response.body.status_detail,
      ).toBe("invalid_request");
    });

    it("should reject a transaction when the expiration date has an invalid format", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .send({
          ...validPayment,
          expirationDate: "13/26",
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        status: "rejected",
        status_detail: "invalid_request",
      });
    });

    it("should reject a transaction when the payer email is invalid", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .send({
          ...validPayment,
          payerEmail: "invalid-email",
        });

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        status: "rejected",
        status_detail: "invalid_request",
      });
    });

    it("should not generate an authorization code when the transaction is rejected", async () => {
      const response = await request(app)
        .post("/api/snailpay/charge")
        .send({
          ...validPayment,
          cvv: "999",
        });

      expect(response.status).toBe(402);

      expect(
        response.body.authorization_code,
      ).toBeNull();
    });
  });
});