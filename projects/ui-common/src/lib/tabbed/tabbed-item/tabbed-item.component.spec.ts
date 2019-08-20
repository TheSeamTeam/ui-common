/* tslint:disable:no-unused-variable */
import { DebugElement } from '@angular/core'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

import { TabbedItemComponent } from './tabbed-item.component'

describe('TabbedItemComponent', () => {
  let component: TabbedItemComponent
  let fixture: ComponentFixture<TabbedItemComponent>

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabbedItemComponent ]
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
