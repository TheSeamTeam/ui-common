import { Injectable } from '@angular/core'
import { defer, Observable } from 'rxjs'
import { map } from 'rxjs/operators'

import { loadStyle, loadStyleSheet } from '@theseam/ui-common/utils'

export class LoadedAssetRef<T extends HTMLLinkElement | HTMLScriptElement | HTMLStyleElement> {

  constructor(
    public readonly nativeElement: T,
    public readonly path?: string,
    public readonly content?: string
  ) {

  }

  public destroy(): void {
    this.nativeElement.parentElement?.removeChild(this.nativeElement)
  }

}

@Injectable({
  providedIn: 'root'
})
export class AssetLoaderService {

  public loadStyleSheet(path: string): Observable<LoadedAssetRef<HTMLLinkElement>> {
    return defer(() => loadStyleSheet(path)).pipe(map(v => new LoadedAssetRef(v, path)))
  }

  public loadStyle(content: string): Observable<LoadedAssetRef<HTMLStyleElement>> {
    return defer(() => loadStyle(content)).pipe(map(v => new LoadedAssetRef(v, undefined, content)))
  }

}
