import { DataFilterSortItem, DataFilterSortType, DataFilterSortDirection } from '@theseam/ui-common/data-filters'
import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils'
import { DataboardCard } from '../models/databoard-card'
import { DataboardBoard } from '../models/databoard-board'
import { shallowValueGetter } from '@marklb/ngx-datatable'

export function hasListSort(sorts: DataFilterSortItem[]): boolean {
  const listSorts = getListSorts(sorts)
  return notNullOrUndefined(listSorts) && listSorts.length > 0
}

export function getListSorts(sorts: DataFilterSortItem[]): DataFilterSortItem[] {
  return sorts.filter(s => isNullOrUndefined(s.boardProp))
}

export function getBoardSorts(prop: string | undefined, sorts: DataFilterSortItem[]): DataFilterSortItem[] {
  if (isNullOrUndefined(prop)) {
    return []
  }

  return sorts.filter(s => s.boardProp === prop)
}

export function getAggregateSorts(board: DataboardBoard, sorts: DataFilterSortItem[]): DataFilterSortItem[] {
  const boardSorts = getBoardSorts(board.prop, sorts)
  if (boardSorts.length === 0) {
    return getListSorts(sorts)
  }
  return boardSorts
}

export function sortCards(sortType: DataFilterSortType, sorts: DataFilterSortItem[], cards: DataboardCard[], boards: DataboardBoard[]): DataboardCard[] {
  if (sortType === DataFilterSortType.single) {
    return _sortCards(cards, boards, sorts)
  } else if (sortType === DataFilterSortType.multi) {
    // TODO: implement
  }

  return cards
}

/**
 * creates a shallow copy of the `cards` input and returns the sorted copy. this function
 * does not sort the `cards` argument in place
 */
function _sortCards(cards: DataboardCard[], boards: DataboardBoard[], dirs: DataFilterSortItem[]): any[] {
  if (!cards) return []
  if (!dirs || !dirs.length || !boards) return [...cards]

  /**
   * record the row ordering of results from prior sort operations (if applicable)
   * this is necessary to guarantee stable sorting behavior
   */
  const rowToIndexMap = new Map<any, number>()
  cards.forEach((row, index) => rowToIndexMap.set(row, index))

  const temp = [...cards]
  const _boards = boards.reduce((obj, board, index) => {
    if (board.comparator && typeof board.comparator === 'function') {
      if (notNullOrUndefined(board.prop)) {
        obj[board.prop] = board.comparator
      }
    }
    return obj
  }, {} as {[index: string]: any})

  // cache valueGetter and compareFn so that they
  // do not need to be looked-up in the sort function body
  const cachedDirs = dirs.map(dir => {
    const prop = dir.dataProp
    return {
      prop,
      dir: dir.dir,
      // TODO: expand options?
      valueGetter: shallowValueGetter,
      compareFn: _boards[prop] || orderByComparator
    }
  })

  return temp.sort((rowA: any, rowB: any) => {
    for (const cachedDir of cachedDirs) {
      // Get property and valuegetters for column to be sorted
      const { prop, valueGetter } = cachedDir
      // Get A and B cell values from rows based on properties of the columns
      const propA = valueGetter(rowA, prop)
      const propB = valueGetter(rowB, prop)

      // Compare function gets five parameters:
      // Two cell values to be compared as propA and propB
      // Two rows corresponding to the cells as rowA and rowB
      // Direction of the sort for this column as SortDirection
      // Compare can be a standard JS comparison function (a,b) => -1|0|1
      // as additional parameters are silently ignored. The whole row and sort
      // direction enable more complex sort logic.
      const comparison =
        cachedDir.dir !== 'desc'
          ? cachedDir.compareFn(propA, propB, rowA, rowB, cachedDir.dir)
          : -cachedDir.compareFn(propA, propB, rowA, rowB, cachedDir.dir)

      // Don't return 0 yet in case of needing to sort by next property
      if (comparison !== 0) return comparison
    }

    if (!(rowToIndexMap.has(rowA) && rowToIndexMap.has(rowB))) return 0

    /**
     * all else being equal, preserve original order of the rows (stable sort)
     */
    const getRowA = rowToIndexMap.get(rowA) || 0
    const getRowB = rowToIndexMap.get(rowB) || 0

    return getRowA === getRowB ? 0 : getRowA < getRowB ? -1 : 1
  })
}

/**
 * Pulled from ngx-datatable library
 * Adapted from fueld-ui on 6/216
 * https://github.com/FuelInteractive/fuel-ui/tree/master/src/pipes/OrderBy
 */
export function orderByComparator(a: any, b: any): number {
  let _a = a
  let _b = b

  if (_a === null || typeof _a === 'undefined') _a = 0
  if (_b === null || typeof _b === 'undefined') _b = 0
  if (_a instanceof Date && _b instanceof Date) {
    if (_a < _b) return -1
    if (_a > _b) return 1
  } else if (isNaN(parseFloat(_a)) || !isFinite(_a) || isNaN(parseFloat(_b)) || !isFinite(_b)) {
    // Convert to string in case of a=0 or b=0
    _a = String(_a)
    _b = String(_b)
    // Isn't a number so lowercase the string to properly compare
    if (_a.toLowerCase() < _b.toLowerCase()) return -1
    if (_a.toLowerCase() > _b.toLowerCase()) return 1
  } else {
    // Parse strings as numbers to compare properly
    if (parseFloat(_a) < parseFloat(_b)) return -1
    if (parseFloat(_a) > parseFloat(_b)) return 1
  }

  // equal each other
  return 0
}
