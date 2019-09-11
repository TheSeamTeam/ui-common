import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-menu-footer',
  templateUrl: './menu-footer.component.html',
  styleUrls: ['./menu-footer.component.scss'],
  host: {
    'class': 'd-flex flex-column text-center bg-light border-top py-2'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuFooterComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
