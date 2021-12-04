import { ComponentHarness, ComponentHarnessConstructor } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { ComponentFixture } from '@angular/core/testing'

import { StorybookHarnessEnvironment } from '@marklb/storybook-harness'

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
    return (new StorybookHarnessEnvironment(options.canvasElement))
      .getHarness(harnessType)
  }

  throw Error(`Unable to get harness. fixture or canvasElement must be provided.`)
}
