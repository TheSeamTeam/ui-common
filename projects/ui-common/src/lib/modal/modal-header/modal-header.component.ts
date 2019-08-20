import { Component, ContentChild, HostBinding, Input, OnInit } from '@angular/core'

import { ModalCloseDirective } from '../directives/modal-close.directive'
import { ModalTitleDirective } from '../directives/modal-title.directive'

@Component({
  selector: 'seam-modal-header',
  templateUrl: './modal-header.component.html',
  styleUrls: ['./modal-header.component.scss']
})
export class ModalHeaderComponent implements OnInit {

  @HostBinding('class.modal-header') _modalHeaderCss = true

  @Input() hasCloseBtn = true

  @ContentChild(ModalTitleDirective, { static: true }) _titleDirective: ModalTitleDirective
  @ContentChild(ModalCloseDirective, { static: true }) _closeDirective: ModalCloseDirective

  constructor() { }

  ngOnInit() {
  }

}
