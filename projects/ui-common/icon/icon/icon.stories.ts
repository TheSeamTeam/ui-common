import { Meta, moduleMetadata, Story } from '@storybook/angular'

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'

import { faShare } from '@fortawesome/free-solid-svg-icons'

import { TheSeamIconModule } from '../icon.module'
import { IconComponent } from './icon.component'

export default {
  title: 'Icon/Components/Basic',
  component: IconComponent,
  decorators: [
    moduleMetadata({
      imports: [
        BrowserAnimationsModule,
        TheSeamIconModule
      ]
    })
  ]
} as Meta

export const Url: Story = (args) => ({ props: { ...args } })
Url.args = {
  icon: 'assets/images/icons8-cotton-filled-48.png'
}

export const UrlStyledSquare: Story = (args) => ({ props: { ...args } })
UrlStyledSquare.storyName = 'Url(styled-square)'
UrlStyledSquare.args = {
  icon: 'assets/images/icons8-cotton-filled-48.png',
  iconType: 'styled-square'
}

export const UrlImageFill: Story = (args) => ({
  props: { ...args },
  template: `
    <div class="p-5">
      <div class="alert alert-warning">Only partially implemented so far for images. The image will shrink but not grow currently.</div>

      <div class="border mb-2" style="height: 200px; width: 200px;">
        <seam-icon [icon]="icon" iconType="image-fill"></seam-icon>
      </div>

      <div class="border" style="height: 200px; width: 200px;">
        <seam-icon [icon]="icon2" iconType="image-fill"></seam-icon>
      </div>
    </div>`
})
UrlImageFill.storyName = 'Url(image-fill)'
UrlImageFill.args = {
  icon: 'assets/images/icons8-cotton-filled-48.png',
  iconType: 'image-fill'
}

export const FontAwesome: Story = (args) => ({
  props: {
    ...args,
    icon: faShare
  }
})
FontAwesome.storyName = 'FontAwesome'

export const FontAwesomeStyledSquare: Story = (args) => ({
  props: {
    ...args,
    icon: faShare
  }
})
FontAwesomeStyledSquare.storyName = 'FontAwesome(styled-square)'
FontAwesomeStyledSquare.args = {
  iconType: 'styled-square'
}

export const FontAwesomeImageFill: Story = (args) => ({
  props: {
    ...args,
    icon: faShare
  }
})
FontAwesomeImageFill.storyName = 'FontAwesome(image-fill)'
FontAwesomeImageFill.args = {
  iconType: 'image-fill'
}
