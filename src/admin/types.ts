export type MethodType = 'DELETE' | 'GET' | 'PATCH' | 'POST';
export type WhatType = 'FEATURE_DOCUMENT' | 'FEATURE_FORM' | 'MESSAGE';
export type WhenType = 'DELAY' | 'INDEX_EVENT' | 'STAGE_TRANSITION' | 'FORM_SUBMITTED';
export type WhoType = 'ALL' | 'GROUP';
export type ISO8601DateTime = string;

export interface IPathwaysAdminClient {
  createAppUser(identityId: string): Promise<IRawAppUser>;
  createAppUserJourney(appUserId: string, startDate: string): Promise<IRawAppUserJourney>;
  createAppUserJourneyIndexEvent(
    appUserId: string,
    journeyId: number,
    eventTypeSlug: string,
    value: string,
  ): Promise<IRawIndexEvent>;
  createAppUserPathway(
    appUserId: string,
    appUserPathwayData: IAppUserPathwayData,
  ): Promise<IRawAppUserPathway>;
  createIndexEventType(
    name: string,
    slug: string,
    translatedNames?: object,
  ): Promise<IRawIndexEvent>;
  createPathway(
    name: string,
    description: string,
    isActive: boolean,
    metadata: object,
  ): Promise<IRawPathway>;
  createPathwayIndexEvent(
    pathwayId: number,
    eventTypeSlug: string,
    rules?: number[],
  ): Promise<IRawPathwayIndexEvent>;
  createPathwayStage(pathwayId: number, stageData: IStage): Promise<IRawStage>;
  createRule(ruleData: IRuleData): Promise<IRawRule>;
  deleteRule(ruleId: number): Promise<boolean>;
  deletePathwayIndexEvent(pathwayId: number, indexEventId: number): Promise<boolean>;
  deletePathwayStage(pathwayId: number, stageId: number): Promise<boolean>;
  duplicatePathway(pathwayId: number, updatedMetadata?: object): Promise<IRawPathway>;
  listAppUsers(page?: number, identityId?: string): Promise<IRawAppUser[]>;
  listIndexEventTypes(page?: number): Promise<IRawIndexEvent[]>;
  listPathways(page?: number, isDeleted?: boolean): Promise<IRawPathway[]>;
  listPathwayIndexEvents(pathwayId: number): Promise<IRawPathwayIndexEvent[]>;
  listPathwayStages(pathwayId: number): Promise<IRawStage[]>;
  listRules(page?: number): Promise<IRawRule[]>;
  patchAppUserPathway(
    appUserId: string,
    appUserPathwayId: number,
    currentStageSlug?: string,
    disabledRuleIds?: [number],
  ): Promise<IRawAppUserPathway>;
  processAppUserPathway(appUserId: string, appUserPathwayId: number): Promise<string>;
  patchPathway(pathwayId: number, pathwayData: IPathway): Promise<IRawPathway>;
  patchPathwayIndexEvent(
    pathwayId: number,
    indexEventId: number,
    eventTypeSlug?: string,
    rules?: [number],
  ): Promise<IRawPathwayIndexEvent>;
  patchPathwayStage(pathwayId: number, stageId: number, stageData: IStage): Promise<IRawStage>;
  patchRule(ruleId: number, ruleData: IRuleData): Promise<IRawRule>;
  transitionAppUserToPathwayStage(
    appUserId: string,
    appUserPathwayId: number,
    newStageSlug: string,
  ): Promise<string>;
  triggerAdhocRule(appUserId: string, appUserPathwayId: number, ruleId: number): Promise<string>;
}

export interface IPathwaysAdminService {
  createAppUser(identityId: string): Promise<IAppUser>;
  createAppUserJourney(appUserId: string, startDate: string): Promise<IAppUserJourney>;
  createAppUserJourneyIndexEvent(
    appUserId: string,
    journeyId: number,
    eventTypeSlug: string,
    value: string,
  ): Promise<IIndexEvent>;
  createAppUserPathway(
    appUserId: string,
    appUserPathwayData: IAppUserPathwayData,
  ): Promise<IAppUserPathway>;
  createIndexEventType(name: string, slug: string, translatedNames?: object): Promise<IIndexEvent>;
  createPathway(
    name: string,
    description: string,
    isActive: boolean,
    metadata: object,
  ): Promise<IPathway>;
  createPathwayIndexEvent(
    pathwayId: number,
    eventTypeSlug: string,
    rules?: number[],
  ): Promise<IPathwayIndexEvent>;
  createPathwayStage(pathwayId: number, stageData: IStage): Promise<IStage>;
  createRule(ruleData: IRuleData): Promise<IRule>;
  deleteRule(ruleId: number): Promise<boolean>;
  deletePathwayIndexEvent(pathwayId: number, indexEventId: number): Promise<boolean>;
  deletePathwayStage(pathwayId: number, stageId: number): Promise<boolean>;
  duplicatePathway(pathwayId: number, updatedMetadata?: object): Promise<IPathway>;
  listAppUsers(page?: number, identityId?: string): Promise<IAppUser[]>;
  listIndexEventTypes(page?: number): Promise<IIndexEvent[]>;
  listPathways(page?: number, isDeleted?: boolean): Promise<IPathway[]>;
  listPathwayIndexEvents(pathwayId: number): Promise<IPathwayIndexEvent[]>;
  listPathwayStages(pathwayId: number): Promise<IStage[]>;
  listRules(page?: number): Promise<IRule[]>;
  patchAppUserPathway(
    appUserId: string,
    appUserPathwayId: number,
    currentStageSlug?: string,
    disabledRuleIds?: [number],
  ): Promise<IAppUserPathway>;
  processAppUserPathway(appUserId: string, appUserPathwayId: number): Promise<string>;
  patchPathway(pathwayId: number, pathwayData: IPathway): Promise<IPathway>;
  patchPathwayIndexEvent(
    pathwayId: number,
    indexEventId: number,
    eventTypeSlug?: string,
    rules?: [number],
  ): Promise<IPathwayIndexEvent>;
  patchPathwayStage(pathwayId: number, stageId: number, stageData: IStage): Promise<IStage>;
  patchRule(ruleId: number, ruleData: IRuleData): Promise<IRule>;
  transitionAppUserToPathwayStage(
    appUserId: string,
    appUserPathwayId: number,
    newStageSlug: string,
  ): Promise<string>;
  triggerAdhocRule(appUserId: string, appUserPathwayId: number, ruleId: number): Promise<string>;
}

