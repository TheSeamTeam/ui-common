import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DataboardCardComponent } from './databoard-card.component'

describe('DataboardCardComponent', () => {
  let component: DataboardCardComponent
  let fixture: ComponentFixture<DataboardCardComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataboardCardComponent ]
    })
    .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(DataboardCardComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
