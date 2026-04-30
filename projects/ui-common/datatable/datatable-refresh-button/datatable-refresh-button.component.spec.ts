import { Component, ViewChild } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

import { DatatableRefreshService } from '../services/datatable-refresh.service'
import { DatatableRefreshButtonComponent } from './datatable-refresh-button.component'

@Component({
  template: `<seam-datatable-refresh-button></seam-datatable-refresh-button>`,
  imports: [DatatableRefreshButtonComponent],
  providers: [DatatableRefreshService],
})
class TestHostComponent {
  @ViewChild(DatatableRefreshButtonComponent)
  button!: DatatableRefreshButtonComponent
}

describe('DatatableRefreshButtonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    })
  })

  it('renders a button', () => {
    const fixture = TestBed.createComponent(TestHostComponent)
    fixture.detectChanges()

    const btn = fixture.debugElement.query(By.css('button'))
    expect(btn).toBeTruthy()
  })

  it('calls refresh() on the injected service when clicked', () => {
    const fixture = TestBed.createComponent(TestHostComponent)
    const service = fixture.debugElement
      .query(By.directive(DatatableRefreshButtonComponent))
      .injector.get(DatatableRefreshService)

    const refreshSpy = jest.spyOn(service, 'refresh')
    fixture.detectChanges()

    const btn = fixture.debugElement.query(By.css('button'))
    btn.nativeElement.click()

    expect(refreshSpy).toHaveBeenCalledTimes(1)
  })

  it('is wired to a parent service so emissions are observable on refreshRequested$', (done) => {
    const fixture = TestBed.createComponent(TestHostComponent)
    const service = fixture.debugElement
      .query(By.directive(DatatableRefreshButtonComponent))
      .injector.get(DatatableRefreshService)

    fixture.detectChanges()

    service.refreshRequested$.subscribe(() => {
      done()
    })

    const btn = fixture.debugElement.query(By.css('button'))
    btn.nativeElement.click()
  })
})
