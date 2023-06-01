import { Component, HostBinding } from '@angular/core'

@Component({
  selector: 'seam-card-header',
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.scss']
})
export class CardHeaderComponent {

  @HostBinding('class.card-header') _cssClassCardHeader = true
  @HostBinding('class.py-0') _cssClassPY0 = true

}
