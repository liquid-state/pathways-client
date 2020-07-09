import PathwaysClient from './client';

export default PathwaysClient;
export { IPathwaysClient, IOptions } from './client';
export {
  IMe,
  ContentType,
  IJourney,
  IJourneyEntry,
  IJourneyEntriesResponse,
  IPathway,
  IOriginalPathway,
  IUpdatedJourneyIndexEvent,
} from './types';

export {
  default as PathwaysAdminClient,
  IPathwaysAdminClient,
  IAdminClientOptions,
} from './admin/client';

export { default as PathwaysAdminService } from './admin/service';
