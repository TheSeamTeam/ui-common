import { ComponentHarness, ComponentHarnessConstructor } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { ComponentFixture } from '@angular/core/testing'

import { StoryBrowserHarnessEnvironment } from './story-browser-harness-environment'

export interface GetHarnessOptions<TComponent = any> {
  canvasElement?: HTMLElement
  fixture?: ComponentFixture<TComponent>
}

export async function getHarness<T extends ComponentHarness>(
  harnessType: ComponentHarnessConstructor<T>,
  options: GetHarnessOptions
): Promise<T> {
  if (options.fixture !== undefined) {
    return TestbedHarnessEnvironment.harnessForFixture(options.fixture, harnessType)
  }

  if (options.canvasElement !== undefined) {
    return (new StoryBrowserHarnessEnvironment(options.canvasElement, { documentRoot: document.body }))
      .getHarness(harnessType)
  }

  throw Error(`Unable to get harness. fixture or canvasElement must be provided.`)
}
