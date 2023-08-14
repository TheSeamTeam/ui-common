// import { async, ComponentFixture, TestBed } from '@angular/core/testing'

// import { DatatableComponent } from './datatable.component'

// describe('DatatableComponent', () => {
//   let component: DatatableComponent
//   let fixture: ComponentFixture<DatatableComponent>

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ DatatableComponent ]
//     })
//     .compileComponents()
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(DatatableComponent)
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

import { TheSeamDatatableHarness } from '../testing'

import * as stories from './datatable.stories' // import all stories from the stories file

// Every component that is returned maps 1:1 with the stories, but they already
// contain all decorators from story level, meta level and global level.
const { GraphQLQueryRef } = composeStories(stories as any)

describe('DatatableComponent', () => {
  describe('Story', () => {
    it('should', () => {
      expect(true).toBe(true)
    })

    // describe('GraphQLQueryRefOne', () => {

    //   it('should use play', async () => {
    //     const res = await renderStory(GraphQLQueryRef)
    //     // @ts-ignore
    //     await stories.GraphQLQueryRef.play({ canvasElement: res.container as any, fixture: res.fixture })
    //   })

    // })

    describe('GraphQLQueryRef', () => {
      let fixture: ComponentFixture<any>
      let loader: HarnessLoader
      let rootLoader: HarnessLoader

      let datatableHarness: any // TheSeamDatatableHarness

      beforeEach(async () => {
        const res = await renderStory(GraphQLQueryRef)
        fixture = res.fixture
        loader = TestbedHarnessEnvironment.loader(fixture)
        rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture)
      })

      // it('should render datatable', async () => {
      //   // tiledSelectHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TheSeamTiledSelectHarness)
      //   // const tileElements = await tiledSelectHarness.getTiles()
      //   // expect((await tileElements()).length).toBe(7)

      //   const dt = document.querySelector('seam-datatable')
      //   expect(dt).toBeTruthy()
      // })

      it('should start on page 1', async () => {
        datatableHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TheSeamDatatableHarness)
        const currentPageNumber = await datatableHarness.getCurrentPage()
        expect(currentPageNumber).toBe(1)
      })

      it('should switch to page 2', async () => {
        datatableHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TheSeamDatatableHarness)
        expect(await datatableHarness.getCurrentPage()).toBe(1)
        const page2BtnHarness = await (await datatableHarness.getPager()).getPageButtonHarness(2)
        await (await page2BtnHarness.getAnchor()).click()
        expect(await datatableHarness.getCurrentPage()).toBe(2)
      })

      // it('should select "cotton" tile', fakeAsync(async () => {
      //   tiledSelectHarness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TheSeamTiledSelectHarness)
      //   const tile = await tiledSelectHarness.getTileAtIndex(0)
      //   const tileElement = await tile.host()
      //   tileElement.click()
      //   expect(await (await tiledSelectHarness.host()).getProperty('value')).toBe('cotton')
      // }))
    })
  })
})
