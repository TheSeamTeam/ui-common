export interface DataFilterSortItem {
  boardProp: string,
  dataProp: string,
  dir: DataFilterSortDirection
}

export type DataFilterSortDirection = 'asc' | 'desc' | null | undefined
