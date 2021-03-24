import { Injectable } from '@angular/core'

import { ActiveToast, GlobalConfig, IndividualConfig, ToastContainerDirective } from 'ngx-toastr'

@Injectable()
export class StoryToastrService {
  toastrConfig: GlobalConfig
  currentlyActive = 0
  toasts: ActiveToast<any>[] = []
  overlayContainer: ToastContainerDirective
  previousToastMessage: string | undefined

  /** show toast */
  show(
    message?: string,
    title?: string,
    override: Partial<IndividualConfig> = {},
    type = ''
  ) { }

  /** show successful toast */
  success(
    message?: string,
    title?: string,
    override: Partial<IndividualConfig> = {}
  ) { }

  /** show error toast */
  error(
    message?: string,
    title?: string,
    override: Partial<IndividualConfig> = {}
  ) { }

  /** show info toast */
  info(
    message?: string,
    title?: string,
    override: Partial<IndividualConfig> = {}
  ) { }

  /** show warning toast */
  warning(
    message?: string,
    title?: string,
    override: Partial<IndividualConfig> = {}
  ) { }

  /**
   * Remove all or a single toast by id
   */
  clear(toastId?: number) { }

  /**
   * Remove and destroy a single toast by id
   */
  remove(toastId: number) { }

  /**
   * Determines if toast message is already shown
   */
  findDuplicate(message: string, resetOnDuplicate: boolean, countDuplicates: boolean) { }

}
