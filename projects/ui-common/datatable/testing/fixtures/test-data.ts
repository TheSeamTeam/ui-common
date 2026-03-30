import { TheSeamDatatableColumn } from '../../models/table-column'

export const SIMPLE_COLUMNS: TheSeamDatatableColumn[] = [
  { prop: 'name', name: 'Name' },
  { prop: 'age', name: 'Age' },
  { prop: 'color', name: 'Color' },
]

export const SIMPLE_ROWS = [
  { name: 'Mark', age: 27, color: 'blue' },
  { name: 'Joe', age: 33, color: 'green' },
  { name: 'Alice', age: 30, color: 'red' },
  { name: 'Bill', age: 40, color: 'orange' },
  { name: 'Sally', age: 25, color: 'purple' },
]

export const FILTERABLE_COLUMNS: TheSeamDatatableColumn[] = [
  { prop: 'name', name: 'Name', filterable: true },
  {
    prop: 'age',
    name: 'Age',
    filterable: true,
    filterOptions: { filterType: 'search-numeric' },
  },
  {
    prop: 'startDate',
    name: 'Start Date',
    cellType: 'date',
    cellTypeConfig: { type: 'date' },
    filterable: true,
    filterOptions: { dateType: 'date' },
  },
  { prop: 'color', name: 'Favorite Color', filterable: true },
  {
    prop: 'candy',
    name: 'Favorite Candy',
    filterable: true,
    filterOptions: {
      filterProp: 'candyAttributes',
      filterType: 'search-candy',
    },
  },
]

export const FILTERABLE_ROWS = [
  {
    name: 'Mark',
    age: 27,
    color: 'blue',
    candy: 'Reeses',
    candyAttributes: ['chocolatey', 'nutty'],
    startDate: '2017-01-21 20:15:20.4166667 +00:00',
  },
  {
    name: 'Joe',
    age: 33,
    color: 'green',
    candy: 'Hershey Bar',
    candyAttributes: ['chocolatey'],
    startDate: '2012-04-25 17:29:36.4266667 +00:00',
  },
  {
    name: 'Shelby',
    age: 30,
    color: 'purple',
    candy: 'Snickers',
    candyAttributes: ['chocolatey', 'nutty'],
    startDate: '2020-11-18 20:47:25.1733333 +00:00',
  },
  {
    name: 'Jason',
    age: 'abc' as any,
    color: 'orange',
    candy: 'Whoppers',
    candyAttributes: ['chocolatey'],
    startDate: '2016-05-24 23:13:26.3400000 +00:00',
  },
  {
    name: 'David',
    age: null,
    color: 'blue',
    candy: 'Skittles',
    candyAttributes: ['fruity'],
    startDate: '2021-06-29 16:31:37.2733333 +00:00',
  },
  {
    name: 'Pam',
    age: null,
    color: 'red',
    candy: 'Starbursts',
    candyAttributes: ['fruity'],
    startDate: '2012-08-11 04:00:00.000000 +00:00',
  },
  {
    name: 'New Employee',
    age: null,
    color: null,
    candy: null,
    candyAttributes: undefined,
    startDate: null,
  },
]

export function createRows(
  count: number,
): { name: string; age: number; color: string }[] {
  const colors = ['blue', 'green', 'red', 'orange', 'purple', 'grey']
  return Array.from({ length: count }, (_, i) => ({
    name: `Person ${i + 1}`,
    age: 20 + (i % 50),
    color: colors[i % colors.length],
  }))
}
