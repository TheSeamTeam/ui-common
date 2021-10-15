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

import { composeStories } from '@storybook/testing-angular'

import { renderStory } from '@theseam/ui-common/testing'

import * as stories from './tiled-select.stories' // import all stories from the stories file

const { Default } = composeStories(stories as any)

describe('TiledSelectComponent', () => {

  describe('Story', () => {

    describe('Default', () => {
      let fixture: ComponentFixture<any>
      let loader: HarnessLoader
      let rootLoader: HarnessLoader

      let tiledSelectHarness: TheSeamTiledSelectComponentHarness

      beforeEach(async () => {
        const res = await renderStory(Default)
        fixture = res.fixture
        loader = TestbedHarnessEnvironment.loader(fixture)
        rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture)
      })

      it('should render all tiles', fakeAsync(async () => {
        tick(1000)
        tiledSelectHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TheSeamTiledSelectComponentHarness)
        const tileElements = await tiledSelectHarness.getTileElements()
        expect(tileElements.length).toBe(7)
      }))

      // it('should have PDF link on "Print" button', async () => {
      //   registerAggAgreeHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TheSeamTiledSelectComponentHarness)
      //   const printButton = await registerAggAgreeHarness.getPrintButtonElement()
      //   expect(await printButton.getAttribute('href')).toBe('https://agg-agreement.pdf')
      // })
    })

  })
})


// class TheSeamTiledSelectComponentHarness extends ComponentHarness {
//   static hostSelector = 'app-register-commodity-selection'

//   getIrrPercentageInputElement = this.locatorFor('input[data-testid="irr-percentage"]')
//   getPrintButtonElement = this.locatorFor('a[data-testid="print"]')
// }

class TheSeamTiledSelectComponentHarness extends ComponentHarness {
  static hostSelector = 'seam-tiled-select'

  public async getTileElements() {
    return this.locatorForAll(TheSeamTiledSelectItemComponentHarness)
  }
}

class TheSeamTiledSelectItemComponentHarness extends ComponentHarness {
  static hostSelector = 'seam-tiled-select-item'
}
