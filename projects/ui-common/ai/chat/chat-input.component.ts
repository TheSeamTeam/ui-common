import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core'
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms'

import { TheSeamRichTextModule } from '@theseam/ui-common/rich-text'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'

@Component({
  selector: 'seam-chat-input',
  imports: [
    ReactiveFormsModule,
    TheSeamRichTextModule,
    TheSeamFormFieldModule,
    TheSeamButtonsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="seam-chat-input">
      <seam-form-field>
        <seam-rich-text
          [formControl]="_control"
          [placeholder]="placeholder"
          [disableRichText]="true"
          [rows]="2"
          (keydown.enter)="_onEnterKey($event)"
        ></seam-rich-text>
      </seam-form-field>
      <button
        seamButton
        theme="primary"
        class="seam-chat-send-btn"
        [disabled]="disabled || _control.invalid"
        (click)="_onSend()"
      >
        Send
      </button>
    </div>
  `,
  styles: [
    `
      .seam-chat-input {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        padding: 8px;
        border-top: 1px solid #dee2e6;
      }

      seam-form-field {
        flex: 1;
      }

      .seam-chat-send-btn {
        flex-shrink: 0;
      }
    `,
  ],
})
export class SeamChatInputComponent {
  @Input() placeholder = 'Type a message...'
  @Input() disabled = false

  @Output() messageSent = new EventEmitter<string>()

  readonly _control = new FormControl<string>('', [Validators.required])

  _onEnterKey(event: Event) {
    const keyEvent = event as KeyboardEvent
    if (keyEvent.shiftKey) {
      return
    }
    keyEvent.preventDefault()
    this._onSend()
  }

  _onSend() {
    const value = this._control.value?.trim()
    if (!value || this.disabled) {
      return
    }
    this.messageSent.emit(value)
    this._control.reset()
  }
}
