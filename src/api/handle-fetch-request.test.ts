import { describe, it, expect, vi } from "vitest";
import { handleFetchRequest } from "./handle-fetch-request.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockResponse(
  status: number,
  body: unknown,
  contentType = "application/json",
): Response {
  const headers = new Headers({ "content-type": contentType });
  return {
    status,
    statusText: status === 200 ? "OK" : "Error",
    ok: status >= 200 && status < 300,
    headers,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === "string" ? body : ""),
  } as unknown as Response;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("handleFetchRequest", () => {
  describe("successful responses", () => {
    it("should return parsed JSON for a 200 JSON response", async () => {
      const data = { id: "prod-1", name: "Test" };
      const response = mockResponse(200, data);

      const result = await handleFetchRequest<typeof data>(
        Promise.resolve(response),
      );

      expect(result).toEqual(data);
    });

    it("should return text for a 200 text/plain response", async () => {
      const response = mockResponse(200, "ok", "text/plain");

      const result = await handleFetchRequest<string>(
        Promise.resolve(response),
      );

      expect(result).toBe("ok");
    });

    it("should treat 201 as successful", async () => {
      const data = { created: true };
      const response = mockResponse(201, data);

      const result = await handleFetchRequest<typeof data>(
        Promise.resolve(response),
      );

      expect(result).toEqual(data);
    });

    it("should treat 399 as successful", async () => {
      const data = { redirected: true };
      const response = mockResponse(399, data);

      const result = await handleFetchRequest<typeof data>(
        Promise.resolve(response),
      );

      expect(result).toEqual(data);
    });
  });

  describe("error responses", () => {
    it("should throw an error with text body for text/plain error response", async () => {
      const response = mockResponse(500, "Internal Server Error", "text/plain");

      await expect(
        handleFetchRequest(Promise.resolve(response)),
      ).rejects.toThrow("Internal Server Error");
    });

    it("should throw an error with message from JSON body", async () => {
      const response = mockResponse(400, { message: "Bad request data" });

      await expect(
        handleFetchRequest(Promise.resolve(response)),
      ).rejects.toThrow("Bad request data");
    });

    it("should throw a generic error when no body content is available", async () => {
      const response = mockResponse(404, null, "");

      await expect(
        handleFetchRequest(Promise.resolve(response)),
      ).rejects.toThrow("Response Code: 404");
    });

    it("should attach the status code to the error object", async () => {
      const response = mockResponse(401, "Unauthorized", "text/plain");

      try {
        await handleFetchRequest(Promise.resolve(response));
        expect.fail("Should have thrown");
      } catch (err) {
        expect((err as Error & { status: number }).status).toBe(401);
      }
    });

    it("should treat 400 as an error", async () => {
      const response = mockResponse(400, { message: "Bad request" });

      await expect(
        handleFetchRequest(Promise.resolve(response)),
      ).rejects.toThrow();
    });

    it("should treat 100 as an error (below 200)", async () => {
      const response = mockResponse(100, null, "");

      await expect(
        handleFetchRequest(Promise.resolve(response)),
      ).rejects.toThrow();
    });
  });

  describe("edge cases", () => {
    it("should propagate fetch rejections", async () => {
      const networkError = new Error("Network error");

      await expect(
        handleFetchRequest(Promise.reject(networkError)),
      ).rejects.toThrow("Network error");
    });
  });
});