export interface IRawAppUser {
  identity_id: string;
  id: number;
  url: string;
  pathways: IRawAppUserPathway[];
}

export interface IAppUser {
  identityId: string;
  id: number;
  url: string;
  pathways: IAppUserPathway[];
}

export interface IAdminClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export interface IRawAppUserPathway {
  id: number;
  journey_id: number;
  original_pathway: number;
  current_stage_slug: string;
  disabled_rule_ids: number[];
}

export interface IAppUserPathway {
  id: number;
  journeyId: number;
  originalPathway: number;
  currentStageSlug: string;
  disabledRuleIds: number[];
}

export interface IRawAppUserJourney {
  id: number;
  url: string;
  start_date: ISO8601DateTime;
  end_date: ISO8601DateTime;
  created_on: string;
  index_events: IRawIndexEvent[];
  entries: IRawJourneyEntry[];
}

export interface IAppUserJourney {
  id: number;
  url: string;
  startDate: string;
  endDate: string;
  createdOn: string;
  indexEvents: IIndexEvent[];
  entries: IJourneyEntry[];
}

export interface IRawJourneyEntry {}

export interface IJourneyEntry {}

export interface IAppUserPathwayData {
  journeyId: number;
  originalPathway: number;
  currentStageSlug: string;
  disabledRuleIds: number[];
}

export interface IPathway {
  description: string;
  indexEvents: IPathwayIndexEvent[];
  id?: number;
  isActive: boolean;
  isDeleted: boolean;
  language: string;
  metadata: object;
  name: string;
  source: string;
  stages: IStage[];
  url?: string;
}

export interface IPathwayIndexEvent {
  id: number;
  url: string;
  rules: IRule[];
  eventTypeSlug: string;
}

export interface IRuleData {
  description: string;
  metadata: { [key: string]: any };
  name: string;
  what: WhatType;
  whatDetail: { [key: string]: any };
  when: WhenType;
  whenDetail: { [key: string]: any };
  who: WhoType;
  whoDetail: { [key: string]: any };
}

export interface IRule {
  description: string;
  id: number;
  metadata: { [key: string]: any };
  name: string;
  url: string;
  what: {
    type: WhatType;
    details: { [key: string]: any };
  };
  when: {
    type: WhenType;
    details: { [key: string]: any };
  };
  who: {
    type: WhoType;
    details: { [key: string]: any };
  };
}

export interface IStage {
  id: number;
  url: string;
  number: number;
  name: string;
  slug: string;
  description: string;
  rules: IRule[];
  isAdhoc: boolean;
}

export interface IIndexEvent {
  id: number;
  name: string;
  slug: string;
  translatedNames: {
    [key: string]: string;
  };
}

export interface IRawIndexEvent {
  id: number;
  name: string;
  slug: string;
  translated_names: {
    [key: string]: string;
  };
}

export interface IRawStage {
  id: number;
  url: string;
  number: number;
  name: string;
  slug: string;
  description: string;
  rules: Array<IRawRule>;
  is_adhoc: boolean;
}

export interface IRawPathwayIndexEvent {
  id: number;
  url: string;
  rules: Array<IRawRule>;
  event_type_slug: string;
}

export interface IRawRule {
  description: string;
  id: number;
  metadata: { [key: string]: any };
  name: string;
  url: string;
  what: WhatType;
  what_detail: { [key: string]: any };
  when: WhenType;
  when_detail: { [key: string]: any };
  who: WhoType;
  who_detail: { [key: string]: any };
}

export interface IRawPathway {
  id: number;
  url: string;
  name: string;
  description: string;
  stages: IRawStage[];
  metadata: object;
  source: string;
  index_events: Array<IRawPathwayIndexEvent>;
  is_active: boolean;
  is_deleted: boolean;
  language: string;
}