import { ComponentFactoryResolver, ComponentRef, Injectable, Injector, StaticProvider } from '@angular/core'
import { Observable, Subject } from 'rxjs'

import { GoogleMapsService } from './google-maps.service'
import { MapControl, MapControlsService, MAP_CONTROL_DATA } from './map-controls-service'

export class MapControlRef {

  private readonly _destroyedSubject = new Subject<void>()

  private _componentRef: ComponentRef<any>
  private _addedAtPosition: google.maps.ControlPosition

  public destroyed: Observable<void>

  constructor(
    private readonly _googleMaps: GoogleMapsService,
    private readonly _componentFactoryResolver: ComponentFactoryResolver,
    private readonly _injector: Injector,
    private readonly _controlDef: MapControl
  ) {
    this.destroyed = this._destroyedSubject.asObservable()

    const component: any = this._controlDef.component
    const factory = this._componentFactoryResolver.resolveComponentFactory(component)

    const providers: StaticProvider[] = []
    if (this._controlDef.data) {
      providers.push({
        provide: MAP_CONTROL_DATA,
        useValue: this._controlDef.data
      })
    }
    const injector = Injector.create({
      providers,
      parent: this._injector,
    })

    this._componentRef = factory.create(injector)
    this._componentRef.changeDetectorRef.detectChanges()

    const position = this._controlDef.position ?? google.maps.ControlPosition.LEFT_BOTTOM

    this._googleMaps.addControl(
      this._componentRef.location.nativeElement,
      position
    )

    this._addedAtPosition = position
  }

  public destroy() {
    const googleMaps = this._googleMaps.googleMap
    if (googleMaps !== undefined) {
      let idx = -1
      googleMaps.controls[this._addedAtPosition].forEach((elem, index) => {
        if (elem === this._componentRef.location.nativeElement) {
          idx = index
        }
      })
      if (idx === -1) {
        throw Error(`Unable to destroy control. Control not found.`)
      }
      googleMaps.controls[this._addedAtPosition].removeAt(idx)
    }
    this._componentRef.destroy()

    this._destroyedSubject.next()
    this._destroyedSubject.complete()
  }

}

@Injectable()
export class GoogleMapsControlsService implements MapControlsService {

  constructor(
    private readonly _googleMaps: GoogleMapsService,
    private readonly _componentFactoryResolver: ComponentFactoryResolver,
    private readonly _injector: Injector,
  ) { }

  public add(control: MapControl): MapControlRef {
    return new MapControlRef(this._googleMaps, this._componentFactoryResolver, this._injector, control)
  }
}
