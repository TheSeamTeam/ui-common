import { Component, Input } from '@angular/core'

import { NgxLoadingConfig } from '@marklb/ngx-loading'

import { defaultThemeConfig, primaryThemeConfig } from '../loading-themes'
import type { TheSeamLoadingTheme } from '../loading.models'

@Component({
  selector: 'seam-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class TheSeamLoadingComponent {

  @Input()
  set theme(value: TheSeamLoadingTheme) {
    if (value === 'primary') {
      this._theme = primaryThemeConfig
    } else {
      this._theme = defaultThemeConfig
    }
  }
  _theme: NgxLoadingConfig = defaultThemeConfig

}
