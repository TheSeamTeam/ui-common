import { gql } from 'apollo-angular'

import { filteredResults } from '../filtered-results'

export interface SimpleGqlTestRecord {
  id: number
  name: string
}

export function createSimpleGqlTestRecord(num: number): SimpleGqlTestRecord {
  return { id: num, name: `Item_${num}` }
}

export function createSimpleGqlTestRoot(numRecords: number) {
  const _records: SimpleGqlTestRecord[] = []
  for (let i = 0; i < numRecords; i++) {
    _records.push(createSimpleGqlTestRecord(i))
  }

  return {
    simpleGqlTestRecords: (args?: any) => filteredResults([..._records], args),
  }
}

export const SIMPLE_GQL_TEST_QUERY = gql`
  query ExampleQuery(
    $skip: Int
    $take: Int
    $order: [SimpleGqlTestRecordSortInput!]
    $where: SimpleGqlTestRecordFilterInput
  ) {
    simpleGqlTestRecords(
      skip: $skip
      take: $take
      order: $order
      where: $where
    ) {
      items {
        id
        name
      }
      totalCount
    }
  }
`

/**
 * Like {@link SIMPLE_GQL_TEST_QUERY} but includes `$search: String` for use
 * with search filters that inline a `gqlVar('search')` reference via
 * `queryProcessingConfig.variables.inline`.
 */
export const SIMPLE_GQL_TEST_SEARCH_QUERY = gql`
  query ExampleQuery(
    $skip: Int
    $take: Int
    $order: [SimpleGqlTestRecordSortInput!]
    $where: SimpleGqlTestRecordFilterInput
    $search: String
  ) {
    simpleGqlTestRecords(
      skip: $skip
      take: $take
      order: $order
      where: $where
    ) {
      items {
        id
        name
      }
      totalCount
    }
  }
`

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SimpleGqlTestExtraVariables {}

export interface SimpleGqlTestVariables extends SimpleGqlTestExtraVariables {
  skip?: number
  take?: number
  order?: Partial<Record<keyof SimpleGqlTestRecord, 'ASC' | 'DESC'>>[]
  where?: any
  search?: string
}
