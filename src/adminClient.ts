interface IPathwaysAdminClient {
  listAppUsers(): Promise<Response>;
}

interface IAdminClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

interface IRuleData {
  name: string;
  description: string;
  who: string;
  who_detail: object;
  when: string;
  when_detail: object;
  what: string;
  what_detail: object;
  metadata?: object;
}

const defaultOptions = {
  baseUrl: "https://pathways.example.com/v1/apps/{{app_ubiquity_token}}/",
  fetch: undefined
};

const pathMap: { [key: string]: string } = {
  createIndexEventType: "index-event-types/",
  createRule: "rules/",
  listAppUsers: "appusers/",
  listIndexEventTypes: "index-event-types/",
  listRules: "rules/"
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

  private getUrl(endpoint: string) {
    let result;
    result = `${this.options.baseUrl}${pathMap[endpoint]}`;
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
    postData?: { [key: string]: any }
  ) => {
    const url = `${this.getUrl(pathKey)}${
      queryStringParameters
        ? Object.keys(queryStringParameters).reduce(
            (acc, key) => `${acc}${key}=${queryStringParameters[key]}&`,
            "?"
          )
        : ""
    }`;

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
    const data = await resp.json();
    return data;
  };

  private getRequest = async (
    pathKey: string,
    errorMessage: string,
    queryStringParameters?: object
  ) => {
    return this.apiRequest(pathKey, errorMessage, "GET", queryStringParameters);
  };

  private postRequest = async (
    pathKey: string,
    postData: { [key: string]: any },
    errorMessage: string,
    queryStringParameters?: object
  ) => {
    return this.apiRequest(
      pathKey,
      errorMessage,
      "POST",
      queryStringParameters,
      postData
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

  createRule = async (ruleData: IRuleData) => {
    const postData = {
      ...ruleData,
      who_detail: JSON.stringify(ruleData.who_detail),
      when_detail: JSON.stringify(ruleData.when_detail),
      what_detail: JSON.stringify(ruleData.what_detail)
    };
    return this.postRequest("createRule", postData, "Unable to create Rule");
  };

  listAppUsers = async () => {
    const url = this.getUrl("listAppUsers");
    const resp = await this.fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.jwt}`
      }
    });
    if (!resp.ok) {
      throw PathwaysAPIError(
        "Unable to get list of App Users from Pathways service",
        resp
      );
    }
    const content = await resp.json();
    return content;
  };

  listIndexEventTypes = async (limit?: number, offset?: number) =>
    this.getRequest(
      "listIndexEventTypes",
      "Unable to get list of Index Events from Pathways service",
      limit && offset ? { limit, offset } : undefined
    );

  listRules = async (limit?: number, offset?: number) =>
    this.getRequest(
      "listRules",
      "Unable to get list of Rules from Pathways service",
      limit && offset ? { limit, offset } : undefined
    );
}

export default PathwaysAdminClient;
export { IPathwaysAdminClient, IAdminClientOptions };
