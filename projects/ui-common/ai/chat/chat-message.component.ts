import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  Injector,
} from '@angular/core'
import { NgComponentOutlet, NgForOf, NgIf } from '@angular/common'
import { MarkdownComponent } from 'ngx-markdown'

import { ChatContentSegment } from './chat-response-parser'
import {
  ChatBlockRegistry,
  THESEAM_CHAT_BLOCK_REGISTRY,
} from './chat-block-registry'

export interface ChatMessageDisplayModel {
  role: 'user' | 'assistant'
  segments: ChatContentSegment[]
  timestamp: Date
}

@Component({
  selector: 'seam-chat-message',
  imports: [NgForOf, NgIf, MarkdownComponent, NgComponentOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="seam-chat-message"
      [class.seam-chat-message--user]="message.role === 'user'"
      [class.seam-chat-message--assistant]="message.role === 'assistant'"
    >
      <div class="seam-chat-message__role">
        {{ message.role === 'user' ? 'You' : 'Assistant' }}
      </div>
      <div class="seam-chat-message__content">
        <ng-container *ngFor="let segment of message.segments">
          <markdown
            *ngIf="segment.type === 'markdown'"
            [data]="segment.content"
          ></markdown>
          <ng-container *ngIf="segment.type === 'custom-block'">
            <ng-container
              *ngIf="
                _getBlockComponent(segment.tag) as blockComponent;
                else fallbackBlock
              "
            >
              <ng-container
                *ngComponentOutlet="
                  blockComponent;
                  injector: _createBlockInjector(segment.content)
                "
              ></ng-container>
            </ng-container>
            <ng-template #fallbackBlock>
              <markdown
                [data]="_buildFallbackMarkdown(segment.tag, segment.content)"
              ></markdown>
            </ng-template>
          </ng-container>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .seam-chat-message {
        display: flex;
        flex-direction: column;
        padding: 8px 12px;
        margin-bottom: 8px;
      }

      .seam-chat-message--user {
        align-items: flex-end;
      }

      .seam-chat-message--user .seam-chat-message__content {
        background-color: #e8f5e9;
        border-radius: 8px;
        padding: 8px 12px;
        max-width: 80%;
      }

      .seam-chat-message--assistant .seam-chat-message__content {
        background-color: #f1f3f5;
        border-radius: 8px;
        padding: 8px 12px;
        max-width: 80%;
      }

      .seam-chat-message__role {
        font-size: 0.75rem;
        color: #6c757d;
        margin-bottom: 4px;
      }
    `,
  ],
})
export class SeamChatMessageComponent {
  @Input({ required: true }) message!: ChatMessageDisplayModel

  private readonly _blockRegistry = inject(THESEAM_CHAT_BLOCK_REGISTRY, {
    optional: true,
  })
  private readonly _injector = inject(Injector)

  _getBlockComponent(tag: string) {
    return this._blockRegistry?.get(tag) ?? null
  }

  _createBlockInjector(content: string): Injector {
    return Injector.create({
      providers: [{ provide: 'CHAT_BLOCK_CONTENT', useValue: content }],
      parent: this._injector,
    })
  }

  _buildFallbackMarkdown(tag: string, content: string): string {
    return '```' + tag + '\n' + content + '\n```'
  }
}
