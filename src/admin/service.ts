import {
  IPathwaysAdminService,
  IPathwaysAdminClient,
  IAdminClientOptions,
  IRawAppUser,
  IAppUser,
  IAppUserPathway,
  IAppUserPathwayData,
  IPathway,
  IRule,
  IRuleData,
  IStage,
  IRawIndexEvent,
  IRawAppUserPathway,
  IRawAppUserJourney,
  IPathwayIndexEvent,
  IRawJourneyEntry,
  IJourneyEntry,
  IAppUserJourney,
  IRawPathwayIndexEvent,
  IRawStage,
  IRawRule,
  IRawPathway,
  IIndexEvent,
  IRawPathwaySnapshot,
  IRawSharedPathwaySnapshot,
  IPathwaySnapshot,
  ISharedPathwaySnapshot,
  IPathwaySnapshotData,
} from './types';
import { PathwaysError } from './utils';

class PathwaysAdminService implements IPathwaysAdminService {
  constructor(private client: IPathwaysAdminClient) {
    if (!client) {
      throw PathwaysError('You must provide a pathways admin client');
    }
  }

  private mapRawAppUserPathway = (rawAppUserPathway: IRawAppUserPathway) => {
    const {
      journey_id,
      original_pathway,
      current_stage_slug,
      disabled_rule_ids,
      owner_id,
      external_id,
      ...rest
    } = rawAppUserPathway;

    return {
      ...rest,
      journeyId: journey_id,
      originalPathway: original_pathway,
      currentStageSlug: current_stage_slug,
      disabledRuleIds: disabled_rule_ids,
      externalId: external_id,
    };
  };

  private mapRawPathwaySnapshot = (rawSnapshot: IRawPathwaySnapshot): IPathwaySnapshot => {
    const {
      is_snapshot,
      is_shared_snapshot,
      snapshot_number,
      snapshot_name,
      snapshot_description,
      ...rawPathway
    } = rawSnapshot;

    return {
      ...this.mapRawPathway(rawPathway),
      isSnapshot: is_snapshot,
      isSharedSnapshot: is_shared_snapshot,
      snapshotNumber: snapshot_number,
      snapshotName: snapshot_name,
      snapshotDescription: snapshot_description,
    };
  };

  private mapRawSharedPathwaySnapshot = (
    rawSnapshot: IRawSharedPathwaySnapshot,
  ): ISharedPathwaySnapshot => {
    const {
      parent_organisation_slug,
      parent_name,
      parent_description,
      parent_index_event_types,
      ...rest
    } = rawSnapshot;

    return {
      ...this.mapRawPathwaySnapshot(rest),
      parentOrganisationSlug: parent_organisation_slug,
      parentName: parent_name,
      parentDescription: parent_description,
      parentIndexEventTypes: parent_index_event_types,
    };
  };

  private mapRawAppUser = (rawAppUser: IRawAppUser): IAppUser => {
    const { identity_id, pathways, ...rest } = rawAppUser;
    return {
      ...rest,
      identityId: identity_id,
      pathways: pathways.map(pathway => this.mapRawAppUserPathway(pathway)),
    };
  };

  private mapRawPathway = (rawPathway: IRawPathway): IPathway => {
    const { index_events, is_active, is_deleted, stages, ...rest } = rawPathway;

    return {
      ...rest,
      indexEvents: index_events.map(indexEvent => this.mapRawPathwayIndexEvent(indexEvent)),
      isActive: is_active,
      isDeleted: is_deleted,
      stages: stages.map(stage => this.mapRawStage(stage)),
    };
  };

  private mapRawPathwayIndexEvent = (
    rawPathwayIndexEvent: IRawPathwayIndexEvent,
  ): IPathwayIndexEvent => {
    const { rules, event_type_slug, ...rest } = rawPathwayIndexEvent;

    return {
      ...rest,
      eventTypeSlug: event_type_slug,
      rules: rules.map(rule => this.mapRawRule(rule)),
    };
  };

