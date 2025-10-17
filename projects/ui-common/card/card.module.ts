import { NgModule } from '@angular/core'

import { TheSeamCardActionComponent } from './card-action/card-action.component'
import { TheSeamCardBodyComponent } from './card-body/card-body.component'
import { TheSeamCardHeaderComponent } from './card-header/card-header.component'
import { TheSeamCardComponent } from './card.component'

@NgModule({
  imports: [
    TheSeamCardComponent,
    TheSeamCardHeaderComponent,
    TheSeamCardBodyComponent,
    TheSeamCardActionComponent,
  ],
  exports: [
    TheSeamCardComponent,
    TheSeamCardHeaderComponent,
    TheSeamCardBodyComponent,
    TheSeamCardActionComponent,
  ],
})
export class TheSeamCardModule {}
