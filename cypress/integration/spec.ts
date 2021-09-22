// import { mount } from '@jscutlery/cypress-angular/mount'
// import { composeStories, composeStory, createMountableStoryComponent } from '@marklb/storybook-testing-angular'
// import { render, screen } from '@testing-library/angular'

// // import * as stories from '../../projects/ui-common/buttons/button/button.stories' // import all stories from the stories file
// import Meta, { Basic as BasicStory } from '../../projects/ui-common/buttons/button/button.stories' // import all stories from the stories file

// // Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
// // const { Basic } = composeStories(stories as any)
// const Basic = composeStory(BasicStory as any, Meta as any)

// describe('ButtonComponent', () => {

//   describe('Stories4', () => {
//     const { component, ngModule } = createMountableStoryComponent((Basic as any)())

//     it('renders mounable component', async () => {
//       // await render(component, {
//       //   imports: [ ngModule ]
//       // })
//       mount(component, { imports: [ ngModule ] })

//       // expect(screen.queryByText(/Detail one/i)).not.toBeInTheDocument();
//       // expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe((Basic as any).args?.btnText)
//       // expect(document.body.getElementsByTagName('button')[0].innerHTML).toBeInTheDocument()
//       cy.get('button').should('contain', (Basic as any).args?.btnText)
//     })
//   })

// })






// describe('My First Test', () => {
//   it('Visits the initial project page', () => {
//     cy.visit('/')
//     cy.contains('Welcome')
//     cy.contains('sandbox app is running!')
//   })
// })




import { Component } from '@angular/core'
// import { mount } from '@jscutlery/cypress-angular/mount'

@Component({
  template: `<h1>👋 Hello!</h1>`,
})
export class GreetingsComponent {}

// describe('greetings', () => {
//   it('should say hello', () => {
//     // const root = document.createElement('div')
//     // root.id = 'root'
//     // document.body.appendChild(root)

//     mount(GreetingsComponent)
//     cy.get('h1').contains('👋 Hello!')
//   })
// })

import { initEnv, mount } from 'cypress-angular-unit-test'
// import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('shows the input', () => {
    // Init Angular stuff
    initEnv(GreetingsComponent)
    // You can also :
    // initEnv({declarations: [GreetingsComponent]});
    // initEnv({imports: [MyModule]});

    // component + any inputs object
    // mount(GreetingsComponent, { title: 'World' });
    mount(GreetingsComponent)
    // use any Cypress command afterwards
    // cy.contains('Welcome to World!');
    cy.get('h1').contains('👋 Hello!')
  })
})
