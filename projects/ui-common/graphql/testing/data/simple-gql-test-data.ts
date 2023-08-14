import { gql } from 'apollo-angular'
import { buildSchema, print } from 'graphql'

import { baseSchemaFragment } from '../base-schema-fragment'
import { filteredResults } from '../filtered-results'

export interface SimpleGqlTestRecord {
  id: number
  name: string
}

export function createSimpleGqlTestRecord(num: number): SimpleGqlTestRecord {
  return { id: num, name: `Item_${num}` }
}

export const simpleGqlTestSchema = buildSchema(print(gql`
  ${baseSchemaFragment}

  type SimpleGqlTestRecordCollectionSegment {
    items: [SimpleGqlTestRecord!]

    """Information to aid in pagination."""
    pageInfo: CollectionSegmentInfo!
    totalCount: Int!
  }

  input SimpleGqlTestRecordFilterInput {
    and: [SimpleGqlTestRecordFilterInput!]
    or: [SimpleGqlTestRecordFilterInput!]
    objectContains: String
    id: ComparableInt32OperationFilterInput
    name: StringOperationFilterInput
  }

  type SimpleGqlTestRecord {
    id: Int
    name: String
  }

  type Query {
    simpleGqlTestRecords(
      skip: Int
      take: Int
      where: SimpleGqlTestRecordFilterInput
    ): SimpleGqlTestRecordCollectionSegment
  }
`))

export function createSimpleGqlTestRoot(numRecords: number) {
  const _records: SimpleGqlTestRecord[] = []
  for (let i = 0; i < numRecords; i++) { _records.push(createSimpleGqlTestRecord(i)) }

  return {
    simpleGqlTestRecords: (args?: any) => filteredResults([ ..._records ], args)
  }
}

export const SIMPLE_GQL_TEST_QUERY = gql`
  query ExampleQuery(
    $skip: Int
    $take: Int
    $where: SimpleGqlTestRecordFilterInput
  ) {
    simpleGqlTestRecords(
      skip: $skip
      take: $take
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

// tslint:disable-next-line: no-empty-interface
export interface SimpleGqlTestExtraVariables {

}

export interface SimpleGqlTestVariables extends SimpleGqlTestExtraVariables {
  skip?: number
  take?: number
  order?: any
  where?: any
}
