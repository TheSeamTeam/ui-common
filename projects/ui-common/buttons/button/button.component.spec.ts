import { createHostFactory, Spectator } from '@ngneat/spectator/jest'

import { ButtonComponent } from './button.component'

describe('ButtonComponent', () => {
  let spectator: Spectator<ButtonComponent>
  const createHost = createHostFactory(ButtonComponent)


  it('should have "button" type by default', () => {
    spectator = createHost(`<button seamButton>Example</button>`)
    expect(spectator.query('button[seamButton][type="button"]', { root: true })).toBeTruthy()
  })

  it('should set the theme class name according to the [theme] input', () => {
    spectator.setInput('theme', 'primary')
    expect(spectator.query('button', { root: true })).toHaveClass('btn-primary')
    expect(spectator.query('button', { root: true })).not.toHaveClass('btn-success')
  })
})
