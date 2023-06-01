import { Component, HostBinding } from '@angular/core'

@Component({
  selector: 'seam-modal-body',
  templateUrl: './modal-body.component.html',
  styleUrls: ['./modal-body.component.scss']
})
export class ModalBodyComponent {

  @HostBinding('class.modal-body') _modalBodyCss = true
  @HostBinding('class.p-3') _paddingCss = true

}
