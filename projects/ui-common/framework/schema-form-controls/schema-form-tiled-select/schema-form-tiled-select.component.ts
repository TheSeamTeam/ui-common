import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule } from '@angular/forms'

import { JsonSchemaFormModule, JsonSchemaFormService } from '@ajsf/core'
import { TheSeamSchemaFormControlWidget, TheSeamSchemaFormWidgetLayoutNodeOptions } from '../../schema-form'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamTiledSelectModule, TiledSelectItem, TiledSelectLayout } from '@theseam/ui-common/tiled-select'
import { Platform } from '@angular/cdk/platform'

@Component({
  selector: 'seam-schema-form-tiled-select',
  templateUrl: './schema-form-tiled-select.component.html',
  // styleUrls: ['./schema-form-tiled-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonSchemaFormModule,
    TheSeamFormFieldModule,
    TheSeamTiledSelectModule,
  ],
})
export class TheSeamSchemaFormTiledSelectComponent implements OnInit, TheSeamSchemaFormControlWidget {

  formControl?: AbstractControl
  controlName?: string
  controlValue?: any
  controlDisabled = false
  boundControl = false
  options?: TheSeamSchemaFormWidgetLayoutNodeOptions

  @Input() layoutNode: TheSeamSchemaFormControlWidget['layoutNode']
  @Input() layoutIndex: TheSeamSchemaFormControlWidget['layoutIndex']
  @Input() dataIndex: TheSeamSchemaFormControlWidget['dataIndex']

  tiles: TiledSelectItem[] = []
  layout: TiledSelectLayout = 'grid'
  multiple = false
  selectionToggleable = true
  tileBackdrop = false
  showSelectedIcon = true
  animationsDisabled: boolean = this._platform.IOS

  constructor(
    private readonly _jsf: JsonSchemaFormService,
    private readonly _platform: Platform,
  ) { }

  ngOnInit() {
    this.options = this.layoutNode?.options || {} as TheSeamSchemaFormWidgetLayoutNodeOptions
    this._jsf.initializeControl(this)
    console.log(this.options)
    console.log(this.layoutNode)
    this.tiles = this.options.tiles || []
  }

  updateValue(event: any) {
    this._jsf.updateValue(this, event.target.value)
  }

}
