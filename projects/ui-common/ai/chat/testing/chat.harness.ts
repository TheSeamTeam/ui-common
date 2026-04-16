import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamChatMessageHarness extends ComponentHarness {
  static hostSelector = 'seam-chat-message'

  async getRole(): Promise<string> {
    const el = await this.host()
    const roleEl = await el.querySelector('.seam-chat-message__role')
    const text = await roleEl?.text()
    return text?.trim().toLowerCase() ?? ''
  }

  async getText(): Promise<string> {
    const el = await this.host()
    const contentEl = await el.querySelector('.seam-chat-message__content')
    return (await contentEl?.text())?.trim() ?? ''
  }

  async hasCustomBlocks(): Promise<boolean> {
    const el = await this.host()
    const blocks = await el.querySelectorAll('[data-chat-block]')
    return blocks.length > 0
  }
}

export class TheSeamChatInputHarness extends ComponentHarness {
  static hostSelector = 'seam-chat-input'

  async getSendButton() {
    return this.locatorFor('button')()
  }

  async isSendDisabled(): Promise<boolean> {
    const btn = await this.getSendButton()
    return (await btn.getAttribute('disabled')) !== null
  }
}

export class TheSeamChatHarness extends ComponentHarness {
  static hostSelector = 'seam-chat'

  private readonly _messages = this.locatorForAll(TheSeamChatMessageHarness)
  private readonly _input = this.locatorFor(TheSeamChatInputHarness)

  async getMessages(): Promise<TheSeamChatMessageHarness[]> {
    return this._messages()
  }

  async getInput(): Promise<TheSeamChatInputHarness> {
    return this._input()
  }

  async isLoading(): Promise<boolean> {
    const host = await this.host()
    const loadingEl = await host.querySelector('.seam-chat__loading')
    return loadingEl !== null
  }
}
