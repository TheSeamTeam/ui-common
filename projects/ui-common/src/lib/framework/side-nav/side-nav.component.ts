import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { BehaviorSubject, combineLatest } from 'rxjs'
import { filter, map, mapTo, publishReplay, refCount, startWith, switchMap } from 'rxjs/operators'

import { ISideNavItem } from './side-nav.models'

@Component({
  selector: 'seam-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavComponent implements OnInit {

  @Input()
  get items(): ISideNavItem[] { return this._items.value }
  set items(value: ISideNavItem[]) { this._items.next(value) }
  private _items = new BehaviorSubject<ISideNavItem[]>([])
  public items$ = this._items.asObservable()

  // private _itemsWithState = new BehaviorSubject<ISideNavItem[]>([])
  // public itemsWithState$ = this._itemsWithState.asObservable()


  constructor(
    private _router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    const routed$ = this._router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        mapTo(undefined)
      )

    combineLatest(this.items$, routed$.pipe(startWith(undefined)))
      .pipe(
        map(v => v[0]),
        map(items => {
          const url = this._router.url
          console.log(items, url)
          console.log(this._router)
          console.log(this._router.isActive(url, false), this._router.isActive(url, true), url)
          const checkNode = node => {
            // console.log('check', node)
            if (node.link) {
              console.log(this._router.isActive(node.link, false), this._router.isActive(node.link, true), node.link)
            }
            if (node.children) {
              for (const _n of node.children) {
                checkNode(_n)
              }
            }
          }

          for (const _n of items) {
            checkNode(_n)
          }
        })
      )
      .subscribe()



      // publishReplay(1),
      // refCount()
  }

}
