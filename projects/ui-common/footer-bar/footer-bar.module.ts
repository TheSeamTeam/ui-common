import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FooterBarComponent } from './footer-bar/footer-bar.component'


@NgModule({
  declarations: [FooterBarComponent],
  imports: [
    CommonModule
  ],
  exports: [FooterBarComponent]
})
export class FooterBarModule { }
