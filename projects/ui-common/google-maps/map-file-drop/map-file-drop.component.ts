import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewContainerRef
} from '@angular/core'

import { Subject } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'

import { MapManagerService, MapValue, MapValueManagerService, MapValueSource, MAP_CONTROLS_SERVICE } from '@theseam/ui-common/map'
import { readGeoFile } from '@theseam/ui-common/utils'

import { GoogleMapsControlsService } from '../google-maps-controls.service'
import { GoogleMapsService } from '../google-maps.service'

/**
 *
 */
@Component({
  selector: 'seam-map-file-drop',
  templateUrl: './map-file-drop.component.html',
  styleUrls: ['./map-file-drop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamMapFileDropComponent implements OnInit, OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()

  /**
   * Map element drag events added to.
   */
  private _mapDiv: HTMLDivElement | undefined

  private _listeners: (() => void)[]  = []

  private _globalDragInProgress: boolean = false

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly _changeDetectorRef: ChangeDetectorRef,
    private readonly _ngZone: NgZone,
    private readonly _googleMaps: GoogleMapsService,
    @Inject(MAP_CONTROLS_SERVICE) private readonly _googleMapsControls: GoogleMapsControlsService,
    private readonly _mapManager: MapManagerService,
    private readonly _mapValueManager: MapValueManagerService,
    private readonly _vcr: ViewContainerRef,
    private readonly _renderer: Renderer2
  ) { }

  /** @ignore */
  ngOnInit() {
    this._mapManager.mapReady$.pipe(
      tap(ready => {
        if (ready) {
          this._enableFileDrop()
        } else {
          this._disableFileDrop()
        }
      }),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()
  }

  /** @ignore */
  ngOnDestroy() {
    this._disableFileDrop()

    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _enableFileDrop(): void {
    const divElement = this._googleMaps.getDiv()
    if (this._mapDiv === divElement) {
      return
    }

    if (this._mapDiv !== undefined) {
      // Disable file drop on previous map div.
      this._disableFileDrop()
    }

    this._mapDiv = divElement
    this._ngZone.runOutsideAngular(() => {
      this._listeners.push(this._renderer.listen('document', 'dragstart', (event: Event) => {
        this._globalDragInProgress = true
      }))

      this._listeners.push(this._renderer.listen('document', 'dragend', (event: Event) => {
        this._globalDragInProgress = false
      }))

      this._listeners.push(this._renderer.listen(divElement, 'dragover', this._handleDragOverEvent))
      this._listeners.push(this._renderer.listen(this._elementRef.nativeElement, 'dragover', this._handleDragOverEvent))
      this._listeners.push(this._renderer.listen(this._elementRef.nativeElement, 'drop', this._handleDropEvent))
      this._listeners.push(this._renderer.listen(divElement, 'dragenter', this._handleDragEnterEvent))
      this._listeners.push(this._renderer.listen(this._elementRef.nativeElement, 'dragleave', this._handleDragLeaveEvent))
    })
  }

  private _disableFileDrop(): void {
    if (this._listeners.length > 0) {
      this._listeners.forEach(l => l())
      this._listeners = []
    }
  }

  private readonly _handleDragOverEvent = (event: any) => {
    if (!this._dropAllowed()) {
      return
    }

    if (!this._isSupportedDataTransferTypes(event.dataTransfer)) {
      return
    }

    // console.log('dragover', event)
    // console.log(event.dataTransfer.files.length)
    // console.log(event.dataTransfer.types)
    console.log(this._isSupportedDataTransferTypes(event.dataTransfer))


    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'

  }

  private readonly _handleDropEvent = (event: any) => {
    if (!this._dropAllowed()) {
      return
    }

    console.log('drop', event)

    event.preventDefault()
    event.stopPropagation()
    this._renderer.setStyle(this._elementRef.nativeElement, 'display', 'none')

    // TODO: Show error if multiple files?
    // if (!this._isSupportedDataTransfer(event.dataTransfer)) {
    //   return
    // }
    console.log(event.dataTransfer.files.length)
    console.log(event.dataTransfer.items.length)
    console.log(event.dataTransfer.files)
    for (const item of event.dataTransfer.items) {
      console.log('item', item)
      const file = item.getAsFile()
      console.log('file', file)

      readGeoFile(file).then(json => {
        console.log('json', json)
      })
    }
  }

  private readonly _handleDragEnterEvent = (event: any) => {
    if (!this._dropAllowed()) {
      return
    }

    if (!this._isSupportedDataTransferTypes(event.dataTransfer)) {
      return
    }

    // console.log('dragenter', event)
    this._renderer.setStyle(this._elementRef.nativeElement, 'display', 'block')
  }

  private readonly _handleDragLeaveEvent = (event: any) => {
    if (!this._dropAllowed()) {
      return
    }
    // console.log('dragleave', event)
    this._renderer.setStyle(this._elementRef.nativeElement, 'display', 'none')
  }

  private _dropAllowed(): boolean {
    return !this._globalDragInProgress
  }

  private _isSupportedDataTransfer(dataTransfer: DataTransfer): boolean {
    return dataTransfer.files.length === 1 && dataTransfer.types[0] === 'Files'
  }

  private _isSupportedDataTransferTypes(dataTransfer: DataTransfer): boolean {
    return dataTransfer.types[0] === 'Files'
  }

}
