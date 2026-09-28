import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { chargeBalance } from "../../../services/snail-pay/snailPayService";

import type { SnailPayRequest } from "../../../types/snail-pay/snail-pay-request";

const validPayment: SnailPayRequest = {
  cardNumber: "1234123412341234",
  expirationDate: "12/26",
  cvv: "543",
  fullName: "Luis Eduardo Gonzalez",
  amount: 500,
  payerId: "user-123",
  payerEmail: "test@example.com",
};

const approvedResponse = {
  id: "transaction-123",
  status: "approved",
  status_detail: "accredited",
  transaction_amount: 500,
  date_created:
    "2026-09-28T12:00:00.000Z",
  authorization_code: "AUTH-123456",
  reference: "SNAIL-123456",
  payer_id: "user-123",
  payer_email: "test@example.com",
  card_number: "1234123412341234",
  cvv: "543",
};

describe("SnailPay Service", () => {
  beforeEach(() => {
    vi.useFakeTimers();

    vi.spyOn(
      console,
      "info",
    ).mockImplementation(() => { });

    vi.spyOn(
      console,
      "warn",
    ).mockImplementation(() => { });

    vi.spyOn(
      console,
      "error",
    ).mockImplementation(() => { });
  });

  afterEach(() => {
    vi.useRealTimers();

    vi.restoreAllMocks();
  });

  it("should return an approved transaction when SnailPay responds successfully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () =>
          approvedResponse,
      }),
    );

    const promise =
      chargeBalance(validPayment);

    await vi.runAllTimersAsync();

    const response =
      await promise;

    expect(response.status).toBe(
      "approved",
    );

    expect(
      response.transaction_amount,
    ).toBe(500);
  });

  it("should send the payment data to the SnailPay charge endpoint", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () =>
          approvedResponse,
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    const promise =
      chargeBalance(validPayment);

    await vi.runAllTimersAsync();

    await promise;

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/snailpay/charge",
      expect.objectContaining({
        method: "POST",

        headers: expect.objectContaining({
          "Content-Type":
            "application/json",
        }),

        body: JSON.stringify(
          validPayment,
        ),
      }),
    );
  });

  it("should persist the SnailPay response in localStorage", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () =>
          approvedResponse,
      }),
    );

    const promise =
      chargeBalance(validPayment);

    await vi.runAllTimersAsync();

    await promise;

    const storedTransaction =
      localStorage.getItem(
        "snail_last_transaction",
      );

    expect(
      storedTransaction,
    ).not.toBeNull();

    expect(
      JSON.parse(
        storedTransaction!,
      ),
    ).toMatchObject({
      status: "approved",
      transaction_amount: 500,
      card_number:
        "1234123412341234",
      cvv: "543",
    });
  });

  it("should throw the transaction response when SnailPay rejects the payment", async () => {
    const rejectedResponse = {
      ...approvedResponse,
      status: "rejected",
      status_detail: "card_declined",
      authorization_code: null,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        json: async () => rejectedResponse,
      }),
    );

    const expectation = expect(
      chargeBalance(validPayment),
    ).rejects.toMatchObject({
      status: "rejected",
      status_detail: "card_declined",
    });

    await vi.runAllTimersAsync();

    await expectation;
  });

  it("should throw the transaction response when SnailPay returns a system error", async () => {
    const errorResponse = {
      ...approvedResponse,
      status: "error",
      status_detail: "internal_processing_error",
      authorization_code: null,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => errorResponse,
      }),
    );

    const expectation = expect(
      chargeBalance(
        validPayment,
        true,
      ),
    ).rejects.toMatchObject({
      status: "error",
      status_detail:
        "internal_processing_error",
    });

    await vi.runAllTimersAsync();

    await expectation;
  });

  it("should send the system error simulation header when enabled", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () =>
          approvedResponse,
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    const promise =
      chargeBalance(
        validPayment,
        true,
      );

    await vi.runAllTimersAsync();

    await promise;

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),

      expect.objectContaining({
        headers: expect.objectContaining({
          "x-simulate-system-error":
            "true",
        }),
      }),
    );
  });

  it("should not send the system error simulation header when disabled", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () =>
          approvedResponse,
      });

    vi.stubGlobal(
      "fetch",
      fetchMock,
    );

    const promise =
      chargeBalance(
        validPayment,
        false,
      );

    await vi.runAllTimersAsync();

    await promise;

    const [, requestOptions] =
      fetchMock.mock.calls[0];

    expect(
      requestOptions.headers,
    ).not.toHaveProperty(
      "x-simulate-system-error",
    );
  });
});