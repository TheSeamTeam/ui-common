export interface TheSeamTableCellTypeColumnAlign {
  /**
   * Alignment for header and cell content.
   *
   * Defaults to 'left'.
   */
  align?: 'left' | 'center' | 'right'

  /**
   * Alignment for header content.
   *
   * Defaults to `align` if not provided.
   */
  alignHeader?: 'left' | 'center' | 'right'

  /**
   * Alignment for cell content.
   *
   * Defaults to `align` if not provided.
   */
  alignCell?: 'left' | 'center' | 'right'
}

export function setColumnAlignDefaults(
  column: TheSeamTableCellTypeColumnAlign & {
    headerClass?: string | null | ((data: any) => string | any)
    cellClass?: string | null | ((data: any) => string | any)
  },
): void {
  if (!Object.prototype.hasOwnProperty.call(column, 'align')) {
    column.align = 'left'
  }

  if (!Object.prototype.hasOwnProperty.call(column, 'alignHeader')) {
    column.alignHeader = column.align
  }

  if (!Object.prototype.hasOwnProperty.call(column, 'alignCell')) {
    column.alignCell = column.align
  }

  if (!Object.prototype.hasOwnProperty.call(column, 'headerClass')) {
    column.headerClass = `text-${column.alignHeader}`
  } else if (
    typeof column.headerClass === 'string' &&
    column.headerClass.length > 0 &&
    !column.headerClass.includes('text-')
  ) {
    column.headerClass = `text-${column.alignHeader} ${column.headerClass}`
  }

  if (!Object.prototype.hasOwnProperty.call(column, 'cellClass')) {
    column.cellClass = `text-${column.alignCell}`
  } else if (
    typeof column.cellClass === 'string' &&
    column.cellClass.length > 0 &&
    !column.cellClass.includes('text-')
  ) {
    column.cellClass = `text-${column.alignCell} ${column.cellClass}`
  }
}
