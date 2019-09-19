import { coerceNumberProperty } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core'
import { BehaviorSubject, Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { untilDestroyed } from 'ngx-take-until-destroy'

import { LibIcon } from '../../../icon/index'
import { RouterHelpersService } from '../../../services/router-helpers.service'

import { ISideNavItem } from '../side-nav.models'

@Component({
  selector: 'seam-side-nav-item',
  templateUrl: './side-nav-item.component.html',
  styleUrls: ['./side-nav-item.component.scss'],
  exportAs: 'seamSideNavItem',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideNavItemComponent implements OnInit, OnDestroy {

  faAngleLeft = faAngleLeft

  @Input() itemType: 'divider' | 'basic' | 'link' | 'button'

  @Input() icon?: LibIcon

  @Input() label: string

  @Input()
  set link(value: string | undefined) { this._link.next(value) }
  get link() { return this._link.value }
  private _link = new BehaviorSubject<string | undefined>(undefined)
  public link$ = this._link.asObservable()

  @Input() queryParams?: { [k: string]: any }

  @Input() children?: ISideNavItem[]

  @Input()
  set hierLevel(value: number) { this._hierLevel = coerceNumberProperty(value, 0) }
  get hierLevel(): number { return this._hierLevel }
  private _hierLevel = 0

  @Input() indentSize = 10

  @Input() expanded = true

  public isActive$: Observable<boolean>

  constructor(
    private _routerHelpers: RouterHelpersService,
    private _renderer: Renderer2,
    private _element: ElementRef
  ) {
    this.isActive$ = this.link$.pipe(
      switchMap(link => link ? this._routerHelpers.isActive(link, true) : of(false)),
    )

    this.isActive$
      .pipe(untilDestroyed(this))
      .subscribe(isActive => {
        const c = 'seam-side-nav-item--active'
        if (isActive) {
          this._renderer.addClass(this._element.nativeElement, c)
        } else {
          this._renderer.removeClass(this._element.nativeElement, c)        }
      })
  }

  ngOnInit() { }

  ngOnDestroy() { }

  get hasChildren() {
    return Array.isArray(this.children) && this.children.length > 0
  }

  public toggleChildren(): void {
    this.expanded = !this.expanded
  }

}
