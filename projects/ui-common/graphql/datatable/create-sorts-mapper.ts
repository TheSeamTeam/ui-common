import { isDevMode } from '@angular/core'

import { SortItem } from '@theseam/ui-common/datatable'

import { SortsMapper, SortsMapperResult } from './datatable-helpers'
import { MapperContext } from './mapper-context'

/**
 * A field mapping entry for {@link createSortsMapper}:
 *
 * - `string`   – the GQL sort-field name to emit for this column
 * - `null`     – column is not sortable; the sort item will be dropped
 * - `function` – `(prop, context) => string | null` for dynamic mapping
 *                with access to {@link MapperContext}
 */
export type SortsMapperFieldEntry =
  | string
  | null
  | ((prop: string, context: MapperContext) => string | null)

/**
 * A map from every column prop name in `TColumns` to its GQL sort field.
 *
 * Requiring every key at compile time provides exhaustiveness checking
 * without needing a switch statement.
 */
export type SortsMapperFieldMap<TColumns extends string> = {
  [K in TColumns]: SortsMapperFieldEntry
}

/**
 * Creates a {@link SortsMapper} from a declarative field-name map.
 *
 * Each key must correspond to a datatable column `prop` value. The value
 * controls how that column's sort is translated to a GQL sort object:
 *
 * - `string`   – emits `{ [gqlField]: 'ASC' | 'DESC' }`
 * - `null`     – column is not sortable; the sort item is dropped
 * - `function` – called with `(prop, context)` and may return a field
 *                name or `null` to drop the item dynamically
 *
 * In dev mode an error is thrown when a sort item's `prop` is not present
 * in the map. In production the item is silently dropped.
 *
 * @example
 * // Simple static mapping
 * const mapSorts = createSortsMapper<'id' | 'name'>({
 *   id: 'id',
 *   name: 'name',
 * })
 *
 * @example
 * // Dynamic mapping with context access
 * const mapSorts = createSortsMapper<'id' | 'name' | 'computed'>({
 *   id: 'id',
 *   name: 'name',
 *   computed: (prop, context) =>
 *     context.extraVariables.useAlt ? 'altField' : prop,
 * })
 */
export function createSortsMapper<TColumns extends string>(
  fieldMap: SortsMapperFieldMap<TColumns>,
): SortsMapper {
  return (sorts: SortItem[], context: MapperContext): SortsMapperResult => {
    const result: SortsMapperResult = []

    for (const s of sorts) {
      const prop = s?.prop as TColumns

      if (!(prop in fieldMap)) {
        if (isDevMode()) {
          throw new Error(
            `createSortsMapper: no mapping found for column prop "${prop}". ` +
              `Add an entry to the field map or set the value to null to ignore it.`,
          )
        }
        continue
      }

      const entry = fieldMap[prop]
      const dir = s?.dir?.toUpperCase()

      const gqlField =
        typeof entry === 'function' ? entry(prop, context) : entry

      if (gqlField === null) continue

      result.push({ [gqlField as string]: dir })
    }

    return result
  }
}
