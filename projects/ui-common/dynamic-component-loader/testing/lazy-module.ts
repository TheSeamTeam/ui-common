import { CommonModule } from '@angular/common'
import { Component, NgModule } from '@angular/core'

import { TheSeamDynamicComponentLoaderModule } from '../dynamic-component-loader.module'

@Component({
  selector: 'lazy-comp',
  template: `Lazy Component Works.`,
})
export class LazyComponent {}

@NgModule({
  declarations: [
    LazyComponent
  ],
  imports: [
    CommonModule,
    TheSeamDynamicComponentLoaderModule.forChild(LazyComponent),
  ]
})
export class LazyModule { }
