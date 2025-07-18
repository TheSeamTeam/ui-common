import { TemplateRef } from '@angular/core'

/**
 * Mock template content for testing tooltips with complex content
 */
export const mockTooltipTemplates = {
  simpleList: `
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  `,

  withIcon: `
    <div>
      <i class="fa fa-info-circle"></i>
      <span>Information tooltip</span>
    </div>
  `,

  formatted: `
    <div>
      <strong>Bold text</strong>
      <br>
      <em>Italic text</em>
      <br>
      <code>Code snippet</code>
    </div>
  `
}

/**
 * Helper function to create a mock TemplateRef for testing
 */
export function createMockTemplateRef(content: string): Partial<TemplateRef<any>> {
  return {
    createEmbeddedView: jasmine.createSpy('createEmbeddedView').and.returnValue({
      rootNodes: [document.createElement('div')],
      destroy: jasmine.createSpy('destroy'),
      detectChanges: jasmine.createSpy('detectChanges')
    })
  }
}

/**
 * Test data for different tooltip configurations
 */
export const tooltipTestData = {
  placements: [
    'top', 'top-start', 'top-end',
    'bottom', 'bottom-start', 'bottom-end',
    'left', 'left-start', 'left-end',
    'right', 'right-start', 'right-end',
    'auto'
  ] as const,

  triggers: ['hover', 'focus', 'both'] as const,

  delays: {
    fast: { show: 100, hide: 50 },
    normal: { show: 500, hide: 0 },
    slow: { show: 1000, hide: 200 }
  },

  content: {
    short: 'Short tooltip',
    medium: 'This is a medium length tooltip with more information',
    long: 'This is a very long tooltip that contains a lot of information and should test how the tooltip handles longer content that might wrap to multiple lines'
  }
}

/**
 * Helper to wait for tooltip animations
 */
export function waitForTooltipAnimation(duration: number = 200): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration))
}

/**
 * Helper to simulate mouse events for testing
 */
export function simulateMouseEvent(element: HTMLElement, eventType: string, options: any = {}) {
  const event = new MouseEvent(eventType, {
    bubbles: true,
    cancelable: true,
    view: window,
    ...options
  })
  element.dispatchEvent(event)
}

/**
 * Helper to simulate focus events for testing
 */
export function simulateFocusEvent(element: HTMLElement, eventType: 'focus' | 'blur') {
  const event = new FocusEvent(eventType, {
    bubbles: true,
    cancelable: true,
    view: window
  })
  element.dispatchEvent(event)
}
