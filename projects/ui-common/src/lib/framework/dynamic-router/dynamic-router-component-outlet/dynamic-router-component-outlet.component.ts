import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-dynamic-router-component-outlet',
  templateUrl: './dynamic-router-component-outlet.component.html',
  styleUrls: ['./dynamic-router-component-outlet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DynamicRouterComponentOutletComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
