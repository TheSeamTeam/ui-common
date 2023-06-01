import { animate, style, transition, trigger } from '@angular/animations'
import { Component, ContentChildren, Input, OnDestroy, OnInit, QueryList } from '@angular/core'
import { BooleanInput, NumberInput } from '@angular/cdk/coercion'
import { BehaviorSubject, combineLatest, interval, Observable, Subject } from 'rxjs'
import { filter, map, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators'

import { faAngleLeft, faAngleRight, faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { InputBoolean, InputNumber } from '@theseam/ui-common/core'
import { notNullOrUndefined } from '@theseam/ui-common/utils'

import { TheSeamCarouselSlideDirective } from './carousel-slide.directive'

@Component({
  selector: 'seam-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition('* => *', [
        style({ opacity: '0', height: '*' }),
        animate(250, style({ opacity: '1', height: '*' })),
      ]),
    ])
  ],
})
export class TheSeamCarouselComponent implements OnInit, OnDestroy {
  static ngAcceptInputType_slideInterval: NumberInput
  static ngAcceptInputType_autoPlay: BooleanInput
  static ngAcceptInputType_pauseOnHover: BooleanInput
  static ngAcceptInputType_pauseOnFocus: BooleanInput
  static ngAcceptInputType_showPager: BooleanInput
  static ngAcceptInputType_showNavButtons: BooleanInput
  static ngAcceptInputType_showPauseButton: BooleanInput

  readonly faAngleRight = faAngleRight
  readonly faAngleLeft = faAngleLeft
  readonly faPause = faPause
  readonly faPlay = faPlay

  /**
   * Duration in ms that slide is displayed before paging.
   * Only applicable when `autoPlay === true`.
   * Defaults to 10000ms.
   */
  @Input() @InputNumber(10000) slideInterval = 10000

  /**
   * When `true`, carousel will page automatically.
   * Defaults to `true`.
   */
  @Input() @InputBoolean() autoPlay = true

  /**
   * When `true`, will pause automatic paging when user mouses over carousel.
   * Timer will restart when user mouses out.
   * Only applicable when `autoPlay === true`.
   * Defaults to `true`.
   */
  @Input() @InputBoolean() pauseOnHover = true

  /**
   * When `true`, will pause automatic paging when user focuses in on item in carousel.
   * Timer will restart when user focuses out.
   * Only applicable when `autoPlay === true`.
   * Defaults to `true`.
   */
  @Input() @InputBoolean() pauseOnFocus = true

  /**
   * When `true`, will show pager row at the bottom of the carousel with clickable buttons to navigate directly to a page.
   * Defaults to `true`.
   */
  @Input() @InputBoolean() showPager = true

  /**
   * When `true`, will show left and right nav button on either side of the carousel to navigate through pages.
   * Defaults to `true`.
   */
  @Input() @InputBoolean() showNavButtons = true

  /**
   * When `true`, will show pause/play button to stop/restart automatic paging.
   * Defaults to `true`.
   */
  @Input() @InputBoolean() showPauseButton = true

  @ContentChildren(TheSeamCarouselSlideDirective)
  get slides(): QueryList<TheSeamCarouselSlideDirective> | undefined {
    return this._slides.value
  }
  set slides(value: QueryList<TheSeamCarouselSlideDirective> | undefined) {
    this._slides.next(value)
  }
  private readonly _slides = new BehaviorSubject<QueryList<TheSeamCarouselSlideDirective> | undefined>(undefined)
  public readonly slides$ = this._slides.asObservable()

  public readonly activeSlide$: Observable<any | undefined>

  private readonly _pollActiveIndex = new BehaviorSubject<number>(0)
  public readonly activeIndex$ = this._pollActiveIndex.asObservable()

  private readonly _carouselPaused = new BehaviorSubject<boolean>(false)
  public readonly carouselPaused$ = this._carouselPaused.asObservable()

  private readonly _carouselStopped = new BehaviorSubject<boolean>(false)
  public readonly carouselStopped$ = this._carouselStopped.asObservable()

  private readonly _resetInterval = new Subject<void>()

  constructor() {
    this.activeSlide$ = this._pollActiveIndex.pipe(
      startWith(0),
      switchMap(i => this.slides$.pipe(
        map(slides => slides?.get(i)),
      ))
    )
  }

  ngOnInit(): void {
    combineLatest([this.carouselPaused$, this.carouselStopped$]).pipe(
      tap(([paused, stopped]) => {
        if (paused || stopped) {
          this._resetInterval.next(undefined)
        } else {
          this._startInterval()
        }
      })
    ).subscribe()
  }

  ngOnDestroy(): void {
    this._resetInterval.next(undefined)
  }

  private _startInterval() {
    if (this.autoPlay) {
      interval(this.slideInterval).pipe(
        takeUntil(this._resetInterval),
        tap(() => {
          this.pageCarousel(1)
        })
      ).subscribe()
    }
  }

  focusIn() {
    if (this.pauseOnFocus) {
      this.pauseTimer()
    }
  }

  focusOut() {
    if (this.pauseOnFocus) {
      this.startTimer()
    }
  }

  mouseEnter() {
    if (this.pauseOnHover) {
      this.pauseTimer()
    }
  }

  mouseLeave() {
    if (this.pauseOnHover) {
      this.startTimer()
    }
  }

  pauseTimer() {
    this._carouselPaused.next(true)
  }

  startTimer() {
    if (!this._carouselStopped.value) {
      this._carouselPaused.next(false)
    }
  }

  setCarousel(i: number) {
    this._pollActiveIndex.next(i)
  }

  pageCarousel(step: number) {
    this.slides$.pipe(
      take(1),
      filter(slides => notNullOrUndefined(slides)),
      map(slides => {
        const slidesLen = slides?.length || 1
        let index = this._pollActiveIndex.value
        index = index + step
        index = index < 0 ? slidesLen + index : index % slidesLen
        this._pollActiveIndex.next(index)
      })
    ).subscribe()
  }

  toggleCarouselStop() {
    const carouselStopped = this._carouselStopped.value
    this._carouselStopped.next(!carouselStopped)
  }
}
