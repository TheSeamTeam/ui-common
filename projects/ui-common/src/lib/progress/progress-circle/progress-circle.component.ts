import { Component, Input, OnInit } from '@angular/core'

export function calcDashoffset(value: number, circumference: number) {
  const progress = value / 100
  const dashoffset = circumference * (1 - progress)
  return dashoffset
}

export function calcPercentage(total: number, n: number) {
  return total && total > 0 ? (n / total) * 100 : 0
}

@Component({
  selector: 'seam-progress-circle',
  templateUrl: './progress-circle.component.html',
  styleUrls: [ './progress-circle.component.scss' ]
})
export class ProgressCircleComponent implements OnInit {

  @Input() fillBackground = false
  @Input() showText = false
  @Input() hiddenOnEmpty = true
  @Input() percentage = null

  // TODO: Consider removing the percentage calculation from this component
  @Input() total = 0
  @Input() numComplete = 0

  public readonly radius = 15
  public readonly circumference = 2 * Math.PI * this.radius

  constructor() { }

  ngOnInit() {
  }

  public getProgress() {
    const percent = this.percentage !== undefined && this.percentage !== null
      ? this.percentage : calcPercentage(this.total, this.numComplete)

    return {
      dashoffset: calcDashoffset(percent || 0, this.circumference),
      circumference: this.circumference,
      percent: Math.floor(percent || 0)
    }
  }
}
