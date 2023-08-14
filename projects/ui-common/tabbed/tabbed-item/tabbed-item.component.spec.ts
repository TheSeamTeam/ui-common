/* tslint:disable:no-unused-variable */
import { DebugElement } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

import { TabbedItemComponent } from './tabbed-item.component'

describe('TabbedItemComponent', () => {
  let component: TabbedItemComponent
  let fixture: ComponentFixture<TabbedItemComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [TabbedItemComponent],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TabbedItemComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
