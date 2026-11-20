import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'

import { TheSeamGuideTargetRegistry } from './guide-target-registry'
import { TheSeamGuideTargetDirective } from './guide-target.directive'

@Component({
  standalone: true,
  imports: [TheSeamGuideTargetDirective],
  template: `
    @if (show()) {
      <div [seamGuideTarget]="name()">target</div>
    }
  `,
})
class HostComponent {
  readonly show = signal(true)
  readonly name = signal('alpha')
}

describe('TheSeamGuideTargetDirective', () => {
  let registry: TheSeamGuideTargetRegistry

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] })
    registry = TestBed.inject(TheSeamGuideTargetRegistry)
  })

  it('registers its host element on init', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()

    const resolved = registry.resolve('alpha')
    expect(resolved).not.toBeNull()
    expect(resolved?.textContent).toBe('target')
  })

  it('unregisters when the host element is destroyed', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()
    expect(registry.resolve('alpha')).not.toBeNull()

    fixture.componentInstance.show.set(false)
    fixture.detectChanges()

    expect(registry.resolve('alpha')).toBeNull()
  })

  it('moves its registration when the name changes', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()

    fixture.componentInstance.name.set('beta')
    fixture.detectChanges()

    expect(registry.resolve('alpha')).toBeNull()
    expect(registry.resolve('beta')).not.toBeNull()
  })

  it('registers again after being destroyed and recreated', () => {
    const fixture = TestBed.createComponent(HostComponent)
    fixture.detectChanges()
    const first = registry.resolve('alpha')

    fixture.componentInstance.show.set(false)
    fixture.detectChanges()
    fixture.componentInstance.show.set(true)
    fixture.detectChanges()

    const second = registry.resolve('alpha')
    expect(second).not.toBeNull()
    expect(second).not.toBe(first)
  })
})
