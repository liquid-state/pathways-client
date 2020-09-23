import {
  MethodType,
  IOptions,
  IMe,
  IMeRaw,
  IJourney,
  IJourneyRaw,
  IJourneyIndexEvent,
  IJourneyIndexEventRaw,
  IUpdatedJourneyIndexEvent,
  IUpdatedJourneyIndexEventRaw,
  IJourneyEntryStageTransition,
  IJourneyEntryRuleExecution,
  IJourneyEntryStageTransitionRaw,
  IJourneyEntryRuleExecutionRaw,
  IJourneyEntriesResponse,
  IPathway,
  IPathwayRaw,
  IOriginalPathway,
  IJourneyEntryAdhocMessageRaw,
  IJourneyEntryFormSubmitted,
  IJourneyEntryFormSubmittedRaw,
  IJourneyEntryAdhocMessage,
} from './types';

interface IPathwaysClient {
  me(username: string, password?: string): Promise<IMe>;
  entries(journey: IJourney | IJourneyEntriesResponse): Promise<IJourneyEntriesResponse>;
  updateIndexEvents(
    appToken: string,
    appUserId: string,
    journeyId: number,
    indexEventDates: IUpdatedJourneyIndexEvent[],
  ): Promise<object>;
  transitionAppUserToPathwayStage(
    appToken: string,
    appUserId: string,
    appUserPathwayId: number,
    newStageSlug: string,
  ): Promise<string>;
}

const defaultOptions = {
  baseUrl: 'https://pathways.example.com/',
  fetch: undefined,
};

const pathMap: { [key: string]: string } = {
  me: 'me/',
  createAppUserJourneyIndexEvent:
    'apps/{{appToken}}/appusers/{{appUserId}}/journeys/{{journeyId}}/index-events/',
  patchAppUserJourneyIndexEvent: 'me/journeys/{{journeyId}}/index-events/{{indexEventId}}/',
  originalPathway: 'apps/{{appToken}}/pathways/{{pathwayId}}/',
  transitionAppUserToPathwayStage:
    'apps/{{appToken}}/appusers/{{appUserId}}/pathways/{{appUserPathwayId}}/transition/',
};

const parsePathway = (pathway: IPathwayRaw): IPathway => ({
  id: pathway.id,
  originalPathway: {
    id: pathway.original_pathway.id,
    name: pathway.original_pathway.name,
    description: pathway.original_pathway.description,
    isActive: pathway.original_pathway.is_active,
    isDeleted: pathway.original_pathway.is_deleted,
    contentList: pathway.original_pathway.content_list,
  },
  currentStageSlug: pathway.current_stage_slug,
  disabledRuleIds: pathway.disabled_rule_ids,
  lastProcessingTime: pathway.last_processing_time,
  nextProcessingTime: pathway.next_processing_time,
});

const parseIndexEvent = (event: IJourneyIndexEventRaw): IJourneyIndexEvent => ({
  id: event.id,
  eventTypeSlug: event.event_type_slug,
  value: event.value,
  updatedOn: event.updated_on,
  name: event.event_type_name,
  translatedNames: event.event_type_translated_names,
  orderIndex: event.event_type_order_index,
});

const parseUpdatedIndexEvent = (
  event: IUpdatedJourneyIndexEvent,
): IUpdatedJourneyIndexEventRaw => ({
  id: event.id,
  event_type_slug: event.eventTypeSlug,
  value: event.value,
});

const parseJourneyEntry = (
  entry:
    | IJourneyEntryStageTransitionRaw
    | IJourneyEntryRuleExecutionRaw
    | IJourneyEntryAdhocMessageRaw
    | IJourneyEntryFormSubmittedRaw,
):
  | IJourneyEntryStageTransition
  | IJourneyEntryRuleExecution
  | IJourneyEntryAdhocMessage
  | IJourneyEntryFormSubmitted => {
  switch (entry.type) {
    case 'stage_transition':
      return {
        id: entry.id,
        type: entry.type,
        eventDatetime: entry.event_datetime,
        createdOn: entry.created_on,
        pathwayId: entry.data.pathway_id,
        newStageName: entry.data.new_stage_name,
        newStageSlug: entry.data.new_stage_slug,
        previousStageName: entry.data.previous_stage_name,
        previousStageSlug: entry.data.previous_stage_slug,
      };
    case 'rule_execution':
      return {
        id: entry.id,
        type: entry.type,
        eventDatetime: entry.event_datetime,
        createdOn: entry.created_on,
        data: {
          ruleId: entry.data.rule_id,
          ruleName: entry.data.rule_name,
          pathwayId: entry.data.pathway_id,
          ruleWhatType: entry.data.rule_what_type,
          ruleWhenType: entry.data.rule_when_type,
          executionDetails: entry.data.execution_details,
          ruleWhatDetails: entry.data.rule_what_details,
        },
      };
    case 'adhoc_message':
      return {
        eventDatetime: entry.event_datetime,
        createdOn: entry.created_on,
        ...entry,
      };
    case 'form_submitted':
      return {
        eventDatetime: entry.event_datetime,
        createdOn: entry.created_on,
        ...entry,
      };
    default: {
      console.log('unknown entry type found - not parsed', entry);
      return entry;
    }
  }
};

