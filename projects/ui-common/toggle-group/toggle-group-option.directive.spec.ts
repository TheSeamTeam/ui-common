import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms'

import { ToggleGroupOptionDirective } from './toggle-group-option.directive'
import { TheSeamToggleGroupModule } from './toggle-group.module'

const SELECTED_CLASS = 'lib-toggle-group-option-selected'

@Component({
  template: `
    <div [formControl]="control" seamToggleGroup>
      <button type="button" seamToggleGroupOption="a">a</button>
      <button type="button" seamToggleGroupOption="b">b</button>
    </div>
  `,
  standalone: false,
})
class GroupedHostComponent {
  control = new UntypedFormControl('a')
}

@Component({
  template: `<button type="button" seamToggleGroupOption="a">a</button>`,
  standalone: false,
})
class UngroupedHostComponent {}

describe('ToggleGroupOptionDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GroupedHostComponent, UngroupedHostComponent],
      imports: [CommonModule, ReactiveFormsModule, TheSeamToggleGroupModule],
    })
  })

  function classes(fixture: ComponentFixture<unknown>): boolean[] {
    return Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).map((b) => b.classList.contains(SELECTED_CLASS))
  }

  it('creates an instance', () => {
    const fixture = TestBed.createComponent(UngroupedHostComponent)
    fixture.detectChanges()

    expect(
      fixture.debugElement.children[0].injector.get(ToggleGroupOptionDirective),
    ).toBeTruthy()
  })

  // The option owns no state of its own; it renders whatever the group reports.
  it('applies the host class for the value the group has selected', () => {
    const fixture = TestBed.createComponent(GroupedHostComponent)
    fixture.detectChanges()

    expect(classes(fixture)).toEqual([true, false])
  })

  it('follows the group when its value changes', () => {
    const fixture = TestBed.createComponent(GroupedHostComponent)
    fixture.detectChanges()

    fixture.componentInstance.control.setValue('b')
    fixture.detectChanges()

    expect(classes(fixture)).toEqual([false, true])
  })

  // Without a group there is nothing to derive from, so it renders unselected
  // rather than throwing.
  it('renders unselected when used without a group', () => {
    const fixture = TestBed.createComponent(UngroupedHostComponent)
    fixture.detectChanges()

    expect(classes(fixture)).toEqual([false])
  })
})
