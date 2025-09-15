import { TemplateRef } from '@angular/core'
import { Observable } from 'rxjs'

export interface TheSeamBaseLayoutActionBase {
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

export interface TheSeamBaseLayoutActionButton extends TheSeamBaseLayoutActionBase {
  type: 'button'
  exec: () => Promise<void> | Observable<void> | void
}

export interface TheSeamBaseLayoutActionRouterLink extends TheSeamBaseLayoutActionBase {
  type: 'router-link'
  url: string
}

export interface TheSeamBaseLayoutActionHref extends TheSeamBaseLayoutActionBase {
  type: 'href'
  url: string
}

export interface TheSeamBaseLayoutActionTemplate extends TheSeamBaseLayoutActionBase {
  type: 'template'
  template: TemplateRef<any>
}

export type TheSeamBaseLayoutAction =
  TheSeamBaseLayoutActionButton |
  TheSeamBaseLayoutActionRouterLink |
  TheSeamBaseLayoutActionHref |
  TheSeamBaseLayoutActionTemplate
