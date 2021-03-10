import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamSharedModule } from '@lib/ui-common/shared'

import { CardActionComponent } from './card-action/card-action.component'
import { CardBodyComponent } from './card-body/card-body.component'
import { CardFooterComponent } from './card-footer/card-footer.component'
import { CardHeaderComponent } from './card-header/card-header.component'
import { CardComponent } from './card.component'

@NgModule({
  declarations: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent,
    CardActionComponent
  ],
  imports: [
    CommonModule,
    TheSeamSharedModule
  ],
  exports: [
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    CardFooterComponent,
    CardActionComponent
  ]
})
export class TheSeamCardModule { }
