import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DatatableColumnPreferencesButtonComponent } from './datatable-column-preferences-button.component'

describe('DatatableColumnPreferencesButtonComponent', () => {
  let component: DatatableColumnPreferencesButtonComponent
  let fixture: ComponentFixture<DatatableColumnPreferencesButtonComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DatatableColumnPreferencesButtonComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableColumnPreferencesButtonComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
