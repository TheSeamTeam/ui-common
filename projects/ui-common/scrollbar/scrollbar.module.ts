import { PlatformModule } from '@angular/cdk/platform'
import { NgModule } from '@angular/core'

import { OverlayScrollbarDirective } from './overlay-scrollbar.directive'
import { LIB_OVERLAY_SCROLLBARS_CONFIG, _OverlayScrollbarDefaults } from './overlay-scrollbars-config'

@NgModule({
  declarations: [
    OverlayScrollbarDirective
  ],
  imports: [
    PlatformModule
  ],
  providers: [
    { provide: LIB_OVERLAY_SCROLLBARS_CONFIG, useValue: _OverlayScrollbarDefaults }
  ],
  exports: [
    OverlayScrollbarDirective
  ]
})
export class TheSeamScrollbarModule { }
