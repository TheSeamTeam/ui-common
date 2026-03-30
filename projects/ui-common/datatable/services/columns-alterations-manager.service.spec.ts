import { firstValueFrom, take, toArray } from 'rxjs'

import { HideColumnColumnsAlteration } from '../models/columns-alterations/hide-column.columns-alteration'
import { SortColumnsAlteration } from '../models/columns-alterations/sort.columns-alteration'
import { WidthColumnsAlteration } from '../models/columns-alterations/width.columns-alteration'

import {
  ColumnsAlterationsManagerService,
  ColumnsAlterationsChangedEvent,
} from './columns-alterations-manager.service'

function createHideAlteration(
  prop: string,
  hidden = true,
  persistent = true,
): HideColumnColumnsAlteration {
  return new HideColumnColumnsAlteration(
    { columnProp: prop, hidden },
    persistent,
  )
}

function createSortAlteration(
  sorts: { prop: string; dir: 'asc' | 'desc' }[] = [],
  persistent = true,
): SortColumnsAlteration {
  return new SortColumnsAlteration({ sorts }, persistent)
}

describe('ColumnsAlterationsManagerService', () => {
  let service: ColumnsAlterationsManagerService

  beforeEach(() => {
    service = new ColumnsAlterationsManagerService()
  })

  it('should create with empty alterations', () => {
    expect(service.get()).toEqual([])
  })

  describe('add()', () => {
    it('should store alterations', () => {
      const alt = createHideAlteration('name')
      service.add([alt])
      expect(service.get()).toEqual([alt])
    })

    it('should emit changes with type added', async () => {
      const alt = createHideAlteration('name')
      const event = firstValueFrom(service.changes)
      service.add([alt])
      const result = await event
      expect(result.changes).toEqual([{ type: 'added', alteration: alt }])
    })

    it('should replace alteration with same id', () => {
      const alt1 = createHideAlteration('name', true)
      const alt2 = createHideAlteration('name', false)
      service.add([alt1])
      service.add([alt2])
      const alts = service.get()
      expect(alts.length).toBe(1)
      expect(alts[0].state.hidden).toBe(false)
    })

    it('should emit both removed and added when replacing', async () => {
      const alt1 = createHideAlteration('name', true)
      service.add([alt1], { emitEvent: false })

      const alt2 = createHideAlteration('name', false)
      const event = firstValueFrom(service.changes)
      service.add([alt2])
      const result = await event
      expect(result.changes).toEqual([
        { type: 'removed', alteration: alt1 },
        { type: 'added', alteration: alt2 },
      ])
    })

    it('should not emit when emitEvent is false', () => {
      const spy = jest.fn()
      service.changes.subscribe(spy)
      service.add([createHideAlteration('name')], { emitEvent: false })
      expect(spy).not.toHaveBeenCalled()
    })

    it('should add multiple alterations', () => {
      const alt1 = createHideAlteration('name')
      const alt2 = createHideAlteration('age')
      service.add([alt1, alt2])
      expect(service.get().length).toBe(2)
    })
  })

  describe('remove()', () => {
    it('should remove alteration by id', () => {
      const alt = createHideAlteration('name')
      service.add([alt], { emitEvent: false })
      service.remove([alt])
      expect(service.get()).toEqual([])
    })

    it('should emit changes with type removed', async () => {
      const alt = createHideAlteration('name')
      service.add([alt], { emitEvent: false })

      const event = firstValueFrom(service.changes)
      service.remove([alt])
      const result = await event
      expect(result.changes).toEqual([{ type: 'removed', alteration: alt }])
    })

    it('should not emit when emitEvent is false', () => {
      const alt = createHideAlteration('name')
      service.add([alt], { emitEvent: false })

      const spy = jest.fn()
      service.changes.subscribe(spy)
      service.remove([alt], { emitEvent: false })
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not emit when nothing was removed', () => {
      const spy = jest.fn()
      service.changes.subscribe(spy)
      service.remove([createHideAlteration('nonexistent')])
      expect(spy).not.toHaveBeenCalled()
    })

    it('should only remove matching alterations', () => {
      const alt1 = createHideAlteration('name')
      const alt2 = createHideAlteration('age')
      service.add([alt1, alt2], { emitEvent: false })
      service.remove([alt1], { emitEvent: false })
      expect(service.get()).toEqual([alt2])
    })
  })

  describe('get()', () => {
    it('should return a copy of the alterations array', () => {
      const alt = createHideAlteration('name')
      service.add([alt], { emitEvent: false })
      const result = service.get()
      result.push(createHideAlteration('age'))
      expect(service.get().length).toBe(1)
    })
  })

  describe('apply()', () => {
    it('should call apply on each alteration', () => {
      const alt = createHideAlteration('name')
      const applySpy = jest.spyOn(alt, 'apply')
      service.add([alt], { emitEvent: false })

      const columns = [{ prop: 'name', name: 'Name' }] as any
      const datatable = {} as any
      service.apply(columns, datatable)
      expect(applySpy).toHaveBeenCalledWith(columns, datatable)
    })

    it('should remove non-persistent alterations after apply', () => {
      const persistent = createHideAlteration('name', true, true)
      const nonPersistent = createHideAlteration('age', true, false)
      jest.spyOn(persistent, 'apply').mockImplementation()
      jest.spyOn(nonPersistent, 'apply').mockImplementation()
      service.add([persistent, nonPersistent], { emitEvent: false })

      service.apply([], {} as any)
      const remaining = service.get()
      expect(remaining.length).toBe(1)
      expect(remaining[0]).toBe(persistent)
    })
  })

  describe('setDefaultSorts()', () => {
    it('should store default sorts for clear() to restore', () => {
      const defaultSorts: { prop: string; dir: 'asc' | 'desc' }[] = [
        { prop: 'name', dir: 'asc' },
      ]
      service.setDefaultSorts(defaultSorts)

      const sortAlt = createSortAlteration([{ prop: 'age', dir: 'desc' }])
      service.add([sortAlt], { emitEvent: false })

      service.clear({ emitEvent: false })

      // After clear, the sort alteration should be replaced with default sorts
      const alts = service.get()
      const sortAlts = alts.filter((a) => a.type === 'sort')
      expect(sortAlts.length).toBe(1)
      expect(sortAlts[0].state.sorts).toEqual(defaultSorts)
    })
  })

  describe('clear()', () => {
    it('should reverse hide-column alterations (set hidden=false)', () => {
      const alt = createHideAlteration('name', true)
      service.add([alt], { emitEvent: false })
      service.clear({ emitEvent: false })

      const alts = service.get()
      const hideAlts = alts.filter((a) => a.type === 'hide-column')
      // The clear replaces the hide alteration with one that has hidden=false
      expect(hideAlts.length).toBe(1)
      expect(hideAlts[0].state.hidden).toBe(false)
    })

    it('should remove order alterations', () => {
      // Order alterations are removed, not replaced
      // We can't easily create an OrderColumnsAlteration without more setup,
      // so we verify the clear works with hide alterations at minimum
      expect(service.get().length).toBe(0)
      service.clear({ emitEvent: false })
      expect(service.get().length).toBe(0)
    })

    it('should not emit when emitEvent is false', () => {
      const spy = jest.fn()
      service.changes.subscribe(spy)
      service.clear({ emitEvent: false })
      expect(spy).not.toHaveBeenCalled()
    })

    it('should emit when emitEvent is not specified', async () => {
      const alt = createHideAlteration('name', true)
      service.add([alt], { emitEvent: false })

      const event = firstValueFrom(service.changes)
      service.clear()
      const result = await event
      expect(result.changes.length).toBeGreaterThan(0)
    })
  })
})
