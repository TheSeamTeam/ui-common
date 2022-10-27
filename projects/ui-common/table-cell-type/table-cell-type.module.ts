import { PortalModule } from '@angular/cdk/portal'
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'

import { TableCellTypeSelectorComponent } from './table-cell-type-selector.component'

@NgModule({
    declarations: [
        TableCellTypeSelectorComponent
    ],
    imports: [
        CommonModule,
        PortalModule
    ],
    providers: [],
    exports: [
        TableCellTypeSelectorComponent
    ]
})
export class TheSeamTableCellTypeModule { }
