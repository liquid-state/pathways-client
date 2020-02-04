interface IPathwaysAdminClient {
  listAppUsers(): Promise<Response>;
}

interface IAdminClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

const defaultOptions = {
  baseUrl: "https://pathways.example.com/v1/apps/{{app_ubiquity_token}}/",
  fetch: undefined
};

const pathMap: { [key: string]: string } = {
  createIndexEventType: "index-event-types/",
  listAppUsers: "appusers/",
  listIndexEventTypes: "index-event-types/"
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
    method?: string,
    postData?: { [key: string]: any }
  ) => {
    const url = this.getUrl(pathKey);
    const requestMethod = method?.toUpperCase() || "GET";
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

  private getRequest = async (pathKey: string, errorMessage: string) => {
    return this.apiRequest(pathKey, errorMessage);
  };

  private postRequest = async (
    pathKey: string,
    postData: { [key: string]: any },
    errorMessage: string
  ) => {
    return this.apiRequest(pathKey, errorMessage, "POST", postData);
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
      "Unable to get create Index Event Type"
    );
  };

  listIndexEventTypes = async (limit: number, offset: number) =>
    this.getRequest(
      "listIndexEventTypes",
      "Unable to get list of Index Events from Pathways service"
    );

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
}

export default PathwaysAdminClient;
export { IPathwaysAdminClient, IAdminClientOptions };