  private mapRawStage = (rawStage: IRawStage): IStage => {
    const { rules, is_adhoc, is_deleted, ...rest } = rawStage;

    return {
      ...rest,
      isAdhoc: is_adhoc,
      rules: rules.map(rule => this.mapRawRule(rule)),
      isDeleted: is_deleted,
    };
  };

  private mapRawRule = (rawRule: IRawRule): IRule => {
    const { what, what_detail, when, when_detail, who, who_detail, ...rest } = rawRule;

    return {
      ...rest,
      what: {
        type: what,
        details: what_detail,
      },
      when: {
        type: when,
        details: when_detail,
      },
      who: {
        type: who,
        details: who_detail,
      },
    };
  };

  private mapRawJourneyEntry = (rawJourneyEntry: IRawJourneyEntry): IJourneyEntry => {
    // TODO: map snake_case keys to camelCase
    return rawJourneyEntry;
  };

  private mapRawIndexEvent = (rawIndexEvent: IRawIndexEvent): IIndexEvent => {
    const { translated_names: translatedNames, order_index: order, ...rest } = rawIndexEvent;

    return {
      ...rest,
      order,
      translatedNames,
    };
  };

  private mapRawAppUserJourney = (rawAppUserJourney: IRawAppUserJourney): IAppUserJourney => {
    const { created_on, end_date, entries, index_events, start_date, ...rest } = rawAppUserJourney;

    return {
      ...rest,
      createdOn: created_on,
      endDate: end_date,
      entries: entries.map(entry => this.mapRawJourneyEntry(entry)),
      indexEvents: index_events.map(indexEvent => this.mapRawIndexEvent(indexEvent)),
      startDate: start_date,
    };
  };

  createAppUser = async (identityId: string): Promise<IAppUser> => {
    const rawAppUser = await this.client.createAppUser(identityId);

    return this.mapRawAppUser(rawAppUser);
  };

  createAppUserJourney = async (
    appUserId: string,
    startDate: string,
  ): Promise<IAppUserJourney> => {
    const rawAppUserJourney = await this.client.createAppUserJourney(appUserId, startDate);

    return this.mapRawAppUserJourney(rawAppUserJourney);
  };

  createAppUserJourneyIndexEvent = async (
    appUserId: string,
    journeyId: number,
    eventTypeSlug: string,
    value: string,
  ): Promise<IIndexEvent> => {
    const rawAppUserJourneyIndexEvent = await this.client.createAppUserJourneyIndexEvent(
      appUserId,
      journeyId,
      eventTypeSlug,
      value,
    );

    return this.mapRawIndexEvent(rawAppUserJourneyIndexEvent);
  };

  createAppUserPathway = async (
    appUserId: string,
    appUserPathwayData: IAppUserPathwayData,
  ): Promise<IAppUserPathway> => {
    const rawAppUserPathway = await this.client.createAppUserPathway(
      appUserId,
      appUserPathwayData,
    );

    return this.mapRawAppUserPathway(rawAppUserPathway);
  };

  createIndexEventType = async (
    name: string,
    slug: string,
    translatedNames?: object,
  ): Promise<IIndexEvent> => {
    const rawIndexEvent = await this.client.createIndexEventType(name, slug, translatedNames);

    return this.mapRawIndexEvent(rawIndexEvent);
  };

  createPathway = async (
    name: string,
    description: string,
    isActive: boolean,
    metadata: object,
  ): Promise<IPathway> => {
    const rawPathway = await this.client.createPathway(name, description, isActive, metadata);

    return this.mapRawPathway(rawPathway);
  };

  createPathwayIndexEvent = async (
    pathwayId: number,
    eventTypeSlug: string,
    rules?: number[],
  ): Promise<IPathwayIndexEvent> => {
    const rawPathwayIndexEvent = await this.client.createPathwayIndexEvent(
      pathwayId,
      eventTypeSlug,
      rules,
    );

    return this.mapRawPathwayIndexEvent(rawPathwayIndexEvent);
  };

