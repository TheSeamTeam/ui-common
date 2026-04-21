import { ChangeDetectionStrategy, Component, inject } from '@angular/core'

import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'

import { DatatableRefreshService } from '../services/datatable-refresh.service'

@Component({
  selector: 'seam-datatable-refresh-button',
  template: `
    <button
      seamButton
      theme="lightgray"
      size="sm"
      title="Refresh"
      (click)="_onClick()"
    >
      <seam-icon [icon]="_refreshIcon"></seam-icon>
      <span class="sr-only">Refresh</span>
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TheSeamButtonsModule, TheSeamIconModule],
})
export class DatatableRefreshButtonComponent {
  private readonly _refreshService = inject(DatatableRefreshService)

  readonly _refreshIcon = faSyncAlt

  _onClick(): void {
    this._refreshService.refresh()
  }
}
