import { ComponentFixture, TestBed } from '@angular/core/testing'

import { DataboardListComponent } from './databoard-list.component'

describe('DataboardsComponent', () => {
  let component: DataboardListComponent
  let fixture: ComponentFixture<DataboardListComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataboardListComponent ]
    })
    .compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(DataboardListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
