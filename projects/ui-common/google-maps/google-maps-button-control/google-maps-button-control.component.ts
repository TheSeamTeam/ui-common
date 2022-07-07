import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Renderer2,
} from '@angular/core'
import { Subject } from 'rxjs'

import { SeamIcon } from '@theseam/ui-common/icon'
import { MapValueManagerService, MapValueSource, MAP_CONTROL_DATA } from '@theseam/ui-common/map'
import { hasProperty, readGeoFile } from '@theseam/ui-common/utils'

export interface GoogleMapsButtonControlData {
  label?: string | undefined | null
  icon?: SeamIcon | undefined | null
}

/**
 *
 */
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'button[seam-google-maps-button-control]',
  templateUrl: './google-maps-button-control.component.html',
  styleUrls: ['./google-maps-button-control.component.scss'],
  host: {
    '[attr.draggable]': 'false',
    '[attr.aria]-label': 'label',
    '[attr.title]': 'label',
    '[attr.type]': 'button',
    'class': 'gmnoprint gm-control-active'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamGoogleMapsButtonControlComponent implements OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()

  private readonly _fileInputElement: HTMLInputElement

  private _listeners: (() => void)[]  = []

  @Input() label: string | undefined | null

  @Input() icon: SeamIcon | undefined | null

  @HostListener('click', [ 'event' ])
  _onClick(event: MouseEvent) {
    this._fileInputElement.click()
  }

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly _mapValueManager: MapValueManagerService,
    private readonly _renderer: Renderer2,
    @Optional() @Inject(MAP_CONTROL_DATA) _data?: GoogleMapsButtonControlData
  ) {
    if (_data) {
      if (_data.hasOwnProperty('label')) {
        this.label = _data.label
      }
      if (_data.hasOwnProperty('icon')) {
        this.icon = _data.icon
      }
    }

    this._fileInputElement = this._createHiddenInput()
    this._renderer.appendChild(this._elementRef.nativeElement, this._fileInputElement)
  }

  /** @ignore */
  ngOnDestroy() {
    this._listeners.forEach(l => l())

    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _getFile(throwIfInvalidFiles: boolean = true): File | null {
    const files = this._fileInputElement.files
    if (files === null || files.length === 0) {
      return null
    }

    if (throwIfInvalidFiles) {
      if (files.length > 1) {
        throw Error(`Only one file can be imported at a time.`)
      }
    }

    return files[0]
  }

  private async _importFile(file: File): Promise<void> {
    const json = await readGeoFile(file)
    this._mapValueManager.setValue(json, MapValueSource.Input)
    this._resetInput()
  }

  private _createHiddenInput(): HTMLInputElement {
    const fileInputElement = this._renderer.createElement('input')
    this._renderer.setAttribute(fileInputElement, 'type', 'file')
    this._renderer.setAttribute(fileInputElement, 'hidden', '')
    this._renderer.setAttribute(fileInputElement, 'accept', '.json,.geojson,.shp,.zip')

    this._listeners.push(this._renderer.listen(fileInputElement, 'change', (event: Event) => {
      const file = this._getFile()
      if (file === null) { return }
      this._importFile(file)
    }))

    return fileInputElement
  }

  private _createTemporaryFormElement(): HTMLFormElement {
    return this._renderer.createElement('form')
  }

  /**
   * Reset input element, so that the same file can be added again.
   */
   private _resetInput(): void {
    const formElement = this._createTemporaryFormElement()
    this._renderer.appendChild(formElement, this._fileInputElement)
    formElement.reset()
    this._renderer.appendChild(this._elementRef.nativeElement, this._fileInputElement)
  }
}
