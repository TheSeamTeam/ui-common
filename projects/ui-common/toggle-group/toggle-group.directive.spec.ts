import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms'

import { ToggleGroupDirective } from './toggle-group.directive'
import { TheSeamToggleGroupModule } from './toggle-group.module'

/**
 * The template deliberately holds no reference to the option directive. Reads
 * go through `tg.isSelected(value)` and writes through
 * `tg.toggleOptionSelect(value)`, which is the supported consumer contract.
 */
@Component({
  template: `
    <div
      [formControl]="control"
      seamToggleGroup
      #tg="seamToggleGroup"
      [multiple]="multiple"
      [selectionToggleable]="selectionToggleable"
    >
      <button
        *ngFor="let v of values"
        type="button"
        class="btn"
        [seamToggleGroupOption]="v"
        [class.is-selected]="tg.isSelected(v)"
        (click)="tg.toggleOptionSelect(v)"
      >
        {{ v }}
      </button>
    </div>
  `,
  standalone: false,
})
class TestHostComponent {
  control = new UntypedFormControl('a')
  values: string[] = []
  multiple = false
  selectionToggleable = true
}

describe('ToggleGroupDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>
  let host: TestHostComponent

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [CommonModule, ReactiveFormsModule, TheSeamToggleGroupModule],
    })

    fixture = TestBed.createComponent(TestHostComponent)
    host = fixture.componentInstance
  })

  function buttons(): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('button'))
  }

  function classesFor(name: string): boolean[] {
    return buttons().map((b) => b.classList.contains(name))
  }

  it('reflects the selected state on the first pass for options added after the value is set', () => {
    fixture.detectChanges()

    host.values = ['a', 'b']
    fixture.detectChanges()

    expect(classesFor('is-selected')).toEqual([true, false])
  })

  it('applies the option host class on the first pass', () => {
    fixture.detectChanges()

    host.values = ['a', 'b']
    fixture.detectChanges()

    expect(classesFor('lib-toggle-group-option-selected')).toEqual([
      true,
      false,
    ])
  })

  // Toggling now updates the group's value synchronously, so no timer needs to
  // be flushed before a click takes effect.
  it('toggles selection on click without waiting for a timer', () => {
    host.values = ['a', 'b']
    fixture.detectChanges()

    buttons()[1].click()
    fixture.detectChanges()

    expect(host.control.value).toBe('b')
    expect(classesFor('is-selected')).toEqual([false, true])
  })

  it('unselects a selected option when selectionToggleable is true', () => {
    host.values = ['a', 'b']
    fixture.detectChanges()

    buttons()[0].click()
    fixture.detectChanges()

    expect(host.control.value).toBeFalsy()
    expect(classesFor('is-selected')).toEqual([false, false])
  })

  it('refuses to unselect the last option when selectionToggleable is false', () => {
    host.selectionToggleable = false
    host.values = ['a', 'b']
    fixture.detectChanges()

    buttons()[0].click()
    fixture.detectChanges()

    expect(host.control.value).toBe('a')
    expect(classesFor('is-selected')).toEqual([true, false])
  })

  describe('multiple', () => {
    beforeEach(() => {
      host.multiple = true
      host.control.setValue(['a'])
    })

    it('adds to the selection', () => {
      host.values = ['a', 'b']
      fixture.detectChanges()

      buttons()[1].click()
      fixture.detectChanges()

      expect(host.control.value).toEqual(['a', 'b'])
      expect(classesFor('is-selected')).toEqual([true, true])
    })

    // The guard exists to stop the selection being emptied, not to freeze every
    // selected option, so unselecting one of several must still work.
    it('still unselects one of several when selectionToggleable is false', () => {
      host.selectionToggleable = false
      host.control.setValue(['a', 'b'])
      host.values = ['a', 'b']
      fixture.detectChanges()

      buttons()[1].click()
      fixture.detectChanges()

      expect(host.control.value).toEqual(['a'])

      // ...but the last one is held.
      buttons()[0].click()
      fixture.detectChanges()

      expect(host.control.value).toEqual(['a'])
    })
  })

  // `isSelected` caches the selection as a Set. These pin the invalidation
  // paths, including `[value]`, which writes the backing field directly and
  // never goes through the `value` setter.
  describe('selection cache', () => {
    @Component({
      template: `
        <div
          seamToggleGroup
          #tg="seamToggleGroup"
          [value]="val"
          [multiple]="multiple"
        >
          <button
            *ngFor="let v of values"
            type="button"
            [seamToggleGroupOption]="v"
            [class.is-selected]="tg.isSelected(v)"
          >
            {{ v }}
          </button>
        </div>
      `,
      standalone: false,
    })
    class ValueInputHostComponent {
      val: string | string[] | undefined = 'a'
      values = ['a', 'b']
      multiple = false
    }

    let f: ComponentFixture<ValueInputHostComponent>

    beforeEach(() => {
      TestBed.resetTestingModule()
      TestBed.configureTestingModule({
        declarations: [ValueInputHostComponent],
        imports: [CommonModule, ReactiveFormsModule, TheSeamToggleGroupModule],
      })
      f = TestBed.createComponent(ValueInputHostComponent)
    })

    function selected(): boolean[] {
      return Array.from<HTMLElement>(
        f.nativeElement.querySelectorAll('button'),
      ).map((b) => b.classList.contains('is-selected'))
    }

    it('refreshes when the [value] input changes', () => {
      f.detectChanges()
      expect(selected()).toEqual([true, false])

      f.componentInstance.val = 'b'
      f.detectChanges()

      expect(selected()).toEqual([false, true])
    })

    it('refreshes when the multiple input changes', () => {
      f.componentInstance.val = ['a', 'b']
      f.detectChanges()
      // Not multiple, and an array of length 2 selects nothing.
      expect(selected()).toEqual([false, false])

      f.componentInstance.multiple = true
      f.detectChanges()

      expect(selected()).toEqual([true, true])
    })

    it('does not report a null or undefined value as selected', () => {
      f.componentInstance.val = undefined
      f.detectChanges()

      const grp = f.debugElement.children[0].injector.get(ToggleGroupDirective)
      expect(grp.isSelected(undefined)).toBe(false)
      expect(grp.isSelected(null)).toBe(false)
      expect(selected()).toEqual([false, false])
    })
  })
})
