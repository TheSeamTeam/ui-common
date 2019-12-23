import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableColumnPreferencesButtonComponent } from './datatable-column-preferences-button.component'

describe('DatatableColumnPreferencesButtonComponent', () => {
  let component: DatatableColumnPreferencesButtonComponent
  let fixture: ComponentFixture<DatatableColumnPreferencesButtonComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableColumnPreferencesButtonComponent ]
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
