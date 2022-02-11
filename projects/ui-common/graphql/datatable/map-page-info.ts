import { TheSeamPageInfo } from '@theseam/ui-common/datatable'

export interface PageInfoMapperResult { skip: number, take: number }
export type PageInfoMapper = (pageInfo: TheSeamPageInfo) => PageInfoMapperResult

/**
 * Maps to a range that fetches the page before the current page, the current
 * page, and the page after the current page.
 */
export function mapPageInfo(pageInfo: TheSeamPageInfo): PageInfoMapperResult {
  const _skip = pageInfo.offset * pageInfo.pageSize

  const skipWithWindowOffset = _skip - pageInfo.pageSize
  const takeOffset = skipWithWindowOffset < 0 ? skipWithWindowOffset : 0

  return {
    skip: Math.max(skipWithWindowOffset, 0),
    take: Math.max((pageInfo.pageSize * 3) + takeOffset, 0)
  }
}