  createPathwayStage = async (pathwayId: number, stageData: IStage): Promise<IStage> => {
    const rawStage = await this.client.createPathwayStage(pathwayId, stageData);

    return this.mapRawStage(rawStage);
  };

  createRule = async (ruleData: IRuleData): Promise<IRule> => {
    const rawRule = await this.client.createRule(ruleData);

    return this.mapRawRule(rawRule);
  };

  deleteRule = (ruleId: number): Promise<boolean> => {
    return this.client.deleteRule(ruleId);
  };

  deleteIndexEventType = (indexEventId: number): Promise<boolean> => {
    return this.client.deleteIndexEventType(indexEventId);
  };

  deletePathwayIndexEvent = (pathwayId: number, indexEventId: number): Promise<boolean> => {
    return this.client.deletePathwayIndexEvent(pathwayId, indexEventId);
  };

  deletePathwayStage = (pathwayId: number, stageId: number): Promise<boolean> => {
    return this.client.deletePathwayStage(pathwayId, stageId);
  };

  duplicatePathway = async (pathwayId: number, updatedMetadata?: object): Promise<Response> => {
    const response = await this.client.duplicatePathway(pathwayId, updatedMetadata);

    return response;
  };

  listAppUsers = async (page?: number, identityId?: string): Promise<IAppUser[]> => {
    const appUsers = await this.client.listAppUsers(page, identityId);

    return appUsers.map(appUser => this.mapRawAppUser(appUser));
  };

  listIndexEventTypes = async (page?: number): Promise<IIndexEvent[]> => {
    const rawIndexEvents = await this.client.listIndexEventTypes(page);

    return rawIndexEvents.map(indexEvent => this.mapRawIndexEvent(indexEvent));
  };

  listPathways = async (page?: number, isDeleted?: boolean): Promise<IPathway[]> => {
    const rawPathways = await this.client.listPathways(page, isDeleted);

    return rawPathways.map(pathway => this.mapRawPathway(pathway));
  };

  listPathwayIndexEvents = async (pathwayId: number): Promise<IPathwayIndexEvent[]> => {
    const rawPathwayIndexEvents = await this.client.listPathwayIndexEvents(pathwayId);

    return rawPathwayIndexEvents.map(indexEvent => this.mapRawPathwayIndexEvent(indexEvent));
  };

  listPathwayStages = async (pathwayId: number): Promise<IStage[]> => {
    const rawPathwayStages = await this.client.listPathwayStages(pathwayId);

    return rawPathwayStages.map(stage => this.mapRawStage(stage));
  };

  listRules = async (page?: number): Promise<IRule[]> => {
    const rawRules = await this.client.listRules(page);

    return rawRules.map(rule => this.mapRawRule(rule));
  };

  patchAppUserPathway = async (
    appUserId: string,
    appUserPathwayId: number,
    currentStageSlug?: string,
    disabledRuleIds?: [number],
    isActive?: boolean,
    ownerId?: string,
  ): Promise<IAppUserPathway> => {
    const rawAppUserPathway = await this.client.patchAppUserPathway(
      appUserId,
      appUserPathwayId,
      currentStageSlug,
      disabledRuleIds,
      isActive,
      ownerId,
    );

    return this.mapRawAppUserPathway(rawAppUserPathway);
  };

  processAppUserPathway = async (
    appUserId: string,
    appUserPathwayId: number,
  ): Promise<Response> => {
    return this.client.processAppUserPathway(appUserId, appUserPathwayId);
  };

  patchIndexEventType = async (indexEvent: IIndexEvent): Promise<IIndexEvent> => {
    const rawIndexEvent = await this.client.patchIndexEventType(
      indexEvent.id,
      indexEvent.name,
      indexEvent.slug,
      indexEvent.translatedNames,
    );

    return this.mapRawIndexEvent(rawIndexEvent);
  };

