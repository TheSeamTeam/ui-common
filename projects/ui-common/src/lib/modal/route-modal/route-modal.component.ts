import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'

import { ModalComponent } from '../modal/modal.component'

@Component({
  selector: 'seam-route-modal',
  templateUrl: './route-modal.component.html',
  styleUrls: ['./route-modal.component.scss']
})
export class RouteModalComponent implements OnInit, AfterViewInit {

  @ViewChild(ModalComponent, { static: true }) _modal: ModalComponent

  constructor(
    private _route: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit() { }

  ngAfterViewInit() { }

  public _onDetached() {
    if (this.isRouteModal()) {
      this._router.navigate(
        [{ outlets: { modal: null, primary: ['.'] } }],
        { relativeTo: this._route.parent }
      )
    }
  }

  public isRouteModal() {
    return this._route.outlet === 'modal'
  }

}
