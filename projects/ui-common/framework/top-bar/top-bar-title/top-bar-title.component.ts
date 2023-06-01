import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core'

@Component({
  selector: 'seam-top-bar-title',
  templateUrl: './top-bar-title.component.html',
  styleUrls: ['./top-bar-title.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarTitleComponent {

  @Input() titleText: string | undefined | null
  @Input() subTitleText: string | undefined | null

}
