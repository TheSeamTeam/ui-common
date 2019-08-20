import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { TheSeamLoadingModule } from '../loading'
import { TheSeamModalModule } from '../modal'
import { TheSeamScrollbarModule } from '../scrollbar'

import { AutoFocusDirective } from './directives/auto-focus.directive'
import { ClickOutsideDirective } from './directives/click-outside.directive'
import { DisableControlDirective } from './directives/disable-control.directive'
import { ElemResizedDirective } from './directives/elem-resized.directive'
import { EncryptedAssetLinkDirective } from './directives/encrypted-asset-link.directive'
import { HoverClassToggleDirective } from './directives/hover-class-toggle.directive'
import { HoverClassDirective } from './directives/hover-class.directive'
import { NgSelectExtraDirective } from './directives/ng-select-extra.directive'

import { MaskCharsPipe } from './pipes/mask-chars.pipe'
import { TruncatePipe } from './pipes/truncate.pipe'

import { PasswordInputRevealComponent } from './components/password-input-reveal/password-input-reveal.component'

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    TheSeamModalModule,
    TheSeamLoadingModule
  ],
  declarations: [
    AutoFocusDirective,
    ElemResizedDirective,
    PasswordInputRevealComponent,
    NgSelectExtraDirective,
    HoverClassDirective,
    HoverClassToggleDirective,
    ClickOutsideDirective,
    DisableControlDirective,
    MaskCharsPipe,
    EncryptedAssetLinkDirective,
    TruncatePipe,
  ],
  exports: [
    AutoFocusDirective,
    ElemResizedDirective,
    PasswordInputRevealComponent,
    NgSelectExtraDirective,
    HoverClassDirective,
    HoverClassToggleDirective,
    ClickOutsideDirective,
    DisableControlDirective,
    MaskCharsPipe,
    EncryptedAssetLinkDirective,
    TruncatePipe,

    // Exporting scrollbars here for backwards compatibility for now.
    TheSeamScrollbarModule
  ]
})
export class TheSeamSharedModule { }
