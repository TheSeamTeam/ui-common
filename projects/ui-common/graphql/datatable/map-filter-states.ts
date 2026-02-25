import { isDevMode } from '@angular/core'
import { from, Observable } from 'rxjs'
import { concatMap, filter, take, toArray } from 'rxjs/operators'

import { DataFilterState } from '@theseam/ui-common/data-filters'
import {
  notNullOrUndefined,
  wrapIntoObservable,
} from '@theseam/ui-common/utils'

import { MapperContext } from './mapper-context'

export interface FilterStateMapperVariables {
  [name: string]: any
}

export interface FilterStateMapperFilter {
  and?: FilterStateMapperFilter[]
  or?: FilterStateMapperFilter[]
  [name: string]: any
}

export type FilterStateMapperResult = {
  filter: FilterStateMapperFilter
  variables: FilterStateMapperVariables
} | null

/**
 * A filter input type constrained to the field names of `T`.
 *
 * Use this as the building block for {@link TypedFilterStateMapperResult}
 * when you want compile-time checking that filter conditions only reference
 * real fields in the corresponding GQL input type.
 *
 * @example
 * type MyFilter = TypedFilterInput<'id' | 'name'>
 * // { id?: any; name?: any }
 */
export type TypedFilterInput<T extends string | number | symbol> = {
  [name in T]?: any
}

/**
 * A type-safe alternative to {@link FilterStateMapperResult} that constrains
 * filter field names to the union `T`.
 *
 * The filter can be either a direct field-condition object or a combined
 * object with `or`/`and` arrays:
 *
 * ```ts
 * // Direct field condition
 * { filter: { status: { eq: 'active' } }, variables: {} }
 *
 * // Combined (OR)
 * { filter: { or: [{ id: { lt: 30 } }, { name: { contains: 'foo' } }] }, variables: {} }
 * ```
 *
 * Because TypeScript uses structural typing, a mapper that returns
 * `TypedFilterStateMapperResult<'id' | 'name'>` is assignable to the
 * untyped {@link FilterStateMapper} signature without any cast.
 */
export type TypedFilterStateMapperResult<T extends string | number | symbol> = {
  filter:
    | {
        or?: TypedFilterInput<T>[]
        and?: TypedFilterInput<T>[]
      }
    | TypedFilterInput<T>
  variables: FilterStateMapperVariables
} | null

export type FilterStateMapper = (
  filterState: DataFilterState,
  context: MapperContext,
) =>
  | FilterStateMapperResult
  | Promise<FilterStateMapperResult>
  | Observable<FilterStateMapperResult>
export interface FilterStateMappers {
  [filterName: string]: FilterStateMapper
}

function resolveMapper(
  filterState: DataFilterState,
  filterStateMappers: FilterStateMappers,
  context: MapperContext,
): Observable<FilterStateMapperResult> {
  const mapper = filterStateMappers[filterState.name]
  if (!notNullOrUndefined(mapper)) {
    throw Error(`Mapper for filter '${filterState.name}' not found.`)
  }

  return wrapIntoObservable(mapper(filterState, context)).pipe(
    // Require each mapper to complete.
    take(1),
  )
}

function resolveMappers(
  filterStates: DataFilterState[],
  filterStateMappers: FilterStateMappers,
  context: MapperContext,
): Observable<Exclude<FilterStateMapperResult, null>[]> {
  return from(filterStates).pipe(
    concatMap((filterState) =>
      resolveMapper(filterState, filterStateMappers, context),
    ),
    filter(notNullOrUndefined),
    toArray(),
  )
}

/**
 * Combines multiple active filter results with AND so that all conditions must
 * be satisfied simultaneously (e.g. a search filter AND a status filter).
 */
function mergeFilters(
  filters: FilterStateMapperFilter[],
): FilterStateMapperFilter {
  return { and: filters }
}

/**
 * Merges variable objects.
 *
 * NOTE: This does not try to deep merge, so if two objects define the same
 * variable then the last object's value will be in the merged object. *In
 * devMode an error will be thrown.*
 */
function mergeVariables(
  variableObjects: FilterStateMapperVariables[],
): FilterStateMapperVariables {
  const variables: FilterStateMapperVariables = {}

  for (const v of variableObjects) {
    const props = Object.keys(v)

    if (isDevMode()) {
      for (const p of props) {
        if (notNullOrUndefined(variables[p]) && variables[p] !== v[p]) {
          // eslint-disable-next-line no-console
          console.warn(
            `Multiple filters adding the same variable with a different result. This could cause unexpected results.`,
          )
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

function isEmptyFilter(mapperFilter: FilterStateMapperFilter): boolean {
  return Object.keys(mapperFilter).length === 0
}

export async function mapFilterStates(
  filterStates: DataFilterState[],
  filterStateMappers: FilterStateMappers,
  context: MapperContext,
): Promise<FilterStateMapperResult> {
  const results: FilterStateMapperFilter[] =
    (await resolveMappers(
      filterStates,
      filterStateMappers,
      context,
    ).toPromise()) ?? []

  if (results.length === 0) {
    return null
  }

  const filters = results
    .map((r: any) => r.filter)
    .filter(notNullOrUndefined)
    .filter((mapperFilter) => !isEmptyFilter(mapperFilter))

  const variableObjs = results
    .map((r: any) => r.variables)
    .filter(notNullOrUndefined)

  return {
    filter: mergeFilters(filters),
    variables: mergeVariables(variableObjs),
  }
}
