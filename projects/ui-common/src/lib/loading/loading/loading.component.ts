import { Component, Input, OnInit } from '@angular/core'

import { NgxLoadingConfig } from 'ngx-loading'

import { defaultThemeConfig, primaryThemeConfig } from '../loading-themes'
import { TheSeamLoadingTheme } from '../loading.models'

@Component({
  selector: 'seam-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  @Input()
  set theme(value: TheSeamLoadingTheme) {
    if (value === 'primary') {
      this._theme = primaryThemeConfig
    } else {
      this._theme = defaultThemeConfig
    }
  }
  _theme: NgxLoadingConfig = defaultThemeConfig

  constructor() { }

  ngOnInit() { }

}
