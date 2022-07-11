import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Inject,
  Input,
  OnDestroy,
  Optional,
} from '@angular/core'
import { Subject } from 'rxjs'

import { SeamIcon } from '@theseam/ui-common/icon'

import { GoogleMapsService } from '../google-maps.service'
import { MAP_CONTROL_DATA } from '../map-controls-service'

export interface GoogleMapsRecenterButtonControlData {
  label?: string | undefined | null
  icon?: SeamIcon | undefined | null
}

/**
 *
 */
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'button[seam-google-maps-recenter-button-control]',
  templateUrl: './google-maps-recenter-button-control.component.html',
  styleUrls: ['./google-maps-recenter-button-control.component.scss'],
  host: {
    '[attr.draggable]': 'false',
    '[attr.aria]-label': 'label',
    '[attr.title]': 'label',
    '[attr.type]': 'button',
    'class': 'gmnoprint gm-control-active'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheSeamGoogleMapsRecenterButtonControlComponent implements OnDestroy {

  private readonly _ngUnsubscribe = new Subject<void>()

  private _listeners: (() => void)[]  = []

  @Input() label: string | undefined | null

  @Input() icon: SeamIcon | undefined | null

  @HostListener('click', [ 'event' ])
  _onClick(event: MouseEvent) {
    this._googleMaps.reCenterOnFeatures()
  }

  constructor(
    private readonly _googleMaps: GoogleMapsService,
    @Optional() @Inject(MAP_CONTROL_DATA) _data?: GoogleMapsRecenterButtonControlData
  ) {
    if (_data) {
      if (_data.hasOwnProperty('label')) {
        this.label = _data.label
      }
      if (_data.hasOwnProperty('icon')) {
        this.icon = _data.icon
      }
    }
  }

  /** @ignore */
  ngOnDestroy() {
    this._listeners.forEach(l => l())

    this._ngUnsubscribe.next()
    this._ngUnsubscribe.complete()
  }
}
