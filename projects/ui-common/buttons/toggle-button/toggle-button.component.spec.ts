// test.skip('Workaround2', () => 1)

// import { async, ComponentFixture, TestBed } from '@angular/core/testing'

// import { ToggleButtonComponent } from './toggle-button.component'

// describe('ToggleButtonComponent', () => {
//   let component: ToggleButtonComponent
//   let fixture: ComponentFixture<ToggleButtonComponent>

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [ ToggleButtonComponent ]
//     })
//     .compileComponents()
//   }))

//   beforeEach(() => {
//     fixture = TestBed.createComponent(ToggleButtonComponent)
//     component = fixture.componentInstance
//     fixture.detectChanges()
//   })

//   it('should create', () => {
//     expect(component).toBeTruthy()
//   })
// })



import { createComponentFactory, createHostFactory, Spectator } from '@ngneat/spectator/jest'

// import { ButtonComponent } from './button.component'


import { fireEvent, render, screen } from '@testing-library/angular'

import { ɵresetJitOptions } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing'

import { composeStories, createMountableStoryComponent } from '@marklb/storybook-testing-angular'

import * as stories from './toggle-button.stories' // import all stories from the stories file

jest.mock('@angular/platform-browser-dynamic')

// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
const { Basic } = composeStories(stories as any)


describe('ToggleButtonComponent Stories', () => {
  const { component, ngModule } = createMountableStoryComponent((Basic as any)())

  beforeEach(async () => {
    // tslint:enable: no-non-null-assertion
    const pbd = platformBrowserDynamic as any
    pbd.mockImplementation(platformBrowserDynamicTesting)
  })

  afterEach(() => {
    jest.clearAllMocks()

    // Necessary to avoid this error "Provided value for `preserveWhitespaces` can not be changed once it has been set." :
    // Source: https://github.com/angular/angular/commit/e342ffd855ffeb8af7067b42307ffa320d82177e#diff-92b125e532cc22977b46a91f068d6d7ea81fd61b772842a4a0212f1cfd875be6R28
    ɵresetJitOptions()
  })

  it('renders mounable component', async () => {
    await render(component, {
      imports: [ ngModule ]
    })

    // expect(screen.queryByText(/Detail one/i)).not.toBeInTheDocument();
    expect(document.body.getElementsByTagName('button')[0].innerHTML).toBe(' ' + (Basic as any).args?.btnText + ' ')

    expect(document.querySelector('button.active')).toBe(null)

    fireEvent.click(screen.getByText((Basic as any).args?.btnText))

    expect(document.querySelector('button.active')).toBeDefined()
  })
})
