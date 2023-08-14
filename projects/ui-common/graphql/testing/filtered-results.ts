import { filterWhere, WhereArg } from './filter-where'
import { skipAndTake } from './skip-and-take'

export interface FilteredResultsPageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface FilteredResults<T> {
  items: T[]
  pageInfo: FilteredResultsPageInfo
  totalCount: number
}

export function filteredResults<T>(items: T[], args: any): FilteredResults<T> {
  let _items = items
  const where: WhereArg = args?.where
  if (where !== undefined) {
    _items = filterWhere(_items, where)
  }

  const totalCount = _items.length

  const skip = args?.skip ?? 0
  const take = args?.take ?? _items.length
  if (args?.skip !== undefined || args?.take !== undefined) {
    _items = skipAndTake(_items, skip, take)
  }

  const pageInfo: FilteredResultsPageInfo = {
    hasNextPage: (skip + take) < totalCount,
    hasPreviousPage: skip > 0,
  }

  return {
    items: _items,
    pageInfo,
    totalCount,
  }
}
