import { NgModule } from '@angular/core'

import { EncryptedAssetLinkDirective } from './encrypted-asset-link.directive'

@NgModule({
  declarations: [
    EncryptedAssetLinkDirective
  ],
  exports: [
    EncryptedAssetLinkDirective
  ]
})
export class TheSeamAssetReaderModule { }
