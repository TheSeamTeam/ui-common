import { Component, TemplateRef, ViewChild } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { OverlayModule } from '@angular/cdk/overlay'
import { A11yModule } from '@angular/cdk/a11y'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'

import userEvent from '@testing-library/user-event'

import { TheSeamTooltipDirective } from './tooltip.directive'
import { TheSeamTooltipModule } from './tooltip.module'
import { TheSeamTooltipHarness } from './testing/tooltip.harness'

@Component({
  template: `
    <button
      id="main-button"
      [seamTooltip]="content"
      [placement]="placement"
      [disableTooltip]="disabled"
      [showDelay]="showDelay"
      [hideDelay]="hideDelay"
      [trigger]="trigger"
      [tooltipClass]="tooltipClass"
    >
      Test Button
    </button>

    <button [seamTooltip]="templateTooltip" placement="bottom">
      Template Button
    </button>

    <button
      id="described-button"
      seamTooltip="Described tooltip"
      aria-describedby="existing-description"
      [showDelay]="0"
    >
      Described Button
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
  `,
  standalone: false,
})
class TestComponent {
  @ViewChild('templateTooltip', { static: true })
  templateTooltip!: TemplateRef<any>

  content: string | null = 'Test tooltip'
  placement = 'top'
  disabled = false
  showDelay = 100
  hideDelay = 50
  trigger = 'both'
  tooltipClass = 'custom-tooltip'
}

