import { AbstractControl } from '@angular/forms'

/**
 * Interface to represent the properties set on a widget component instance by
 * '@ajsf/core', when calling `initializeControl`.
 *
 * Some properties, such as `options` can be set before calling
 * `initializeControl` and will affect how it works.
 *
 * NOTE: I am not positive this is completely accurate.
 */
export interface TheSeamSchemaFormWidget {

  options?: {
    errorMessage: any
    validationMessages: any
    showErrors: boolean
    /**
     * ?
     */
    copyValueTo: any[]
    title: string
  }

  /**
   * Node from the json schema.
   */
  layoutNode?: {
    options: any
    name: string
    value: any
    dataPointer: string
    type: string
  }
  layoutIndex: number[] | undefined | null
  dataIndex: number[] | undefined | null

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
