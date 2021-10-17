import { render, screen } from '@testing-library/angular'
import * as stories from './button.stories' // import all stories from the stories file

import { composeStories, createMountableStoryComponent } from '@storybook/testing-angular'

import { cypressGlobalSetup } from '@theseam/ui-common/test-helpers'

cypressGlobalSetup()

// Every component that is returned maps 1:1 with the stories, but they already
// contain all decorators from story level, meta level and global level.
const { Basic } = composeStories(stories as any)

describe('ButtonComponent', () => {

  describe('Stories3', () => {
    const { component, ngModule } = createMountableStoryComponent((Basic as any)())
    console.log({ component, ngModule })

    it('renders mounable component', () => {
      // await render(component, {
      //   imports: [ ngModule ]
      // })

      // cy.visit('')

      mount(component, {
        imports: [ ngModule ]
      })

      // expect(screen.queryByText(/Detail one/i)).not.toBeInTheDocument();
      // expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe((Basic as any).args?.btnText)
      // expect(document.body.getElementsByTagName('button')[0].innerHTML).toBeInTheDocument()
      cy.get('button').should('contain', (Basic as any).args?.btnText)
    })

    // it('renders mounable component 2', () => {
    //   // await render(component, {
    //   //   imports: [ ngModule ]
    //   // })

    //   // cy.visit('')

    //   mountStory(Basic as any)

    //   // expect(screen.queryByText(/Detail one/i)).not.toBeInTheDocument();
    //   // expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe((Basic as any).args?.btnText)
    //   // expect(document.body.getElementsByTagName('button')[0].innerHTML).toBeInTheDocument()
    //   cy.get('button').should('contain', (Basic as any).args?.btnText)
    // })
  })

})


import { Component } from '@angular/core'
import { mount, mountStory } from '@jscutlery/cypress-angular/mount'

// @Component({
//   template: `<h1>👋 Hello!</h1>`,
// })
// export class GreetingsComponent {}

// describe('greetings', () => {
//   it('should say hello', () => {
//     mount(GreetingsComponent)
//     cy.get('h1').contains('👋 Hello!')
//   })
// })
