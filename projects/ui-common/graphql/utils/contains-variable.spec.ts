import { gql } from 'apollo-angular'

import { containsVariable } from './contains-variable'

describe('containsVariable', () => {
  it('returns true when variable is used as an argument', () => {
    const query = gql`
      query TestQuery($skip: Int) {
        example(skip: $skip) {
          totalCount
        }
      }
    `
    expect(containsVariable(query, 'skip')).toBe(true)
  })

  it('returns true when variable exists only in its own definition', () => {
    const query = gql`
      query TestQuery($skip: Int, $search: String) {
        example(skip: $skip) {
          totalCount
        }
      }
    `
    expect(containsVariable(query, 'search')).toBe(true)
  })

  it('returns false when variable is not in the document', () => {
    const query = gql`
      query TestQuery($skip: Int) {
        example(skip: $skip) {
          totalCount
        }
      }
    `
    expect(containsVariable(query, 'where')).toBe(false)
  })

  it('returns true when variable is nested inside an inlined argument', () => {
    const query = gql`
      query TestQuery($skip: Int, $search: String) {
        example(skip: $skip, where: { name: { contains: $search } }) {
          totalCount
        }
      }
    `
    expect(containsVariable(query, 'search')).toBe(true)
  })
})
