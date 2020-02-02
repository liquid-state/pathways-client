export const TEST_JWT = 'test-jwt';

export const TEST_ME_RESPONSE = {
  id: 1,
  identity_id: '80e268c6-42e8-4bd3-97bc-569b5f1d6260',
  pathways: [
    {
      id: 1,
      original_pathway: {
        id: 1,
        name: 'Pathway 1',
        description: 'pathway 1 desc',
        is_active: true,
        is_deleted: false,
      },
      current_stage_slug: 'stage-0',
      disabled_rule_ids: [2],
    },
  ],
  journeys: [
    {
      id: 1,
      start_date: '2019-10-03',
      end_date: null,
      created_on: '2020-02-02T05:58:11.440200Z',
      index_events: [],
      entries: 'https://pathways.ecoach.health/v1/me/journey-entries/1/?format=json',
    },
    {
      id: 2,
      start_date: '2020-01-03',
      end_date: null,
      created_on: '2020-02-02T05:58:13.072669Z',
      index_events: [
        {
          id: 1,
          event_type_slug: 'admission',
          value: '2020-02-02T15:58:13.321288Z',
          updated_on: '2020-02-02T05:58:14.673556Z',
        },
        {
          id: 2,
          event_type_slug: 'discharge',
          value: '2020-02-05T15:58:13.321288Z',
          updated_on: '2020-02-02T05:58:16.313494Z',
        },
        {
          id: 3,
          event_type_slug: 'surgery',
          value: '2020-02-08T15:58:13.321288Z',
          updated_on: '2020-02-02T05:58:17.228348Z',
        },
      ],
      entries: 'https://pathways.ecoach.health/v1/me/journey-entries/2/?format=json',
    },
  ],
};
