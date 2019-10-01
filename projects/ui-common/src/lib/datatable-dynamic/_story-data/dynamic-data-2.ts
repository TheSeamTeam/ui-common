import { IDatatableDynamicDef } from '../datatable-dynamic-def'

export const exampleData2: IDatatableDynamicDef = {
  filterMenu: {
    state: 'always-visible',
    filters: [
      { name: 'search', type: 'full-search' },
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
    { prop: 'firstName', name: 'First Name' },
    { prop: 'lastName', name: 'Last Name' },
    { prop: 'age', name: 'Age' },
    { prop: 'sentDate', name: 'Sent Date', cellType: 'date' }
  ],
  rows: [
    { firstName: 'User1', lastName: 'Last1', age: 28, sentDate: '2019-07-22T16:25:58.0266996+00:00' },
    { firstName: 'User2', lastName: 'Last2', age: 30, sentDate: '2019-04-22T12:15:58.0266996+00:00' },
    { firstName: 'User3', lastName: 'Last3', age: 32, sentDate: '2019-08-22T19:23:58.0266996+00:00' },
  ],
  rowActions: [
    {
      label: 'View Detail',
      action: {
        type: 'link',
        link: 'details'
      }
    }
  ],
  options: {
    virtualization: true
  }
}
