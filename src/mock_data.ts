export const TEST_APP_TOKEN = "app123";
export const TEST_JWT = "test-jwt";
export const TEST_BASE_URL = `https://pathways.example.com/v1/apps/${TEST_APP_TOKEN}/`;

export const TEST_APPUSER_ME_RESPONSE = {
  id: 1,
  identity_id: "80e268c6-42e8-4bd3-97bc-569b5f1d6260",
  pathways: [
    {
      id: 1,
      original_pathway: {
        id: 1,
        name: "Pathway 1",
        description: "pathway 1 desc",
        is_active: true,
        is_deleted: false
      },
      current_stage_slug: "stage-0",
      disabled_rule_ids: [2]
    }
  ],
  journeys: [
    {
      id: 1,
      start_date: "2019-10-03",
      end_date: null,
      created_on: "2020-02-02T05:58:11.440200Z",
      index_events: [],
      entries:
        "https://pathways.example.com/v1/me/journey-entries/1/?format=json"
    },
    {
      id: 2,
      start_date: "2020-01-03",
      end_date: null,
      created_on: "2020-02-02T05:58:13.072669Z",
      index_events: [
        {
          id: 1,
          event_type_slug: "admission",
          value: "2020-02-02T15:58:13.321288Z",
          updated_on: "2020-02-02T05:58:14.673556Z"
        },
        {
          id: 2,
          event_type_slug: "discharge",
          value: "2020-02-05T15:58:13.321288Z",
          updated_on: "2020-02-02T05:58:16.313494Z"
        },
        {
          id: 3,
          event_type_slug: "surgery",
          value: "2020-02-08T15:58:13.321288Z",
          updated_on: "2020-02-02T05:58:17.228348Z"
        }
      ],
      entries:
        "https://pathways.example.com/v1/me/journey-entries/2/?format=json"
    }
  ]
};

export const TEST_ADMIN_LIST_APPUSERS_RESPONSE = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 2,
      url: "https://pathways.example.com/v1/apps/f39e5e/appusers/2/",
      identity_id: "7c60d634-386c-4f79-812c-4e0fc2f3fb2c",
      pathways: [
        {
          id: 2,
          url:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/2/pathways/2/",
          original_pathway:
            "https://pathways.example.com/v1/apps/f39e5e/pathways/3/",
          current_stage_slug: "stage-0",
          disabled_rule_ids: [14]
        }
      ],
      journeys: [
        {
          id: 3,
          url:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/2/journeys/3/",
          start_date: "2019-10-03",
          end_date: null,
          created_on: "2020-02-03T05:28:10.291738Z",
          index_events:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/2/journeys/3/index-events/",
          entries:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/2/journeys/3/entries/"
        },
        {
          id: 4,
          url:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/2/journeys/4/",
          start_date: "2020-01-03",
          end_date: null,
          created_on: "2020-02-03T05:28:12.017405Z",
          index_events:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/2/journeys/4/index-events/",
          entries:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/2/journeys/4/entries/"
        }
      ]
    },
    {
      id: 1,
      url: "https://pathways.example.com/v1/apps/f39e5e/appusers/1/",
      identity_id: "5642abd7-3bfb-4b82-9d6f-0cc7c2bf632c",
      pathways: [
        {
          id: 1,
          url:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/1/pathways/1/",
          original_pathway:
            "https://pathways.example.com/v1/apps/f39e5e/pathways/1/",
          current_stage_slug: "stage-0",
          disabled_rule_ids: [2]
        }
      ],
      journeys: [
        {
          id: 1,
          url:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/1/journeys/1/",
          start_date: "2019-10-03",
          end_date: null,
          created_on: "2020-02-02T05:58:11.440200Z",
          index_events:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/1/journeys/1/index-events/",
          entries:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/1/journeys/1/entries/"
        },
        {
          id: 2,
          url:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/1/journeys/2/",
          start_date: "2020-01-03",
          end_date: null,
          created_on: "2020-02-02T05:58:13.072669Z",
          index_events:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/1/journeys/2/index-events/",
          entries:
            "https://pathways.example.com/v1/apps/f39e5e/appusers/1/journeys/2/entries/"
        }
      ]
    }
  ]
};

export const TEST_ADMIN_LIST_INDEX_EVENTS_RESPONSE = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      name: "Surgery",
      slug: "surgery23",
      id: 1,
      translated_names: {}
    },
    {
      name: "Admission",
      slug: "admission23",
      id: 2,
      translated_names: {}
    }
  ]
};
