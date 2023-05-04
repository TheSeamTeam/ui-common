import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'seam-footer-bar',
  templateUrl: './footer-bar.component.html',
  styleUrls: ['./footer-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterBarComponent { }
