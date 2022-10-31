import { Directive, ElementRef, HostBinding, OnInit } from '@angular/core'

import { TabbedTabAccessor } from '../tabbed-models'
import { TabbedComponent } from '../tabbed.component'
import { TabbedService } from '../tabbed.service'

@Directive({
  selector: '[seamTabbedTab]',
  exportAs: 'seamTabbedTab'
})
export class TabbedTabDirective implements OnInit, TabbedTabAccessor {

  // @HostBinding('class.custom-invalid')
  // get customInvalid() { return this.control.invalid }

  public isActive = false

  constructor(
    public elementRef: ElementRef,
    // public host: TabbedComponent,
    public tabbedService: TabbedService
  ) { }

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
