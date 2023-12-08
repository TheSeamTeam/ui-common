import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DataFilterMenuBarColumnCenterComponent } from './data-filter-menu-bar-column-center.component'

describe('DataFilterMenuBarColumnCenterComponent', () => {
  let component: DataFilterMenuBarColumnCenterComponent
  let fixture: ComponentFixture<DataFilterMenuBarColumnCenterComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DataFilterMenuBarColumnCenterComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFilterMenuBarColumnCenterComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
