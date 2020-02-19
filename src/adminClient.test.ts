import PathwaysAdminClient from './adminClient';
import {
  TEST_JWT,
  TEST_APP_TOKEN,
  TEST_BASE_URL,
  TEST_ADMIN_CREATE_APP_USER,
  TEST_ADMIN_LIST_APPUSERS_RESPONSE,
  TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE,
  TEST_ADMIN_LIST_PATHWAYS_RESPONSE,
  TEST_ADMIN_LIST_RULES_RESPONSE,
} from './mock_data';

const fetchImpl: any = (
  response: any,
  valid: boolean = true,
  contentType: string = 'application/json'
) => {
  return jest.fn().mockImplementation((url: string, init: object) => {
    return {
      ok: valid,
      headers: {
        get: (h: string) => {
          if (h === 'content-type') {
            return contentType;
          } else return undefined;
        },
      },
      json: () => response,
    };
  });
};

const createClient = (fetch: any) =>
  new PathwaysAdminClient(TEST_APP_TOKEN, TEST_JWT, {
    fetch,
  });

const requestParameters = (method = 'GET', extraHeaders = {}, body?: object) => ({
  method,
  headers: {
    Authorization: `Bearer ${TEST_JWT}`,
    ...extraHeaders,
  },
  ...(body ? { body } : {}),
});

