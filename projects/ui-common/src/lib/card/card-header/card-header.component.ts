import { Component, HostBinding, OnInit } from '@angular/core'

@Component({
  selector: 'seam-card-header',
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.scss']
})
export class CardHeaderComponent implements OnInit {

  @HostBinding('class.card-header') _cssClassCardHeader = true
  @HostBinding('class.py-0') _cssClassPY0 = true

  constructor() { }

  ngOnInit() {
  }

}
