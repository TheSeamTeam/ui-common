import { applicationConfig, componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { Component, Directive, importProvidersFrom, inject, input, NgModule } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { switchMap } from 'rxjs'

import { TheSeamOverlayScrollbarDirective } from '@theseam/ui-common/scrollbar'
import { DynamicComponentManifest, TheSeamDynamicComponentLoaderModule } from '@theseam/ui-common/dynamic-component-loader'

import { TheSeamModalModule } from '../modal.module'
import { Modal } from '../modal.service'
import { ModalRef } from '../modal-ref'

@Directive({
  selector: '[storyExampleDirective]',
  exportAs: 'storyExampleDirective',
  standalone: true,
})
class StoryExampleDirective {
  storyExampleDirective = input<string>('')
  constructor() {
    console.log('StoryExampleDirective')
  }
  ngOnInit() {
    console.log('StoryExampleDirective init', this.storyExampleDirective)
  }
}

//
// Basic
//

@Component({
  selector: 'story-seam-modal-basic',
  styles: [],
  template: `<span>Example</span>`,
})
class StorySeamModalBasicComponent {
  private readonly _modalRef = inject(ModalRef<StorySeamModalBasicComponent>)
  ngOnInit() {
    console.log('StorySeamModalBasicComponent modalRef', this._modalRef)
  }
}

@Component({
  selector: 'story-seam-modal-basic-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `,
})
class StorySeamModalBasicExampleComponent {
  private readonly _modal = inject(Modal)

  open() {
    this._modal.openFromLazyComponent('basic-modal').pipe(
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

//
// Basic Non Sa
//

@Component({
  selector: 'story-seam-modal-basic-non-sa',
  styles: [],
  template: `<span [storyExampleDirective]="'Example'" #tmp="storyExampleDirective">Example</span>[{{ tmp.storyExampleDirective() }}]`,
  standalone: false,
})
class StorySeamModalBasicNonSaComponent {
  private readonly _modalRef = inject(ModalRef<StorySeamModalBasicNonSaComponent>)

  ngOnInit() {
    console.log('StorySeamModalBasicNonSaComponent modalRef', this._modalRef)
  }
}

@Component({
  selector: 'story-seam-modal-basic-non-sa-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `,
})
class StorySeamModalBasicNonSaExampleComponent {
  private readonly _modal = inject(Modal)

  open() {
    this._modal.openFromLazyComponent('basic-non-sa-modal').pipe(
      switchMap(mr => mr.afterClosed()),
    ).subscribe(v => console.log('result', v))
  }
}

@NgModule({
  imports: [
    TheSeamModalModule,
    TheSeamOverlayScrollbarDirective,
    StoryExampleDirective,
    TheSeamDynamicComponentLoaderModule.forChild(StorySeamModalBasicNonSaComponent),
  ],
  declarations: [StorySeamModalBasicNonSaComponent],
})
class StorySeamModalBasicNonSaExampleModule { }

//
// Simple
//

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
    console.log('StorySeamModalSimpleComponent modalRef', this._modalRef)
  }
}

@Component({
  selector: 'story-seam-modal-simple-example',
  styles: [],
  template: `
    <div class="p-4">
      <button type="button" class="btn btn-lightgray" (click)="open()">Open</button>
    </div>
  `,
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
    TheSeamDynamicComponentLoaderModule.forChild(StorySeamModalSimpleComponent),
  ],
})
class StorySeamModalSimpleExampleModule { }

//
// Manifests
//

const manifests: DynamicComponentManifest[] = [
  {
    componentId: 'basic-modal',
    path: 'basic-modal',
    // loadChildren: () => Promise.resolve(StorySeamModalBasicComponent),
    loadChildren: () => Promise.resolve(StorySeamModalBasicExampleModule),
  },
  {
    componentId: 'basic-non-sa-modal',
    path: 'basic-non-sa-modal',
    loadChildren: () => Promise.resolve(StorySeamModalBasicNonSaExampleModule),
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

export const BasicNonSa: Story = {
  render: args => ({
    moduleMetadata: {
      imports: [
        // StorySeamModalBasicNonSaComponent,
        StorySeamModalBasicNonSaExampleComponent,
      ],
    },
    props: args,
    template: `<story-seam-modal-basic-non-sa-example></story-seam-modal-basic-non-sa-example>`,
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
