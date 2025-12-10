import {
  applicationConfig,
  Meta,
  moduleMetadata,
  StoryObj,
} from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'

import { DashboardComponent } from './dashboard.component'
import { TheSeamDashboardModule } from './dashboard.module'

const meta: Meta<DashboardComponent> = {
  title: 'Framework/Dashboard',
  component: DashboardComponent,
  decorators: [
    applicationConfig({
      providers: [provideAnimations()],
    }),
    moduleMetadata({
      declarations: [],
      imports: [TheSeamDashboardModule],
    }),
  ],
}

export default meta
type Story = StoryObj<DashboardComponent>

export const Example: Story = {}
