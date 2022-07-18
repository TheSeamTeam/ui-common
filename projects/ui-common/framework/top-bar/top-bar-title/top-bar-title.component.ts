import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'seam-top-bar-title',
  templateUrl: './top-bar-title.component.html',
  styleUrls: ['./top-bar-title.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarTitleComponent implements OnInit {

  @Input() titleText: string | undefined | null
  @Input() subTitleText: string | undefined | null

  constructor() { }

  ngOnInit() { }

}
