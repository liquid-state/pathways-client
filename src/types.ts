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
  data: {
    pathway_id: number;
    new_stage_name: string;
    new_stage_slug: string;
    previous_stage_name: string;
    previous_stage_slug: string;
  };
}

export interface IJourneyEntryRuleExecution extends IJourneyEntry {
  type: 'rule_execution';
  data: {
    ruleId: number;
    ruleName: string;
    pathwayId: number;
    ruleWhatType: ContentTypes;
    ruleWhenType: string;
    executionDetails: {
      [key: string]: any;
    };
    ruleWhatDetails: {
      [key: string]: any;
    };
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
    execution_details: {
      [key: string]: any;
    };
    rule_what_details: {
      [key: string]: any;
    };
  };
}

export interface IJourneyEntryAdhocMessageRaw extends IJourneyEntryRaw {
  type: 'adhoc_message';
  [key: string]: any;
}

export interface IJourneyEntryAdhocMessage extends IJourneyEntry {
  type: 'adhoc_message';
  [key: string]: any;
}

export interface IJourneyEntryFormSubmittedRaw extends IJourneyEntryRaw {
  type: 'form_submitted';
  [key: string]: any;
}

export interface IJourneyEntryFormSubmitted extends IJourneyEntry {
  type: 'form_submitted';
  [key: string]: any;
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
  name: string;
  translatedNames: { [key: string]: string };
  orderIndex: number;
}

export interface IJourneyIndexEventRaw {
  id: number;
  event_type_slug: string;
  value: string;
  updated_on: string;
  event_type_name: string;
  event_type_translated_names: { [key: string]: string };
  event_type_order_index: number;
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
  index_events: IJourneyIndexEventRaw[];
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

export interface IOriginalPathway {
  id: number;
  url: string;
  name: string;
  description: string;
  stages: {
    name: string;
    slug: string;
    description: string;
  }[];
}
