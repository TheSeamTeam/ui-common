import {
  ChangeDetectorRef,
  ElementRef,
  Injector,
  NgZone,
  runInInjectionContext,
} from '@angular/core'

import { TheSeamGoogleMapsPlacesAutoCompleteComponent } from '../google-maps-places-autocomplete/google-maps-places-autocomplete.component'
import { GoogleMapsService } from '../google-maps.service'
import { MAP_CONTROL_DATA } from '../map-controls-service'
import { TheSeamGoogleMapsPlacesSearchControlComponent } from './google-maps-places-search-control.component'

/** Runs callbacks straight through; the control only uses these two methods. */
const zone = {
  run: (fn: any) => fn(),
  runOutsideAngular: (fn: any) => fn(),
} as unknown as NgZone

/**
 * The control's collaborators are all reached through `inject()`, so it is
 * built in an injection context holding stand-ins for each. No TestBed: the
 * view children are set by hand, and the host element is put in the document
 * so the outside-click check has something to be outside of.
 */
function createControl(options: { data?: unknown; place?: any } = {}) {
  const host = document.createElement('div')
  const toggleButton = document.createElement('button')
  host.appendChild(toggleButton)
  document.body.appendChild(host)

  const googleMaps = { fitBounds: jest.fn() }
  const autocomplete = {
    focus: jest.fn(),
    getPlace: jest.fn().mockReturnValue(options.place ?? {}),
  }

  const providers: any[] = [
    { provide: GoogleMapsService, useValue: googleMaps },
    { provide: ElementRef, useValue: new ElementRef(host) },
    { provide: NgZone, useValue: zone },
    {
      provide: ChangeDetectorRef,
      useValue: { detectChanges: jest.fn(), markForCheck: jest.fn() },
    },
  ]
  if (options.data !== undefined) {
    providers.push({ provide: MAP_CONTROL_DATA, useValue: options.data })
  }
  const control = runInInjectionContext(
    Injector.create({ providers }),
    () => new TheSeamGoogleMapsPlacesSearchControlComponent(),
  )
  control._autocomplete =
    autocomplete as unknown as TheSeamGoogleMapsPlacesAutoCompleteComponent
  control._toggleButton = new ElementRef(toggleButton)

  return { control, host, toggleButton, googleMaps, autocomplete }
}

function keydown(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, bubbles: true })
}

describe('TheSeamGoogleMapsPlacesSearchControlComponent', () => {
  afterEach(() => document.body.replaceChildren())

  it('starts closed', () => {
    const { control } = createControl()
    expect(control.isOpen()).toBe(false)
  })

  it('opens on toggle and focuses the input', () => {
    const { control, autocomplete } = createControl()

    control.toggle()

    expect(control.isOpen()).toBe(true)
    expect(autocomplete.focus).toHaveBeenCalled()
  })

  it('closes on a second toggle and returns focus to the button', () => {
    const { control, toggleButton } = createControl()
    control.toggle()

    control.toggle()

    expect(control.isOpen()).toBe(false)
    expect(document.activeElement).toBe(toggleButton)
  })

  it('asks the autocomplete for only the viewport', () => {
    const { control } = createControl()
    expect(control._autocompleteOptions.fields).toEqual(['geometry.viewport'])
    expect(control._autocompleteOptions.componentRestrictions).toEqual({
      country: 'US',
    })
  })

  describe('choosing a place', () => {
    it('fits the map to its viewport and closes', () => {
      const viewport = { north: 2, south: 1, east: 2, west: 1 }
      const { control, googleMaps } = createControl({
        place: { geometry: { viewport } },
      })
      control.open()

      control._onPlaceChanged()

      expect(googleMaps.fitBounds).toHaveBeenCalledWith(viewport)
      expect(control.isOpen()).toBe(false)
    })

    it('does nothing for a place without a viewport', () => {
      const { control, googleMaps } = createControl({
        place: { name: 'typed text' },
      })
      control.open()

      control._onPlaceChanged()

      expect(googleMaps.fitBounds).not.toHaveBeenCalled()
      expect(control.isOpen()).toBe(true)
    })
  })

  describe('keys', () => {
    it('closes on Escape without letting it reach the map', () => {
      const { control, toggleButton } = createControl()
      control.open()
      const event = keydown('Escape')
      const stop = jest.spyOn(event, 'stopPropagation')

      control._onKeydown(event)

      expect(control.isOpen()).toBe(false)
      expect(stop).toHaveBeenCalled()
      expect(document.activeElement).toBe(toggleButton)
    })

    it('keeps Delete from reaching the map while open', () => {
      const { control } = createControl()
      control.open()
      const event = keydown('Delete')
      const stop = jest.spyOn(event, 'stopPropagation')

      control._onKeydown(event)

      expect(stop).toHaveBeenCalled()
      expect(control.isOpen()).toBe(true)
    })

    it('leaves keys alone while closed', () => {
      const { control } = createControl()
      const event = keydown('Escape')
      const stop = jest.spyOn(event, 'stopPropagation')

      control._onKeydown(event)

      expect(stop).not.toHaveBeenCalled()
    })
  })

  describe('pointer outside', () => {
    function pointerDownOn(target: Element): void {
      // jsdom has no PointerEvent; the listener only reads `target`.
      target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
    }

    it('closes on a pointer down elsewhere, leaving focus alone', () => {
      const { control, toggleButton } = createControl()
      control.open()
      const elsewhere = document.createElement('div')
      document.body.appendChild(elsewhere)

      pointerDownOn(elsewhere)

      expect(control.isOpen()).toBe(false)
      expect(document.activeElement).not.toBe(toggleButton)
    })

    it('stays open for a pointer down inside the control', () => {
      const { control, host } = createControl()
      control.open()
      const inside = document.createElement('span')
      host.appendChild(inside)

      pointerDownOn(inside)

      expect(control.isOpen()).toBe(true)
    })

    it("stays open for a pointer down in Google's suggestion list", () => {
      const { control } = createControl()
      control.open()
      const suggestions = document.createElement('div')
      suggestions.className = 'pac-container'
      const item = document.createElement('div')
      suggestions.appendChild(item)
      document.body.appendChild(suggestions)

      pointerDownOn(item)

      expect(control.isOpen()).toBe(true)
    })

    it('stops listening once closed', () => {
      const { control } = createControl()
      control.open()
      control.close(false)
      const close = jest.spyOn(control, 'close')

      pointerDownOn(document.body)

      expect(close).not.toHaveBeenCalled()
    })
  })

  it('uses the label, icon and placeholder from the control data', () => {
    const icon = { prefix: 'fas', iconName: 'x' } as any
    const { control } = createControl({
      data: { label: 'Find a farm', icon, placeholder: 'Farm address' },
    })

    expect(control.label).toBe('Find a farm')
    expect(control.icon).toBe(icon)
    expect(control.placeholder).toBe('Farm address')
  })
})
