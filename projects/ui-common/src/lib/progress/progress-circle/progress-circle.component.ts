import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion'
import { Component, Input } from '@angular/core'

interface IProgressInfo {
  dashoffset: number
  circumference: number
  percent: number
}

export function calcDashoffset(value: number, circumference: number) {
  const progress = value / 100
  const dashoffset = circumference * (1 - progress)
  return dashoffset
}

@Component({
  selector: 'seam-progress-circle',
  templateUrl: './progress-circle.component.html',
  styleUrls: [ './progress-circle.component.scss' ]
})
export class ProgressCircleComponent {

  private _fillBackground: boolean = false
  private _showText: boolean = false
  private _hiddenOnEmpty: boolean = true
  private _percentage: number = 0
  private _pending: boolean = false

  @Input()
  set fillBackground(value: boolean) {
    this._fillBackground = coerceBooleanProperty(value)
  }
  get fillBackground(): boolean { return this._fillBackground }

  @Input()
  set showText(value: boolean) {
    this._showText = coerceBooleanProperty(value)
  }
  get showText(): boolean { return this._showText }

  @Input()
  set hiddenOnEmpty(value: boolean) {
    this._hiddenOnEmpty = coerceBooleanProperty(value)
  }
  get hiddenOnEmpty(): boolean { return this._hiddenOnEmpty }

  @Input()
  set percentage(value: number) {
    this._percentage = coerceNumberProperty(value)
    this._progressInfo = this._getProgress()
  }
  get percentage(): number { return this._percentage }

  @Input()
  set pending(value: boolean) {
    this._pending = coerceBooleanProperty(value)
  }
  get pending(): boolean { return this._pending }

  public readonly radius = 15
  public readonly circumference = 2 * Math.PI * this.radius

  _progressInfo?: IProgressInfo | null

  constructor() { }

  private _getProgress(): IProgressInfo {
    return {
      dashoffset: calcDashoffset(this.percentage || 0, this.circumference),
      circumference: this.circumference,
      percent: Math.floor(this.percentage || 0)
    }
  }
}
