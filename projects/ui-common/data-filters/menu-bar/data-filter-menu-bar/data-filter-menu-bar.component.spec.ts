import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DataFilterMenuBarComponent } from './data-filter-menu-bar.component'

describe('DataFilterMenuBarComponent', () => {
  let component: DataFilterMenuBarComponent
  let fixture: ComponentFixture<DataFilterMenuBarComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [DataFilterMenuBarComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DataFilterMenuBarComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
