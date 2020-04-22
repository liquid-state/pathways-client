import {
  MethodType,
  IPathwaysAdminClient,
  IAdminClientOptions,
  IRawAppUser,
  IAppUserPathwayData,
  IPathway,
  IRuleData,
  IStage,
  IRawIndexEvent,
  IRawAppUserPathway,
  IRawAppUserJourney,
  IRawPathwayIndexEvent,
  IRawStage,
  IRawRule,
  IRawPathway,
} from './types';
import { PathwaysAPIError, PathwaysError } from './utils';

const defaultOptions = {
  baseUrl: 'https://pathways.example.com/v1/apps/{{app_ubiquity_token}}/',
  fetch: undefined,
};

const pathMap: { [key: string]: string } = {
  createAppUser: 'appusers/',
  createAppUserJourney: 'appusers/{{appUserId}}/journeys/',
  createAppUserJourneyIndexEvent: 'appusers/{{appUserId}}/journeys/{{journeyId}}/index-events/',
  createAppUserPathway: 'appusers/{{appUserId}}/pathways/',
  createIndexEventType: 'index-event-types/',
  createPathway: 'pathways/',
  createPathwayIndexEvent: 'pathways/{{pathwayId}}/index-events/',
  createPathwayStage: 'pathways/{{pathwayId}}/stages/',
  createRule: 'rules/',
  deletePathway: 'pathways/{{pathwayId}}/',
  deletePathwayIndexEvent: 'pathways/{{pathwayId}}/index-events/{{indexEventId}}/',
  deletePathwayStage: 'pathways/{{pathwayId}}/stages/{{stageId}}/',
  deleteRule: 'rules/{{ruleId}}/',
  duplicatePathway: 'pathways/{{pathwayId}}/duplicate/',
  listAppUsers: 'appusers/',
  listIndexEventTypes: 'index-event-types/',
  listPathways: 'pathways/',
  listPathwayIndexEvents: 'pathways/{{pathwayId}}/index-events/',
  listPathwayStages: 'pathways/{{pathwayId}}/stages/',
  listRules: 'rules/',
  patchAppUserPathway: 'appusers/{{appUserId}}/pathways/{{appUserPathwayId}}/',
  patchPathway: 'pathways/{{pathwayId}}/',
  patchPathwayIndexEvent: 'pathways/{{pathwayId}}/index-events/{{indexEventId}}/',
  patchPathwayStage: 'pathways/{{pathwayId}}/stages/{{stageId}}/',
  patchRule: 'rules/{{ruleId}}/',
  processAppUserPathway: 'appusers/{{appUserId}}/pathways/{{appUserPathwayId}}/process/',
  transitionAppUserToPathwayStage:
    'appusers/{{appUserId}}/pathways/{{appUserPathwayId}}/transition/',
  triggerAdhocRule: 'appusers/{{appUserId}}/pathways/{{appUserPathwayId}}/trigger_adhoc_rule/',
};

class PathwaysAdminClient implements IPathwaysAdminClient {
  private options: IAdminClientOptions;
  private fetch: typeof fetch;

  constructor(private appToken: string, private jwt: string, options?: IAdminClientOptions) {
    if (!appToken) {
      throw PathwaysError('You must specify appToken');
    }
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
    this.options.baseUrl = this.options.baseUrl?.replace('{{app_ubiquity_token}}', this.appToken);
  }

