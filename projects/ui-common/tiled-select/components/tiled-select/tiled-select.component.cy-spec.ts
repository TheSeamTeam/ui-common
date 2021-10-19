import { composeStories } from '@storybook/testing-angular'

import { getHarness } from '@jscutlery/cypress-harness'
import { cyRenderStory } from '@theseam/ui-common/testing'

import { TheSeamTiledSelectHarness } from '../../testing'
import * as stories from './tiled-select.stories' // import all stories from the stories file

// Every component that is returned maps 1:1 with the stories, but they already
// contain all decorators from story level, meta level and global level.
const { Default, WithControl } = composeStories(stories as any)

describe('TiledSelectComponent', () => {
  const tiledSelect = getHarness(TheSeamTiledSelectHarness)

  describe('Story - Default', () => {
    beforeEach(() => cyRenderStory(Default))

    it('renders mounable component', () => {

      const tileItems = (Default as any).args.tiles
      // const tiles = tiledSelect.getTiles()
      for (let i = 0; i < tileItems.length; i++) {
        const tile = tileItems[i]
        cy.get('seam-tiled-select-tile').eq(i).should('have.attr', 'data-tile-name', tile.name)
        // const t = tiledSelect.getTiles()
        // tiles.g
        // tiledSelect.getTileAtIndex(i) .should('equal', tileItems.)
        // tiledSelect.getTiles().eq(i).should('have.attr', 'data-tile-name', tile.name)

        // tiledSelect.getTileAtIndex(i).should('have.attr', 'data-tile-name', tile.name)
        // const t = tiledSelect.getTileAtIndex(i)
      }
    })
  })

  describe('Story - WithControl', () => {
    beforeEach(() => cyRenderStory(WithControl))

    it('should select with click', () => {
      cy.get('seam-tiled-select-tile[data-tile-name="cotton"]').click()
      cy.get('seam-tiled-select').should('have.property', 'value', 'cotton')
    })
  })

})
