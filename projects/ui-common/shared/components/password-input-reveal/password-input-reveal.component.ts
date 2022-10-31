import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion'
import { Component, Input } from '@angular/core'

import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons'

@Component({
  selector: 'seam-password-input-reveal',
  template: `
    <fa-icon [icon]="passwordVisible ? faEyeSlash : faEye" class="password-reveal-icon" (click)="revealPassword()"></fa-icon>
  `,
  styles: [
    `
    :host {
      display: flex;
      align-items: center;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      width: 30px;
      transform: translateZ(0);
      z-index: 50;
    }

    :host fa-icon {
      opacity: 1;
      color: #bababa;
      margin-top: 3px;
      cursor: pointer;
    }

    :host fa-icon ::ng-deep .svg-inline--fa {
      vertical-align: middle;
    }
    `
  ]
})
export class PasswordInputRevealComponent {
  static ngAcceptInputType_passwordVisible: BooleanInput

  faEye = faEye
  faEyeSlash = faEyeSlash

  @Input()
  get inputRef(): HTMLInputElement | undefined | null { return this._passwordInput }
  set inputRef(value: HTMLInputElement | undefined | null) {
    this._passwordInput = value
    this.updateRevealState()
    if (this._passwordInput) {
      this._passwordInput.style.paddingRight = '40px'
      this._passwordInput.classList.add('no-native-eye')
    }
  }
  private _passwordInput: HTMLInputElement | undefined | null

  @Input()
  get passwordVisible() { return this._passwordVisible }
  set passwordVisible(value: boolean) {
    this._passwordVisible = coerceBooleanProperty(value)
    this.updateRevealState()
  }
  public _passwordVisible = false

  public updateRevealState(): void {
    if (this._passwordInput) {
      this._passwordInput.type = this.passwordVisible ? 'text' : 'password'
    }
  }

  public revealPassword(): void {
    this.passwordVisible = !this.passwordVisible
  }

}
