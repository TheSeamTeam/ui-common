import { EventEmitter } from '@angular/core'
import { AbstractControl, FormControl, FormGroup } from '@angular/forms'

export interface TheSeamToggleEditRef {

  cancelOnBlur: boolean
  placeholder: string
  editing: boolean
  waitOnSubmit: boolean

  changeAccepted: EventEmitter<TheSeamToggleEditRef>
  changeDeclined: EventEmitter<TheSeamToggleEditRef>
  editingChange: EventEmitter<boolean>

  canSubmit(): boolean
  isSubmitting(): boolean
  submitComplete(error?: any): void
  updateBeforeEditValue(): void
  getValue(): string | null
  resetValue(): void
  isFormGroup(): boolean
  getFormGroup(): FormGroup | null
  isInFormField(): boolean
  getFormControl(): FormControl | null
  hasControl(): boolean
  getControl(): AbstractControl | null
  submitEdit(): void
  cancelEdit(): void
  hasFocus(): boolean
  toggleEditing(isEditing?: boolean): void
  isEditing(): boolean
  startEditing(): void
  stopEditing(): void
}
