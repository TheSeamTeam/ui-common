import { ElementRef, NgZone, Renderer2 } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

jest.mock('@theseam/ui-common/utils', () => ({
  ...jest.requireActual('@theseam/ui-common/utils'),
  readGeoFile: jest.fn(),
}))

import { readGeoFile } from '@theseam/ui-common/utils'

import { GoogleMapsService } from '../google-maps.service'
import { MapValueManagerService } from '../map-value-manager.service'
import { TheSeamMapFileDropComponent } from './map-file-drop.component'

const mockReadGeoFile = readGeoFile as jest.Mock

/** Runs callbacks straight through; the component only uses these two. */
const zone = {
  run: (fn: any) => fn(),
  runOutsideAngular: (fn: any) => fn(),
} as unknown as NgZone

/** A drop carrying exactly one file, which is all the component accepts. */
function dropEventFor(file: File): any {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    dataTransfer: {
      files: { length: 1 },
      types: ['Files'],
      items: [{ getAsFile: () => file }],
    },
  }
}

/** A drop carrying several files, which the component refuses outright. */
function multiFileDropEventFor(files: File[]): any {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    dataTransfer: {
      files,
      types: ['Files'],
      items: files.map((file) => ({ getAsFile: () => file })),
    },
  }
}

/** A drag of something that is not files at all, such as selected text. */
function nonFileDropEvent(): any {
  return {
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    dataTransfer: {
      files: [],
      types: ['text/plain'],
      items: [],
    },
  }
}

function createComponent(handler?: (file: File) => void) {
  const host = document.createElement('div')
  const mapDiv = document.createElement('div')

  /** Records listeners by the element they were attached to plus the event. */
  const listeners = new Map<string, (event: any) => void>()
  const renderer = {
    listen: (target: any, event: string, fn: (event: any) => void) => {
      listeners.set(target === host ? `host:${event}` : `map:${event}`, fn)
      return () => undefined
    },
    setStyle: () => undefined,
  } as unknown as Renderer2

  const googleMaps = {
    mapReady$: new BehaviorSubject(true),
    getDiv: () => mapDiv,
    getFileInputHandler: () => handler,
    notifyFileImportError: jest.fn(),
  } as unknown as GoogleMapsService
  const mapValueManager = {
    setValue: jest.fn(),
  } as unknown as MapValueManagerService

  const component = new TheSeamMapFileDropComponent(
    new ElementRef(host),
    zone,
    googleMaps,
    mapValueManager,
    renderer,
  )
  component.ngOnInit()

  return { component, listeners, googleMaps, mapValueManager }
}

/** Lets the component's import promise settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('TheSeamMapFileDropComponent', () => {
  beforeEach(() => {
    mockReadGeoFile.mockReset()
  })

  it('should hand a dropped file to the consumer handler when one is set', async () => {
    const handler = jest.fn()
    const file = new File(['{}'], 'boundaries.zip')
    const { listeners, mapValueManager } = createComponent(handler)

    listeners.get('host:drop')?.(dropEventFor(file))
    await flush()

    expect(handler).toHaveBeenCalledWith(file)
    expect(mockReadGeoFile).not.toHaveBeenCalled()
    expect(mapValueManager.setValue).not.toHaveBeenCalled()
  })

  it('should parse and set the value when no handler is set', async () => {
    const json = { type: 'FeatureCollection', features: [] }
    mockReadGeoFile.mockResolvedValue(json)
    const file = new File(['{}'], 'boundaries.zip')
    const { listeners, mapValueManager } = createComponent(undefined)

    listeners.get('host:drop')?.(dropEventFor(file))
    await flush()

    expect(mockReadGeoFile).toHaveBeenCalledWith(file)
    expect(mapValueManager.setValue).toHaveBeenCalledWith(json, 'input')
  })

  it('should report a dropped file it cannot read', async () => {
    const error = new Error('Shape data not found.')
    mockReadGeoFile.mockRejectedValue(error)
    const file = new File(['nope'], 'boundaries.zip')
    const { listeners, googleMaps, mapValueManager } =
      createComponent(undefined)

    listeners.get('host:drop')?.(dropEventFor(file))
    await flush()

    expect(googleMaps.notifyFileImportError).toHaveBeenCalledWith(file, error)
    expect(mapValueManager.setValue).not.toHaveBeenCalled()
  })

  it('should not report anything once the consumer owns the file', async () => {
    const handler = jest.fn(() => {
      throw new Error('consumer blew up')
    })
    const file = new File(['{}'], 'boundaries.zip')
    const { listeners, googleMaps } = createComponent(handler)

    expect(() => listeners.get('host:drop')?.(dropEventFor(file))).toThrow(
      'consumer blew up',
    )
    await flush()

    expect(googleMaps.notifyFileImportError).not.toHaveBeenCalled()
  })
  it('should report a multi-file drop the way the upload button does', () => {
    const first = new File(['{}'], 'north.zip')
    const second = new File(['{}'], 'south.zip')
    const { listeners, googleMaps, mapValueManager } =
      createComponent(undefined)

    listeners.get('host:drop')?.(multiFileDropEventFor([first, second]))

    expect(googleMaps.notifyFileImportError).toHaveBeenCalledWith(
      first,
      expect.objectContaining({
        message: 'Only one file can be imported at a time.',
      }),
    )
    expect(mockReadGeoFile).not.toHaveBeenCalled()
    expect(mapValueManager.setValue).not.toHaveBeenCalled()
  })

  it('should report a multi-file drop even when a handler is set', () => {
    const handler = jest.fn()
    const first = new File(['{}'], 'north.zip')
    const second = new File(['{}'], 'south.zip')
    const { listeners, googleMaps } = createComponent(handler)

    listeners.get('host:drop')?.(multiFileDropEventFor([first, second]))

    expect(handler).not.toHaveBeenCalled()
    expect(googleMaps.notifyFileImportError).toHaveBeenCalledWith(
      first,
      expect.objectContaining({
        message: 'Only one file can be imported at a time.',
      }),
    )
  })

  it('should stay silent when the drag is not files at all', () => {
    const { listeners, googleMaps } = createComponent(undefined)

    listeners.get('host:drop')?.(nonFileDropEvent())

    expect(googleMaps.notifyFileImportError).not.toHaveBeenCalled()
    expect(mockReadGeoFile).not.toHaveBeenCalled()
  })
})
