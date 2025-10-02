import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { Component, importProvidersFrom, inject, NgModule } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'

import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'
import { DynamicComponentManifest, TheSeamDynamicComponentLoaderModule } from '@theseam/ui-common/dynamic-component-loader'

import { TheSeamModalModule } from '../modal.module'
import { Modal } from '../modal.service'
import { switchMap } from 'rxjs'
import { ModalRef } from '../modal-ref'

@Component({
  selector: 'story-seam-modal-basic',
  styles: [],
  template: `<span>Example</span>`
})
class StorySeamModalBasicComponent { }

@Component({
  selector: 'story-seam-modal-simple',
  styles: [],
  template: `
    <seam-modal-header>
      <h4 seamModalTitle>Title</h4>
      <button seamModalClose="cancel" class="close" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </seam-modal-header>
    <seam-modal-body>
      Example
    </seam-modal-body>
    <seam-modal-footer>
      <button class="btn btn-primary" seamModalClose="Yes">Yes</button>
      <button class="btn btn-lightgray" seamModalClose="No">No</button>
    </seam-modal-footer>
  `,
  imports: [
    TheSeamModalModule,
  ],
})
class StorySeamModalSimpleComponent {
  private readonly _modalRef = inject(ModalRef<StorySeamModalSimpleComponent>)
  ngOnInit() {
    console.log('modalRef', this._modalRef)
  }
}

@Component({
  selector: 'story-seam-modal-basic-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `
})
class StorySeamModalBasicExampleComponent {
  private readonly _modal = inject(Modal)

  open() {
    this._modal.openFromLazyComponent('basic-modal').pipe(
      switchMap(mr => mr.afterClosed()),
    ).subscribe(v => console.log('result', v))
  }
}

@Component({
  selector: 'story-seam-modal-simple-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `
})
class StorySeamModalSimpleExampleComponent {
  private readonly _modal = inject(Modal)

  open() {
    this._modal.openFromLazyComponent('simple-modal').pipe(
      switchMap(mr => mr.afterClosed()),
    ).subscribe(v => console.log('result', v))
  }
}

@NgModule({
  imports: [
    TheSeamModalModule,
    TheSeamOverlayScrollbarDirective,
    TheSeamDynamicComponentLoaderModule.forChild(StorySeamModalBasicComponent),
  ],
})
class StorySeamModalBasicExampleModule { }

@NgModule({
  imports: [
    TheSeamModalModule,
    TheSeamOverlayScrollbarDirective,
    TheSeamDynamicComponentLoaderModule.forChild(StorySeamModalSimpleComponent),
  ],
})
class StorySeamModalSimpleExampleModule { }

const manifests: DynamicComponentManifest[] = [
  {
    componentId: 'basic-modal',
    path: 'basic-modal',
    // loadChildren: () => Promise.resolve(StorySeamModalBasicComponent),
    loadChildren: () => Promise.resolve(StorySeamModalBasicExampleModule),
  },
  {
    componentId: 'simple-modal',
    path: 'simple-modal',
    loadChildren: () => Promise.resolve(StorySeamModalSimpleExampleModule),
  },
]

const meta: Meta<any> = {
  title: 'Modal/Manifest',
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(TheSeamDynamicComponentLoaderModule.forRoot(manifests)),
      ],
    }),
    moduleMetadata({
      imports: [
        TheSeamModalModule,
        TheSeamOverlayScrollbarDirective,
      ],
    }),
    componentWrapperDecorator((story) => `<div class="info info-warning">This is the old implementation, from before components could easily be lazy loaded.</div>${story}`),
  ],
}

export default meta
type Story = StoryObj<any>

export const Basic: Story = {
  render: args => ({
    moduleMetadata: {
      imports: [
        // StorySeamModalBasicComponent,
        StorySeamModalBasicExampleComponent,
      ],
    },
    props: args,
    template: `<story-seam-modal-basic-example></story-seam-modal-basic-example>`,
  }),
}

export const Simple: Story = {
  render: args => ({
    moduleMetadata: {
      imports: [
        // StorySeamModalSimpleComponent,
        StorySeamModalSimpleExampleComponent,
      ],
    },
    props: args,
    template: `<story-seam-modal-simple-example></story-seam-modal-simple-example>`,
  }),
}
