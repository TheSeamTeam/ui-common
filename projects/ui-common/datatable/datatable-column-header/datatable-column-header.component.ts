import { Component, input } from '@angular/core'
import { CommonModule } from '@angular/common'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { SeamIcon, TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamPopoverModule } from '@theseam/ui-common/popover'

import { TheSeamDatatableColumn } from '../models/table-column'
import { TheSeamDatatableColumnFilterUpdateMethod } from '../models/datatable-config'
import { DatatableColumnFilterMenuComponent } from '../datatable-column-filter-menu/datatable-column-filter-menu.component'

@Component({
  selector: 'seam-datatable-column-header',
  templateUrl: './datatable-column-header.component.html',
  styleUrls: ['./datatable-column-header.component.scss'],
  imports: [
    CommonModule,
    TheSeamButtonsModule,
    TheSeamPopoverModule,
    TheSeamIconModule,
    DatatableColumnFilterMenuComponent,
  ],
  host: {
    class: 'd-inline-flex align-items-center flex-fill',
    '[class.justify-content-center]': 'column().alignHeader === "center"',
    '[class.justify-content-end]': 'column().alignHeader === "right"',
  },
})
export class DatatableColumnHeaderComponent {
  column = input.required<TheSeamDatatableColumn>()
  sortFn = input.required<() => void>()
  columnFilterIcon = input<SeamIcon | undefined | null>()
  columnFilterUpdateMethod = input<
    TheSeamDatatableColumnFilterUpdateMethod | undefined | null
  >()
  columnFilterUpdateDebounce = input<number | undefined | null>()
}
