interface IPathwaysClient {
  me(username: string, password?: string): Promise<IMe>;
  entries(
    journey: IJourney | IJourneyEntriesResponse
  ): Promise<IJourneyEntriesResponse>;
}

export interface IJourneyEntry {
  id: number;
  type: string;
  data: {
    pathway_id: number;
    new_stage_name: string;
    new_stage_slug: string;
    previous_stage_name: string;
    previous_stage_slug: string;
  };
  event_datetime: string;
  created_on: string;
}

export interface IJourneyEntriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IJourneyEntry[];
}

export interface IPathway {
  id: number;
  original_pathway: {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    is_deleted: boolean;
  };
  current_stage_slug: string;
  disabled_rule_ids: number[];
  last_processing_time: string;
  next_processing_time: string;
}

export interface IJourney {
  id: number;
  start_date: number;
  end_date: string;
  created_on: string;
  index_events: {
    id: number;
    event_type_slug: string;
    value: string;
    updated_on: string;
  }[];
  entries: string;
}

export interface IMe {
  id: number;
  identity_id: string;
  pathways: IPathway[];
  journeys: IJourney[];
}

interface IOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}
const defaultOptions = {
  baseUrl: "https://pathways.example.com/",
  fetch: undefined
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

  me = async (identity_id?: string): Promise<IMe> => {
    const url = this.getUrl("me");
    let fullURL = url;
    if (identity_id) {
      fullURL = `${url}?identity_id=${this.sub()}`;
    }
    const resp = await this.fetch(fullURL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.jwt}`
      }
    });
    if (!resp.ok) {
      throw PathwaysAPIError("Unable to get pathways user details", resp);
    }
    const data = await resp.json();

    return data;
  };

  entries = async (
    journey: IJourney | IJourneyEntriesResponse
  ): Promise<IJourneyEntriesResponse> => {
    if ("entries" in journey) {
      const entryResponse: Response = await fetch(journey.entries);
      return entryResponse.json();
    } else {
      const entryResponse: Response = await fetch(journey.next!);
      return entryResponse.json();
    }
  };
}

export default PathwaysClient;
export { IPathwaysClient, IOptions };
