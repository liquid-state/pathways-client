export declare const TEST_JWT = "test-jwt";
export declare const TEST_ME_RESPONSE: {
    id: number;
    identity_id: string;
    pathways: {
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
    }[];
    journeys: {
        id: number;
        start_date: string;
        end_date: null;
        created_on: string;
        index_events: {
            id: number;
            event_type_slug: string;
            value: string;
            updated_on: string;
        }[];
        entries: string;
    }[];
};
//# sourceMappingURL=mock_data.d.ts.map