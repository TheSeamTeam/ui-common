import { createComponentFactory, createHostFactory, Spectator } from '@ngneat/spectator/jest'

import { ButtonComponent } from './button.component'


import { render, screen } from '@testing-library/angular'
import * as stories from './button.stories' // import all stories from the stories file

import { ɵresetJitOptions } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing'
// import { RendererFactory } from '@storybook/angular/dist/ts3.9/client/preview/angular-beta/RendererFactory'

// import { composeStories, createMountableStoryComponent } from '@storybook/testing-angular'

// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
// const { Basic } = composeStories(stories as any)

describe('ButtonComponent', () => {

  describe('Normal', () => {
    let spectator: Spectator<ButtonComponent>
    const createHost = createHostFactory(ButtonComponent)


    it('should have "button" type by default', () => {
      spectator = createHost(`<button seamButton>Example</button>`)
      expect(spectator.query('button[seamButton][type="button"]', { root: true })).toBeTruthy()
    })

    it('should set the theme class name according to the [theme] input', () => {
      spectator.setInput('theme', 'primary')
      expect(spectator.query('button', { root: true })).toHaveClass('btn-primary')
      expect(spectator.query('button', { root: true })).not.toHaveClass('btn-success')
    })
  })

  // describe('Stories', () => {

  //   let rendererFactory: RendererFactory
  //   let rootTargetDOMNode: HTMLElement
  //   let rootDocstargetDOMNode: HTMLElement

  //   beforeEach(async () => {
  //     rendererFactory = new RendererFactory()
  //     document.body.innerHTML =
  //       '<div id="root"></div><div id="root-docs"><div id="story-in-docs"></div></div>'
  //     // tslint:disable: no-non-null-assertion
  //     rootTargetDOMNode = global.document.getElementById('root')!
  //     rootDocstargetDOMNode = global.document.getElementById('root-docs')!
  //     // tslint:enable: no-non-null-assertion
  //   })

  //   it('renders primary button with default args', async () => {
  //     const _render = await rendererFactory.getRendererInstance('my-story', rootTargetDOMNode)
  //     await _render?.render({
  //       storyFnAngular: (Basic as any)(),
  //       forced: false,
  //       parameters: {} as any,
  //       targetDOMNode: rootTargetDOMNode,
  //     })

  //     expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe((Basic as any).args?.btnText)


  //     // render(Basic);
  //     // const buttonElement = screen.getByText(
  //     //   /Text coming from args in stories file!/i
  //     // );
  //     // expect(buttonElement).not.toBeNull();
  //   })

  //   // it('renders mounable component', async () => {
  //   //   // const _render = await rendererFactory.getRendererInstance('my-story', rootTargetDOMNode)
  //   //   // await _render.render({
  //   //   //   storyFnAngular: (Basic as any)(),
  //   //   //   forced: false,
  //   //   //   parameters: {} as any,
  //   //   //   targetDOMNode: rootTargetDOMNode,
  //   //   // })




  //   //   const tmp = createMountableStoryComponent((Basic as any)())

  //   //   // let spectator: Spectator<any>
  //   //   // const createHost = createHostFactory({
  //   //   //   component: tmp.component,
  //   //   //   imports: [ tmp.module ]
  //   //   // })
  //   //   // spectator = createHost(`<sb-testing-mount></sb-testing-mount>`)
  //   //   // expect(spectator.query('button[seamButton][type="button"]', { root: true })).toBeTruthy()

  //   //   let spectator: Spectator<any>
  //   //   const createComponent = createComponentFactory({
  //   //     component: tmp.component,
  //   //     imports: [ tmp.module ]
  //   //   })
  //   //   spectator = createComponent()

  //   //   expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe(Basic.args?.btnText)


  //   //   // render(Basic);
  //   //   // const buttonElement = screen.getByText(
  //   //   //   /Text coming from args in stories file!/i
  //   //   // );
  //   //   // expect(buttonElement).not.toBeNull();
  //   // })

  //   // it('renders primary button with overriden props', () => {
  //   //   render(<Primary>Hello world</Primary>); // you can override props and they will get merged with values from the Story's args
  //   //   const buttonElement = screen.getByText(/Hello world/i);
  //   //   expect(buttonElement).not.toBeNull();
  //   // });
  // })

  // describe('Stories2', () => {
  //   let spectator: Spectator<any>

  //   const tmp = createMountableStoryComponent((Basic as any)())
  //   const createComponent = createComponentFactory({
  //     component: tmp.component,
  //     imports: [ tmp.ngModule ]
  //   })

  //   beforeEach(async () => {
  //     // rendererFactory = new RendererFactory()
  //     // document.body.innerHTML =
  //     //   '<div id="root"></div><div id="root-docs"><div id="story-in-docs"></div></div>'
  //     // // tslint:disable: no-non-null-assertion
  //     // rootTargetDOMNode = global.document.getElementById('root')!
  //     // rootDocstargetDOMNode = global.document.getElementById('root-docs')!

  //     spectator = createComponent()
  //   })


  //   it('renders mounable component', () => {
  //     expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe((Basic as any).args?.btnText)
  //   })
  // })

  // describe('Stories3', () => {
  //   const { component, ngModule } = createMountableStoryComponent((Basic as any)())

  //   it('renders mounable component', async () => {
  //     const { navigate } = await render(component, {
  //       imports: [ ngModule ]
  //     })

  //     // expect(screen.queryByText(/Detail one/i)).not.toBeInTheDocument();
  //     expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe((Basic as any).args?.btnText)
  //   })
  // })

})
