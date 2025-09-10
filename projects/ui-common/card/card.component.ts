import { Component, HostBinding } from '@angular/core'

@Component({
  selector: 'seam-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class TheSeamCardComponent {

  @HostBinding('class.card') _cssClassCard = true

}
