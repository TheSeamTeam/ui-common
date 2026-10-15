import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'

import { TheSeamGuideTargetRegistry } from './guide-target-registry'
import { registerGuideTargetHost } from './register-guide-target-host'

@Component({
  selector: 'seam-test-host-target',
  template: 'host',
})
class HostTargetComponent {
  constructor() {
    registerGuideTargetHost('host-target')
  }
}

describe('registerGuideTargetHost', () => {
  it('registers the host once rendered, and unregisters it on destroy', () => {
    const fixture = TestBed.createComponent(HostTargetComponent)
    const registry = TestBed.inject(TheSeamGuideTargetRegistry)
    document.body.appendChild(fixture.nativeElement)

    fixture.detectChanges()
    expect(registry.resolve('host-target')).toBe(fixture.nativeElement)

    fixture.destroy()
    expect(registry.resolve('host-target')).toBeNull()
  })
})
