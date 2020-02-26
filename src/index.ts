import PathwaysClient from './client';

export default PathwaysClient;
export { IPathwaysClient, IOptions } from './client';
export { IMe, IJourney, IJourneyEntriesResponse } from './types';

export {
  default as PathwaysAdminClient,
  IPathwaysAdminClient,
  IAdminClientOptions,
} from './adminClient';
