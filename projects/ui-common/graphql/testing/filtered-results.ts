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
  const where: WhereArg = args?.where
  if (where !== undefined) {
    items = filterWhere(items, where)
  }

  const totalCount = items.length

  const skip = args?.skip ?? 0
  const take = args?.take ?? items.length
  if (args?.skip !== undefined || args?.take !== undefined) {
    items = skipAndTake(items, skip, take)
  }

  const pageInfo: FilteredResultsPageInfo = {
    hasNextPage: (skip + take) < totalCount,
    hasPreviousPage: skip > 0,
  }

  return {
    items,
    pageInfo,
    totalCount,
  }
}
