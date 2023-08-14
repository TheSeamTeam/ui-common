import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'
import { Observable } from 'rxjs'

import { TheSeamBreadcrumb } from '../breadcrumb'
import { TheSeamBreadcrumbsService } from '../breadcrumbs.service'

@Component({
  selector: 'seam-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsComponent {

  public crumbs$: Observable<TheSeamBreadcrumb[]>

  constructor(
    private _breadcrumbs: TheSeamBreadcrumbsService
  ) {
    this.crumbs$ = this._breadcrumbs.crumbs$
  }

}
