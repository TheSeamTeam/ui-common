import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { MenuComponent } from './menu.component'
import { TheSeamMenuModule } from './menu.module'
import { TheSeamMenuHarness } from './testing/menu.harness'
import { lastValueFrom, timer } from 'rxjs'

// interface ExtraArgs {
//   position: 'top' | 'bottom' | 'left' | 'right'
// }
// type StoryArgsType = MenuComponent & ExtraArgs

const meta: Meta<MenuComponent> = {
  title: 'Menu/Components',
  component: MenuComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamButtonsModule,
        TheSeamMenuModule
      ]
    })
  ],
  // argTypes: {
  //   position: {
  //     options: [ 'top', 'bottom', 'left', 'right' ],
  //   },
  // }
  parameters: {
    layout: 'fullscreen',
    docs: {
      iframeHeight: '400px',
    },
  },
} as Meta

export default meta
type Story = StoryObj<MenuComponent>

export const Basic: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="padding:200px;">
      <seam-menu #menu>
        <button seamMenuItem>Item 1</button>
        <button seamMenuItem>Item 2</button>
        <button seamMenuItem>Item 3</button>
      </seam-menu>
      <button [seamMenuToggle]="menu" seamButton theme="primary">Toggle</button>
      </div>
    `,
  }),
  play: async ({ canvasElement, fixture }) => {
    const menuHarness = await getHarness(TheSeamMenuHarness, { canvasElement, fixture })
    await expectFn(await menuHarness.isOpen()).toBe(false)
    await menuHarness.open()
    await expectFn(await menuHarness.isOpen()).toBe(true)
    await menuHarness.close()
    await expectFn(await menuHarness.isOpen()).toBe(false)
  },
}

export const TopLeft: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-menu #menu>
        <button seamMenuItem>Item 1</button>
        <button seamMenuItem>Item 2</button>
        <button seamMenuItem>Item 3</button>
      </seam-menu>
      <button [seamMenuToggle]="menu" seamButton theme="primary" style="position: absolute; top: 0;">Toggle</button>
    `,
  }),
}

export const TopRight: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-menu #menu>
        <button seamMenuItem>Item 1</button>
        <button seamMenuItem>Item 2</button>
        <button seamMenuItem>Item 3</button>
      </seam-menu>
      <button [seamMenuToggle]="menu" seamButton theme="primary" style="position: absolute; top: 0; right: 0;">Toggle</button>
    `,
  }),
}

export const BottomLeft: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-menu #menu>
        <button seamMenuItem>Item 1</button>
        <button seamMenuItem>Item 2</button>
        <button seamMenuItem>Item 3</button>
      </seam-menu>
      <button [seamMenuToggle]="menu" seamButton theme="primary" style="position: absolute; bottom: 0;">Toggle</button>
    `,
  }),
}

export const BottomRight: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-menu #menu>
        <button seamMenuItem>Item 1</button>
        <button seamMenuItem>Item 2</button>
        <button seamMenuItem>Item 3</button>
      </seam-menu>
      <button [seamMenuToggle]="menu" seamButton theme="primary" style="position: absolute; bottom: 0; right: 0;">Toggle</button>
    `,
  }),
}

export const SecondLevel: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-menu #menu>
        <button seamMenuItem>Item 1</button>
        <button seamMenuItem [seamMenuToggle]="menu_2">Item 2</button>
        <button seamMenuItem>Item 3</button>
      </seam-menu>

      <seam-menu #menu_2>
        <button seamMenuItem>Item 2.1</button>
        <button seamMenuItem>Item 2.2</button>
        <button seamMenuItem>Item 3.3</button>
      </seam-menu>
      <button [seamMenuToggle]="menu" seamButton theme="primary">Toggle</button>
    `,
  }),
  play: async ({ canvasElement, fixture }) => {
    const menuHarness = await getHarness(TheSeamMenuHarness, { canvasElement, fixture })
    await expectFn(await menuHarness.isOpen()).toBe(false)
    await menuHarness.open()
    await expectFn(await menuHarness.isOpen()).toBe(true)
    await expectFn((await menuHarness.getItems()).length).toBe(3)
    await expectFn((await menuHarness.getItems({ hasSubmenu: true })).length).toBe(1)
    const submenuItem = (await menuHarness.getItems({ hasSubmenu: true }))[0]
    const submenu = await submenuItem.getSubmenu()
    await expectFn(await submenu?.isOpen()).toBe(false)
    // Avoid position being incorrect by opening during animation, since it
    // doesn't currently correct itself.
    await lastValueFrom(timer(1000))
    await submenu?.open()
    await expectFn(await submenu?.isOpen()).toBe(true)
  },
}
