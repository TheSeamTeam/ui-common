import { BooleanInput, NumberInput } from '@angular/cdk/coercion'
import { Component, Input, ViewEncapsulation } from '@angular/core'

import { InputBoolean, InputNumber } from '@theseam/ui-common/core'

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
  styleUrls: [ './progress-circle.component.scss' ],
  encapsulation: ViewEncapsulation.None
})
export class ProgressCircleComponent {
  static ngAcceptInputType_fillBackground: BooleanInput
  static ngAcceptInputType_showText: BooleanInput
  static ngAcceptInputType_hiddenOnEmpty: BooleanInput
  static ngAcceptInputType_percentage: NumberInput
  static ngAcceptInputType_pending: BooleanInput

  private _percentage: number = 0

  @Input() @InputBoolean() fillBackground: boolean = false
  @Input() @InputBoolean() showText: boolean = false
  @Input() @InputBoolean() hiddenOnEmpty: boolean = true
  @Input() @InputBoolean() pending: boolean = false

  @Input() @InputNumber()
  set percentage(value: number) {
    this._percentage = value
    this._progressInfo = this._getProgress()
  }
  get percentage(): number { return this._percentage }

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
