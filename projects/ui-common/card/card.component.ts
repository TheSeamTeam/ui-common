import { Component, HostBinding, OnInit } from '@angular/core'

@Component({
  selector: 'seam-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @HostBinding('class.card') _cssClassCard = true

  constructor() { }

  ngOnInit() {
  }

}
