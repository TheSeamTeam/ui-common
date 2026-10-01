import { Component, ViewChild } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import { DataFilter } from '../../data-filter'
import {
  DataFilterContainer,
  THESEAM_DATA_FILTER_CONTAINER,
} from '../../data-filter-container'
import { TheSeamDataFiltersModule } from '../../data-filters.module'
import {
  DataFilterToggleButtonsComponent,
  IToggleButton,
} from './data-filter-toggle-buttons.component'

class MockDataFilterContainer implements DataFilterContainer {
  private readonly _filters: DataFilter[] = []
  filters(): DataFilter[] {
    return this._filters
  }
  addFilter(dataFilter: DataFilter): void {
    this._filters.push(dataFilter)
  }
  removeFilter(dataFilter: DataFilter): void {
    const idx = this._filters.indexOf(dataFilter)
    if (idx !== -1) {
      this._filters.splice(idx, 1)
    }
  }
}

@Component({
  template: `
    <seam-data-filter-toggle-buttons
      [buttons]="buttons"
      [value]="value"
      forceCollapseState="collapsed"
    ></seam-data-filter-toggle-buttons>
  `,
  standalone: false,
})
class TestHostComponent {
  buttons: IToggleButton[] = []
  value: string | string[] = ''

  @ViewChild(DataFilterToggleButtonsComponent, { static: true })
  filter!: DataFilterToggleButtonsComponent
}

describe('DataFilterToggleButtonsComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>
  let host: TestHostComponent

  beforeAll(() => {
    // jsdom has no ResizeObserver, and `ngAfterViewInit` constructs one.
    ;(window as any).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [TheSeamDataFiltersModule, NoopAnimationsModule],
      providers: [
        {
          provide: THESEAM_DATA_FILTER_CONTAINER,
          useClass: MockDataFilterContainer,
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(TestHostComponent)
    host = fixture.componentInstance
  })

  it('updates activeFilterLabel when buttons arrive after the value is set', () => {
    host.value = 'a'
    fixture.detectChanges()

    const emitted: string[] = []
    const sub = host.filter.activeFilterLabel.subscribe((v) => emitted.push(v))

    // Baseline: no buttons yet, so the label falls back to the dropdown label.
    expect(emitted[emitted.length - 1]).toBe('Select Filter')

    host.buttons = [{ name: 'Alpha', value: 'a' }]
    fixture.detectChanges()

    expect(emitted[emitted.length - 1]).toBe('Alpha')

    sub.unsubscribe()
  })

  it('renders the selected label in the collapsed dropdown button', () => {
    host.value = 'a'
    fixture.detectChanges()

    host.buttons = [{ name: 'Alpha', value: 'a' }]
    fixture.detectChanges()

    const toggleBtn: HTMLElement = fixture.nativeElement.querySelector(
      '.toggle-buttons-filter__collapsed-button',
    )
    expect(toggleBtn.textContent?.trim()).toBe('Alpha')
  })

  it('applies a late-arriving button comparator in filter()', () => {
    host.value = 'big'
    fixture.detectChanges()

    const data = [{ n: 1 }, { n: 5 }, { n: 10 }]
    const results: { n: number }[][] = []
    const sub = host.filter.filter(data).subscribe((d) => results.push(d))

    // Deliberately not asserting the no-buttons result: what matters here is
    // that a late `buttons` list causes filter() to re-emit with the button's
    // comparator applied.
    const emissionsBeforeButtons = results.length

    host.buttons = [
      {
        name: 'Big',
        value: 'big',
        comparator: (_v: any, row: any) => (row.n >= 5 ? 0 : -1),
      },
    ]
    fixture.detectChanges()

    expect(results.length).toBeGreaterThan(emissionsBeforeButtons)
    expect(results[results.length - 1]).toEqual([{ n: 5 }, { n: 10 }])

    sub.unsubscribe()
  })
})
