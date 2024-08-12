import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";
import { TabbedComponent } from "./tabbed.component";
import { TheSeamTabbedModule } from "./tabbed.module";
import { provideAnimations } from "@angular/platform-browser/animations";
import { importProvidersFrom } from "@angular/core";
import { RouterModule } from "@angular/router";
import { of } from "rxjs";

const meta: Meta<TabbedComponent> = {
  title: 'Tabs/Components',
  component: TabbedComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([

          ])
        )
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamTabbedModule
      ]
    })
  ]
}

export default meta
type Story = StoryObj<TabbedComponent>

export const Basic: Story = {
  render: args => ({
    template: `
      <seam-tabbed [activeTabName]="activeTabName$ | async">
        <seam-tabbed-item name="tab-1" label="Tab 1">
          <div class="p-4" *seamTabbedTabContent>
            Tab 1 Content
          </div>
        </seam-tabbed-item>
        <seam-tabbed-item name="tab-2" label="Tab 2">
          <div class="p-4" *seamTabbedTabContent>
            Tab 2 Content
          </div>
        </seam-tabbed-item>
        <seam-tabbed-item name="tab-3" label="Tab 3">
          <div class="p-4" *seamTabbedTabContent>
            Tab 3 Content
          </div>
        </seam-tabbed-item>
      </seam-tabbed>
    `,
    props: {
      ...args,
      activeTabName$: of('tab-2')
    }
  })
}
