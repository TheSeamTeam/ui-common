import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

@Component({
  selector: 'seam-data-filter-search',
  templateUrl: './data-filter-search.component.html',
  styleUrls: ['./data-filter-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataFilterSearchComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
