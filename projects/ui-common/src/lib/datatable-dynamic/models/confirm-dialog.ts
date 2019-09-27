import { ThemeTypes } from '../../models/index'

export interface IDynamicDatatableConfirmDialog {
  /** Dialog message. */
  message: string
  /**
   * Additional message to show in an alert below the message.
   *
   * Default alert type is 'warning'.
   */
  alert: string | { message: string, type: ThemeTypes }
}
