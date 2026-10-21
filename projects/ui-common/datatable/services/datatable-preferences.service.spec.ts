import { TestBed, fakeAsync, tick } from '@angular/core/testing'
import { firstValueFrom, take } from 'rxjs'

import {
  provideMockPrefsApiService,
  MockPrefsApiActions,
} from '../testing/fixtures/mock-prefs-api'
import {
  EMPTY_DATATABLE_PREFERENCES,
  TheSeamDatatablePreferences,
} from '../models/preferences'

import { DatatablePreferencesService } from './datatable-preferences.service'

describe('DatatablePreferencesService', () => {
  describe('without accessor', () => {
    let service: DatatablePreferencesService

    beforeEach(() => {
      TestBed.configureTestingModule({
        teardown: { destroyAfterEach: false },
      })
      service = TestBed.inject(DatatablePreferencesService)
    })

    it('should be created', () => {
      expect(service).toBeTruthy()
    })

    it('preferences() should return empty preferences when no accessor provided', async () => {
      const prefs = await firstValueFrom(service.preferences('test-key'))
      expect(prefs).toEqual(EMPTY_DATATABLE_PREFERENCES)
    })

    it('setAlterations() should do nothing when no accessor provided', () => {
      // Should not throw
      service.setAlterations('test-key', [])
    })
  })

  describe('with mock accessor', () => {
    let service: DatatablePreferencesService
    let actions: MockPrefsApiActions

    beforeEach(() => {
      actions = {
        get: jest.fn(),
        update: jest.fn(),
      }

      TestBed.resetTestingModule()
      TestBed.configureTestingModule({
        providers: [
          ...provideMockPrefsApiService({ get: 0, update: 0 }, {}, actions),
        ],
        teardown: { destroyAfterEach: false },
      })
      service = TestBed.inject(DatatablePreferencesService)
    })

    it('should be created', () => {
      expect(service).toBeTruthy()
    })

    it('preferences() should fetch from accessor', fakeAsync(() => {
      let prefs: TheSeamDatatablePreferences | undefined
      service
        .preferences('test-key')
        .pipe(take(1))
        .subscribe((p) => {
          prefs = p
        })
      tick()
      // Returns empty prefs since mock has no stored data (defaults to '{}')
      // But '{}' has no version field, which should throw
      // Actually, empty mock returns '{}' which parses to {} with no version
      // The service checks version === 2, so this will throw
      // Let's just verify the accessor.get was called
      expect(actions.get).toHaveBeenCalledWith('test-key')
    }))

    it('preferences() should return valid v2 preferences', fakeAsync(() => {
      const validPrefs: TheSeamDatatablePreferences = {
        version: 2,
        alterations: [
          {
            id: 'sort',
            type: 'sort',
            state: { sorts: [{ prop: 'name', dir: 'asc' }] },
          },
        ],
      }

      TestBed.resetTestingModule()
      TestBed.configureTestingModule({
        providers: [
          ...provideMockPrefsApiService(
            { get: 0, update: 0 },
            { 'test-key': JSON.stringify(validPrefs) },
          ),
        ],
        teardown: { destroyAfterEach: false },
      })
      service = TestBed.inject(DatatablePreferencesService)

      let prefs: TheSeamDatatablePreferences | undefined
      service
        .preferences('test-key')
        .pipe(take(1))
        .subscribe((p) => {
          prefs = p
        })
      tick()
      expect(prefs).toEqual(validPrefs)
    }))

    it('setAlterations() should call accessor.update', fakeAsync(() => {
      // Need valid prefs to be loaded first
      TestBed.resetTestingModule()
      TestBed.configureTestingModule({
        providers: [
          ...provideMockPrefsApiService(
            { get: 0, update: 0 },
            { 'test-key': JSON.stringify(EMPTY_DATATABLE_PREFERENCES) },
            actions,
          ),
        ],
        teardown: { destroyAfterEach: false },
      })
      service = TestBed.inject(DatatablePreferencesService)

      const alterations = [
        {
          id: 'hide--name',
          type: 'hide-column',
          state: { columnProp: 'name', hidden: true },
        },
      ]
      service.setAlterations('test-key', alterations)
      tick()
      expect(actions.update).toHaveBeenCalledWith(
        'test-key',
        expect.stringContaining('"version":2'),
      )
    }))

    describe('writes keep the other preferences', () => {
      const hideNameAlteration = {
        id: 'hide--name',
        type: 'hide-column',
        state: { columnProp: 'name', hidden: true },
      }

      const setup = (stored: TheSeamDatatablePreferences) => {
        TestBed.resetTestingModule()
        TestBed.configureTestingModule({
          providers: [
            ...provideMockPrefsApiService(
              { get: 0, update: 0 },
              { 'test-key': JSON.stringify(stored) },
              actions,
            ),
          ],
          teardown: { destroyAfterEach: false },
        })
        service = TestBed.inject(DatatablePreferencesService)
      }

      const lastSaved = (): TheSeamDatatablePreferences =>
        JSON.parse(actions.update.mock.calls.at(-1)[1])

      it('setDisplay() should keep stored alterations', fakeAsync(() => {
        setup({ version: 2, alterations: [hideNameAlteration] })

        service.setDisplay('test-key', { headerHeight: 'auto' })
        tick()

        expect(lastSaved()).toEqual({
          version: 2,
          alterations: [hideNameAlteration],
          display: { headerHeight: 'auto' },
        })
      }))

      it('setAlterations() should keep stored display', fakeAsync(() => {
        setup({
          version: 2,
          alterations: [],
          display: { headerHeight: 'auto' },
        })

        service.setAlterations('test-key', [hideNameAlteration])
        tick()

        expect(lastSaved()).toEqual({
          version: 2,
          alterations: [hideNameAlteration],
          display: { headerHeight: 'auto' },
        })
      }))

      it('should not lose a write made while another is in flight', fakeAsync(() => {
        setup({ version: 2, alterations: [] })

        service.setDisplay('test-key', { headerHeight: 'auto' })
        service.setAlterations('test-key', [hideNameAlteration])
        tick()

        expect(lastSaved()).toEqual({
          version: 2,
          alterations: [hideNameAlteration],
          display: { headerHeight: 'auto' },
        })
      }))

      it('setDisplay() should drop a cleared value', fakeAsync(() => {
        setup({
          version: 2,
          alterations: [],
          display: { headerHeight: 'auto' },
        })

        service.setDisplay('test-key', { headerHeight: undefined })
        tick()

        expect(lastSaved()).toEqual({
          version: 2,
          alterations: [],
          display: {},
        })
      }))
    })

    it('isPending() should return false initially', () => {
      expect(service.isPending('test-key')).toBe(false)
    })

    it('isLoaded() should return false when not yet loaded', () => {
      // Before any preferences are fetched, isLoaded should be false
      expect(service.isLoaded('test-key')).toBe(false)
    })
  })
})
