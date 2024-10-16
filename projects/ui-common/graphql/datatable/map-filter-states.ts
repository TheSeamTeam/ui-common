import { isDevMode } from '@angular/core'
import { from, Observable } from 'rxjs'
import { concatMap, filter, take, toArray } from 'rxjs/operators'

import { DataFilterState } from '@theseam/ui-common/data-filters'
import { notNullOrUndefined, wrapIntoObservable } from '@theseam/ui-common/utils'

import { MapperContext } from './mapper-context'

export interface FilterStateMapperVariables {
  [name: string]: any
}

export interface FilterStateMapperFilter {
  [name: string]: any
}

export type FilterStateMapperResult = {
  filter: FilterStateMapperFilter,
  variables: FilterStateMapperVariables
} | null

export type FilterStateMapper = (filterState: DataFilterState, context: MapperContext)
  => (FilterStateMapperResult | Promise<FilterStateMapperResult> | Observable<FilterStateMapperResult>)
export interface FilterStateMappers { [filterName: string]: FilterStateMapper }

function resolveMapper(
  filterState: DataFilterState,
  filterStateMappers: FilterStateMappers,
  context: MapperContext
): Observable<FilterStateMapperResult> {
  const mapper = filterStateMappers[filterState.name]
  if (!notNullOrUndefined(mapper)) {
    throw Error(`Mapper for filter '${filterState.name}' not found.`)
  }

  return wrapIntoObservable(mapper(filterState, context)).pipe(
    // Require each mapper to complete.
    take(1)
  )
}

function resolveMappers(
  filterStates: DataFilterState[],
  filterStateMappers: FilterStateMappers,
  context: MapperContext
): Observable<(Exclude<FilterStateMapperResult, null>)[]> {
  return from(filterStates).pipe(
    concatMap(filterState => resolveMapper(filterState, filterStateMappers, context)),
    filter(notNullOrUndefined),
    toArray()
  )
}

function mergeFilters(filters: FilterStateMapperFilter[]): { or: FilterStateMapperFilter[] } {
  return { or: filters }
}

/**
 * Merges variable objects.
 *
 * NOTE: This does not try to deep merge, so if two objects define the same
 * variable then the last object's value will be in the merged object. *In
 * devMode an error will be thrown.*
 */
function mergeVariables(variableObjects: FilterStateMapperVariables[]): FilterStateMapperVariables {
  const variables: FilterStateMapperVariables = {}

  for (const v of variableObjects) {
    const props = Object.keys(v)

    if (isDevMode()) {
      for (const p of props) {
        if (notNullOrUndefined(variables[p]) && variables[p] !== v[p]) {
          // eslint-disable-next-line no-console
          console.warn(`Multiple filters adding the same variable with a different result. This could cause unexpected results.`)
          break
        }
      }
    }

    for (const p of props) {
      variables[p] = v[p]
    }
  }

  return variables
}

export async function mapFilterStates(
  filterStates: DataFilterState[],
  filterStateMappers: FilterStateMappers,
  context: MapperContext
): Promise<FilterStateMapperResult> {
  // TODO: Fix types
  const results: any = await resolveMappers(filterStates, filterStateMappers, context).toPromise()

  if (results.length === 0) {
    return null
  }

  const filters = results
    .map((r: any) => r.filter)
    .filter(notNullOrUndefined)

  const variableObjs = results
    .map((r: any) => r.variables)
    .filter(notNullOrUndefined)

  return {
    filter: mergeFilters(filters),
    variables: mergeVariables(variableObjs)
  }
}
