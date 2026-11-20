import { TheSeamDatatableColumn } from '../models/table-column'

function isLeadingUtility(column: TheSeamDatatableColumn): boolean {
  return (
    !!column.checkboxable ||
    column.prop === '$$__checkbox__' ||
    (!column.name && !String(column.prop).startsWith('$$'))
  )
}

/**
 * Sets `frozenLeft` on the first visible data column and on all leading utility
 * columns (checkbox, document-link icons). Call on the already-filtered visible
 * column list; does not reorder the array, so alteration indices stay intact.
 */
export function freezeFirstDataColumn(
  columns: TheSeamDatatableColumn[],
): TheSeamDatatableColumn[] {
  const first = columns.find(
    (c) => !isLeadingUtility(c) && !!c.name && !c.hidden,
  )
  return columns.map((c) => {
    const pinned = isLeadingUtility(c) || c === first
    return {
      ...c,
      // ngx-datatable does not reconnect drag handlers when the same column
      // moves between pin groups. A group-specific ID forces a clean rebuild.
      $$id: JSON.stringify([
        c.prop,
        pinned ? 'left' : c.frozenRight ? 'right' : 'center',
      ]),
      frozenLeft: pinned || (!c.name && !!c.frozenLeft),
      frozenRight: pinned ? false : c.frozenRight,
      draggable: isLeadingUtility(c) ? false : c.draggable,
    }
  })
}
