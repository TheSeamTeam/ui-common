import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { NgxLoadingModule } from 'ngx-loading'

import { defaultThemeConfig } from './loading-themes'
import { LoadingComponent } from './loading/loading.component'

@NgModule({
  declarations: [LoadingComponent],
  imports: [
    CommonModule,
    OverlayModule,
    PortalModule,
    NgxLoadingModule.forRoot(defaultThemeConfig),
  ],
  exports: [LoadingComponent],
  entryComponents: [LoadingComponent]
})
export class TheSeamLoadingModule { }
