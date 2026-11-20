import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'

import { readGeoFile } from '@theseam/ui-common/utils'

import { GoogleMapsService } from '../google-maps.service'
import {
  MapValueManagerService,
  MapValueSource,
} from '../map-value-manager.service'

/**
 *
 */
@Component({
  selector: 'seam-map-file-drop',
  templateUrl: './map-file-drop.component.html',
  styleUrls: ['./map-file-drop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class TheSeamMapFileDropComponent implements OnInit, OnDestroy {
  private readonly _ngUnsubscribe = new Subject<void>()

  /**
   * Map element drag events added to.
   */
  private _mapDiv: HTMLDivElement | undefined

  private _listeners: (() => void)[] = []

  private _globalDragInProgress = false

  constructor(
    private readonly _elementRef: ElementRef,
    private readonly _ngZone: NgZone,
    private readonly _googleMaps: GoogleMapsService,
    private readonly _mapValueManager: MapValueManagerService,
    private readonly _renderer: Renderer2,
  ) {}

  /** @ignore */
  ngOnInit() {
    this._googleMaps.mapReady$
      .pipe(
        tap((ready) => {
          if (ready) {
            this._enableFileDrop()
          } else {
            this._disableFileDrop()
          }
        }),
        takeUntil(this._ngUnsubscribe),
      )
      .subscribe()
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
      this._listeners.push(
        this._renderer.listen('document', 'dragstart', (event: Event) => {
          this._globalDragInProgress = true
        }),
      )

      this._listeners.push(
        this._renderer.listen('document', 'dragend', (event: Event) => {
          this._globalDragInProgress = false
        }),
      )

      this._listeners.push(
        this._renderer.listen(
          divElement,
          'dragover',
          this._handleDragOverEvent,
        ),
      )
      this._listeners.push(
        this._renderer.listen(
          this._elementRef.nativeElement,
          'dragover',
          this._handleDragOverEvent,
        ),
      )
      this._listeners.push(
        this._renderer.listen(
          this._elementRef.nativeElement,
          'drop',
          this._handleDropEvent,
        ),
      )
      this._listeners.push(
        this._renderer.listen(
          divElement,
          'dragenter',
          this._handleDragEnterEvent,
        ),
      )
      this._listeners.push(
        this._renderer.listen(
          this._elementRef.nativeElement,
          'dragleave',
          this._handleDragLeaveEvent,
        ),
      )
    })
  }

  private _disableFileDrop(): void {
    if (this._listeners.length > 0) {
      this._listeners.forEach((l) => l())
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

    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  private readonly _handleDropEvent = (event: any) => {
    if (!this._dropAllowed()) {
      return
    }

    event.preventDefault()
    event.stopPropagation()
    this._renderer.setStyle(this._elementRef.nativeElement, 'display', 'none')

    if (!this._isSupportedDataTransferTypes(event.dataTransfer)) {
      // Not a file drag at all — selected text, a link, an image dragged out
      // of a page. Nobody asked for an import and there is no file to name,
      // so this stays silent rather than reporting a failure.
      return
    }

    const files: FileList = event.dataTransfer.files
    if (files.length !== 1) {
      if (files.length > 1) {
        // Refused before any handler is consulted, exactly as the upload
        // button's `_getFile` does: `fileImportHandler` takes a single file
        // and cannot be handed several, so the consumer never sees these and
        // this output is its only way to learn the drop was rejected. Same
        // message as the button, so a consumer matching on it needs one
        // string rather than two.
        this._ngZone.run(() =>
          this._googleMaps.notifyFileImportError(
            files[0],
            Error('Only one file can be imported at a time.'),
          ),
        )
      }
      return
    }

    const item = event.dataTransfer.items[0]
    const file = item.getAsFile()
    if (file === null) {
      return
    }

    // These listeners are registered outside Angular's zone, so re-enter it
    // before calling back into anything that expects change detection — the
    // consumer's handler may well render a message from here.
    this._ngZone.run(() => this._importDroppedFile(file))
  }

  /**
   * Routes a dropped file the same way the upload button routes a chosen one,
   * so `fileImportHandler` means "the consumer owns imported files" whichever
   * way the file arrived.
   */
  private _importDroppedFile(file: File): void {
    const fileImportHandler = this._googleMaps.getFileInputHandler()
    if (fileImportHandler) {
      // The consumer owns the file now, including reporting its failures.
      fileImportHandler(file)
      return
    }

    readGeoFile(file)
      .then((json) => {
        this._mapValueManager.setValue(json, MapValueSource.Input)
      })
      .catch((error) => {
        this._googleMaps.notifyFileImportError(file, error)
      })
  }

  private readonly _handleDragEnterEvent = (event: any) => {
    if (!this._dropAllowed()) {
      return
    }

    if (!this._isSupportedDataTransferTypes(event.dataTransfer)) {
      return
    }

    this._renderer.setStyle(this._elementRef.nativeElement, 'display', 'block')
  }

  private readonly _handleDragLeaveEvent = (event: any) => {
    if (!this._dropAllowed()) {
      return
    }

    this._renderer.setStyle(this._elementRef.nativeElement, 'display', 'none')
  }

  private _dropAllowed(): boolean {
    return !this._globalDragInProgress
  }

  private _isSupportedDataTransferTypes(dataTransfer: DataTransfer): boolean {
    return dataTransfer.types[0] === 'Files'
  }
}
