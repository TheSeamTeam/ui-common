import { ElementRef, Renderer2 } from '@angular/core'

jest.mock('@theseam/ui-common/utils', () => ({
  ...jest.requireActual('@theseam/ui-common/utils'),
  readGeoFile: jest.fn(),
}))

import { readGeoFile } from '@theseam/ui-common/utils'

import { GoogleMapsService } from '../google-maps.service'
import { MapValueManagerService } from '../map-value-manager.service'
import { TheSeamGoogleMapsUploadButtonControlComponent } from './google-maps-upload-button-control.component'

const mockReadGeoFile = readGeoFile as jest.Mock

/** Captures listeners so the spec can fire the input's `change` itself. */
function createRenderer(input: HTMLInputElement): {
  renderer: Renderer2
  listeners: Map<string, (event: any) => void>
} {
  const listeners = new Map<string, (event: any) => void>()
  const renderer = {
    createElement: (name: string) =>
      name === 'input' ? input : document.createElement(name),
    setAttribute: () => undefined,
    appendChild: () => undefined,
    listen: (_target: any, event: string, handler: (event: any) => void) => {
      listeners.set(event, handler)
      return () => listeners.delete(event)
    },
  } as unknown as Renderer2
  return { renderer, listeners }
}

function createComponent(file: File | null) {
  const input = document.createElement('input')
  // `configurable` so the multi-file test below can redefine it.
  Object.defineProperty(input, 'files', {
    value: file === null ? [] : [file],
    configurable: true,
  })

  const { renderer, listeners } = createRenderer(input)
  const googleMaps = {
    getFileInputHandler: jest.fn().mockReturnValue(undefined),
    notifyFileImportError: jest.fn(),
  } as unknown as GoogleMapsService
  const mapValueManager = {
    setValue: jest.fn(),
  } as unknown as MapValueManagerService

  const component = new TheSeamGoogleMapsUploadButtonControlComponent(
    new ElementRef(document.createElement('button')),
    mapValueManager,
    renderer,
    googleMaps,
  )

  return { component, listeners, googleMaps, mapValueManager }
}

/** Lets the component's floating import promise settle. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

describe('TheSeamGoogleMapsUploadButtonControlComponent', () => {
  beforeEach(() => {
    mockReadGeoFile.mockReset()
  })

  it('should report a file it cannot read', async () => {
    const file = new File(['nope'], 'boundaries.zip')
    const error = new Error('Shape data not found.')
    mockReadGeoFile.mockRejectedValue(error)

    const { listeners, googleMaps, mapValueManager } = createComponent(file)
    listeners.get('change')?.(new Event('change'))
    await flush()

    expect(googleMaps.notifyFileImportError).toHaveBeenCalledWith(file, error)
    expect(mapValueManager.setValue).not.toHaveBeenCalled()
  })

  it('should set the map value for a file it can read', async () => {
    const file = new File(['{}'], 'boundaries.zip')
    const json = { type: 'FeatureCollection', features: [] }
    mockReadGeoFile.mockResolvedValue(json)

    const { listeners, googleMaps, mapValueManager } = createComponent(file)
    listeners.get('change')?.(new Event('change'))
    await flush()

    expect(mapValueManager.setValue).toHaveBeenCalledWith(json, 'input')
    expect(googleMaps.notifyFileImportError).not.toHaveBeenCalled()
  })

  it('should report the too-many-files refusal rather than throwing at the listener', async () => {
    const { component, listeners, googleMaps } = createComponent(null)
    const input = (component as any)._fileInputElement as HTMLInputElement
    Object.defineProperty(input, 'files', {
      value: [new File(['a'], 'a.zip'), new File(['b'], 'b.zip')],
      configurable: true,
    })

    expect(() => listeners.get('change')?.(new Event('change'))).not.toThrow()
    await flush()

    expect(googleMaps.notifyFileImportError).toHaveBeenCalled()
  })
})
