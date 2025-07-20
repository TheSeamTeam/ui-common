import { ComponentFixture } from '@angular/core/testing'

import { TooltipHarness } from './tooltip.harness'

/**
 * Test utility functions for tooltip implementation testing.
 * These functions test implementation details that are not part of the user-facing harness API.
 */

/**
 * Tests tooltip show timing by triggering hover and verifying timing behavior
 */
export async function testTooltipShowTiming(
  harness: TooltipHarness,
  expectedDelay: number,
  fixture: ComponentFixture<any>
): Promise<void> {
  await harness.hover()
  fixture.detectChanges()
  await fixture.whenStable()

  // Check that tooltip is not visible before delay
  expect(await harness.isTooltipVisible()).toBe(false)

  // Advance time by expected delay
  jest.advanceTimersByTime(expectedDelay)
  fixture.detectChanges()
  await fixture.whenStable()

  // Check that tooltip is now visible
  expect(await harness.isTooltipVisible()).toBe(true)

  // Clean up
  await harness.mouseAway()
  jest.advanceTimersByTime(1000) // Ensure hide completes
  fixture.detectChanges()
  await fixture.whenStable()
}

/**
 * Tests tooltip hide timing by showing tooltip then triggering hide
 */
export async function testTooltipHideTiming(
  harness: TooltipHarness,
  expectedDelay: number,
  fixture: ComponentFixture<any>
): Promise<void> {
  // First show the tooltip
  await harness.hover()
  jest.advanceTimersByTime(1000) // Use a large delay to ensure show completes
  fixture.detectChanges()
  await fixture.whenStable()

  expect(await harness.isTooltipVisible()).toBe(true)

  // Now test hide timing
  await harness.mouseAway()
  fixture.detectChanges()
  await fixture.whenStable()

  // Check that tooltip is still visible before hide delay
  expect(await harness.isTooltipVisible()).toBe(true)

  // Advance time by expected delay
  jest.advanceTimersByTime(expectedDelay)
  fixture.detectChanges()
  await fixture.whenStable()

  // Check that tooltip is now hidden
  expect(await harness.isTooltipVisible()).toBe(false)
}

/**
 * Tests tooltip trigger behavior (hover, focus, or both)
 */
export async function testTooltipTriggerBehavior(
  harness: TooltipHarness,
  expectedTrigger: 'hover' | 'focus' | 'both',
  fixture: ComponentFixture<any>
): Promise<void> {
  // Test hover behavior
  await harness.hover()
  jest.advanceTimersByTime(1000) // Advance past any show delay
  fixture.detectChanges()
  await fixture.whenStable()

  const showsOnHover = await harness.isTooltipVisible()

  await harness.mouseAway()
  jest.advanceTimersByTime(1000) // Advance past any hide delay
  fixture.detectChanges()
  await fixture.whenStable()

  // Test focus behavior
  await harness.focus()
  jest.advanceTimersByTime(1000) // Advance past any show delay
  fixture.detectChanges()
  await fixture.whenStable()

  const showsOnFocus = await harness.isTooltipVisible()

  await harness.blur()
  jest.advanceTimersByTime(1000) // Advance past any hide delay
  fixture.detectChanges()
  await fixture.whenStable()

  // Assert based on expected trigger type
  switch (expectedTrigger) {
    case 'hover':
      expect(showsOnHover).toBe(true)
      expect(showsOnFocus).toBe(false)
      break
    case 'focus':
      expect(showsOnHover).toBe(false)
      expect(showsOnFocus).toBe(true)
      break
    case 'both':
      expect(showsOnHover).toBe(true)
      expect(showsOnFocus).toBe(true)
      break
  }
}

/**
 * Tests tooltip disabled state by attempting to trigger and verifying no tooltip appears
 */
export async function testTooltipDisabledBehavior(
  harness: TooltipHarness,
  fixture: ComponentFixture<any>
): Promise<void> {
  // Try hover
  await harness.hover()
  jest.advanceTimersByTime(1000) // Advance past any show delay
  fixture.detectChanges()
  await fixture.whenStable()

  expect(await harness.isTooltipVisible()).toBe(false)

  await harness.mouseAway()

  // Try focus
  await harness.focus()
  jest.advanceTimersByTime(1000) // Advance past any show delay
  fixture.detectChanges()
  await fixture.whenStable()

  expect(await harness.isTooltipVisible()).toBe(false)

  await harness.blur()
}

/**
 * Helper function to setup Jest timers for tooltip timing tests
 */
export function setupTooltipTimers(): void {
  jest.useFakeTimers()
}

/**
 * Helper function to cleanup Jest timers after tooltip timing tests
 */
export function cleanupTooltipTimers(): void {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
}
