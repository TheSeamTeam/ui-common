import * as React from 'react'

// import { styled } from '@storybook/theming'

// const StyledDiv = styled.div({
//   'borderRadius': '0',
//   'borderLeftWidth': '5px !important'
// })

interface DocAlertProps {
  kind: string
  children: any
}

export class DocAlert extends React.Component<DocAlertProps> {

  render() {
    const { children, kind } = this.props
    const _kind = kind || 'warning'
    const cssClasses = `alart alert-${_kind} border-left border-${_kind} p-2`
    return (
      // <StyledDiv className={cssClasses} role='alert'>{children}</StyledDiv>
      <></>
    )
  }
}
