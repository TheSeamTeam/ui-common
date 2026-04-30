import { NgSignaturePadOptions } from '@almothafar/angular-signature-pad'

/**
 * Options for `szimek/signature_pad` exposed by
 * `@almothafar/angular-signature-pad`. Re-exported here so consumers don't
 * have to reach into the third-party module directly.
 */
export type SignaturePadOptions = NgSignaturePadOptions

export type SignatureInputOptions = NgSignaturePadOptions

export interface SignatureInputItem {
  clear(): void
}

export interface SignatureInputContainer {
  registerInputItem(type: string, item: SignatureInputItem): boolean
  unregisterInputItem(type: string, item: SignatureInputItem): boolean
}

export type SignatureInputType = 'pen' | 'text' | 'img'

export type SignatureInputResetType = 'delete' | 'cancel'

export type SignatureInputPanelResult =
  | { type: 'submit'; value: string }
  | { type: 'cancel' }
