interface IPathwaysClient {
  me(username: string, password?: string): Promise<Response>;
}

interface IOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

const defaultOptions = {
  baseUrl: "https://pathways.example.com/",
  fetch: window.fetch
};

const pathMap: { [key: string]: string } = {
  me: "me/"
};

const PathwaysError = (message: string) => `Pathways Error: ${message}`;

const PathwaysAPIError = (message: string, response: Response) => ({
  message: `Pathways API Error: ${message}`,
  response
});

class PathwaysClient implements IPathwaysClient {
  private options: IOptions;
  private fetch: typeof fetch;

  constructor(private jwt: string, options?: IOptions) {
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
  }

  me = async () => {
    const url = this.getUrl("me");
    const resp = await this.fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.jwt}`
      }
    });
    if (!resp.ok) {
      throw PathwaysAPIError("Unable to pathways user details", resp);
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

export default PathwaysClient;
export { IPathwaysClient, IOptions };