  patchPathway = async (pathwayId: number, pathwayData: IPathway): Promise<IPathway> => {
    const rawPathway = await this.client.patchPathway(pathwayId, pathwayData);

    return this.mapRawPathway(rawPathway);
  };

  patchPathwayIndexEvent = async (
    pathwayId: number,
    indexEventId: number,
    eventTypeSlug?: string,
    rules?: [number],
  ): Promise<IPathwayIndexEvent> => {
    const rawPathwayIndexEvent = await this.client.patchPathwayIndexEvent(
      pathwayId,
      indexEventId,
      eventTypeSlug,
      rules,
    );

    return this.mapRawPathwayIndexEvent(rawPathwayIndexEvent);
  };

  patchPathwayStage = async (
    pathwayId: number,
    stageId: number,
    stageData: IStage,
  ): Promise<IStage> => {
    const rawStage = await this.client.patchPathwayStage(pathwayId, stageId, stageData);

    return this.mapRawStage(rawStage);
  };

  patchRule = async (ruleId: number, ruleData: IRuleData): Promise<IRule> => {
    const rawRule = await this.client.patchRule(ruleId, ruleData);

    return this.mapRawRule(rawRule);
  };

  transitionAppUserToPathwayStage = async (
    appUserId: string,
    appUserPathwayId: number,
    newStageSlug: string,
  ): Promise<string> => {
    return this.client.transitionAppUserToPathwayStage(appUserId, appUserPathwayId, newStageSlug);
  };

  triggerAdhocRule = async (
    appUserId: string,
    appUserPathwayId: number,
    ruleId: number,
  ): Promise<string> => {
    return this.triggerAdhocRule(appUserId, appUserPathwayId, ruleId);
  };

  listPathwaySnapshots = async (pathwayId: number): Promise<IPathwaySnapshot[]> => {
    const rawSnapshots = await this.client.listPathwaySnapshots(pathwayId);
    return rawSnapshots.map(snapshot => this.mapRawPathwaySnapshot(snapshot));
  };

  createPathwaySnapshot = async (
    pathwayId: number,
    snapshotData: IPathwaySnapshotData,
  ): Promise<IPathwaySnapshot> => {
    const rawSnapshot = await this.client.createPathwaySnapshot(pathwayId, snapshotData);
    return this.mapRawPathwaySnapshot(rawSnapshot);
  };

  sharePathwaySnapshot = async (
    pathwayId: number,
    snapshotId: number,
  ): Promise<IPathwaySnapshot> => {
    const rawSnapshot = await this.client.sharePathwaySnapshot(pathwayId, snapshotId);
    return this.mapRawPathwaySnapshot(rawSnapshot);
  };

  unsharePathwaySnapshot = async (
    pathwayId: number,
    snapshotId: number,
  ): Promise<IPathwaySnapshot> => {
    const rawSnapshot = await this.client.unsharePathwaySnapshot(pathwayId, snapshotId);
    return this.mapRawPathwaySnapshot(rawSnapshot);
  };

  listSharedPathwaySnapshots = async (page?: number): Promise<ISharedPathwaySnapshot[]> => {
    const rawSnapshots = await this.client.listSharedPathwaySnapshots(page);
    return rawSnapshots.map(snapshot => this.mapRawSharedPathwaySnapshot(snapshot));
  };

  useSharedPathwaySnapshot = async (
    snapshotId: number,
    indexEventTypes: { [key: string]: string },
  ): Promise<ISharedPathwaySnapshot> => {
    const postData = { index_event_types: JSON.stringify(indexEventTypes) };
    const rawSnapshot = await this.client.useSharedPathwaySnapshot(snapshotId, postData);
    return this.mapRawSharedPathwaySnapshot(rawSnapshot);
  };

  actionJourneyEntry = async (
    appUserId: string,
    journeyId: string,
    entryId: string,
  ): Promise<Response> => {
    return await this.client.actionJourneyEntry(appUserId, journeyId, entryId);
  };
}

export default PathwaysAdminService;
export { IPathwaysAdminService, IAdminClientOptions };
