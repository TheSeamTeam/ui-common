export interface TheSeamPageInfo {
  /**
   * Index of page.
   */
  offset: number
  /**
   * Size of a page.
   */
  pageSize: number
  /**
   * Max page size.
   */
  limit?: number
  /**
   * Number of rows.
   */
  count: number
}
