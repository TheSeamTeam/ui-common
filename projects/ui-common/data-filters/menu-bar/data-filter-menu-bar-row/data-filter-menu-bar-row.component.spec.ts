import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DataFilterMenuBarRowComponent } from './data-filter-menu-bar-row.component'

describe('DataFilterMenuBarRowComponent', () => {
  let component: DataFilterMenuBarRowComponent
  let fixture: ComponentFixture<DataFilterMenuBarRowComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DataFilterMenuBarRowComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFilterMenuBarRowComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
