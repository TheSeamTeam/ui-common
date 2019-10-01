import * as React from 'react'

import { Props } from '@storybook/addon-docs/blocks'
import { ColorItem, ColorPalette, Meta, Story } from '@storybook/addon-docs/blocks'
import { PropDef, PropsTable, PropsTableError, PropsTableProps } from '@storybook/components'
import { PropRow } from '@storybook/components/dist/blocks/PropsTable/PropRow'
import { styled } from '@storybook/theming'

export const StyledDiv = styled.div({
  display: 'block',
  boxSizing: 'content-box',
  height: '150px',
  width: '400px'
})

export const HiddenDiv = styled.div({
  display: 'none'
})

// export const ColorPreview = (props) => (<StyledDiv>Color Preview</StyledDiv>)

// export const PropsExample = () => (<PropsTable rows={[]} />)


// const ex = {
//   name: 'Thing',
//   type: 'number',
//   required: 'true',
//   description: 'A thing',
//   defaultValue: '39'
// }

// export const stringDef = {
//   name: 'someString',
//   type: { name: 'string' },
//   required: true,
//   description: 'someString description',
//   defaultValue: 'fixme',
// }

// console.log(Props)
// console.log(PropsTable)

// export const PropsExample = (props) => (<PropsTable rows={[]} error={PropsTableError.NO_COMPONENT} /> )

interface ColorDispProps {
  themeClass: string
  styleProp: string
}

export class ColorDisp extends React.Component<ColorDispProps> {

  color: string | null = ''

  componentDidMount() {
    const { themeClass, styleProp } = this.props
    const elem = document.querySelector(`#themeDisp_${themeClass}`)
    if (elem) {
      const c = window.getComputedStyle(elem)
      this.color = c[styleProp]
      this.setState({})
    }
  }

  render() {
    const { themeClass } = this.props
    const id = `themeDisp_${themeClass}`
    return (
      <>
        <HiddenDiv id={id} className={themeClass}></HiddenDiv>
        <ColorItem
          title={themeClass}
          colors={[ this.color ]}
        />
      </>
    )
  }
}