  public buildPath(pathTemplate: string, pathParameters?: { [key: string]: string }): string {
    if (!pathParameters) return pathTemplate;
    const re = /{{([A-Za-z]+)}}/;

    let path = pathTemplate;
    let match;
    while ((match = re.exec(path)) !== null) {
      path = path.replace(match[0], pathParameters[match[1]]);
    }

    return path;
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

  public buildQueryStringParameters = (params: { [key: string]: any }): { [key: string]: any } => {
    return Object.keys(params).reduce((acc: object, key: string) => {
      return Object.assign({}, acc, params[key] !== undefined ? { [key]: params[key] } : {});
    }, {});
  };

  private deleteRequest = async (
    pathKey: string,
    errorMessage: string,
    pathParameters: { [key: string]: string },
  ) => {
    const url = this.getUrl(pathKey, undefined, pathParameters);
    const resp = await this.fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.jwt}`,
      },
    });
    if (!resp.ok) {
      throw PathwaysAPIError(errorMessage, resp);
    }
    return true;
  };

  private getRequest = (
    pathKey: string,
    errorMessage: string,
    queryStringParameters?: object,
    pathParameters?: { [key: string]: string },
  ) => {
    return this.apiRequest(
      pathKey,
      errorMessage,
      'GET',
      queryStringParameters,
      undefined,
      pathParameters,
    );
  };

  private patchRequest = (
    pathKey: string,
    patchData: { [key: string]: any },
    errorMessage: string,
    pathParameters: { [key: string]: string },
    queryStringParameters?: object,
  ) => {
    return this.apiRequest(
      pathKey,
      errorMessage,
      'PATCH',
      queryStringParameters,
      patchData,
      pathParameters,
    );
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

  createAppUser = async (identityId: string): Promise<IRawAppUser> => {
    return (
      await this.postRequest(
        'createAppUser',
        { identity_id: identityId },
        'Unable to create App User for Pathways service',
      )
    ).json();
  };

  createAppUserJourney = async (
    appUserId: string,
    startDate: string,
  ): Promise<IRawAppUserJourney> => {
    return (
      await this.postRequest(
        'createAppUserJourney',
        { start_date: startDate },
        'Unable to create App User Journey for Pathways service',
        undefined,
        { appUserId },
      )
    ).json();
  };

  createAppUserJourneyIndexEvent = async (
    appUserId: string,
    journeyId: number,
    eventTypeSlug: string,
    value: string,
  ): Promise<IRawIndexEvent> => {
    return (
      await this.postRequest(
        'createAppUserJourneyIndexEvent',
        { event_type_slug: eventTypeSlug, value },
        'Unable to create App User Journey Index Event for Pathways service',
        undefined,
        { appUserId, journeyId: `${journeyId}` },
      )
    ).json();
  };

  createAppUserPathway = async (
    appUserId: string,
    appUserPathwayData: IAppUserPathwayData,
  ): Promise<IRawAppUserPathway> => {
    const ruleIds =
      typeof appUserPathwayData.disabledRuleIds === 'string'
        ? appUserPathwayData.disabledRuleIds
        : JSON.stringify(appUserPathwayData.disabledRuleIds);
    const postData = {
      journey_id: appUserPathwayData.journeyId,
      original_pathway_id: appUserPathwayData.originalPathway,
      current_stage_slug: appUserPathwayData.currentStageSlug,
      disabled_rule_ids: ruleIds,
    };

    return (
      await this.postRequest(
        'createAppUserPathway',
        postData,
        'Unable to create App User Pathway for Pathways service',
        undefined,
        { appUserId },
      )
    ).json();
  };

  createIndexEventType = async (
    name: string,
    slug: string,
    translatedNames?: object,
  ): Promise<IRawIndexEvent> => {
    const postData = {
      name,
      slug,
      translated_names: JSON.stringify(translatedNames),
    };
    return (
      await this.postRequest('createIndexEventType', postData, 'Unable to create Index Event Type')
    ).json();
  };

  createPathway = async (
    name: string,
    description: string,
    isActive: boolean,
    metadata: object,
  ): Promise<IRawPathway> => {
    const postData = {
      name,
      description,
      is_active: isActive,
      metadata: JSON.stringify(metadata),
    };

    return (await this.postRequest('createPathway', postData, 'Unable to create Pathway')).json();
  };

  createPathwayIndexEvent = async (
    pathwayId: number,
    eventTypeSlug: string,
    rules?: number[],
  ): Promise<IRawPathwayIndexEvent> => {
    const postData = {
      event_type_slug: eventTypeSlug,
      ...(rules ? { rules: JSON.stringify(rules) } : {}),
    };

    return (
      await this.postRequest(
        'createPathwayIndexEvent',
        postData,
        'Unable to create Pathway Index Event',
        undefined,
        { pathwayId: `${pathwayId}` },
      )
    ).json();
  };

  createPathwayStage = async (pathwayId: number, stageData: IStage): Promise<IRawStage> => {
    const postData = {
      number: stageData.number,
      name: stageData.name,
      slug: stageData.slug,
      description: stageData.description,
      is_adhoc: stageData.isAdhoc,
      rules: JSON.stringify(stageData.rules),
    };

    return (
      await this.postRequest(
        'createPathwayStage',
        postData,
        'Unable to create Pathway Stage',
        undefined,
        { pathwayId: `${pathwayId}` },
      )
    ).json();
  };

  createRule = async (ruleData: IRuleData): Promise<IRawRule> => {
    const postData = {
      ...ruleData,
      who_detail: JSON.stringify(ruleData.whoDetail),
      when_detail: JSON.stringify(ruleData.whenDetail),
      what_detail: JSON.stringify(ruleData.whatDetail),
      ...(ruleData.metadata ? { metadata: JSON.stringify(ruleData.metadata) } : {}),
    };
    return (await this.postRequest('createRule', postData, 'Unable to create Rule')).json();
  };

  deleteRule = (ruleId: number): Promise<boolean> => {
    return this.deleteRequest('deleteRule', 'Unable to delete Rule from Pathways service', {
      ruleId: `${ruleId}`,
    });
  };

  deletePathwayIndexEvent = (pathwayId: number, indexEventId: number): Promise<boolean> => {
    return this.deleteRequest('deletePathwayIndexEvent', 'Unable to delete Pathway Index Event', {
      pathwayId: `${pathwayId}`,
      indexEventId: `${indexEventId}/`,
    });
  };

  deletePathwayStage = (pathwayId: number, stageId: number): Promise<boolean> => {
    return this.deleteRequest('deletePathwayStage', 'Unable to delete Pathway Stage', {
      pathwayId: `${pathwayId}`,
      stageId: `${stageId}`,
    });
  };

  duplicatePathway = async (pathwayId: number, updatedMetadata?: object): Promise<Response> => {
    const postData = {
      ...(updatedMetadata ? { updatedMetadata } : {}),
    };
    return await this.postRequest(
      'duplicatePathway',
      postData,
      'Unable to duplicate Pathway',
      undefined,
      { pathwayId: `${pathwayId}` },
    );
  };

  listAppUsers = async (page?: number, identityId?: string): Promise<IRawAppUser[]> => {
    let queryStringParameters = {};
    if (page) {
      queryStringParameters = { page };
    }
    if (identityId) {
      queryStringParameters = { identity_id: identityId };
    }
    return (
      await this.getRequest(
        'listAppUsers',
        'Unable to get list of App Users from Pathways service',
        this.buildQueryStringParameters(queryStringParameters),
      )
    ).json();
  };

  listIndexEventTypes = async (page?: number): Promise<IRawIndexEvent[]> => {
    return (
      await this.getRequest(
        'listIndexEventTypes',
        'Unable to get list of Index Events from Pathways service',
        this.buildQueryStringParameters({ page }),
      )
    ).json();
  };

  listPathways = async (page?: number, isDeleted?: boolean): Promise<IRawPathway[]> => {
    return (
      await this.getRequest(
        'listPathways',
        'Unable to get list of Pathways from Pathways service',
        this.buildQueryStringParameters({ page, is_deleted: isDeleted }),
      )
    ).json();
  };

  listPathwayIndexEvents = async (pathwayId: number): Promise<IRawPathwayIndexEvent[]> => {
    return (
      await this.getRequest(
        'listPathwayIndexEvents',
        'Unable to get list of Pathway Index Events',
        undefined,
        { pathwayId: `${pathwayId}` },
      )
    ).json();
  };

  listPathwayStages = async (pathwayId: number): Promise<IRawStage[]> => {
    return (
      await this.getRequest(
        'listPathways',
        'Unable to get list of Pathways from Pathways service',
        undefined,
        { pathwayId: `${pathwayId}` },
      )
    ).json();
  };

  listRules = async (page?: number): Promise<IRawRule[]> => {
    return (
      await this.getRequest(
        'listRules',
        'Unable to get list of Rules from Pathways service',
        this.buildQueryStringParameters({ page }),
      )
    ).json();
  };

  patchAppUserPathway = async (
    appUserId: string,
    appUserPathwayId: number,
    currentStageSlug?: string,
    disabledRuleIds?: [number],
  ): Promise<IRawAppUserPathway> => {
    const patchData = {
      ...(currentStageSlug ? { current_stage_slug: currentStageSlug } : {}),
      ...(disabledRuleIds ? { disabled_rule_ids: disabledRuleIds } : {}),
    };

    return (
      await this.patchRequest(
        'patchAppUserPathway',
        patchData,
        'Unable to update App User Pathway for Pathways service',
        { appUserId: `${appUserId}`, appUserPathwayId: `${appUserPathwayId}` },
      )
    ).json();
  };

  processAppUserPathway = async (appUserId: string, appUserPathwayId: number): Promise<string> => {
    return (
      await this.postRequest(
        'processAppUserPathway',
        {},
        'Unable to process App User Pathway for Pathways service',
        undefined,
        { appUserId: `${appUserId}`, appUserPathwayId: `${appUserPathwayId}` },
      )
    ).json();
  };

  patchPathway = async (pathwayId: number, pathwayData: IPathway): Promise<IRawPathway> => {
    const patchData = {
      name: pathwayData.name,
      description: pathwayData.description,
      is_active: pathwayData.isActive,
      is_deleted: pathwayData.isDeleted,
      ...(pathwayData.metadata ? { metadata: JSON.stringify(pathwayData.metadata) } : {}),
    };

    return (
      await this.patchRequest('patchPathway', patchData, 'Unable to update Pathway', {
        pathwayId: `${pathwayId}`,
      })
    ).json();
  };

  patchPathwayIndexEvent = async (
    pathwayId: number,
    indexEventId: number,
    eventTypeSlug?: string,
    rules?: [number],
  ): Promise<IRawPathwayIndexEvent> => {
    const patchData = {
      ...(eventTypeSlug ? { event_type_slug: eventTypeSlug } : {}),
      ...(rules ? { rules: JSON.stringify(rules) } : {}),
    };

    return (
      await this.patchRequest(
        'patchPathwayIndexEvent',
        patchData,
        'Unable to update Pathway Index Event',
        { pathwayId: `${pathwayId}`, indexEventId: `${indexEventId}` },
      )
    ).json();
  };

  patchPathwayStage = async (
    pathwayId: number,
    stageId: number,
    stageData: IStage,
  ): Promise<IRawStage> => {
    const patchData = {
      number: stageData.number,
      name: stageData.name,
      slug: stageData.slug,
      description: stageData.description,
      is_adhoc: stageData.isAdhoc,
      rules: JSON.stringify(stageData.rules),
    };

    return (
      await this.patchRequest('patchPathwayStage', patchData, 'Unable to update Pathway Stage', {
        pathwayId: `${pathwayId}`,
        stageId: `${stageId}`,
      })
    ).json();
  };

  patchRule = async (ruleId: number, ruleData: IRuleData): Promise<IRawRule> => {
    const patchData = {
      ...ruleData,
      who_detail: JSON.stringify(ruleData.whoDetail),
      when_detail: JSON.stringify(ruleData.whenDetail),
      what_detail: JSON.stringify(ruleData.whatDetail),
      ...(ruleData.metadata ? { metadata: JSON.stringify(ruleData.metadata) } : {}),
    };
    return (
      await this.patchRequest('patchRule', patchData, 'Unable to update Rule', {
        ruleId: `${ruleId}`,
      })
    ).json();
  };

  transitionAppUserToPathwayStage = async (
    appUserId: string,
    appUserPathwayId: number,
    newStageSlug: string,
  ): Promise<string> => {
    return (
      await this.postRequest(
        'transitionAppUserToPathwayStage',
        { new_stage_slug: newStageSlug },
        'Unable to transition App User to Pathway Stage for Pathways service',
        undefined,
        { appUserId: `${appUserId}`, appUserPathwayId: `${appUserPathwayId}` },
      )
    ).text();
  };

  triggerAdhocRule = async (
    appUserId: string,
    appUserPathwayId: number,
    ruleId: number,
  ): Promise<string> => {
    return (
      await this.postRequest(
        'triggerAdhocRule',
        { rule_id: ruleId },
        'Unable to trigger Adhoc Rule for Pathways service',
        undefined,
        { appUserId: `${appUserId}`, appUserPathwayId: `${appUserPathwayId}` },
      )
    ).json();
  };
}

export default PathwaysAdminClient;
export { IPathwaysAdminClient, IAdminClientOptions };
