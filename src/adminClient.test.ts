import PathwaysAdminClient from "./adminClient";
import {
  TEST_JWT,
  TEST_APP_TOKEN,
  TEST_BASE_URL,
  TEST_ADMIN_LIST_APPUSERS_RESPONSE,
  TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE,
  TEST_ADMIN_LIST_RULES_RESPONSE
} from "./mock_data";

const fetchImpl: any = (response: any, valid: boolean = true) => {
  return jest.fn().mockImplementation((url: string, init: object) => {
    return {
      ok: valid,
      json: () => response
    };
  });
};

describe("Pathways client", () => {
  it("Should throw if appToken is missing", () => {
    try {
      new PathwaysAdminClient("", "");
    } catch (e) {
      expect(e).toBe("Pathways Error: You must specify appToken");
    }
  });

  it("Should throw if JWT is missing", () => {
    try {
      new PathwaysAdminClient(TEST_APP_TOKEN, "");
    } catch (e) {
      expect(e).toBe("Pathways Error: You must specify a JWT");
    }
  });

  it("Should retrieve a list of App Users", async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    const client = new PathwaysAdminClient(TEST_APP_TOKEN, TEST_JWT, {
      fetch: f
    });
    const resp = await client.listAppUsers();
    expect(resp).toBe(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(`${TEST_BASE_URL}appusers/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TEST_JWT}`
      }
    });
  });

  it("Should retrieve a list of Index Events", async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE);
    const client = new PathwaysAdminClient(TEST_APP_TOKEN, TEST_JWT, {
      fetch: f
    });
    const resp = await client.listIndexEventTypes();
    expect(resp).toBe(TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(`${TEST_BASE_URL}index-event-types/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TEST_JWT}`
      }
    });
  });

  it("Should retrieve a list of Rules", async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_RULES_RESPONSE);
    const client = new PathwaysAdminClient(TEST_APP_TOKEN, TEST_JWT, {
      fetch: f
    });
    const resp = await client.listRules();
    expect(resp).toBe(TEST_ADMIN_LIST_RULES_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(`${TEST_BASE_URL}rules/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TEST_JWT}`
      }
    });
  });
});
