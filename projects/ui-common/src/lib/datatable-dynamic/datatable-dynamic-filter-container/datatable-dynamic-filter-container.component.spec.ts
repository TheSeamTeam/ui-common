import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { DatatableDynamicFilterContainerComponent } from './datatable-dynamic-filter-container.component'

describe('DatatableDynamicFilterContainerComponent', () => {
  let component: DatatableDynamicFilterContainerComponent
  let fixture: ComponentFixture<DatatableDynamicFilterContainerComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatatableDynamicFilterContainerComponent ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableDynamicFilterContainerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
