// import { async, ComponentFixture, TestBed } from '@angular/core/testing'

// import { TiledSelectComponent } from './tiled-select.component'

// describe('TiledSelectComponent', () => {
//   let component: TiledSelectComponent
//   let fixture: ComponentFixture<TiledSelectComponent>

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ TiledSelectComponent ]
//     })
//     .compileComponents()
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(TiledSelectComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//   })

//   it('should create', () => {
//     expect(component).toBeTruthy()
//   })
// })

import { ComponentHarness, HarnessLoader } from '@angular/cdk/testing'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { ComponentFixture, fakeAsync, tick } from '@angular/core/testing'

// import { composeStories } from '@storybook/testing-angular'

import { renderStory } from '@theseam/ui-common/testing'

import { TheSeamTiledSelectHarness } from '../../testing/tiled-select-harness'

import * as stories from './tiled-select.stories' // import all stories from the stories file

// const { Default } = composeStories(stories as any)

describe('TiledSelectComponent', () => {
  describe('Story', () => {
    it('should', () => {
      expect(true).toBe(true)
    })

    // describe('Default', () => {
    //   let fixture: ComponentFixture<any>
    //   let loader: HarnessLoader
    //   let rootLoader: HarnessLoader

    //   let tiledSelectHarness: TheSeamTiledSelectHarness

    //   beforeEach(async () => {
    //     const res = await renderStory(Default)
    //     fixture = res.fixture
    //     loader = TestbedHarnessEnvironment.loader(fixture)
    //     rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture)
    //   })

    //   it('should render all tiles', fakeAsync(async () => {
    //     tiledSelectHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TheSeamTiledSelectHarness)
    //     const tileElements = await tiledSelectHarness.getTiles()
    //     expect((await tileElements()).length).toBe(7)
    //   }))

    //   it('should select "cotton" tile', fakeAsync(async () => {
    //     tiledSelectHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TheSeamTiledSelectHarness)
    //     const tile = await tiledSelectHarness.getTileAtIndex(0)
    //     const tileElement = await tile.host()
    //     tileElement.click()
    //     expect(await (await tiledSelectHarness.host()).getProperty('value')).toBe('cotton')
    //   }))

    // })
  })
})
