import { AbstractControl } from '@angular/forms'

export interface TheSeamSchemaFormWidgetLayoutNodeOptions {
  errorMessage: any
  validationMessages: any
  showErrors: boolean
  /**
   * ?
   */
  copyValueTo: any[]
  title: string

  [key: string]: any
}

/**
 * Interface to represent the properties set on a widget component instance by
 * '@ajsf/core'.
 *
 * NOTE: I am not positive this is completely accurate.
 */
export interface TheSeamSchemaFormWidget {

  options?: TheSeamSchemaFormWidgetLayoutNodeOptions

  /**
   * Node from the json schema.
   */
  layoutNode?: {
    options?: TheSeamSchemaFormWidgetLayoutNodeOptions
    name: string
    value: any
    dataPointer: string
    type: string
    dataType?: string
    items?: any[]
  } | null
  layoutIndex: number[] | undefined | null
  dataIndex: number[] | undefined | null
}

/**
 * Interface to represent the properties set on a widget component instance by
 * '@ajsf/core', when calling `initializeControl`.
 *
 * Some properties, such as `options` can be set before calling
 * `initializeControl` and will affect how it works.
 *
 * NOTE: I am not positive this is completely accurate.
 */
export interface TheSeamSchemaFormControlWidget extends TheSeamSchemaFormWidget {

  formOptions?: {
    validateOnRender: boolean
  }

  /**
   * The form control for a widget.
   */
  formControl?: AbstractControl
  /**
   * ?
   */
  boundControl?: boolean

  controlName?: string
  controlValue?: any
  controlDisabled?: boolean
}
