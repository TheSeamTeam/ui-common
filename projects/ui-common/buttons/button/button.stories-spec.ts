import { render, screen } from '@testing-library/angular'
import * as stories from './Button.stories' // import all stories from the stories file

import { composeStories, createMountableStoryComponent } from '@marklb/storybook-testing-angular'


// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
const { Basic } = composeStories(stories)

describe('ButtonComponent', () => {

  describe('Stories3', () => {
    const { component, ngModule } = createMountableStoryComponent((Basic as any)())

    it('renders mounable component', async () => {
      await render(component, {
        imports: [ ngModule ]
      })

      cy.visit('')

      // expect(screen.queryByText(/Detail one/i)).not.toBeInTheDocument();
      expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe(Basic.args?.btnText)
    })
  })

})
