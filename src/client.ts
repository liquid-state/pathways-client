import {
  IOptions,
  IMe,
  IMeRaw,
  IJourney,
  IJourneyRaw,
  IJourneyIndexEvent,
  IJourneyIndexEventRaw,
  IJourneyEntry,
  IJourneyEntryStageTransition,
  ContentTypes,
  IJourneyEntryRuleExecution,
  IJourneyEntryStageTransitionRaw,
  IJourneyEntryRuleExecutionRaw,
  IJourneyEntriesResponse,
  IPathway,
  IPathwayRaw,
} from './types';

interface IPathwaysClient {
  me(username: string, password?: string): Promise<IMe>;
  entries(journey: IJourney | IJourneyEntriesResponse): Promise<IJourneyEntriesResponse>;
}

const defaultOptions = {
  baseUrl: 'https://pathways.example.com/',
  fetch: undefined,
};

const pathMap: { [key: string]: string } = {
  me: 'me/',
};

const parsePathway = (pathway: IPathwayRaw): IPathway => ({
  id: pathway.id,
  originalPathway: {
    id: pathway.original_pathway.id,
    name: pathway.original_pathway.name,
    description: pathway.original_pathway.description,
    isActive: pathway.original_pathway.is_active,
    isDeleted: pathway.original_pathway.is_deleted,
    contentList: {
      stages: Object.keys(pathway.original_pathway.content_list.stages).reduce(
        (acc, key) => ({
          ...acc,
          [key]: pathway.original_pathway.content_list.stages[key].map(content => ({
            type: content.type,
            details: {
              id: content.details.id,
              app: content.details.app,
              name: content.details.name,
              slug: content.details.slug,
              links: {
                self: content.details.links.self,
                versions: content.details.links.versions,
                variations: content.details.links.variations,
                publishingStatus: content.details.links.publishing_status,
              },
              title: content.details.title,
              token: content.details.token,
              appId: content.details.app_id,
              parent: content.details.parent,
              appName: content.details.app_name,
              metadata: {
                tags: content.details.metadata.tags,
                source: content.details.metadata.source,
                language: content.details.metadata.language,
                sourceUrl: content.details.metadata['source-url'],
                contentProvider: content.details.metadata['content-provider'],
                originalAuthors: content.details.metadata['original-authors'],
              },
              ownerId: content.details.owner_id,
              published: content.details.published,
              isDeleted: content.details.is_deleted,
              productId: content.details.product_id,
              description: content.details.description,
              thumbnailUrl: content.details.thumbnail_url,
              deletionDatetime: content.details.deletion_datetime,
              appUserAccessType: content.details.app_user_access_type,
            },
          })),
        }),
        {}
      ),
    },
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
});

const parseJourneyEntry = (
  entry: IJourneyEntryStageTransitionRaw | IJourneyEntryRuleExecutionRaw
): IJourneyEntryStageTransition | IJourneyEntryRuleExecution => {
  switch (entry.type) {
    case 'stage_transition':
      return {
        id: entry.id,
        type: entry.type,
        eventDatetime: entry.event_datetime,
        createdOn: entry.created_on,
        pathwayId: entry.pathway_id,
        newStageName: entry.new_stage_name,
        newStageSlug: entry.new_stage_slug,
        previousStageName: entry.previous_stage_name,
        previousStageSlug: entry.previous_stage_slug,
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
        },
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

  private getUrl(endpoint: string) {
    let result;
    result = `${this.options.baseUrl}${pathMap[endpoint]}`;
    return result;
  }

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
    journey: IJourney | IJourneyEntriesResponse
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
}

export default PathwaysClient;
export { IPathwaysClient, IOptions };