describe('TheSeamTooltipDirective', () => {
  let component: TestComponent
  let fixture: ComponentFixture<TestComponent>
  let buttonElement: HTMLElement
  let templateButtonElement: HTMLElement

  // Helper function to wait for tooltip to be fully shown
  const waitForTooltipShow = async (timeout = 1000) => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
      const tooltip = document.querySelector('.tooltip.show:not(.ng-animating)')
      if (tooltip) {
        return tooltip
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    return null
  }

  // Helper function to wait for tooltip to be fully hidden/removed
  const waitForTooltipHide = async (timeout = 1000) => {
    const startTime = Date.now()
    while (Date.now() - startTime < timeout) {
      const tooltip = document.querySelector('.tooltip.show')
      if (!tooltip) {
        return true
      }
      await new Promise((resolve) => setTimeout(resolve, 50))
    }
    return false
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        TheSeamTooltipModule,
        OverlayModule,
        A11yModule,
        NoopAnimationsModule,
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(TestComponent)
    component = fixture.componentInstance
    fixture.detectChanges()

    buttonElement = fixture.nativeElement.querySelector('button')
    templateButtonElement = fixture.nativeElement.querySelectorAll('button')[1]
  })

  afterEach(async () => {
    // Force close any active tooltips through the directive
    const directive = fixture.debugElement.children[0].injector.get(
      TheSeamTooltipDirective,
    )
    if (directive.tooltipOpen()) {
      directive.ngOnDestroy() // This will trigger cleanup
    }

    // Clean up any remaining DOM elements
    const tooltips = document.querySelectorAll('.tooltip')
    tooltips.forEach((tooltip) => tooltip.remove())

    // Wait for cleanup to complete
    await new Promise((resolve) => setTimeout(resolve, 150))
    fixture.detectChanges()
  })

  describe('Basic Functionality', () => {
    it('should create directive', () => {
      expect(buttonElement).toBeTruthy()
    })

    it('should have correct default values', () => {
      const directive = fixture.debugElement.children[0].injector.get(
        TheSeamTooltipDirective,
      )
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
      await new Promise((resolve) => setTimeout(resolve, 200))
      fixture.detectChanges()

      expect(buttonElement.getAttribute('aria-describedby')).toContain(
        'seam-tooltip-',
      )
    })
  })

  describe('Mouse Interactions', () => {
    it('should show tooltip on mouseenter', async () => {
      const user = userEvent.setup({ delay: null })
      await user.hover(buttonElement)

      // Wait for tooltip to appear
      await new Promise((resolve) => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()
      expect(tooltip?.textContent?.trim()).toBe('Test tooltip')
    })

    it('should hide tooltip on mouseleave', async () => {
      const user = userEvent.setup({ delay: null })

      // Show tooltip first
      await user.hover(buttonElement)
      const tooltip = await waitForTooltipShow()
      expect(tooltip).toBeTruthy()

      // Hide tooltip
      await user.unhover(buttonElement)
      const isHidden = await waitForTooltipHide()
      expect(isHidden).toBe(true)
    })

    it('should respect show delay', async () => {
      const user = userEvent.setup({ delay: null })
      component.showDelay = 500
      fixture.detectChanges()

      await user.hover(buttonElement)
      await new Promise((resolve) => setTimeout(resolve, 400)) // Less than show delay
      fixture.detectChanges()

      let tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()

      await new Promise((resolve) => setTimeout(resolve, 200)) // Complete the delay
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
      const tooltip = await waitForTooltipShow()
      expect(tooltip).toBeTruthy()

      // Start hiding
      await user.unhover(buttonElement)
      await new Promise((resolve) => setTimeout(resolve, 200)) // Less than hide delay
      fixture.detectChanges()

      const stillVisible = document.querySelector('.tooltip.show')
      expect(stillVisible).toBeTruthy()

      // Wait for hide delay to complete
      const isHidden = await waitForTooltipHide()
      expect(isHidden).toBe(true)
    })
  })

  describe('Focus Interactions', () => {
    it('should show tooltip on focus', async () => {
      // Use direct focus to avoid mouse hover simulation
      buttonElement.focus()
      fixture.detectChanges()

      await new Promise((resolve) => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeTruthy()
    })

    it('should hide tooltip on blur', async () => {
      // Show tooltip with direct focus
      buttonElement.focus()
      fixture.detectChanges()
      const tooltip = await waitForTooltipShow()
      expect(tooltip).toBeTruthy()

      // Hide tooltip with direct blur
      buttonElement.blur()
      fixture.detectChanges()
      const isHidden = await waitForTooltipHide()
      expect(isHidden).toBe(true)
    })
  })

  describe('Trigger Types', () => {
    it('should only respond to hover when trigger is "hover"', async () => {
      const user = userEvent.setup({ delay: null })

      // Force cleanup of any existing tooltips
      const existingTooltips = document.querySelectorAll('.tooltip')
      existingTooltips.forEach((tooltip) => tooltip.remove())
      await new Promise((resolve) => setTimeout(resolve, 100))

      component.trigger = 'hover'
      fixture.detectChanges()

      const tooltipBefore = document.querySelector('.tooltip.show')
      expect(tooltipBefore).toBeFalsy()

      // Focus should not show tooltip (use direct focus to avoid hover)
      buttonElement.focus()
      fixture.detectChanges()
      await new Promise((resolve) => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()

      // Hover should show tooltip
      await user.hover(buttonElement)
      const shownTooltip = await waitForTooltipShow()
      expect(shownTooltip).toBeTruthy()
    })

    it('should only respond to focus when trigger is "focus"', async () => {
      const user = userEvent.setup({ delay: null })

      // Force cleanup of any existing tooltips
      const existingTooltips = document.querySelectorAll('.tooltip')
      existingTooltips.forEach((tooltip) => tooltip.remove())
      await new Promise((resolve) => setTimeout(resolve, 100))

      component.trigger = 'focus'
      fixture.detectChanges()

      // Hover should not show tooltip
      await user.hover(buttonElement)
      await new Promise((resolve) => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip).toBeFalsy()

      // Focus should show tooltip (use direct focus to avoid hover)
      buttonElement.focus()
      fixture.detectChanges()
      const shownTooltip = await waitForTooltipShow()
      expect(shownTooltip).toBeTruthy()
    })
  })

  describe('Disabled State', () => {
    it('should not show tooltip when disabled', async () => {
      const user = userEvent.setup({ delay: null })
      component.disabled = true
      fixture.detectChanges()

      await user.hover(buttonElement)
      await new Promise((resolve) => setTimeout(resolve, 200))
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
      await new Promise((resolve) => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip?.classList.contains('bs-tooltip-bottom')).toBe(true)
    })
  })

  describe('Custom Classes', () => {
    it('should apply custom tooltip class', async () => {
      const user = userEvent.setup({ delay: null })
      await user.hover(buttonElement)
      await new Promise((resolve) => setTimeout(resolve, 200))
      fixture.detectChanges()

      const tooltipInner = document.querySelector('.tooltip-inner')
      expect(tooltipInner?.classList.contains('custom-tooltip')).toBe(true)
    })
  })

  describe('Template Content', () => {
    it('should display template content', async () => {
      const user = userEvent.setup({ delay: null })

      // Force cleanup of any existing tooltips
      const existingTooltips = document.querySelectorAll('.tooltip')
      existingTooltips.forEach((tooltip) => tooltip.remove())
      await new Promise((resolve) => setTimeout(resolve, 100))

      await user.hover(templateButtonElement)

      const tooltip = await waitForTooltipShow()
      expect(tooltip).toBeTruthy()

      // Wait a bit more for template content to render
      await new Promise((resolve) => setTimeout(resolve, 100))
      fixture.detectChanges()

      expect(tooltip?.textContent).toContain('Template Content')
      expect(tooltip?.textContent).toContain('Item 1')
      expect(tooltip?.textContent).toContain('Item 2')
    })
  })

  describe('Keyboard Interactions', () => {
    it('should hide tooltip on Escape key', async () => {
      const user = userEvent.setup({ delay: null })

      // Force cleanup of any existing tooltips
      const existingTooltips = document.querySelectorAll('.tooltip')
      existingTooltips.forEach((tooltip) => tooltip.remove())
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Show tooltip
      await user.hover(buttonElement)
      const tooltip = await waitForTooltipShow()
      expect(tooltip).toBeTruthy()

      // Press Escape
      await user.keyboard('{Escape}')
      const isHidden = await waitForTooltipHide()
      expect(isHidden).toBe(true)
    })
  })

  describe('Placement Fallbacks', () => {
    it('should try the specified placement before the auto placements', async () => {
      const user = userEvent.setup({ delay: null })
      component.placement = 'right auto'
      fixture.detectChanges()

      await user.hover(buttonElement)
      const tooltip = await waitForTooltipShow()
      fixture.detectChanges()

      expect(tooltip?.classList.contains('bs-tooltip-right')).toBe(true)
    })

    it('should use the auto placements when only "auto" is given', async () => {
      const user = userEvent.setup({ delay: null })
      component.placement = 'auto'
      fixture.detectChanges()

      await user.hover(buttonElement)
      const tooltip = await waitForTooltipShow()
      fixture.detectChanges()

      expect(tooltip?.classList.contains('bs-tooltip-top')).toBe(true)
    })
  })

  describe('Updating While Open', () => {
    const showMainTooltip = async (user = userEvent.setup({ delay: null })) => {
      await user.hover(buttonElement)
      const tooltip = await waitForTooltipShow()
      expect(tooltip).toBeTruthy()
      return tooltip
    }

    it('should update the content', async () => {
      await showMainTooltip()

      component.content = 'Updated tooltip'
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip?.textContent?.trim()).toBe('Updated tooltip')
    })

    it('should update the tooltip class', async () => {
      await showMainTooltip()

      component.tooltipClass = 'other-tooltip'
      fixture.detectChanges()

      const tooltipInner = document.querySelector('.tooltip-inner')
      expect(tooltipInner?.classList.contains('other-tooltip')).toBe(true)
      expect(tooltipInner?.classList.contains('custom-tooltip')).toBe(false)
    })

    it('should update the placement', async () => {
      await showMainTooltip()

      component.placement = 'bottom'
      fixture.detectChanges()

      const tooltip = document.querySelector('.tooltip.show')
      expect(tooltip?.classList.contains('bs-tooltip-bottom')).toBe(true)
    })

    it('should close when the content is cleared', async () => {
      await showMainTooltip()

      component.content = null
      fixture.detectChanges()

      expect(await waitForTooltipHide()).toBe(true)
    })

    it('should close when disabled', async () => {
      await showMainTooltip()

      component.disabled = true
      fixture.detectChanges()

      expect(await waitForTooltipHide()).toBe(true)
    })

    it('should not be closed by the exit animation of a previous tooltip', async () => {
      const user = userEvent.setup({ delay: null })
      const directive = fixture.debugElement.children[0].injector.get(
        TheSeamTooltipDirective,
      )

      await showMainTooltip(user)
      const previousTooltip = (directive as any)._compRef.instance

      await user.unhover(buttonElement)
      expect(await waitForTooltipHide()).toBe(true)

      await showMainTooltip(user)
      previousTooltip._onAnimationDone({ toState: 'void' })

      expect(directive.tooltipOpen()).toBe(true)
      expect(document.querySelector('.tooltip.show')).toBeTruthy()
    })
  })

  describe('aria-describedby', () => {
    it('should keep existing ids while open and restore them when closed', async () => {
      const user = userEvent.setup({ delay: null })
      const describedButton = fixture.nativeElement.querySelector(
        '#described-button',
      ) as HTMLElement

      expect(describedButton.getAttribute('aria-describedby')).toBe(
        'existing-description',
      )

      await user.hover(describedButton)
      const tooltip = await waitForTooltipShow()
      expect(tooltip).toBeTruthy()

      const ids = describedButton.getAttribute('aria-describedby')!.split(' ')
      expect(ids).toContain('existing-description')
      expect(ids).toContain(tooltip!.id)

      await user.unhover(describedButton)
      expect(await waitForTooltipHide()).toBe(true)
      expect(describedButton.getAttribute('aria-describedby')).toBe(
        'existing-description',
      )
    })

    it('should remove the attribute when there were no existing ids', async () => {
      const user = userEvent.setup({ delay: null })
      await user.hover(buttonElement)
      expect(await waitForTooltipShow()).toBeTruthy()

      await user.unhover(buttonElement)
      expect(await waitForTooltipHide()).toBe(true)
      expect(buttonElement.hasAttribute('aria-describedby')).toBe(false)
    })
  })

  describe('Harness', () => {
    it('should find a trigger with a bound seamTooltip input', async () => {
      const loader = TestbedHarnessEnvironment.loader(fixture)
      const harness = await loader.getHarness(
        TheSeamTooltipHarness.with({ selector: '#main-button' }),
      )

      await harness.hover()
      await harness.waitForTooltipToShow()

      expect(await harness.getVisibleTooltipText()).toBe('Test tooltip')
    })

    it('should find the tooltip when aria-describedby has other ids', async () => {
      const loader = TestbedHarnessEnvironment.loader(fixture)
      const harness = await loader.getHarness(
        TheSeamTooltipHarness.with({ selector: '#described-button' }),
      )

      await harness.hover()
      await harness.waitForTooltipToShow()

      expect(await harness.getVisibleTooltipText()).toBe('Described tooltip')
    })

    it('should find every trigger', async () => {
      const loader = TestbedHarnessEnvironment.loader(fixture)
      const harnesses = await loader.getAllHarnesses(TheSeamTooltipHarness)
      expect(harnesses.length).toBe(3)
    })
  })
})
