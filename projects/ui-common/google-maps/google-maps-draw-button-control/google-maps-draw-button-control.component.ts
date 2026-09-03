import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'

import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons'
import { SeamIcon, TheSeamIconModule } from '@theseam/ui-common/icon'

import { GoogleMapsService } from '../google-maps.service'
import { MAP_CONTROL_DATA } from '../map-controls-service'

export interface GoogleMapsDrawButtonControlData {
  label?: string | undefined | null
  icon?: SeamIcon | undefined | null
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'button[seam-google-maps-draw-button-control]',
  templateUrl: './google-maps-draw-button-control.component.html',
  styleUrls: ['./google-maps-draw-button-control.component.scss'],
  imports: [TheSeamIconModule],
  host: {
    '(click)': '_onClick()',
    '[attr.draggable]': 'false',
    '[attr.aria-label]': 'label',
    '[attr.title]': 'label',
    '[attr.aria-pressed]': '_active()',
    '[class.active]': '_active()',
    type: 'button',
    class: 'gmnoprint gm-control-active',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TheSeamGoogleMapsDrawButtonControlComponent {
  private readonly _googleMaps = inject(GoogleMapsService)
  private readonly _data = inject<GoogleMapsDrawButtonControlData>(
    MAP_CONTROL_DATA,
    { optional: true },
  )

  private readonly _mode = toSignal(this._googleMaps.interactionMode$, {
    initialValue: 'legacy' as const,
  })

  private readonly _drawing = toSignal(this._googleMaps.drawing$, {
    initialValue: false,
  })

  private readonly _editMode = toSignal(this._googleMaps.editMode$, {
    initialValue: false,
  })

  /**
   * In 'legacy' the button toggles drawing directly. In 'grouped' it toggles
   * edit mode, which is what makes a click on open map begin a drawing.
   */
  protected readonly _active = computed(() =>
    this._mode() === 'grouped' ? this._editMode() : this._drawing(),
  )

  protected readonly _label = computed(
    () =>
      this._data?.label ??
      (this._mode() === 'grouped' ? 'Edit Fields' : 'Draw Field'),
  )

  get label(): string {
    return this._label()
  }

  icon: SeamIcon = this._data?.icon ?? faDrawPolygon

  _onClick() {
    if (this._mode() === 'grouped') {
      this._googleMaps.setEditMode(!this._googleMaps.isEditMode())
      return
    }
    if (this._googleMaps.isDrawing()) {
      this._googleMaps.stopDrawing()
    } else {
      this._googleMaps.startDrawing()
    }
  }
}
