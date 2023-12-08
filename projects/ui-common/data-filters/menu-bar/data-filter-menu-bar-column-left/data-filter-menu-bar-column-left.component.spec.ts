import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DataFilterMenuBarColumnLeftComponent } from './data-filter-menu-bar-column-left.component'

describe('DataFilterMenuBarColumnLeftComponent', () => {
  let component: DataFilterMenuBarColumnLeftComponent
  let fixture: ComponentFixture<DataFilterMenuBarColumnLeftComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DataFilterMenuBarColumnLeftComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFilterMenuBarColumnLeftComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
