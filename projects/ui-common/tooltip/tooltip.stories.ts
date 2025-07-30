import { expect } from '@storybook/jest'
import type { Meta, StoryObj } from '@storybook/angular'
import { applicationConfig, moduleMetadata } from '@storybook/angular'

import { Component, TemplateRef, ViewChild } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'

import { getHarness } from '@theseam/ui-common/testing'

import { TooltipModule } from './tooltip.module'
import { TooltipHarness } from './testing/tooltip.harness'

@Component({
  selector: 'tooltip-story-wrapper',
  template: `
    <div style="padding: 100px; display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
      <ng-content></ng-content>
    </div>

    <!-- Template for complex tooltip content -->
    <ng-template #complexTooltip>
      <div>
        <strong>Complex Tooltip</strong>
        <ul style="margin: 5px 0; padding-left: 15px;">
          <li>Feature 1</li>
          <li>Feature 2</li>
          <li>Feature 3</li>
        </ul>
        <small><em>Click for more info</em></small>
      </div>
    </ng-template>

    <ng-template #iconTooltip>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="color: #28a745;">✓</span>
        <span>Success! Operation completed.</span>
      </div>
    </ng-template>
  `
})
class TooltipStoryWrapper {
  @ViewChild('complexTooltip', { static: true }) complexTooltip!: TemplateRef<any>
  @ViewChild('iconTooltip', { static: true }) iconTooltip!: TemplateRef<any>
}

const meta: Meta = {
  title: 'Tooltip/Components',
  component: TooltipStoryWrapper,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [TooltipModule],
      declarations: [TooltipStoryWrapper]
    })
  ],
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
# Tooltip Directive

A custom tooltip directive that replaces \`ngbTooltip\` with zero dependencies.
Supports both string and template content with full Bootstrap 4.6 compatibility.

## Features
- **String & Template Content**: Support for both simple text and complex HTML content
- **Multiple Triggers**: Hover, focus, or both
- **Flexible Positioning**: 12 placement options with auto-fallback
- **Configurable Timing**: Customizable show/hide delays
- **Bootstrap Compatible**: Uses Bootstrap 4.6 classes for seamless integration
- **Accessibility**: Full ARIA support and keyboard navigation
- **Performance**: Lazy creation and proper cleanup

## Migration from ngbTooltip
\`\`\`typescript
// Before
<button ngbTooltip="Help text" placement="top" tooltipClass="custom">

// After
<button seamTooltip="Help text" placement="top" tooltipClass="custom">
\`\`\`
        `
      }
    }
  }
}

export default meta
type Story = StoryObj<TooltipStoryWrapper>

export const BasicTooltips: Story = {
  render: () => ({
    template: `
      <tooltip-story-wrapper>
        <button class="btn btn-primary" seamTooltip="Simple tooltip text">
          Hover me
        </button>

        <button class="btn btn-secondary" seamTooltip="This is a longer tooltip that demonstrates how the tooltip handles more text content">
          Long tooltip
        </button>

        <button class="btn btn-success" seamTooltip="Quick tooltip" [showDelay]="100" [hideDelay]="50">
          Fast tooltip
        </button>

        <button class="btn btn-warning" seamTooltip="Slow tooltip" [showDelay]="1000" [hideDelay]="500">
          Slow tooltip
        </button>
      </tooltip-story-wrapper>
    `
  }),
  play: async ({ canvasElement, fixture }) => {
    const harness = await getHarness(TooltipHarness, { canvasElement, fixture })

    // Test basic tooltip interaction - hover to show tooltip
    await harness.hover()
    await harness.waitForTooltipToShow()

    // Verify tooltip content is visible
    await expect(await harness.getVisibleTooltipText()).toBe('Simple tooltip text')
    await expect(await harness.isTooltipVisible()).toBe(true)

    // Hide tooltip
    await harness.mouseAway()
    await harness.waitForTooltipToHide()
    await expect(await harness.isTooltipVisible()).toBe(false)
  }
}

