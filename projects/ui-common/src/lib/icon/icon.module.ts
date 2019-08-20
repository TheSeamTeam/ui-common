import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { IconBtnComponent } from './icon-btn/icon-btn.component'
import { IconComponent } from './icon/icon.component'

@NgModule({
  declarations: [
    IconComponent,
    IconBtnComponent
  ],
  imports: [
    CommonModule,
    FontAwesomeModule
  ],
  exports: [
    IconComponent,
    IconBtnComponent
  ]
})
export class TheSeamIconModule { }
