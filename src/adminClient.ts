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
  listAppUsers: "appusers/"
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
}

export default PathwaysAdminClient;
export { IPathwaysAdminClient, IAdminClientOptions };
