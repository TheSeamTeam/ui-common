import { Component, TemplateRef, ViewChild } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { OverlayModule } from '@angular/cdk/overlay'
import { A11yModule } from '@angular/cdk/a11y'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'

import userEvent from '@testing-library/user-event'

import { SeamTooltipDirective } from './tooltip.directive'
import { TooltipModule } from './tooltip.module'

@Component({
  template: `
    <button
      seamTooltip="Test tooltip"
      [placement]="placement"
      [disableTooltip]="disabled"
      [showDelay]="showDelay"
      [hideDelay]="hideDelay"
      [trigger]="trigger"
      [tooltipClass]="tooltipClass">
      Test Button
    </button>

    <button
      [seamTooltip]="templateTooltip"
      placement="bottom">
      Template Button
    </button>

    <ng-template #templateTooltip>
      <div>
        <strong>Template Content</strong>
        <ul>
          <li>Item 1</li>
          <li>Item 2</li>
        </ul>
      </div>
    </ng-template>
  `
})
class TestComponent {
  @ViewChild('templateTooltip', { static: true }) templateTooltip!: TemplateRef<any>

  placement = 'top'
  disabled = false
  showDelay = 100
  hideDelay = 50
  trigger = 'both'
  tooltipClass = 'custom-tooltip'
}

describe('SeamTooltipDirective', () => {
  let component: TestComponent
  let fixture: ComponentFixture<TestComponent>
  let buttonElement: HTMLElement
  let templateButtonElement: HTMLElement

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        TooltipModule,
        OverlayModule,
        A11yModule,
        NoopAnimationsModule
      ]
    }).compileComponents()

    fixture = TestBed.createComponent(TestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    buttonElement = fixture.nativeElement.querySelector('button')
    templateButtonElement = fixture.nativeElement.querySelectorAll('button')[1]
  })

  afterEach(() => {
    // Clean up any open tooltips
    const tooltips = document.querySelectorAll('.tooltip')
    tooltips.forEach(tooltip => tooltip.remove())
  })

  describe('Basic Functionality', () => {
    it('should create directive', () => {
      expect(buttonElement).toBeTruthy()
    })

    it('should have correct default values', () => {
      const directive = fixture.debugElement.children[0].injector.get(SeamTooltipDirective)
      expect(directive.placement).toBe('top')
      expect(directive.disableTooltip).toBe(false)
      expect(directive.showDelay).toBe(100)
      expect(directive.hideDelay).toBe(50)
      expect(directive.trigger).toBe('both')
    })

    it('should set aria-describedby when tooltip is open', async () => {
      const user = userEvent.setup({ delay: null })
      await user.hover(buttonElement)

      // Wait for tooltip to appear
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      expect(buttonElement.getAttribute('aria-describedby')).toContain('seam-tooltip-')
    })
  })

  describe('Mouse Interactions', () => {
    it('should show tooltip on mouseenter', async () => {
      const user = userEvent.setup({ delay: null })
      await user.hover(buttonElement)

      // Wait for tooltip to appear
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()
      expect(tooltip?.textContent?.trim()).toBe('Test tooltip')
    })

    it('should hide tooltip on mouseleave', async () => {
      const user = userEvent.setup({ delay: null })

      // Show tooltip first
      await user.hover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      let tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()

      // Hide tooltip
      await user.unhover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 300)) // Increased wait time
      fixture.detectChanges()

      // Check if tooltip is hidden or removed
      tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()
    })

    it('should respect show delay', async () => {
      const user = userEvent.setup({ delay: null })
      component.showDelay = 500
      fixture.detectChanges()

      await user.hover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 400)) // Less than show delay
      fixture.detectChanges()

      let tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()

      await new Promise(resolve => setTimeout(resolve, 200)) // Complete the delay
      fixture.detectChanges()

      tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()
    })

    it('should respect hide delay', async () => {
      const user = userEvent.setup({ delay: null })
      component.hideDelay = 300
      fixture.detectChanges()

      // Show tooltip
      await user.hover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      // Start hiding
      await user.unhover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200)) // Less than hide delay
      fixture.detectChanges()

      let tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()

      await new Promise(resolve => setTimeout(resolve, 200)) // Complete the delay
      fixture.detectChanges()

      tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()
    })
  })

  describe('Focus Interactions', () => {
    it('should show tooltip on focus', async () => {
      const user = userEvent.setup({ delay: null })
      await user.click(buttonElement) // This will focus the button

      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()
    })

    it('should hide tooltip on blur', async () => {
      const user = userEvent.setup({ delay: null })

      // Show tooltip
      await user.click(buttonElement) // Focus
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      // Hide tooltip
      await user.tab() // This will blur the button
      await new Promise(resolve => setTimeout(resolve, 100))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()
    })
  })

  describe('Trigger Types', () => {
    it('should only respond to hover when trigger is "hover"', async () => {
      const user = userEvent.setup({ delay: null })
      component.trigger = 'hover'
      fixture.detectChanges()

      // Focus should not show tooltip
      await user.click(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      let tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()

      // Hover should show tooltip
      await user.hover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()
    })

    it('should only respond to focus when trigger is "focus"', async () => {
      const user = userEvent.setup({ delay: null })
      component.trigger = 'focus'
      fixture.detectChanges()

      // Hover should not show tooltip
      await user.hover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      let tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()

      // Focus should show tooltip
      await user.click(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()
    })
  })

  describe('Disabled State', () => {
    it('should not show tooltip when disabled', async () => {
      const user = userEvent.setup({ delay: null })
      component.disabled = true
      fixture.detectChanges()

      await user.hover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()
    })
  })

  describe('Placement', () => {
    it('should apply correct placement class', async () => {
      const user = userEvent.setup({ delay: null })
      component.placement = 'bottom'
      fixture.detectChanges()

      await user.hover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip?.classList.contains('bs-tooltip-bottom')).toBe(true)
    })
  })

  describe('Custom Classes', () => {
    it('should apply custom tooltip class', async () => {
      const user = userEvent.setup({ delay: null })
      await user.hover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltipInner = document.querySelector('.tooltip-inner')
      expect(tooltipInner?.classList.contains('custom-tooltip')).toBe(true)
    })
  })

  describe('Template Content', () => {
    it('should display template content', async () => {
      const user = userEvent.setup({ delay: null })
      await user.hover(templateButtonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()
      expect(tooltip?.textContent).toContain('Template Content')
      expect(tooltip?.textContent).toContain('Item 1')
      expect(tooltip?.textContent).toContain('Item 2')
    })
  })

  describe('Keyboard Interactions', () => {
    it('should hide tooltip on Escape key', async () => {
      const user = userEvent.setup({ delay: null })

      // Show tooltip
      await user.hover(buttonElement)
      await new Promise(resolve => setTimeout(resolve, 200))
      fixture.detectChanges()

      let tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()

      // Press Escape
      await user.keyboard('{Escape}')
      await new Promise(resolve => setTimeout(resolve, 100))
      fixture.detectChanges()

      tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()
    })
  })
})
