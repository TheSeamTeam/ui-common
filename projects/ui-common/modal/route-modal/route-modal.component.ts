import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router'

// import { ModalComponent } from '../modal/modal.component'
import { Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'
import { Modal } from '../modal.service'

@Component({
  selector: 'seam-route-modal',
  templateUrl: './route-modal.component.html',
  styleUrls: ['./route-modal.component.scss']
})
export class RouteModalComponent implements OnInit, OnDestroy, AfterViewInit {

  private readonly _ngUnsubscribe = new Subject<void>()

  // @ViewChild(ModalComponent, { static: true }) _modal: ModalComponent

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _modal: Modal
  ) { }

  ngOnInit() {
    this._route.data
      .pipe(
        takeUntil(this._ngUnsubscribe)
      )
      .subscribe(data => {
        // console.log('data', data)
        if (data.routeComponent) {
          // console.log(this._route.snapshot)
          const modalRef = this._modal.openFromComponent(data.routeComponent, {
            modalSize: 'lg',
            data
          })
          modalRef.afterClosed().subscribe(() => {
            const parent = this.getOutletParent()
            this._router.navigate(
              [{ outlets: { modal: null, primary: ['.'] } }],
              // { relativeTo: this._route.parent }
              { relativeTo: parent }
            )
          })
        }
      })
  }

  ngOnDestroy() {
    this._ngUnsubscribe.next(undefined)
    this._ngUnsubscribe.complete()
  }

  ngAfterViewInit() { }

  getOutletParent() {
    let route: ActivatedRoute | null = this._route
    while (route && route.outlet !== 'modal') { route = route.parent }
    return route ? route.parent : route
  }

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
