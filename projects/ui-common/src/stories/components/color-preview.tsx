import * as React from 'react'

import { ColorItem } from '@storybook/addon-docs/blocks'
import { styled } from '@storybook/theming'

interface ColorDispProps {
  title: string
  subtitle: string
  colorVars: string[]
}

export class ColorDisp extends React.Component<ColorDispProps> {

  render() {
    const { title, subtitle, colorVars } = this.props

    const colors: string[] = []
    for (const c of colorVars) {
      colors.push(getComputedStyle(document.documentElement).getPropertyValue(c))
    }
    return (
      <>
        <ColorItem
          title={title}
          subtitle={subtitle}
          colors={colors}
        />
      </>
    )
  }
}
