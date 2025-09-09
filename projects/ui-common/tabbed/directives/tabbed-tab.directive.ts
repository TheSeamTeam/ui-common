import { Directive, ElementRef, HostBinding, OnInit } from '@angular/core'

import { TheSeamTabbedTabAccessor } from '../tabbed-models'
import { TheSeamTabbedComponent } from '../tabbed.component'
import { TheSeamTabbedService } from '../tabbed.service'

@Directive({
  selector: '[seamTabbedTab]',
  exportAs: 'seamTabbedTab'
})
export class TheSeamTabbedTabDirective implements OnInit, TheSeamTabbedTabAccessor {

  // @HostBinding('class.custom-invalid')
  // get customInvalid() { return this.control.invalid }

  public isActive = false

  constructor(
    public elementRef: ElementRef,
    // public host: TheSeamTabbedComponent,
    public tabbedService: TheSeamTabbedService
  ) { }

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit() {
    // this.tabbedService.selectedTab.subscribe(tab => {
    //   console.log('tab: ', tab)
    //   console.log('tab.tabbedTabTpl.elementRef: ', tab.tabbedTabTpl.elementRef)
    //   console.log('this.elementRef: ', this.elementRef)
    //   if (tab.tabbedTabTpl.elementRef.na === this.elementRef) {
    //     this.isActive = true
    //   } else {
    //     this.isActive = false
    //   }
    // })
  }

}
