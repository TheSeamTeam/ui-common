import { Observable } from 'rxjs'

export abstract class TheSeamGoogleMapsApiLoader {

  abstract load(): Observable<void>

}
