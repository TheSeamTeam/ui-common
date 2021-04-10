import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

@Component({
  selector: 'seam-top-bar-title',
  templateUrl: './top-bar-title.component.html',
  styleUrls: ['./top-bar-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarTitleComponent implements OnInit {

  @Input() titleText: string | undefined | null
  @Input() subTitleText: string | undefined | null

  constructor() { }

  ngOnInit() { }

}
