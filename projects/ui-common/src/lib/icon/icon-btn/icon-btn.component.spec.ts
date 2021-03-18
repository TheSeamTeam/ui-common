import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { CommonModule } from '@angular/common'

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'

import { IconComponent } from '../icon/icon.component'
import { IconBtnComponent } from './icon-btn.component'

describe('IconBtnComponent', () => {
  let component: IconBtnComponent
  let fixture: ComponentFixture<IconBtnComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        IconComponent,
        IconBtnComponent
      ],
      imports: [
        CommonModule,
        FontAwesomeModule
      ]
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IconBtnComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
