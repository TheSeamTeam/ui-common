import { TheSeamPageInfo } from '@theseam/ui-common/datatable'

import { mapPageInfo } from './map-page-info'

describe('mapPageInfo', () => {

  describe('pageSize=10', () => {
    const pageSize = 10

    describe('count=0', () => {
      const count = 0

      it('should set skip to 0 when start of window is negative', () => {
        const pageInfo: TheSeamPageInfo = { offset: 0, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 0, take: 20 })
      })
    })

    describe('count=10', () => {
      const count = 10

      it('should set skip to 0 when start of window is negative', () => {
        const pageInfo: TheSeamPageInfo = { offset: 0, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 0, take: 20 })
      })
    })

    describe('count=20', () => {
      const count = 20

      it('should set skip to 0 when start of window is negative', () => {
        const pageInfo: TheSeamPageInfo = { offset: 0, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 0, take: 20 })
      })

      it('should set skip to 0 when on second page', () => {
        const pageInfo: TheSeamPageInfo = { offset: 1, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 0, take: 30 })
      })
    })

    describe('count=30', () => {
      const count = 30

      it('should set skip to 0 when start of window is negative', () => {
        const pageInfo: TheSeamPageInfo = { offset: 0, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 0, take: 20 })
      })

      it('should set skip to 0 when on second page', () => {
        const pageInfo: TheSeamPageInfo = { offset: 1, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 0, take: 30 })
      })

      it('should set skip to 10 when on third page', () => {
        const pageInfo: TheSeamPageInfo = { offset: 2, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 10, take: 30 })
      })
    })

    describe('count=40', () => {
      const count = 40

      it('should set skip to 0 when start of window is negative', () => {
        const pageInfo: TheSeamPageInfo = { offset: 0, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 0, take: 20 })
      })

      it('should set skip to 0 when on second page', () => {
        const pageInfo: TheSeamPageInfo = { offset: 1, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 0, take: 30 })
      })

      it('should set skip to 10 when on third page', () => {
        const pageInfo: TheSeamPageInfo = { offset: 2, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 10, take: 30 })
      })

      it('should set skip to 20 when on fourth page', () => {
        const pageInfo: TheSeamPageInfo = { offset: 3, pageSize, count }
        expect(mapPageInfo(pageInfo)).toEqual({ skip: 20, take: 30 })
      })
    })
  })
})
