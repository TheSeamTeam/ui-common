import { TableCellTypeConfigDate } from '../../table-cell-types/table-cell-type-date/table-cell-type-date-config'
import { TableCellTypeConfigIcon } from '../../table-cell-types/table-cell-type-icon/table-cell-type-icon-config'
import { TableCellTypeConfigString } from '../../table-cell-types/table-cell-type-string/table-cell-type-string-config'

import { DatatableDynamicDef, DynamicDatatableColumn } from '../datatable-dynamic-def'

type ColumnDefType =
  DynamicDatatableColumn<'string', TableCellTypeConfigString> |
  DynamicDatatableColumn<'date', TableCellTypeConfigDate> |
  DynamicDatatableColumn<'icon', TableCellTypeConfigIcon>

const _columnDefs: ColumnDefType[] = [
  // { prop: 'icn', name: 'Icon', cellType: 'icon' },
  {
    prop: 'icn', name: 'Icon',
    width: 60,
    resizeable: false,
    canAutoResize: false,
    cellType: 'icon',
    cellTypeConfig: {
      type: 'icon',
      iconClass: { type: 'jexl', expr: 'row.read ? "" : "text-danger"' },
      action: {
        type: 'modal',
        component: 'story-modal-1',
        data: { type: 'jexl', expr: '{ message: row.item }' },
        confirmDef: {
          message: 'Are you sure you want to view message?'
        },
        resultActions: {
          'next-modal': {
            type: 'modal',
            component: 'story-modal-2',
            data: { type: 'jexl', expr: '{ message: row.item, isReply: true }' }
          }
        }
      }
    },
    exportHeader: 'Read Status',
    exportValue: { type: 'jexl', expr: 'row.read ? "Read" : "Unread"' },
  },
  { prop: 'firstName', name: 'First Name' },
  { prop: 'lastName', name: 'Last Name' },
  { prop: 'age', name: 'Age' },
  { prop: 'sentDate', name: 'Sent Date', cellType: 'date' },
  { prop: 'error', name: 'Error' }
]

export const exampleData1: DatatableDynamicDef = {
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
            { name: 'All', value: '' },
            { name: '30', value: '30' },
            { name: '32', value: '32' }
          ],
          multiple: false,
          selectionToggleable: false,
          initialValue: '',
          properties: ['age']
        }
      }
    ],
    exporters: [
      'exporter:csv',
      'exporter:xlsx'
    ],
  },
  columns: _columnDefs,
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
    // {
    //   label: 'Link',
    //   action: {
    //     type: 'link',
    //     link: 'details'
    //   }
    // },
    // {
    //   label: 'Link External',
    //   action: { type: 'link', link: 'https://bing.com', external: true, target: '_blank' },
    //   hidden: { type: 'jexl', expr: 'row.age > 30' }
    // },
    // {
    //   label: 'Link Asset',
    //   // action: { type: 'link', link: 'https://api.theseam.com/asset/1234', asset: true },
    //   action: { type: 'link', link: { type: 'jexl', expr: '"https://api.theseam.com/asset/1234"' }, asset: true },
    //   hidden: { type: 'jexl', expr: 'row.age > 30' }
    // },
    // {
    //   label: 'Link Asset',
    //   action: { type: 'link', link: 'https://api.theseam.com/asset/1234', asset: true },
    //   // action: { type: 'link', link: { type: 'jexl', expr: '"https://api.theseam.com/asset/1234"' }, asset: true, target: '_blank' },
    //   hidden: { type: 'jexl', expr: 'row.age > 30' }
    // },
    // {
    //   label: 'Link External Config',
    //   action: { type: 'link', link: 'https://bing.com', external: true, confirmDialog: { 'message': 'Are you sure?' } },
    //   hidden: { type: 'jexl', expr: 'row.age > 30' }
    // },
    // {
    //   label: 'Api Endpoint',
    //   action: {
    //     type: 'api',
    //     endpoint: { type: 'jexl', expr: '"example/users/" + row.age' },
    //     method: 'POST',
    //     body: { type: 'jexl', expr: '{ thing: row.age }' },
    //     params: { type: 'jexl', expr: '{ age: row.age, name: row.firstName + " " + row.lastName }' }
    //   },
    //   hidden: { type: 'jexl', expr: 'row.age > 30' }
    // },
    {
      label: 'Modal',
      // action: { type: 'modal', component: 'story-ex-modal' }
      // action: { type: 'modal', component: { type: 'jexl', expr: 'row.age > 30 ? "story-ex-modal" : "story-ex-modal2"' } }
      action: { type: 'modal', component: { type: 'jexl', expr: 'row.age > 30 ? "story-modal-1" : "story-modal-2"' } }
    }
  ],
  options: {
    virtualization: true
  }
}
