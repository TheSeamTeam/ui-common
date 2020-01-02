import { IDatatableDynamicDef } from '../datatable-dynamic-def'

export const exampleData1: IDatatableDynamicDef = {
  filterMenu: {
    state: 'always-visible',
    filters: [
      { name: 'search', type: 'full-search' },
      { name: 'text', type: 'common' },
      { name: 'search', type: 'common' },
      {
        name: 'toggle-buttons',
        type: 'common',
        options: {
          buttons: [
            { name: '30', value: '30' },
            { name: '32', value: '32' }
          ]
        }
      }
    ],
    exporters: [
      'exporter:csv',
      'exporter:xlsx'
    ],
  },
  columns: [
    { prop: 'icn', name: 'Icon', cellType: 'icon' },
    { prop: 'firstName', name: 'First Name' },
    { prop: 'lastName', name: 'Last Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'sentDate', name: 'Sent Date', cellType: 'date' },
    { prop: 'error', name: 'Error' }
  ],
  rows: [
    { icn: 'faEnvelope', firstName: 'User1', lastName: 'Last1', age: 28, sentDate: '2019-07-22T16:25:58.0266996+00:00' },
    { icn: 'faEnvelope', firstName: 'User2', lastName: 'Last2', age: 30, sentDate: '2019-08-22T19:23:58.0266996+00:00' },
    { icn: 'faEnvelope', firstName: 'User3', lastName: 'Last3', age: 32, sentDate: '' },
    // tslint:disable-next-line: max-line-length
    { icn: 'faEnvelope', firstName: 'User4', lastName: 'Last4', age: 34, sentDate: '2019-08-22T19:23:58.0266996+00:00', error: 'Sint enim do adipisicing in veniamaa' },
    // tslint:disable-next-line: max-line-length
    { icn: 'faEnvelope', firstName: 'User4', lastName: 'Last4', age: 34, sentDate: '2019-08-22T19:23:58.0266996+00:00', error: 'Sint enim do adipisicing in veniam ullamco tempor sunt sunt cillum magna. Proident ullamco ut nulla nisi ullamco occaecat cupidatat nisi. Elit proident sint ex ex reprehenderit anim adipisicing dolore pariatur ea officia est quis fugiat. Quis nostrud amet magna do proident consequat irure minim quis. Aute sit et pariatur ipsum.' },
  ],
  rowActions: [
    {
      label: 'Link',
      action: {
        type: 'link',
        link: 'details'
      }
    },
    {
      label: 'Link External',
      action: { type: 'link', link: 'https://bing.com', external: true, target: '_blank' },
      hidden: { type: 'jexl', expr: 'row.age > 30' }
    },
    // {
    //   label: 'Link External Config',
    //   action: { type: 'link', link: 'https://bing.com', external: true, confirmDialog: { 'message': 'Are you sure?' } },
    //   hidden: { type: 'jexl', expr: 'row.age > 30' }
    // },
    // {
    //   label: 'Api Endpoint',
    //   action: {
    //     type: 'api',
    //     // endpoint: 'example/users',
    //     endpointExpr: '"example/users/" + row.age',
    //     method: 'POST',
    //     bodyExpr: '{ thing: row.age }',
    //     paramsExpr: '{ age: row.age, name: row.firstName + " " + row.lastName }'
    //   },
    //   hidden: { type: 'jexl', expr: 'row.age > 30' }
    // },
    // {
    //   label: 'Modal',
    //   action: { type: 'modal', component: 'story-ex-modal' }
    // }
  ],
  options: {
    virtualization: true
  }
}
