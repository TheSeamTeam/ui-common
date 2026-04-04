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
 * A partial map from column prop names to their GQL sort fields.
 *
 * Each key must be a valid property of `TRow`, catching typos and
 * copy-paste errors at compile time. Only columns that actually need
 * sort mapping must be listed — unlisted columns are silently dropped
 * (or throw in dev mode).
 */
export type SortsMapperFieldMap<TRow extends Record<string, any>> = {
  [K in keyof TRow & string]?: SortsMapperFieldEntry
}

/**
 * Options for {@link createSortsMapper}.
 */
export interface CreateSortsMapperOptions {
  /**
   * When `true` (the default), sort items whose `prop` is not listed in
   * the field map are automatically mapped using the prop value as the
   * GQL field name, provided a column with that prop exists in the
   * current datatable and has `sortable` not explicitly set to `false`.
   *
   * This eliminates boilerplate for the common case where column props
   * match GQL field names. The field map becomes an override/exclusion
   * map: list only columns that need a different GQL name or `null` to
   * suppress sorting.
   *
   * Set to `false` to require every sortable column to be explicitly
   * listed in the field map (with a dev-mode error for unmapped props).
   */
  autoMap?: boolean
}

/**
 * Creates a {@link SortsMapper} from a declarative field-name map.
 *
 * By default, `autoMap` is enabled: columns not listed in the field map
 * are automatically mapped using their `prop` as the GQL field name,
 * provided the column exists in the datatable and has `sortable` not
 * explicitly set to `false`. This guards against stale sort preferences
 * for removed columns.
 *
 * Each key in `fieldMap` must correspond to a datatable column `prop`
 * value. The value controls how that column's sort is translated:
 *
 * - `string`   – emits `{ [gqlField]: 'ASC' | 'DESC' }`
 * - `null`     – column is not sortable; the sort item is dropped
 * - `function` – called with `(prop, context)` and may return a field
 *                name or `null` to drop the item dynamically
 *
 * @example
 * // Auto-map all columns, override one
 * const mapSorts = createSortsMapper<MyRow>({
 *   computedField: 'gql_computed_field',
 * })
 *
 * @example
 * // Opt out of auto-mapping (explicit field map required)
 * const mapSorts = createSortsMapper<MyRow>({
 *   id: 'id',
 *   name: 'name',
 * }, { autoMap: false })
 */
export function createSortsMapper<TRow extends Record<string, any>>(
  fieldMap: SortsMapperFieldMap<TRow>,
  options?: CreateSortsMapperOptions,
): SortsMapper {
  const autoMap = options?.autoMap ?? true

  return (sorts: SortItem[], context: MapperContext): SortsMapperResult => {
    const result: SortsMapperResult = []

    for (const s of sorts) {
      const prop = s?.prop as keyof TRow & string

      if (!(prop in fieldMap)) {
        if (autoMap) {
          const columns = context.columns
          if (columns) {
            const column = columns.find((c) => c.prop === prop)
            if (column && column.sortable !== false) {
              const dir = s?.dir?.toUpperCase()
              result.push({ [prop]: dir })
            }
          } else if (isDevMode()) {
            // autoMap is enabled but no columns in context — likely a
            // wiring issue where columns$ is not being piped through.
            console.warn(
              `createSortsMapper: autoMap is enabled but no columns found in context for prop "${prop}". ` +
                `Ensure columns are provided via MapperContext.`,
            )
          }
          continue
        }

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