const parseEntriesResponse = (entryResponse: any): IJourneyEntriesResponse => ({
  count: entryResponse.count,
  next: entryResponse.next,
  previous: entryResponse.previous,
  results: entryResponse.results.map(parseJourneyEntry),
});

const parseJourney = (journey: IJourneyRaw): IJourney => ({
  id: journey.id,
  startDate: journey.start_date,
  endDate: journey.end_date,
  createdOn: journey.created_on,
  indexEvents: journey.index_events.map(parseIndexEvent),
  entries: journey.entries,
});

const parseMe = (me: IMeRaw): IMe => ({
  id: me.id,
  identityId: me.identity_id,
  pathways: me.pathways.map(parsePathway),
  journeys: me.journeys.map(parseJourney),
});

const parseOriginalPathway = (pathway: any): IOriginalPathway => ({
  id: pathway.id,
  url: pathway.url,
  name: pathway.name,
  description: pathway.description,
  stages: pathway.stages.map((stage: any) => ({
    name: stage.name,
    slug: stage.slug,
    description: stage.description,
  })),
});

const PathwaysError = (message: string) => `Pathways Error: ${message}`;

const PathwaysAPIError = (message: string, response: Response) => ({
  message: `Pathways API Error: ${message}`,
  response,
});

class PathwaysClient implements IPathwaysClient {
  private options: IOptions;
  private fetch: typeof fetch;

  constructor(private jwt: string, options?: IOptions) {
    if (!jwt) {
      throw PathwaysError('You must specify a JWT');
    }
    if (!options) {
      this.options = defaultOptions;
    } else {
      this.options = { ...defaultOptions, ...options };
      if (!this.options.baseUrl) {
        this.options.baseUrl = defaultOptions.baseUrl;
      }
    }
    this.fetch = this.options.fetch || window.fetch.bind(window);
  }

  public buildPath(pathTemplate: string, pathParameters?: { [key: string]: string }): string {
    if (!pathParameters) return pathTemplate;
    const re = /{{([A-Za-z]+)}}/;

    let path = pathTemplate;
    let match;
    while ((match = re.exec(path)) !== null) {
      path = path.replace(match[0], pathParameters[match[1]]);
    }

    return path[path.length - 1] === '/' ? path : `${path}/`;
  }

  private getUrl(
    endpoint: string,
    queryStringParameters?: { [key: string]: any },
    pathParameters?: { [key: string]: string },
  ): string {
    let result;
    result = `${this.options.baseUrl}${this.buildPath(pathMap[endpoint], pathParameters)}${
      queryStringParameters
        ? Object.keys(queryStringParameters).reduce(
            (acc, key) => `${acc}${key}=${queryStringParameters[key]}&`,
            '?',
          )
        : ''
    }`;
    return result;
  }

  private apiRequest = async (
    pathKey: string,
    errorMessage: string,
    requestMethod: MethodType,
    queryStringParameters?: { [key: string]: any },
    postData?: { [key: string]: any },
    pathParameters?: { [key: string]: string },
  ): Promise<Response> => {
    const url = this.getUrl(pathKey, queryStringParameters, pathParameters);

    let body = undefined;
    if (postData) {
      body = new FormData();
      for (let key in postData) {
        body.append(key, postData[key]);
      }
    }

    const resp = await this.fetch(url, {
      method: requestMethod,
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
      body,
    });
    if (!resp.ok) {
      throw PathwaysAPIError(errorMessage, resp);
    }

    return resp;
  };

  private postRequest = (
    pathKey: string,
    postData: { [key: string]: any },
    errorMessage: string,
    queryStringParameters?: object,
    pathParameters?: { [key: string]: string },
  ) => {
    return this.apiRequest(
      pathKey,
      errorMessage,
      'POST',
      queryStringParameters,
      postData,
      pathParameters,
    );
  };

