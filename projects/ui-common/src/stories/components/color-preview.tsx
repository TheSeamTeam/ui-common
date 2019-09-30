import * as React from 'react'

import { Props } from '@storybook/addon-docs/blocks'
import { PropDef, PropsTable, PropsTableError, PropsTableProps } from '@storybook/components'
import { PropRow } from '@storybook/components/dist/blocks/PropsTable/PropRow'
import { styled } from '@storybook/theming'

export const StyledDiv = styled.div({
  display: 'block',
  boxSizing: 'content-box',
  height: '150px',
  width: '400px'
})

export const ColorPreview = (props) => (<StyledDiv>Color Preview</StyledDiv>)

// export const PropsExample = () => (<PropsTable rows={[]} />)


const ex = {
  name: 'Thing',
  type: 'number',
  required: 'true',
  description: 'A thing',
  defaultValue: '39'
}

export const stringDef = {
  name: 'someString',
  type: { name: 'string' },
  required: true,
  description: 'someString description',
  defaultValue: 'fixme',
}

// console.log(Props)
// console.log(PropsTable)

export const PropsExample = (props) => (<PropsTable rows={[]} error={PropsTableError.NO_COMPONENT} /> )

interface ColorDispProps {
  id: string
  key?: string
  title: string
  src: string
  allowFullScreen: boolean
  scale: number
  style?: any
}

export class ColorDisp extends React.Component<ColorDispProps> {

  componentDidMount() {
    // const { id } = this.props
    // this.iframe = window.document.getElementById(id)
    const elem = document.querySelector('#colorDisp_text-primary')
    console.log(elem)
    console.dir(elem)
    if (elem) {
      const c = window.getComputedStyle(elem, 'color')
      console.log(c)
    }
  }

  // shouldComponentUpdate(nextProps: ColorDispProps) {
  //   const { scale } = nextProps
  //   // eslint-disable-next-line react/destructuring-assignment

  //   return false
  // }

  render() {
    // const { id, title, src, allowFullScreen, scale, ...rest } = this.props
    return (
      <StyledDiv id='colorDisp_text-primary' className='text-primary'>

      </StyledDiv>
    )
  }
}

