import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { APP_BASE_HREF } from '@angular/common'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { faBuilding } from '@fortawesome/free-regular-svg-icons'

import { TheSeamSideNavModule } from '../side-nav.module'
import { SideNavToggleComponent } from './side-nav-toggle.component'

export default {
  title: 'Framework/SideNav/Toggle',
  component: SideNavToggleComponent,
  decorators: [
    moduleMetadata({
      declarations: [],
      imports: [
        BrowserAnimationsModule,
        RouterModule.forRoot([], { useHash: true }),
        TheSeamSideNavModule
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue: '/' },
      ]
    })
  ]
} as Meta

export const Basic: Story = (args) => ({
  props: {
    itemType: 'basic',
    label: 'Example 1',
    icon: faBuilding
  },
  template: `
    <div class="d-flex flex-row vh-100">
      <div style="width: 260px; background-color: #e9ecef;" class="h-100">
        <seam-side-nav-toggle
          >
        </seam-side-nav-toggle>
      </div>
    </div>`
})
