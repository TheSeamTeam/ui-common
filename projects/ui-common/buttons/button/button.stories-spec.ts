import { render, screen } from '@testing-library/angular'
import { composeStories } from '../../../../.storybook/testing/sb-testing'
import { createMountableStoryComponent } from '../../../../.storybook/testing/sb-testing-renderer'
import * as stories from './Button.stories' // import all stories from the stories file

import { ɵresetJitOptions } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing'


// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
const { Basic } = composeStories(stories)

describe('ButtonComponent', () => {

  describe('Stories3', () => {
    const tmp = createMountableStoryComponent((Basic as any)())

    it('renders mounable component', async () => {
      await render(tmp.component, {
        imports: [ tmp.module ]
      })

      cy.visit('')

      // expect(screen.queryByText(/Detail one/i)).not.toBeInTheDocument();
      expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe(Basic.args?.btnText)
    })
  })

})