  private sub() {
    // Get the body of the JWT.
    const payload = this.jwt.split('.')[1];
    // Which is base64 encoded.
    const parsed = JSON.parse(atob(payload));
    return parsed.sub;
  }

  me = async (identity_id?: string): Promise<IMe> => {
    const url = this.getUrl('me');
    let fullURL = url;
    if (identity_id) {
      fullURL = `${url}?identity_id=${this.sub()}`;
    }
    const resp = await this.fetch(fullURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    });
    if (!resp.ok) {
      throw PathwaysAPIError('Unable to get pathways user details', resp);
    }
    const me: IMeRaw = await resp.json();

    return parseMe(me);
  };

  entries = async (
    journey: IJourney | IJourneyEntriesResponse,
  ): Promise<IJourneyEntriesResponse> => {
    if ('entries' in journey) {
      // need to parse to be IJourney (camelcase) not IJourneyRaw
      const entryResponse: Response = await fetch(journey.entries);
      return parseEntriesResponse(await entryResponse.json());
    } else {
      const entryResponse: Response = await fetch(journey.next!);
      return parseEntriesResponse(await entryResponse.json());
    }
  };

  originalPathway = async (appToken: string, pathway: IPathway | number) => {
    const pathwayId = typeof pathway === 'number' ? pathway : pathway.originalPathway.id;
    const baseUrl = this.getUrl('originalPathway');
    const finalUrl = baseUrl
      .replace('{{appToken}}', appToken)
      .replace('{{pathwayId}}', pathwayId.toString());
    const resp = await this.fetch(finalUrl);
    return parseOriginalPathway(await resp.json());
  };

  createAppUserJourneyIndexEvent = async (
    appToken: string,
    appUserId: string,
    journeyId: number,
    eventTypeSlug: string,
    value: string,
  ): Promise<IUpdatedJourneyIndexEventRaw> => {
    return (
      await this.postRequest(
        'createAppUserJourneyIndexEvent',
        { event_type_slug: eventTypeSlug, value },
        'Unable to create App User Journey Index Event for Pathways service',
        undefined,
        { appToken, appUserId, journeyId: `${journeyId}` },
      )
    ).json();
  };

  updateIndexEvents = async (
    appToken: string,
    appUserId: string,
    journeyId: number,
    indexEventDates: IUpdatedJourneyIndexEvent[],
  ): Promise<object> =>
    Promise.all(
      indexEventDates.map(async ie => {
        const updateIndexEvent = parseUpdatedIndexEvent(ie);
        if (updateIndexEvent.value) {
          if (!updateIndexEvent.id) {
            return await this.createAppUserJourneyIndexEvent(
              appToken,
              appUserId,
              journeyId,
              ie.eventTypeSlug,
              ie.value,
            );
          }

          if (updateIndexEvent.id) {
            const baseUrl = this.getUrl('patchAppUserJourneyIndexEvent');

            const finalUrl = baseUrl
              .replace('{{journeyId}}', journeyId.toString())
              .replace('{{indexEventId}}', updateIndexEvent.id.toString());
            const fullURL = `${finalUrl}?identity_id=${this.sub()}`;
            const body = new FormData();
            body.append('event_type_slug', updateIndexEvent.event_type_slug);
            // if (updateIndexEvent.value) {
            body.append('value', updateIndexEvent.value || '');
            // }
            const resp = await this.fetch(fullURL, {
              method: 'PUT',
              headers: {
                Authorization: `Bearer ${this.jwt}`,
              },
              body,
            });
            if (!resp.ok) {
              throw PathwaysAPIError('Unable to update index event', resp);
            }

            return resp;
          }
        }
      }),
    );

  transitionAppUserToPathwayStage = async (
    appToken: string,
    appUserId: string,
    appUserPathwayId: number,
    newStageSlug: string,
  ): Promise<string> => {
    console.log('transitionAppUserToPathwayStage');
    return (
      await this.postRequest(
        'transitionAppUserToPathwayStage',
        { new_stage_slug: newStageSlug },
        'Unable to transition App User to Pathway Stage for Pathways service',
        undefined,
        { appToken, appUserId: `${appUserId}`, appUserPathwayId: `${appUserPathwayId}` },
      )
    ).text();
  };
}

export default PathwaysClient;
export { IPathwaysClient, IOptions };
