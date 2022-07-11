import { ComponentFactoryResolver, Injectable, Injector, StaticProvider } from '@angular/core'

import { MapControl, MapControlsService, MAP_CONTROL_DATA } from '@theseam/ui-common/map'
// import { TheSeamGoogleMapsButtonControlComponent } from './google-maps-button-control/google-maps-button-control.component'

import { GoogleMapsService } from './google-maps.service'

@Injectable()
export class GoogleMapsControlsService implements MapControlsService {

  constructor(
    private readonly _googleMaps: GoogleMapsService,
    private readonly _componentFactoryResolver: ComponentFactoryResolver,
    private readonly _injector: Injector,
  ) { }

  public addPolygonEditorControls(element: HTMLElement): void {
    this._googleMaps.addPolygonEditorControls(element)
  }

  public removePolygonEditorControls(): void {
    throw Error(`Not implemented.`)
  }

  public add(control: MapControl): void {
    const component: any = control.component
    const factory = this._componentFactoryResolver.resolveComponentFactory(component)

    const providers: StaticProvider[] = []
    if (control.data) {
      providers.push({
        provide: MAP_CONTROL_DATA,
        useValue: control.data
      })
    }
    const injector = Injector.create({
      providers,
      parent: this._injector,
    })

    const componentRef = factory.create(injector)
    componentRef.changeDetectorRef.detectChanges()

    this._googleMaps.addControl(
      componentRef.location.nativeElement,
      control.position ?? google.maps.ControlPosition.LEFT_BOTTOM
    )
  }

  public remove(control: MapControl): void {
    throw Error(`Not implemented.`)
  }
}
