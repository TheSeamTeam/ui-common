import { NgModule } from '@angular/core'

import { TheSeamAutoFocusDirective } from './directives/auto-focus.directive'
import { TheSeamClickOutsideDirective } from './directives/click-outside.directive'
import { TheSeamDisableControlDirective } from './directives/disable-control.directive'
import { TheSeamElemResizedDirective } from './directives/elem-resized.directive'
import { TheSeamHoverClassToggleDirective } from './directives/hover-class-toggle.directive'
import { TheSeamHoverClassDirective } from './directives/hover-class.directive'
import { TheSeamNgSelectExtraDirective } from './directives/ng-select-extra.directive'
import { TheSeamNgxQuillExtraDirective } from './directives/ngx-quill-extra.directive'

import { TheSeamMaskCharsPipe } from './pipes/mask-chars.pipe'
import { TheSeamTruncatePipe } from './pipes/truncate.pipe'

import { TheSeamPasswordInputRevealComponent } from './components/password-input-reveal/password-input-reveal.component'

@NgModule({
  imports: [
    TheSeamAutoFocusDirective,
    TheSeamElemResizedDirective,
    TheSeamHoverClassToggleDirective,
    TheSeamNgSelectExtraDirective,
    TheSeamHoverClassDirective,
    TheSeamClickOutsideDirective,
    TheSeamDisableControlDirective,
    TheSeamNgxQuillExtraDirective,
    TheSeamMaskCharsPipe,
    TheSeamTruncatePipe,
    TheSeamPasswordInputRevealComponent,
  ],
  exports: [
    TheSeamAutoFocusDirective,
    TheSeamElemResizedDirective,
    TheSeamPasswordInputRevealComponent,
    TheSeamNgSelectExtraDirective,
    TheSeamHoverClassDirective,
    TheSeamHoverClassToggleDirective,
    TheSeamClickOutsideDirective,
    TheSeamDisableControlDirective,
    TheSeamMaskCharsPipe,
    TheSeamTruncatePipe,
    TheSeamNgxQuillExtraDirective,
  ]
})
export class TheSeamSharedModule { }