export const AllPlacements: Story = {
  render: () => ({
    template: `
      <tooltip-story-wrapper>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; max-width: 600px;">
          <button class="btn btn-outline-primary" seamTooltip="Top placement" placement="top">Top</button>
          <button class="btn btn-outline-primary" seamTooltip="Top start" placement="top-left">Top Start</button>
          <button class="btn btn-outline-primary" seamTooltip="Top end" placement="top-right">Top End</button>
          <button class="btn btn-outline-primary" seamTooltip="Auto placement" placement="auto">Auto</button>

          <button class="btn btn-outline-secondary" seamTooltip="Left placement" placement="left">Left</button>
          <button class="btn btn-outline-secondary" seamTooltip="Left start" placement="left-top">Left Start</button>
          <button class="btn btn-outline-secondary" seamTooltip="Left end" placement="left-bottom">Left End</button>
          <button class="btn btn-outline-info" seamTooltip="Right placement" placement="right">Right</button>

          <button class="btn btn-outline-info" seamTooltip="Right start" placement="right-top">Right Start</button>
          <button class="btn btn-outline-info" seamTooltip="Right end" placement="right-bottom">Right End</button>
          <button class="btn btn-outline-success" seamTooltip="Bottom placement" placement="bottom">Bottom</button>
          <button class="btn btn-outline-success" seamTooltip="Bottom start" placement="bottom-left">Bottom Start</button>

          <button class="btn btn-outline-success" seamTooltip="Bottom end" placement="bottom-right">Bottom End</button>
        </div>
      </tooltip-story-wrapper>
    `
  }),
  play: async ({ canvasElement, fixture }) => {
    // Test tooltip visibility for different placements
    const topHarness = await getHarness(TooltipHarness, { canvasElement, fixture })

    await topHarness.hover()
    await topHarness.waitForTooltipToShow()

    // Verify tooltip appears and has content
    await expect(await topHarness.isTooltipVisible()).toBe(true)
    await expect(await topHarness.getVisibleTooltipText()).toBe('Top placement')

    await topHarness.mouseAway()
    await topHarness.waitForTooltipToHide()
    await expect(await topHarness.isTooltipVisible()).toBe(false)
  }
}

export const TriggerTypes: Story = {
  render: () => ({
    template: `
      <tooltip-story-wrapper>
        <button class="btn btn-primary" seamTooltip="Hover only" trigger="hover">
          Hover Only
        </button>

        <button class="btn btn-secondary" seamTooltip="Focus only" trigger="focus">
          Focus Only (Tab to me)
        </button>

        <button class="btn btn-success" seamTooltip="Both hover and focus" trigger="both">
          Both Triggers
        </button>

        <input type="text" class="form-control" style="width: 200px;"
               seamTooltip="Input field tooltip" trigger="focus"
               placeholder="Focus me for tooltip">
      </tooltip-story-wrapper>
    `
  }),
  play: async ({ canvasElement, fixture }) => {
    // Test hover-only trigger
    const hoverOnlyHarness = await getHarness(TooltipHarness, { canvasElement, fixture })

    await hoverOnlyHarness.hover()
    await hoverOnlyHarness.waitForTooltipToShow()
    await expect(await hoverOnlyHarness.isTooltipVisible()).toBe(true)
    await expect(await hoverOnlyHarness.getVisibleTooltipText()).toBe('Hover only')

    await hoverOnlyHarness.mouseAway()
    await hoverOnlyHarness.waitForTooltipToHide()
    await expect(await hoverOnlyHarness.isTooltipVisible()).toBe(false)
  }
}

export const TemplateContent: Story = {
  render: () => ({
    template: `
      <tooltip-story-wrapper #wrapper>
        <button class="btn btn-info" [seamTooltip]="wrapper.complexTooltip">
          Complex Content
        </button>

        <button class="btn btn-success" [seamTooltip]="wrapper.iconTooltip">
          With Icon
        </button>

        <button class="btn btn-warning" [seamTooltip]="customTemplate">
          Custom Template
        </button>

        <ng-template #customTemplate>
          <div style="text-align: center;">
            <div style="font-weight: bold; color: #ff6b35;">⚠️ Warning</div>
            <div style="margin: 5px 0;">This action cannot be undone</div>
            <div style="font-size: 0.8em; color: #666;">
              <kbd>Ctrl+Z</kbd> won't work here
            </div>
          </div>
        </ng-template>
      </tooltip-story-wrapper>
    `
  })
}

