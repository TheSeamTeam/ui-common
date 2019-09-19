import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-footer-bar',
  templateUrl: './footer-bar.component.html',
  styleUrls: ['./footer-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterBarComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
