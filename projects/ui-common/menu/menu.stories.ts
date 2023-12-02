import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { expectFn, getHarness } from '@theseam/ui-common/testing'

import { MenuComponent } from './menu.component'
import { TheSeamMenuModule } from './menu.module'
import { TheSeamMenuHarness } from './testing/menu.harness'

// interface ExtraArgs {
//   position: 'top' | 'bottom' | 'left' | 'right'
// }
// type StoryArgsType = MenuComponent & ExtraArgs

const meta: Meta<MenuComponent> = {
  title: 'Menu/Components',
  tags: [ 'autodocs' ],
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
}

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

export const Submenu: Story = {
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
    await submenu?.open()
    await expectFn(await submenu?.isOpen()).toBe(true)
  },
}

export const Hover: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-menu #menu>
        <button seamMenuItem>Item 1</button>
        <button seamMenuItem [seamMenuToggle]="menu_2">Item 2</button>
        <button seamMenuItem [seamMenuToggle]="menu_3">Item 3</button>
        <button seamMenuItem>Item 4</button>
        <button seamMenuItem>Item 5</button>
      </seam-menu>

      <seam-menu #menu_2>
        <button seamMenuItem>Item 2.1</button>
        <button seamMenuItem>Item 2.2</button>
        <button seamMenuItem>Item 2.3</button>
      </seam-menu>

      <seam-menu #menu_3>
        <button seamMenuItem [seamMenuToggle]="menu_3_1">Item 3.1</button>
        <button seamMenuItem>Item 3.2</button>
        <button seamMenuItem>Item 3.3</button>
      </seam-menu>

      <seam-menu #menu_3_1>
        <button seamMenuItem>Item 3.1.1</button>
        <button seamMenuItem>Item 3.1.2</button>
        <button seamMenuItem>Item 3.1.3</button>
      </seam-menu>

      <button [seamMenuToggle]="menu" seamButton theme="primary">Toggle</button>
    `,
  }),
  play: async ({ canvasElement, fixture }) => {
    const menuHarness = await getHarness(TheSeamMenuHarness, { canvasElement, fixture })
    await expectFn(await menuHarness.isOpen()).toBe(false)
    await menuHarness.open()
    await expectFn(await menuHarness.isOpen()).toBe(true)
    await expectFn((await menuHarness.getItems()).length).toBe(5)
    await menuHarness.hoverItem({ text: 'Item 3' }, { text: 'Item 3.1' })
    const submenu1 = (await (await menuHarness.getItems({ text: 'Item 3' }))[0].getSubmenu())
    await expectFn(await submenu1?.isOpen()).toBe(true)
    const submenu2 = await (await submenu1?.getItems({ text: 'Item 3.1' }))?.[0].getSubmenu()
    await expectFn(await submenu2?.isOpen()).toBe(true)
  },
}

export const Header: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-menu #menu>
        <seam-menu-header>
          <h5 class="mb-0">Menu Header</h5>
        </seam-menu-header>

        <button seamMenuItem>Item 1</button>
        <button seamMenuItem>Item 2</button>
        <button seamMenuItem>Item 3</button>
      </seam-menu>
      <button [seamMenuToggle]="menu" seamButton theme="primary">Toggle</button>
    `,
  }),
  play: async ({ canvasElement, fixture }) => {
    const menuHarness = await getHarness(TheSeamMenuHarness, { canvasElement, fixture })
    await expectFn(await menuHarness.isOpen()).toBe(false)
    await menuHarness.open()
    await expectFn(await menuHarness.isOpen()).toBe(true)
    await expectFn((await menuHarness.getHeader()) !== null).toBe(true)
  },
}

export const Footer: Story = {
  render: args => ({
    props: args,
    template: `
      <seam-menu #menu>
        <button seamMenuItem>Item 1</button>
        <button seamMenuItem>Item 2</button>
        <button seamMenuItem>Item 3</button>

        <seam-menu-footer>
          <button seamMenuFooterAction>Action</button>
        </seam-menu-footer>
      </seam-menu>
      <button [seamMenuToggle]="menu" seamButton theme="primary">Toggle</button>
    `,
  }),
  play: async ({ canvasElement, fixture }) => {
    const menuHarness = await getHarness(TheSeamMenuHarness, { canvasElement, fixture })
    await expectFn(await menuHarness.isOpen()).toBe(false)
    await menuHarness.open()
    await expectFn(await menuHarness.isOpen()).toBe(true)
    await expectFn((await menuHarness.getFooter()) !== null).toBe(true)
  },
}
