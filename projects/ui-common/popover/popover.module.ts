import { OverlayModule } from '@angular/cdk/overlay'
import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TheSeamPopoverDirective } from './popover.directive'
import { PopoverComponent } from './popover/popover.component'

@NgModule({
    declarations: [
        PopoverComponent,
        TheSeamPopoverDirective
    ],
    imports: [
        CommonModule,
        OverlayModule,
        PortalModule
    ],
    exports: [
        TheSeamPopoverDirective,
        OverlayModule,
        PortalModule
    ]
})
export class TheSeamPopoverModule { }
