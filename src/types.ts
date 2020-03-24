export interface IOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

export enum ContentType {
  FEATURE_DOCUMENT,
  FEATURE_FORM,
  MESSAGE,
}
export type ContentTypes = keyof typeof ContentType;

// TODO - convert to enum if more 'when' types are added
export type RuleWhenType = 'STAGE_TRANSITION';

export interface IJourneyEntryStageTransition {
  pathwayId: number;
  newStageName: string;
  newStageSlug: string;
  previousStageName: string;
  previousStageSlug: string;
}

export interface IJourneyEntry {
  id: number;
  type: string;
  eventDatetime: string;
  createdOn: string;
}

export interface IJourneyEntryRaw {
  id: number;
  type: string;
  event_datetime: string;
  created_on: string;
}

export interface IJourneyEntryStageTransition extends IJourneyEntry {
  type: 'stage_transition';
  pathwayId: number;
  newStageName: string;
  newStageSlug: string;
  previousStageName: string;
  previousStageSlug: string;
}

export interface IJourneyEntryStageTransitionRaw extends IJourneyEntryRaw {
  type: 'stage_transition';
  pathway_id: number;
  new_stage_name: string;
  new_stage_slug: string;
  previous_stage_name: string;
  previous_stage_slug: string;
}

export interface IJourneyEntryRuleExecution extends IJourneyEntry {
  type: 'rule_execution';
  data: {
    ruleId: number;
    ruleName: string;
    pathwayId: number;
    ruleWhatType: ContentTypes;
    ruleWhenType: string;
    executionDetails: object;
    ruleWhatDetails: object;
  };
}

export interface IJourneyEntryRuleExecutionRaw extends IJourneyEntryRaw {
  type: 'rule_execution';
  data: {
    rule_id: number;
    rule_name: string;
    pathway_id: number;
    rule_what_type: ContentTypes;
    rule_when_type: string;
    execution_details: object;
    rule_what_details: object;
  };
}

export interface IJourneyEntriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<IJourneyEntryStageTransition | IJourneyEntryRuleExecution>;
}

export interface IJourneyEntriesResponseRaw {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<IJourneyEntryStageTransitionRaw | IJourneyEntryRuleExecutionRaw>;
}

export type IPathwayStageContent = {
  type: string;
  details: {
    [key: string]: any;
  };
};

export interface IPathway {
  id: number;
  originalPathway: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    isDeleted: boolean;
    contentList: {
      stages: {
        [key: string]: IPathwayStageContent[];
      };
    };
  };
  currentStageSlug: string;
  disabledRuleIds: number[];
  lastProcessingTime: string;
  nextProcessingTime: string;
}

export type IPathwayStageContentRaw = {
  type: string;
  details: {
    [key: string]: any;
  };
};

export interface IPathwayRaw {
  id: number;
  original_pathway: {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    is_deleted: boolean;
    content_list: {
      stages: {
        [key: string]: IPathwayStageContentRaw[];
      };
    };
  };
  current_stage_slug: string;
  disabled_rule_ids: number[];
  last_processing_time: string;
  next_processing_time: string;
}

export interface IJourneyIndexEvent {
  id: number;
  eventTypeSlug: string;
  value: string;
  updatedOn: string;
}

export interface IJourneyIndexEventRaw {
  id: number;
  event_type_slug: string;
  value: string;
  updated_on: string;
}

export interface IJourney {
  id: number;
  startDate: string;
  endDate: string;
  createdOn: string;
  indexEvents: IJourneyIndexEvent[];
  entries: string;
}

export interface IJourneyRaw {
  id: number;
  start_date: string;
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
  identityId: string;
  pathways: IPathway[];
  journeys: IJourney[];
}

export interface IMeRaw {
  id: number;
  identity_id: string;
  pathways: IPathwayRaw[];
  journeys: IJourneyRaw[];
}
