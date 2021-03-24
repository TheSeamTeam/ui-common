import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DatatableColumnPreferencesComponent } from './datatable-column-preferences.component'

describe('DatatableColumnPreferencesComponent', () => {
  let component: DatatableColumnPreferencesComponent
  let fixture: ComponentFixture<DatatableColumnPreferencesComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableColumnPreferencesComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableColumnPreferencesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