describe('Pathways client', () => {
  it('Should throw if appToken is missing', () => {
    try {
      new PathwaysAdminClient('', '');
    } catch (e) {
      expect(e).toBe('Pathways Error: You must specify appToken');
    }
  });

  it('Should throw if JWT is missing', () => {
    try {
      new PathwaysAdminClient(TEST_APP_TOKEN, '');
    } catch (e) {
      expect(e).toBe('Pathways Error: You must specify a JWT');
    }
  });

  it('Should build query string parameters corrrectly', async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    const client = createClient(f);
    const page = 1;
    let params = client.buildQueryStringParameters({ page, foo: undefined });
    expect(params).toStrictEqual({ page: 1 });
  });

  it('Should build a path without parameters correctly', () => {
    const f = fetchImpl(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    const client = createClient(f);
    const testPath = 'appusers/';
    const builtPath = client.buildPath(testPath);
    expect(builtPath).toStrictEqual('appusers/');
  });

  it('Should build path parameters correctly', () => {
    const f = fetchImpl(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    const client = createClient(f);
    const testPath = 'appusers/{{appUserId}}/journeys/{{journeyId}}/index-events/';
    const testPathParameters = { appUserId: '1234', journeyId: '5678' };
    const builtPath = client.buildPath(testPath, testPathParameters);
    expect(builtPath).toStrictEqual('appusers/1234/journeys/5678/index-events/');
  });

  it('Should retrieve a list of App Users', async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    const client = createClient(f);
    const resp1 = await client.listAppUsers(1);
    expect(resp1).toBe(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(`${TEST_BASE_URL}appusers/?page=1&`, requestParameters());
    const resp2 = await client.listAppUsers(undefined, 'abc-123');
    expect(resp2).toBe(TEST_ADMIN_LIST_APPUSERS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}appusers/?identity_id=abc-123&`,
      requestParameters()
    );
  });

  it('Should retrieve a list of Index Events', async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE);
    const client = createClient(f);
    const resp = await client.listIndexEventTypes();
    expect(resp).toBe(TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(`${TEST_BASE_URL}index-event-types/?`, requestParameters());
  });

  it('Should retrieve a list of Pathways', async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_PATHWAYS_RESPONSE);
    const client = createClient(f);
    const resp = await client.listPathways();
    expect(resp).toBe(TEST_ADMIN_LIST_PATHWAYS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(`${TEST_BASE_URL}pathways/?`, requestParameters());

    const resp2 = await client.listPathways(2, false);
    expect(resp2).toBe(TEST_ADMIN_LIST_PATHWAYS_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}pathways/?page=2&is_deleted=false&`,
      requestParameters()
    );
  });

  it('Should retrieve a list of Rules', async () => {
    const f = fetchImpl(TEST_ADMIN_LIST_RULES_RESPONSE);
    const client = createClient(f);
    const resp = await client.listRules();
    expect(resp).toBe(TEST_ADMIN_LIST_RULES_RESPONSE);
    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(`${TEST_BASE_URL}rules/?`, requestParameters());
  });

  it('Should create an app user', async () => {
    const identityId = '650548b6-c816-4060-ad37-87cf9d810f7e';
    const mockData = TEST_ADMIN_CREATE_APP_USER(identityId);
    const f = fetchImpl(mockData);
    const client = createClient(f);
    const resp = await client.createAppUser(identityId);

    const body = new FormData();
    body.append('identity_id', identityId);

    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}appusers/`,
      requestParameters('POST', {}, expect.objectContaining(body))
    );
  });

  it('Should create an app user journey', async () => {
    const appUserId = '650548b6-c816-4060-ad37-87cf9d810f7e';
    const startDate = '2020-02-12T02:46:21.593Z';
    const mockData = TEST_ADMIN_CREATE_APP_USER(appUserId);
    const f = fetchImpl(mockData);
    const client = createClient(f);
    const resp = await client.createAppUserJourney(appUserId, startDate);

    const body = new FormData();
    body.append('start_date', startDate);

    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}appusers/${appUserId}/journeys/`,
      requestParameters('POST', {}, expect.objectContaining(body))
    );
  });

  it('Should create an app user journey index event', async () => {
    const appUserId = '650548b6-c816-4060-ad37-87cf9d810f7e';
    const journeyId = 1234;
    const eventTypeSlug = 'admission';
    const value = '2020-02-12T02:46:21.593Z';
    const mockData = TEST_ADMIN_CREATE_APP_USER(appUserId);
    const f = fetchImpl(mockData);
    const client = createClient(f);
    const resp = await client.createAppUserJourneyIndexEvent(
      appUserId,
      journeyId,
      eventTypeSlug,
      value
    );

    const body = new FormData();
    body.append('event_type_slug', eventTypeSlug);
    body.append('value', value);

    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}appusers/${appUserId}/journeys/${journeyId}/index-events/`,
      requestParameters('POST', {}, expect.objectContaining(body))
    );
  });

  it('Should create an app user pathway', async () => {
    const appUserId = '650548b6-c816-4060-ad37-87cf9d810f7e';
    const pathwayData = {
      journeyId: 1234,
      originalPathway: 5678,
      currentStageSlug: 'stuff',
      disabledRuleIds: [1, 2],
    };

    const mockData = TEST_ADMIN_CREATE_APP_USER(appUserId);
    const f = fetchImpl(mockData);
    const client = createClient(f);
    const resp = await client.createAppUserPathway(appUserId, pathwayData);

    const body = new FormData();
    body.append('journey_id', `${pathwayData.journeyId}`);
    body.append('original_pathway_id', `${pathwayData.originalPathway}`);
    body.append('current_stage_slug', pathwayData.currentStageSlug);
    body.append('disabled_rule_ids', JSON.stringify(pathwayData.disabledRuleIds));

    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}appusers/${appUserId}/pathways/`,
      requestParameters('POST', {}, expect.objectContaining(body))
    );
  });

  it('Should create an index event type', async () => {
    const name = 'IE Name';
    const slug = 'ie-slug';
    const translatedNames = {};

    const mockData = {};
    const f = fetchImpl(mockData);
    const client = createClient(f);
    const resp = await client.createIndexEventType(name, slug, translatedNames);

    const body = new FormData();
    body.append('name', name);
    body.append('slug', slug);
    body.append('translated_names', JSON.stringify(translatedNames));

    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}index-event-types/`,
      requestParameters('POST', {}, expect.objectContaining(body))
    );
  });

  it('Should create a pathway', async () => {
    const name = 'Pathway Name';
    const description = 'Lorem Ipsum';
    const isActive = true;
    const metadata = {};

    const mockData = {};
    const f = fetchImpl(mockData);
    const client = createClient(f);
    const resp = await client.createPathway(name, description, isActive, metadata);

    const body = new FormData();
    body.append('name', name);
    body.append('description', description);
    body.append('is_active', JSON.stringify(isActive));
    body.append('metadata', JSON.stringify(metadata));

    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}pathways/`,
      requestParameters('POST', {}, expect.objectContaining(body))
    );
  });

  it('Should create a pathway index event', async () => {
    const pathwayId = 1234;
    const eventTypeSlug = 'ie-slug';
    const rules = [1, 2, 3, 4];

    const mockData = {};
    const f = fetchImpl(mockData);
    const client = createClient(f);
    const resp = await client.createPathwayIndexEvent(pathwayId, eventTypeSlug, rules);

    const body = new FormData();
    body.append('event_type_slug', eventTypeSlug);
    body.append('rules', JSON.stringify(rules));

    expect(f).toHaveBeenCalled();
    expect(f).toHaveBeenCalledWith(
      `${TEST_BASE_URL}pathways/${pathwayId}/index-events/`,
      requestParameters('POST', {}, expect.objectContaining(body))
    );
  });
});
