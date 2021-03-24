import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'seam-top-bar-title',
  templateUrl: './top-bar-title.component.html',
  styleUrls: ['./top-bar-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarTitleComponent implements OnInit {

  @Input() titleText: string
  @Input() subTitleText?: string | null

  constructor() { }

  ngOnInit() { }

}
