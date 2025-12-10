import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { FooterBarComponent } from './footer-bar/footer-bar.component'

@NgModule({
  imports: [CommonModule, FooterBarComponent],
  exports: [FooterBarComponent],
})
export class FooterBarModule {}
