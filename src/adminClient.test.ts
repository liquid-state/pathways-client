import PathwaysAdminClient from "./adminClient";
import {
  TEST_JWT,
  TEST_APP_TOKEN,
  TEST_BASE_URL,
  TEST_ADMIN_LIST_APPUSERS_RESPONSE,
  TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE,
  TEST_ADMIN_LIST_PATHWAYS_RESPONSE,
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

const createClient = (fetch: any) =>
  new PathwaysAdminClient(TEST_APP_TOKEN, TEST_JWT, {
    fetch
  });

const requestParameters = (method = "GET", extraHeaders = {}) => ({
  method,
  headers: {
    Authorization: `Bearer ${TEST_JWT}`,
    ...extraHeaders
  }
});

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

  it("Should build query string parameters corrrectly", async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    const client = createClient(f);
    const page = 1;
    let params = client.buildQueryStringParameters({ page, foo: undefined });
    expect(params).toStrictEqual({ page: 1 });
  });

  it("Should retrieve a list of App Users", async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    const client = createClient(f);
    const resp1 = await client.listAppUsers(1);
    expect(resp1).toBe(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}appusers/?page=1&`,
      requestParameters()
    );
    const resp2 = await client.listAppUsers(undefined, "abc-123");
    expect(resp2).toBe(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}appusers/?identity_id=abc-123&`,
      requestParameters()
    );
  });

  it("Should retrieve a list of Index Events", async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE);
    const client = createClient(f);
    const resp = await client.listIndexEventTypes();
    expect(resp).toBe(TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}index-event-types/?`,
      requestParameters()
    );
  });

  it("Should retrieve a list of Pathways", async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_PATHWAYS_RESPONSE);
    const client = createClient(f);
    const resp = await client.listPathways();
    expect(resp).toBe(TEST_ADMIN_LIST_PATHWAYS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}pathways/?`,
      requestParameters()
    );

    const resp2 = await client.listPathways(2, false);
    expect(resp2).toBe(TEST_ADMIN_LIST_PATHWAYS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}pathways/?page=2&is_deleted=false&`,
      requestParameters()
    );
  });

  it("Should retrieve a list of Rules", async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_RULES_RESPONSE);
    const client = createClient(f);
    const resp = await client.listRules();
    expect(resp).toBe(TEST_ADMIN_LIST_RULES_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}rules/?`,
      requestParameters()
    );
  });
});
