interface IPathwaysAdminClient {
  listAppUsers(): Promise<Response>;
}

interface IAdminClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

interface IAppUserPathwayData {
  journeyId: number;
  originalPathwayId: number;
  currentStageSlug: string;
  disabledRuleIds: [number];
}

interface IPathwayData {
  name: string;
  description: string;
  isActive: boolean;
  isDeleted: boolean;
  metadata?: object;
}

interface IRuleData {
  name: string;
  description: string;
  who: string;
  whoDetail: object;
  when: string;
  whenDetail: object;
  what: string;
  whatDetail: object;
  metadata?: object;
}

interface IStageData {
  number: number;
  name: string;
  slug: string;
  description: string;
  isAdhoc: boolean;
  rules: [number];
}

const defaultOptions = {
  baseUrl: "https://pathways.example.com/v1/apps/{{app_ubiquity_token}}/",
  fetch: undefined
};

const pathMap: { [key: string]: string } = {
  createAppUser: "appusers/",
  createAppUserJourney: "appusers/",
  createAppUserJourneyIndexEvent: "appusers/",
  createAppUserPathway: "appusers/",
  createIndexEventType: "index-event-types/",
  createPathway: "pathways/",
  createPathwayIndexEvent: "pathways/",
  createPathwayStage: "pathways/",
  createRule: "rules/",
  deletePathway: "pathways/",
  deletePathwayIndexEvent: "pathways/",
  deletePathwayStage: "pathways/",
  deleteRule: "rules/",
  duplicatePathway: "pathways/",
  listAppUsers: "appusers/",
  listIndexEventTypes: "index-event-types/",
  listPathways: "pathways/",
  listPathwayIndexEvents: "pathways/",
  listPathwayStages: "pathways/",
  listRules: "rules/",
  patchAppUserPathway: "appusers/",
  patchPathway: "pathways/",
  patchPathwayIndexEvent: "pathways/",
  patchPathwayStages: "pathways/",
  patchRule: "rules/",
  transitionAppUserToPathwayStage: "appusers/",
  triggerAdhocRule: "appusers/"
};

const PathwaysError = (message: string) => `Pathways Error: ${message}`;

const PathwaysAPIError = (message: string, response: Response) => ({
  message: `Pathways API Error: ${message}`,
  response
});

class PathwaysAdminClient implements IPathwaysAdminClient {
  private options: IAdminClientOptions;
  private fetch: typeof fetch;

