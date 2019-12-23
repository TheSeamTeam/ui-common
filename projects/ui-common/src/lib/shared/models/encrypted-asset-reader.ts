import { Observable } from 'rxjs'

/**
 *
 * THIS SHOULD BE IMPLEMENTED AND PROVIDED BY APPLICATION USING 'ui-common'.
 *
 * Example:
 * ```
 * @NgModule({
 *   imports: [ ... ],
 *   declarations: [ ... ]
 *   providers: [
 *      ...,
 *     { provide: IEncryptedAssetReaderService useClass: YourAssetService }
 *   ]
 * }
 * ```
 *
 */

export abstract class EncryptedAssetReader {

  abstract getAssetBlobFromUrl(url: string, detectMimeFromContent: boolean): Observable<Blob | { blob: Blob, filename?: string }>

}
