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
import { readGeoFile } from '@theseam/ui-common/utils'

import { GoogleMapsService } from '../google-maps.service'
import { MAP_CONTROL_DATA } from '../map-controls-service'
import {
  MapValueManagerService,
  MapValueSource,
} from '../map-value-manager.service'

export interface GoogleMapsUploadButtonControlData {
  label?: string | undefined | null
  icon?: SeamIcon | undefined | null
}

/**
 *
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[seam-google-maps-upload-button-control]',
  templateUrl: './google-maps-upload-button-control.component.html',
  styleUrls: ['./google-maps-upload-button-control.component.scss'],
  host: {
    '[attr.draggable]': 'false',
    '[attr.aria-label]': 'label',
    '[attr.title]': 'label',
    type: 'button',
    class: 'gmnoprint gm-control-active',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TheSeamGoogleMapsUploadButtonControlComponent
  implements OnDestroy
{
  private readonly _ngUnsubscribe = new Subject<void>()

  private readonly _fileInputElement: HTMLInputElement

  private _listeners: (() => void)[] = []

  @Input() label: string | undefined | null

  @Input() icon: SeamIcon | undefined | null

  @HostListener('click', ['event'])
  _onClick(event: MouseEvent) {
    this._fileInputElement.click()
  }

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly _mapValueManager: MapValueManagerService,
    private readonly _renderer: Renderer2,
    private readonly _googleMaps: GoogleMapsService,
    @Optional()
    @Inject(MAP_CONTROL_DATA)
    _data?: GoogleMapsUploadButtonControlData,
  ) {
    if (_data) {
      if (Object.prototype.hasOwnProperty.call(_data, 'label')) {
        this.label = _data.label
      }
      if (Object.prototype.hasOwnProperty.call(_data, 'icon')) {
        this.icon = _data.icon
      }
    }

    this._fileInputElement = this._createHiddenInput()
    this._renderer.appendChild(
      this._elementRef.nativeElement,
      this._fileInputElement,
    )
  }

  /** @ignore */
  ngOnDestroy() {
    this._listeners.forEach((l) => l())

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
  }

  private _reportImportError(file: File | undefined, error: unknown): void {
    if (file === undefined) {
      return
    }
    this._googleMaps.notifyFileImportError(file, error)
  }

  private _createHiddenInput(): HTMLInputElement {
    const fileInputElement = this._renderer.createElement('input')
    this._renderer.setAttribute(fileInputElement, 'type', 'file')
    this._renderer.setAttribute(fileInputElement, 'hidden', '')
    this._renderer.setAttribute(
      fileInputElement,
      'accept',
      '.json,.geojson,.shp,.zip',
    )

    this._listeners.push(
      this._renderer.listen(fileInputElement, 'change', (event: Event) => {
        let file: File | null
        try {
          file = this._getFile()
        } catch (err) {
          // `_getFile` refuses a multi-file selection. Report it like any
          // other reason the chosen files could not be imported. `_getFile`
          // has already read `files` by this point, so resetting now cannot
          // disturb the read.
          this._reportImportError(this._fileInputElement.files?.[0], err)
          this._resetInput()
          return
        }

        if (file === null) {
          return
        }

        const fileImportHandler = this._googleMaps.getFileInputHandler()
        if (fileImportHandler) {
          // The consumer owns the file now, including reporting its failures.
          fileImportHandler(file)
          this._resetInput()
        } else {
          this._importFile(file)
            .catch((err) => this._reportImportError(file, err))
            .finally(() => this._resetInput())
        }
      }),
    )

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
    this._renderer.appendChild(
      this._elementRef.nativeElement,
      this._fileInputElement,
    )
  }
}
