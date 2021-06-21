import { TemplateRef } from '@angular/core'
import { Observable } from 'rxjs'

export interface IBaseLayoutActionBase {

  type: string

  /**
   * This needs to be unique to identify the specific action.
   */
  name: string

  /**
   * Will be used when the UI needs text to represent the action.
   */
  label: string

  disabled?: boolean
}

export interface IBaseLayoutActionButton extends IBaseLayoutActionBase {

  type: 'button'

  exec: () => Promise<void> | Observable<void> | void
}

export interface IBaseLayoutActionRouterLink extends IBaseLayoutActionBase {

  type: 'router-link'

  url: string

}

export interface IBaseLayoutActionHref extends IBaseLayoutActionBase {

  type: 'href'

  url: string

}

export interface IBaseLayoutActionTemplate extends IBaseLayoutActionBase {

  type: 'template'

  template: TemplateRef<any>

}

export type BaseLayoutAction =
  IBaseLayoutActionButton |
  IBaseLayoutActionRouterLink |
  IBaseLayoutActionHref |
  IBaseLayoutActionTemplate
