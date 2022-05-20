import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { Subject } from 'rxjs'
import { takeUntil, tap } from 'rxjs/operators'

import { MapControlsService, MAP_CONTROLS_SERVICE } from '../map-controls-service'
import { MapManagerService } from '../map-manager.service'

/**
 *
 */
@Component({
  selector: 'seam-edit-controls-wrapper',
  template: `<ng-template><seam-edit-controls></seam-edit-controls></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamEditControlsWrapperComponent implements OnInit, OnDestroy {
  private readonly _ngUnsubscribe = new Subject()

  private _addedPolygonEditorElement?: HTMLElement

  @ViewChild(TemplateRef, { static: true }) templateRef!: TemplateRef<any>

  constructor(
    private readonly _mapManager: MapManagerService,
    @Inject(MAP_CONTROLS_SERVICE) private readonly _mapControls: MapControlsService,
  ) { }

  ngOnInit(): void {
    this._mapManager.mapReady$.pipe(
      tap(ready => ready ? this._addControls() : this._removeControls()),
      takeUntil(this._ngUnsubscribe)
    ).subscribe()
  }

  ngOnDestroy(): void {
    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }

  private _addControls(): void {
    const embeddedView = this.templateRef.createEmbeddedView({})
    const element = embeddedView.rootNodes[0]
    this._mapControls.addPolygonEditorControls(element)
    this._addedPolygonEditorElement = element
  }

  private _removeControls(): void {

  }

}
