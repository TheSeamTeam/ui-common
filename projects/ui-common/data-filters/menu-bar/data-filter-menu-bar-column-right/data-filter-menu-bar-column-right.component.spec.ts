import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DataFilterMenuBarColumnRightComponent } from './data-filter-menu-bar-column-right.component'

describe('DataFilterMenuBarColumnRightComponent', () => {
  let component: DataFilterMenuBarColumnRightComponent
  let fixture: ComponentFixture<DataFilterMenuBarColumnRightComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DataFilterMenuBarColumnRightComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFilterMenuBarColumnRightComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