export const CustomStyling: Story = {
  render: () => ({
    template: `
      <tooltip-story-wrapper>
        <button class="btn btn-primary" seamTooltip="Default styling">
          Default
        </button>

        <button class="btn btn-secondary" seamTooltip="Custom class applied"
                tooltipClass="bg-danger text-white">
          Custom Class
        </button>

        <button class="btn btn-success" seamTooltip="Large tooltip with custom styling"
                tooltipClass="bg-dark text-light border border-warning"
                style="margin: 10px;">
          Dark Theme
        </button>

        <button class="btn btn-warning" seamTooltip="Small tooltip"
                tooltipClass="small bg-info text-white">
          Small Text
        </button>
      </tooltip-story-wrapper>
    `
  })
}

export const DisabledState: Story = {
  render: () => ({
    template: `
      <tooltip-story-wrapper>
        <button class="btn btn-primary" seamTooltip="This tooltip works">
          Enabled Tooltip
        </button>

        <button class="btn btn-secondary" seamTooltip="This won't show" [disableTooltip]="true">
          Disabled Tooltip
        </button>

        <button class="btn btn-outline-secondary" disabled seamTooltip="Disabled button with tooltip">
          Disabled Button
        </button>
      </tooltip-story-wrapper>
    `
  }),
  play: async ({ canvasElement, fixture }) => {
    // Test enabled tooltip works
    const enabledHarness = await getHarness(TooltipHarness, { canvasElement, fixture })

    await enabledHarness.hover()
    await enabledHarness.waitForTooltipToShow()
    await expect(await enabledHarness.isTooltipVisible()).toBe(true)
    await expect(await enabledHarness.getVisibleTooltipText()).toBe('This tooltip works')

    await enabledHarness.mouseAway()
    await enabledHarness.waitForTooltipToHide()
    await expect(await enabledHarness.isTooltipVisible()).toBe(false)
  }
}

export const DelayConfiguration: Story = {
  render: () => ({
    template: `
      <tooltip-story-wrapper>
        <button class="btn btn-primary" seamTooltip="No delay" [showDelay]="0" [hideDelay]="0">
          Default
        </button>

        <button class="btn btn-secondary" seamTooltip="Fast show, slow hide" [showDelay]="100" [hideDelay]="1000">
          Fast Show
        </button>

        <button class="btn btn-success" seamTooltip="Slow show, fast hide" [showDelay]="1500" [hideDelay]="100">
          Slow Show
        </button>

        <button class="btn btn-warning" seamTooltip="Both slow" [showDelay]="1000" [hideDelay]="1000">
          Both Slow
        </button>
      </tooltip-story-wrapper>
    `
  }),
  play: async ({ canvasElement, fixture }) => {
    // Test tooltip with no delay
    const defaultHarness = await getHarness(TooltipHarness, { canvasElement, fixture })

    await defaultHarness.hover()
    await defaultHarness.waitForTooltipToShow()
    await expect(await defaultHarness.isTooltipVisible()).toBe(true)
    await expect(await defaultHarness.getVisibleTooltipText()).toBe('No delay')

    await defaultHarness.mouseAway()
    await defaultHarness.waitForTooltipToHide()
    await expect(await defaultHarness.isTooltipVisible()).toBe(false)
  }
}

export const AccessibilityDemo: Story = {
  render: () => ({
    template: `
      <tooltip-story-wrapper>
        <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
          <button class="btn btn-primary" seamTooltip="Use Tab to navigate between elements">
            Tab Navigation
          </button>

          <button class="btn btn-secondary" seamTooltip="Press Escape to close tooltip">
            Escape Key
          </button>

          <button class="btn btn-success" seamTooltip="Screen readers will announce this tooltip"
                  trigger="focus">
            Screen Reader Friendly
          </button>

          <div style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h6>Accessibility Features:</h6>
            <ul style="text-align: left; margin: 10px 0;">
              <li><code>aria-describedby</code> attribute when tooltip is open</li>
              <li>Keyboard navigation support (Tab, Escape)</li>
              <li>Focus management and restoration</li>
              <li>Screen reader compatible</li>
              <li>Respects <code>prefers-reduced-motion</code></li>
            </ul>
          </div>
        </div>
      </tooltip-story-wrapper>
    `
  })
}
