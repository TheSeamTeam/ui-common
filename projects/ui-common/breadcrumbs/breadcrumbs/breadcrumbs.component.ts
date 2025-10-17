import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core'
import { RouterModule } from '@angular/router'

import { TheSeamBreadcrumbsService } from '../breadcrumbs.service'

@Component({
  selector: 'seam-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, NgFor, AsyncPipe, NgClass, NgIf],
})
export class TheSeamBreadcrumbsComponent {
  private readonly _breadcrumbs = inject(TheSeamBreadcrumbsService)
  public readonly crumbs$ = this._breadcrumbs.crumbs$
}
