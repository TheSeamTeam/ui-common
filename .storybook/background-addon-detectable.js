// background-addon-detectable.js

import React from 'react'
import { addons, types } from '@storybook/addons'
import { AddonPanel } from '@storybook/components'
import { STORY_RENDER } from '@storybook/core-events'

import { ADDON_ID as ADDON_BACKGROUNDS_ID, PARAM_KEY as ADDON_BACKGROUNDS_PARAM_KEY } from '@storybook/addon-backgrounds/dist/constants'

const ADDON_ID = 'background-addon-detectable'
const PANEL_ID = `${ADDON_ID}/panel`

function getStoryBody() {
  const iframe = document && document.querySelector('#storybook-preview-iframe')
  if (iframe && iframe.contentDocument) {
    return iframe.contentDocument.querySelector('body')
  }
  return null
}

function isBackgroundSelected(api) {
  const currentValue = api.getAddonState(ADDON_BACKGROUNDS_PARAM_KEY)

  if (currentValue === 'transparent') {
    return false
  }

  const backgrounds = api.getCurrentParameter(ADDON_BACKGROUNDS_PARAM_KEY) || []

  if (!backgrounds.length) {
    return false
  }

  if (backgrounds.find(i => i.value === currentValue)) {
    return true
  }

  if (!currentValue && backgrounds.find(i => i.default)) {
    return true
  }

  return false
}

function isGridActive(api) {
  return api.getAddonState(`${ADDON_BACKGROUNDS_ID}/grid`) || false
}

function updateBgStateAttrForCss(api) {
  const isBgGridActive = isGridActive(api)
  const isBgSelected = isBackgroundSelected(api)

  const storyBody = getStoryBody()
  if (storyBody) {
    storyBody.setAttribute('data-addon-background', isBgSelected || isBgGridActive)
  }
}

addons.register(ADDON_ID, api => {
  // React to a background change.
  //
  // The README shows how to listen to the event emitted when a background is changed.
  // Source: https://github.com/storybookjs/storybook/blob/next/addons/backgrounds/README.md#events
  api.getChannel().on('storybook/background/update', (bg) => {
    // console.log('Background color', bg.selected)
    // console.log('Background name', bg.name)
    updateBgStateAttrForCss(api)
  })

  // There may be a better event, because it would probably only need this event
  // when the iframe is initially loaded.
  api.on(STORY_RENDER, evt => {
    updateBgStateAttrForCss(api)
  })

  //
  // The following is a way could detect a grid state change.
  //
  // NOTE: I do not consider this a good thing to do, since I am adding a panel
  // just to listen for an event. I don't have much experience with React, I
  // mainly use Angular, so I just know enough to get by when I need to use it.
  // Someone else may know a better way to do what I am using this render
  // function for.
  //
  const render = ({ active, key }) => {
    // state will be undefined until the tool button is clicked
    // const isBgGridActive = api.getAddonState(`${ADDON_BACKGROUNDS_ID}/grid`) || false
    // console.log('isBgGridActive', isBgGridActive)
    updateBgStateAttrForCss(api)

    return React.createElement(AddonPanel, { active, key })
  }

  // Empty string should make the button hidden.
  const title = '';

  addons.add(PANEL_ID, {
    type: types.PANEL,
    title,
    render
  })
})
