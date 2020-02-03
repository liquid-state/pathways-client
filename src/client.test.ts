import PathwaysClient from "./client";
import { TEST_JWT, TEST_APPUSER_ME_RESPONSE } from "./mock_data";

const fetchImpl: any = (response: any, valid: boolean = true) => {
  return jest.fn().mockImplementation((url: string, init: object) => {
    return {
      ok: valid,
      json: () => response
    };
  });
};

describe("Pathways client", () => {
  it("Should throw if JWT is missing", () => {
    try {
      new PathwaysClient("");
    } catch (e) {
      expect(e).toBe("Pathways Error: You must specify a JWT");
    }
  });

  it("Should retrieve user details correctly with /me/ endpoint", async () => {
    const f = fetchImpl(TEST_APPUSER_ME_RESPONSE);
    const client = new PathwaysClient(TEST_JWT, { fetch: f });
    const resp = await client.me();
    expect(resp).toBe(TEST_APPUSER_ME_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith("https://pathways.example.com/me/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TEST_JWT}`
      }
    });
  });
});
