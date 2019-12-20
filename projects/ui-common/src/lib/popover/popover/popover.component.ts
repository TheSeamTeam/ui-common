import { AnimationEvent, transition, trigger, useAnimation } from '@angular/animations'
import { coerceNumberProperty } from '@angular/cdk/coercion'
import { ESCAPE, hasModifierKey } from '@angular/cdk/keycodes'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef
} from '@angular/core'
import { BehaviorSubject, fromEvent, Observable, of, Subject } from 'rxjs'
import { distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators'

import { untilDestroyed } from 'ngx-take-until-destroy'

import { popoverExpandIn, popoverExpandOut, popoverSlideIn, popoverSlideOut } from '../popover-animations'

@Component({
  selector: 'seam-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
  animations: [
    trigger('slideDown', [
      transition(':enter', useAnimation(popoverExpandIn)),
      transition(':leave', useAnimation(popoverExpandOut)),
    ])
  ],
  host: {
    class: 'popover show m-2 position-static',
    '[@slideDown]': `{
      value: _state,
      params: {
        enterAnimationDuration: enterAnimationDuration,
        exitAnimationDuration: exitAnimationDuration
      }
    }`,
    '(@slideDown.start)': '_onAnimationStart($event)',
    '(@slideDown.done)': '_animationDone.next($event)',
    '[style.width]': '_popoverWidth'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverComponent implements OnInit, OnDestroy {

  /** Duration of the enter animation. Has to be a valid CSS value (e.g. 100ms). */
  enterAnimationDuration?: string = '225ms'

  /** Duration of the exit animation. Has to be a valid CSS value (e.g. 50ms). */
  exitAnimationDuration?: string = '225ms'

  /** State of the dialog animation. */
  _state: 'void' | 'enter' | 'exit' = 'enter'

  /** A subject emitting before the dialog enters the view. */
  _beforeEnter: Subject<void> = new Subject()

  /** A subject emitting after the dialog enters the view. */
  _afterEnter: Subject<void> = new Subject()

  /** A subject emitting before the dialog exits the view. */
  _beforeExit: Subject<void> = new Subject()

  /** A subject emitting after the dialog exits the view. */
  _afterExit: Subject<void> = new Subject()

  /** Stream of animation `done` events. */
  _animationDone = new Subject<AnimationEvent>()

  // @HostBinding('attr.role') get _role() { return this._config.role }
  @HostBinding('attr.role') get _role() { return 'dialog' }

  @HostBinding('attr.tabindex') get _tabindex() { return -1 }

  @Input() template: TemplateRef<any>

  // @Output() readonly closed = new EventEmitter<void | 'click' | 'keydown'>()

  @Input() popoverClass: string

  /**
   * Defines a width for a popover that will scale down if the window innerWidth is
   * smaller than the value.
   */
  @Input()
  get baseWidth() { return this._baseWidth.value }
  set baseWidth(value: number | null) {
    const _val = coerceNumberProperty(value, null)
    if (_val !== this._baseWidth.value) {
      this._baseWidth.next(_val)
    }
  }
  private _baseWidth = new BehaviorSubject<number | null>(600)
  // _popoverWidth$: Observable<string | undefined>
  _popoverWidth: string | undefined

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    // TODO: Implement PopoverConfig
  ) {
    // We use a Subject with a distinctUntilChanged, rather than a callback attached to .done,
    // because some browsers fire the done event twice and we don't want to emit duplicate events.
    // See: https://github.com/angular/angular/issues/24084
    this._animationDone.pipe(distinctUntilChanged((x, y) => {
      return x.fromState === y.fromState && x.toState === y.toState
    })).subscribe(event => {
      // Emit lifecycle events based on animation `done` callback.
      if (event.toState === 'enter') {
        this._afterEnter.next()
        this._afterEnter.complete()
      }

      if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
        this._afterExit.next()
        this._afterExit.complete()
      }
    })
  }

  ngOnInit() {
    // this._popoverWidth$ =
    this._baseWidth.pipe(
      switchMap(baseWidth => {
        if (baseWidth) {
          return fromEvent(window, 'resize').pipe(
            startWith(undefined),
            map(() => window.innerWidth < baseWidth ? `${window.innerWidth}px` : `${baseWidth}px`)
          )
        }
        return of(undefined)
      }),
      untilDestroyed(this)
    ).subscribe(w => {
      this._popoverWidth = w
      this._changeDetectorRef.markForCheck()
    })
  }

  ngOnDestroy() {
    // this.closed.complete()
    this._animationDone.complete()
  }

  /** Starts the dialog exit animation. */
  _startExiting(): void {
    this._state = 'exit'

    // Mark the container for check so it can react if the
    // view container is using OnPush change detection.
    this._changeDetectorRef.markForCheck()
  }

  /** Emit lifecycle events based on animation `start` callback. */
  _onAnimationStart(event: AnimationEvent) {
    if (event.toState === 'enter') {
      this._beforeEnter.next()
      this._beforeEnter.complete()
    }
    if (event.fromState === 'enter' && (event.toState === 'void' || event.toState === 'exit')) {
      this._beforeExit.next()
      this._beforeExit.complete()
    }
  }

  /** Handle a keyboard event from the menu, delegating to the appropriate action. */
  @HostListener('keydown', [ '$event' ])
  _handleKeydown(event: KeyboardEvent) {
    // tslint:disable-next-line:deprecation
    const keyCode = event.keyCode

    switch (keyCode) {
      case ESCAPE:
        if (!hasModifierKey(event)) {
          event.preventDefault()
          // this.closed.emit('keydown')
          this._startExiting()
        }
        break
    }
  }

}
