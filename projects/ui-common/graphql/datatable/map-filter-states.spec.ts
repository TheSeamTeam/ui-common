import { DataFilterState } from '@theseam/ui-common/data-filters'

import { mapFilterStates } from './map-filter-states'
import { MapperContext } from './mapper-context'

describe('mapFilterStates', () => {
  it('should return null if no filterStates', async () => {
    const result = await mapFilterStates([], {}, { extraVariables: {} })
    expect(result).toBeNull()
  })

  it('should return null if no filterStates return value', async () => {
    const state = [ { name: 'a', state: {} } ]
    const mappers = {
      'a': (filterState: DataFilterState, context: MapperContext) => null
    }
    const result = await mapFilterStates(state, mappers, { extraVariables: {} })
    expect(result).toBeNull()
  })

  it('should return merged filters', async () => {
    const state = [
      { name: 'a', state: {} },
      { name: 'b', state: {} },
      { name: 'c', state: {} },
      { name: 'd', state: {} }
    ]
    const mappers = {
      'a': (filterState: DataFilterState, context: MapperContext) => ({ filter: { eq: 'a' }, variables: { a: 'b' } }),
      'b': (filterState: DataFilterState, context: MapperContext) => ({ filter: { eq: 'b' }, variables: { c: 'd' } }),
      'c': (filterState: DataFilterState, context: MapperContext) => ({ filter: null, variables: { e: 'f' } }),
      'd': (filterState: DataFilterState, context: MapperContext) => ({ filter: { eq: 'b' }, variables: null })
    }
    const result = await mapFilterStates(state, mappers, { extraVariables: {} })
    expect(result?.filter).toEqual({ or: [ { eq: 'a' }, { eq: 'b' }, { eq: 'b' } ] })
    expect(result?.variables).toEqual({ a: 'b', c: 'd', e: 'f' })
  })
})