  constructor(
    private appToken: string,
    private jwt: string,
    options?: IAdminClientOptions
  ) {
    if (!appToken) {
      throw PathwaysError("You must specify appToken");
    }
    if (!jwt) {
      throw PathwaysError("You must specify a JWT");
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
    this.options.baseUrl = this.options.baseUrl?.replace(
      "{{app_ubiquity_token}}",
      this.appToken
    );
  }

  private getUrl(
    endpoint: string,
    queryStringParameters?: { [key: string]: any },
    pathParameters?: string
  ) {
    let result;
    result = `${this.options.baseUrl}${pathMap[endpoint]}${
      pathParameters ? pathParameters : ""
    }${
      queryStringParameters
        ? Object.keys(queryStringParameters).reduce(
            (acc, key) => `${acc}${key}=${queryStringParameters[key]}&`,
            "?"
          )
        : ""
    }`;
    return result;
  }

  private sub() {
    // Get the body of the JWT.
    const payload = this.jwt.split(".")[1];
    // Which is base64 encoded.
    const parsed = JSON.parse(atob(payload));
    return parsed.sub;
  }

  private apiRequest = async (
    pathKey: string,
    errorMessage: string,
    method: string,
    queryStringParameters?: { [key: string]: any },
    postData?: { [key: string]: any },
    pathParameters?: string
  ) => {
    const url = this.getUrl(pathKey, queryStringParameters, pathParameters);

    const requestMethod = method.toUpperCase() || "GET";
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
        Authorization: `Bearer ${this.jwt}`
      },
      body
    });
    if (!resp.ok) {
      throw PathwaysAPIError(errorMessage, resp);
    }

    if (requestMethod === "DELETE") return resp.ok;
    const data = await resp.json();
    return data;
  };

  private buildQueryStringParameters = (params: { [key: string]: any }) => {
    return Object.keys(params).reduce((acc: object, key: string) => {
      return Object.assign(
        {},
        acc,
        params[key] !== undefined ? { [key]: params[key] } : {}
      );
    }, {});
  };

  private deleteRequest = async (
    pathKey: string,
    errorMessage: string,
    pathParameters: string
  ) => {
    return this.apiRequest(
      pathKey,
      errorMessage,
      "DELETE",
      undefined,
      undefined,
      pathParameters
    );
  };

  private getRequest = async (
    pathKey: string,
    errorMessage: string,
    queryStringParameters?: object,
    pathParameters?: string
  ) => {
    return this.apiRequest(
      pathKey,
      errorMessage,
      "GET",
      queryStringParameters,
      undefined,
      pathParameters
    );
  };

  private patchRequest = async (
    pathKey: string,
    patchData: { [key: string]: any },
    errorMessage: string,
    pathParameters: string,
    queryStringParameters?: object
  ) => {
    return this.apiRequest(
      pathKey,
      errorMessage,
      "PATCH",
      queryStringParameters,
      patchData,
      pathParameters
    );
  };

  private postRequest = async (
    pathKey: string,
    postData: { [key: string]: any },
    errorMessage: string,
    queryStringParameters?: object,
    pathParameters?: string
  ) => {
    return this.apiRequest(
      pathKey,
      errorMessage,
      "POST",
      queryStringParameters,
      postData,
      pathParameters
    );
  };

  createAppUser = (identityId: string) => {
    return this.postRequest(
      "createAppUser",
      { identity_id: identityId },
      "Unable to create App User for Pathways service"
    );
  };

  createAppUserJourney = (appUserId: string, startDate: string) => {
    return this.postRequest(
      "createAppUserJourney",
      { start_date: startDate },
      "Unable to create App User Journey for Pathways service",
      undefined,
      `${appUserId}/journeys/`
    );
  };

  createAppUserJourneyIndexEvent = (
    appUserId: string,
    journeyId: number,
    eventTypeSlug: string,
    value: string
  ) => {
    return this.postRequest(
      "createAppUserJourneyIndexEvent",
      { event_type_slug: eventTypeSlug, value },
      "Unable to create App User Journey Index Event for Pathways service",
      undefined,
      `${appUserId}/journeys/${journeyId}/index-events/`
    );
  };

  createAppUserPathway = (
    appUserId: string,
    appUserPathwayData: IAppUserPathwayData
  ) => {
    const ruleIds =
      typeof appUserPathwayData.disabledRuleIds === "string"
        ? appUserPathwayData.disabledRuleIds
        : JSON.stringify(appUserPathwayData.disabledRuleIds);
    const postData = {
      journey_id: appUserPathwayData.journeyId,
      original_pathway_id: appUserPathwayData.originalPathwayId,
      current_stage_slug: appUserPathwayData.currentStageSlug,
      disabled_rule_ids: ruleIds
    };

    return this.postRequest(
      "createAppUserPathway",
      postData,
      "Unable to create App User Pathway for Pathways service",
      undefined,
      `${appUserId}/pathways/`
    );
  };

  createIndexEventType = async (
    name: string,
    slug: string,
    translatedNames?: object
  ) => {
    const postData = {
      name,
      slug,
      translatedNames: JSON.stringify(translatedNames)
    };
    return this.postRequest(
      "createIndexEventType",
      postData,
      "Unable to create Index Event Type"
    );
  };

  createPathway = async (
    name: string,
    description: string,
    isActive: boolean,
    metadata: object
  ) => {
    const postData = {
      name,
      description,
      is_active: isActive,
      metadata: JSON.stringify(metadata)
    };

    return this.postRequest(
      "createPathway",
      postData,
      "Unable to create Pathway"
    );
  };

  createPathwayIndexEvent = (
    id: number,
    eventTypeSlug: string,
    rules?: [number]
  ) => {
    const postData = {
      event_type_slug: eventTypeSlug,
      ...(rules ? { rules: JSON.stringify(rules) } : {})
    };

    return this.postRequest(
      "createPathwayIndexEvent",
      postData,
      "Unable to create Pathway Index Event",
      undefined,
      `${id}/index-events/`
    );
  };

  createPathwayStage = (id: number, stageData: IStageData) => {
    const postData = {
      number: stageData.number,
      name: stageData.name,
      slug: stageData.slug,
      description: stageData.description,
      is_adhoc: stageData.isAdhoc,
      rules: JSON.stringify(stageData.rules)
    };

    return this.postRequest(
      "createPathwayStage",
      postData,
      "Unable to create Pathway Stage",
      undefined,
      `${id}/stages/`
    );
  };

  createRule = async (ruleData: IRuleData) => {
    const postData = {
      ...ruleData,
      who_detail: JSON.stringify(ruleData.whoDetail),
      when_detail: JSON.stringify(ruleData.whenDetail),
      what_detail: JSON.stringify(ruleData.whatDetail),
      ...(ruleData.metadata
        ? { metadata: JSON.stringify(ruleData.metadata) }
        : {})
    };
    return this.postRequest("createRule", postData, "Unable to create Rule");
  };

  deleteRule = async (id: number) => {
    return this.deleteRequest(
      "deleteRule",
      "Unable to delete Rule from Pathways service",
      `${id}/`
    );
  };

  deletePathwayIndexEvent = (pathwayId: number, indexEventId: number) => {
    return this.deleteRequest(
      "deletePathwayIndexEvent",
      "Unable to delete Pathway Index Event",
      `${pathwayId}/index-events/${indexEventId}/`
    );
  };

  deletePathwayStage = (pathwayId: number, stageId: number) => {
    return this.deleteRequest(
      "deletePathwayStage",
      "Unable to delete Pathway Stage",
      `${pathwayId}/stages/${stageId}/`
    );
  };

  duplicatePathway = (id: number, updatedMetadata?: object) => {
    const postData = {
      ...(updatedMetadata ? { updatedMetadata } : {})
    };
    return this.postRequest(
      "duplicatePathway",
      postData,
      "Unable to duplicate Pathway",
      undefined,
      `${id}/duplicate/`
    );
  };

  listAppUsers = async (identityId?: string) =>
    this.getRequest(
      "listAppUsers",
      "Unable to get list of App Users from Pathways service",
      identityId
        ? this.buildQueryStringParameters({ identity_id: identityId })
        : undefined
    );

  listIndexEventTypes = async (page?: number) =>
    this.getRequest(
      "listIndexEventTypes",
      "Unable to get list of Index Events from Pathways service",
      this.buildQueryStringParameters({ page })
    );

  listPathways = async (page?: number, isDeleted?: boolean) =>
    this.getRequest(
      "listPathways",
      "Unable to get list of Pathways from Pathways service",
      this.buildQueryStringParameters({ page, is_deleted: isDeleted })
    );

  listPathwayIndexEvents = (id: number) =>
    this.getRequest(
      "listPathwayIndexEvents",
      "Unable to get list of Pathway Index Events",
      undefined,
      `${id}/index-events/`
    );

  listPathwayStages = async (id: number) =>
    this.getRequest(
      "listPathways",
      "Unable to get list of Pathways from Pathways service",
      undefined,
      `${id}/`
    );

  listRules = async (page?: number) =>
    this.getRequest(
      "listRules",
      "Unable to get list of Rules from Pathways service",
      this.buildQueryStringParameters({ page })
    );

  patchAppUserPathway = (
    appUserId: string,
    appUserPathwayId: number,
    currentStageSlug?: string,
    disabledRuleIds?: [number]
  ) => {
    const patchData = {
      ...(currentStageSlug ? { current_stage_slug: currentStageSlug } : {}),
      ...(disabledRuleIds ? { disabled_rule_ids: disabledRuleIds } : {})
    };

    return this.patchRequest(
      "patchAppUserPathway",
      patchData,
      "Unable to update App User Pathway for Pathways service",
      `${appUserId}/pathways/${appUserPathwayId}/`
    );
  };

  patchPathway = (id: number, pathwayData: IPathwayData) => {
    const patchData = {
      name: pathwayData.name,
      description: pathwayData.description,
      is_active: pathwayData.isActive,
      is_deleted: pathwayData.isDeleted,
      ...(pathwayData.metadata
        ? { metadata: JSON.stringify(pathwayData.metadata) }
        : {})
    };

    return this.patchRequest(
      "patchPathway",
      patchData,
      "Unable to update Pathway",
      `${id}/`
    );
  };

  patchPathwayIndexEvent = (
    pathwayId: number,
    indexEventId: number,
    eventTypeSlug?: string,
    rules?: [number]
  ) => {
    const patchData = {
      ...(eventTypeSlug ? { event_type_slug: eventTypeSlug } : {}),
      ...(rules ? { rules: JSON.stringify(rules) } : {})
    };

    return this.patchRequest(
      "patchPathwayIndexEvent",
      patchData,
      "Unable to update Pathway Index Event",
      `${pathwayId}/index-events/${indexEventId}/`
    );
  };

  patchPathwayStages = (
    pathwayId: number,
    stageId: number,
    stageData: IStageData
  ) => {
    const patchData = {
      number: stageData.number,
      name: stageData.name,
      slug: stageData.slug,
      description: stageData.description,
      is_adhoc: stageData.isAdhoc,
      rules: JSON.stringify(stageData.rules)
    };

    return this.patchRequest(
      "patchPathwayStages",
      patchData,
      "Unable to update Pathway Stage",
      `${pathwayId}/stages/${stageId}/`
    );
  };

  patchRule = async (id: number, ruleData: IRuleData) => {
    const patchData = {
      ...ruleData,
      who_detail: JSON.stringify(ruleData.whoDetail),
      when_detail: JSON.stringify(ruleData.whenDetail),
      what_detail: JSON.stringify(ruleData.whatDetail),
      ...(ruleData.metadata
        ? { metadata: JSON.stringify(ruleData.metadata) }
        : {})
    };
    return this.patchRequest(
      "patchRule",
      patchData,
      "Unable to update Rule",
      `${id}/`
    );
  };

  transitionAppUserToPathwayStage = (
    appUserId: string,
    appUserPathwayId: number,
    newStageSlug: string
  ) => {
    return this.postRequest(
      "transitionAppUserToPathwayStage",
      { new_stage_slug: newStageSlug },
      "Unable to transition App User to Pathway Stage for Pathways service",
      undefined,
      `${appUserId}/pathways/${appUserPathwayId}/transition/`
    );
  };

  triggerAdhocRule = (
    appUserId: string,
    appUserPathwayId: number,
    ruleId: number
  ) => {
    return this.postRequest(
      "triggerAdhocRule",
      { rule_id: ruleId },
      "Unable to trigger Adhoc Rule for Pathways service",
      undefined,
      `${appUserId}/pathways/${appUserPathwayId}/trigger_adhoc_rule/`
    );
  };
}

export default PathwaysAdminClient;
export { IPathwaysAdminClient, IAdminClientOptions };
