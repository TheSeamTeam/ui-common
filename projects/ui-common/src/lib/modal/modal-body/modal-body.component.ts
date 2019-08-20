import { Component, HostBinding, OnInit } from '@angular/core'

@Component({
  selector: 'seam-modal-body',
  templateUrl: './modal-body.component.html',
  styleUrls: ['./modal-body.component.scss']
})
export class ModalBodyComponent implements OnInit {

  @HostBinding('class.modal-body') _modalBodyCss = true
  @HostBinding('class.p-3') _paddingCss = true

  constructor() { }

  ngOnInit() {
  }

}
