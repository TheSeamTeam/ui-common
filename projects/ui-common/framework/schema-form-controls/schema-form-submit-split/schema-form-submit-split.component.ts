import { Component, Input, isDevMode, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { AbstractControl, ReactiveFormsModule, UntypedFormControl } from '@angular/forms'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

import { buildTitleMap, hasOwn, JsonSchemaFormModule, JsonSchemaFormService, TitleMapItem } from '@ajsf/core'
import { observeControlStatus, observeControlValue } from '@theseam/ui-common/utils'
import { TheSeamSchemaFormControlWidget, TheSeamSchemaFormWidgetLayoutNodeOptions } from '../../schema-form'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

// NOTE: This is aliasing TitleMapItem, because we may want to extend it's
// options. For simplicity, I am letting this work similar to a 'select' widget.
export type TheSeamSchemaFormSubmitSplitItem = TitleMapItem

// NOTE: This component is a little hacky, because I am basically creating a
// data widget that acts like a data and 'submit' widget at the same time.
//
// TODO: Try and think of a nicer way to implement this, but still make sense
// from a schema definition. The library may need to me forked to actually
// support this in the way I expect, but maybe there is another way.
@Component({
  selector: 'seam-schema-form-submit-split',
  templateUrl: './schema-form-submit-split.component.html',
  styleUrls: ['./schema-form-submit-split.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JsonSchemaFormModule,
    TheSeamFormFieldModule,
    TheSeamMenuModule,
    TheSeamButtonsModule,
  ],
})
export class TheSeamSchemaFormSubmitSplitComponent implements OnInit, OnDestroy, TheSeamSchemaFormControlWidget {

  /** @ignore */
  private readonly _ngUnsubscribe = new Subject<void>()

  formControl?: AbstractControl
  controlName?: string
  controlValue?: any
  controlDisabled = false
  boundControl = false
  options?: TheSeamSchemaFormWidgetLayoutNodeOptions

  @Input() layoutNode: TheSeamSchemaFormControlWidget['layoutNode']
  @Input() layoutIndex: TheSeamSchemaFormControlWidget['layoutIndex']
  @Input() dataIndex: TheSeamSchemaFormControlWidget['dataIndex']

  _buttonLabel = ''

  _dropdownObj: any
  _dropdownDisabled = false
  _selectList: TheSeamSchemaFormSubmitSplitItem[] = []
  _selectedItem?: TheSeamSchemaFormSubmitSplitItem

  constructor(
    private readonly _jsf: JsonSchemaFormService
  ) { }

  /** @ignore */
  ngOnInit() {
    this.options = this.layoutNode?.options || {} as TheSeamSchemaFormWidgetLayoutNodeOptions
    this._jsf.initializeControl(this)

    // NOTE: This is commented out, because there is a bug with submit widgets
    // manually defined in layout. All nodes initialized from the provided
    // layout have their options populated from the defaults and 'disabled' is
    // on of the default properties, so the 'disableInvalidSubmit' condition
    // never gets reached.
    //
    // My initial idea for fixing would be to check if the disabled property
    // exists and is a boolean, or possibly anything defined that can coerce
    // into a boolean. I can't think of a reason disabled should be anything
    // else, so that may be an acceptable fix, but I don't want to enable that
    // yet.
    //
    // if (hasOwn(this.options, 'disabled')) {
    //   console.log('[TheSeamSchemaFormSubmitSplitComponent] hasDisabled', this.options.disabled)
    //   this.controlDisabled = this.options.disabled
    // } else
    if (this._jsf.formOptions.disableInvalidSubmit) {
      this.controlDisabled = !this._jsf.isValid
      this._jsf.isValidChanges.subscribe(isValid => this.controlDisabled = !isValid)
    }
    if (this.controlValue === null || this.controlValue === undefined) {
      this.controlValue = this.options.title
    }

    if (hasOwn(this.options, 'title')) {
      this._buttonLabel = this.options.title
    }

    this._initDropdown()

    // console.log('this', this)
  }

  /** @ignore */
  ngOnDestroy(): void {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  updateValue(event: any) {
    if (typeof this.options?.onClick === 'function') {
      this.options.onClick(event)
    } else {
      this._jsf.updateValue(this, event.target.value)
    }
  }

  private _initDropdown(): void {
    if (!hasOwn(this.layoutNode, 'items') || !(this.layoutNode?.items || []).length) {
      return
    }

    if (isDevMode()) {
      if (this.layoutNode?.items && this.layoutNode?.items.length > 1) {
        // eslint-disable-next-line no-console
        console.warn(
          `TheSeamSchemaFormSubmitSplitComponent only supports one item.` +
          ` items after index 0 will be ignored.`
        )
      }
    }

    const idx = 0
    const item = (this.layoutNode?.items as any)[idx] || {}
    this._dropdownObj = {
      layoutNode: item,
      layoutIndex: (this.layoutIndex || []).concat(idx),
      dataIndex: this.layoutNode?.dataType === 'array' ? (this.dataIndex || []).concat(idx) : this.dataIndex,

      options: item.options || {}
    }

    this._jsf.initializeControl(this._dropdownObj)

    const items = buildTitleMap(
      this._dropdownObj.options.titleMap || this._dropdownObj.options.enumNames,
      this._dropdownObj.options.enum,
      !!this._dropdownObj.options.required,
      !!this._dropdownObj.options.flatList
    )

    this._selectList = items

    // TODO: Should this be checking if the control is bound?
    const dropdownControl = this._getDropdownControl()
    if (!dropdownControl) {
      return
    }

    observeControlValue(dropdownControl).pipe(
      takeUntil(this._ngUnsubscribe)
    ).subscribe(value => {
      this._setSelectListCheckedProp(value)
      this._selectedItem = this._getSelectedItem()
    })

    observeControlStatus(dropdownControl).pipe(
      takeUntil(this._ngUnsubscribe)
    ).subscribe(value => {
      this._dropdownDisabled = dropdownControl.disabled
    })
  }

  private _getDropdownControl(): UntypedFormControl | undefined {
    return this._dropdownObj.formControl as UntypedFormControl
  }

  private _setSelectListCheckedProp(value: any) {
    const items = this._selectList
    for (const item of items) {
      if (item.value === value) {
        item.checked = true
      } else if (item.checked) {
        item.checked = false
      }
    }
    this._selectList = [ ...items ]
  }

  private _getSelectedItem(): TheSeamSchemaFormSubmitSplitItem | undefined {
    return (this._selectList || []).find(x => x.checked === true)
  }

  _setDropdownValue(value: any) {
    const formControl = this._getDropdownControl()
    formControl?.setValue(value)
  }

}
