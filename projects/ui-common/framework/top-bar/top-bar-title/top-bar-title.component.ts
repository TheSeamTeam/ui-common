import { NgIf, NgStyle } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewEncapsulation,
} from '@angular/core'
import { FlexLayoutModule } from '@angular/flex-layout'

@Component({
  selector: 'seam-top-bar-title',
  templateUrl: './top-bar-title.component.html',
  styleUrls: ['./top-bar-title.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIf, NgStyle, FlexLayoutModule],
})
export class TopBarTitleComponent {
  @Input() titleText: string | undefined | null
  @Input() subTitleText: string | undefined | null
}
