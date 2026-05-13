import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamChatMessageHarness extends ComponentHarness {
  static hostSelector = 'seam-chat-message'

  private readonly _role = this.locatorForOptional('.seam-chat-message__role')
  private readonly _content = this.locatorForOptional(
    '.seam-chat-message__content',
  )

  async getRole(): Promise<string> {
    const roleEl = await this._role()
    const text = await roleEl?.text()
    return text?.trim().toLowerCase() ?? ''
  }

  async getText(): Promise<string> {
    const contentEl = await this._content()
    return (await contentEl?.text())?.trim() ?? ''
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
  private readonly _loading = this.locatorForOptional('.seam-chat__loading')
  private readonly _initialLoading = this.locatorForOptional(
    '.seam-chat__initial-loading',
  )

  async getMessages(): Promise<TheSeamChatMessageHarness[]> {
    return this._messages()
  }

  async getMessageCount(): Promise<number> {
    return (await this._messages()).length
  }

  async getInput(): Promise<TheSeamChatInputHarness> {
    return this._input()
  }

  async isLoading(): Promise<boolean> {
    return (await this._loading()) !== null
  }

  async isInitialLoading(): Promise<boolean> {
    return (await this._initialLoading()) !== null
  }
}
