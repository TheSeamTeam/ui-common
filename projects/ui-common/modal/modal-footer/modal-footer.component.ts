import { Component, HostBinding } from '@angular/core'

@Component({
  selector: 'seam-modal-footer',
  templateUrl: './modal-footer.component.html',
  styleUrls: ['./modal-footer.component.scss']
})
export class ModalFooterComponent {

  @HostBinding('class.modal-footer') _modalFooterCss = true

}
