import { ArgTypes, Meta, StoryFn, applicationConfig, moduleMetadata } from "@storybook/angular";
import { provideAnimations } from "@angular/platform-browser/animations";
import { TheSeamMenuModule } from "../menu/menu.module";
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Component, Input, OnInit } from "@angular/core";
import { RichTextComponent } from "./rich-text/rich-text.component";
import { TheSeamRichTextModule } from "./rich-text.module";
import { TheSeamQuillEditorConfig, TheSeamQuillMentionMenuItem } from "./utils/models";
import { THESEAM_QUILL_EDITOR_CONFIG, THESEAM_QUILL_EDITOR_CONFIG_DEFAULT, THESEAM_QUILL_TOOLBAR_OPTIONS_DEFAULT, THESEAM_QUILL_FORMATS_DEFAULT } from "./utils/utils";
import { delay, interval, map, of, take, tap } from "rxjs";
import { TheSeamFormFieldModule } from "../form-field/form-field.module";
import { TheSeamButtonsModule } from "../buttons/buttons.module";

@Component({
  selector: 'rich-text-form-component',
  template: `
  <div style="max-width: 750px; margin: 0 auto;" [formGroup]="form">
    <seam-form-field label="Standard Input:" class="mb-2">
      <input seamInput formControlName="input" required/>
      <ng-template seamFormFieldError="required">Standard Input is required.</ng-template>
    </seam-form-field>
    <div class="mb-2">Standard Input Errors: {{ form.controls.input.errors | json }}</div>
    <seam-form-field label="Rich Text:" class="mb-2">
      <seam-rich-text
        seamInput
        formControlName="text"
        [placeholder]="placeholder"
        [rows]="rows"
        [resizable]="resizable"
        [disableRichText]="disableRichText"
        [displayCharacterCounter]="displayCharacterCounter"
        [minLength]="minLength"
        [maxLength]="maxLength"
        required></seam-rich-text>
      <ng-template seamFormFieldError="required">Rich Text is required.</ng-template>
    </seam-form-field>
    <div class="mb-2">Rich Text Errors: {{ form.controls.text.errors | json }}</div>
    <div class="mb-2">Form Status: {{ form.status }}</div>
    <div class="mb-2">Form Value: {{ form.value | json }}</div>
    <button seamButton theme="primary" (click)="disableForm()" *ngIf="form.enabled">Disable Form</button>
    <button seamButton theme="primary" (click)="enableForm()" *ngIf="form.disabled">Enable Form</button>
  </div>
  `
})
class RichTextFormComponent implements OnInit {

  form = new FormGroup({
    input: new FormControl<string | null>(null, [ Validators.required ]),
    text: new FormControl<string | null>(null, [ Validators.required ])
  })

  @Input() placeholder: string | undefined

  @Input() rows: number | undefined

  @Input() resizable: boolean | undefined

  @Input() disableRichText: boolean | undefined

  @Input() displayCharacterCounter: boolean | undefined

  @Input() minLength: number | undefined

  @Input() maxLength: number | undefined

  @Input() mentionItems: TheSeamQuillMentionMenuItem[] | undefined

  ngOnInit(): void {
    this.form?.valueChanges.pipe(
      tap(vc => console.log({ vc, form: this.form }))
    ).subscribe()
  }

  disableForm() {
    this.form.disable()
  }

  enableForm() {
    this.form.enable()
  }

}

@Component({
  selector: 'custom-config-component',
  template: `
  <div style="max-width: 750px; margin: 0 auto;">
    <seam-rich-text
      [formControl]="form"
      [required]="required"
      [placeholder]="placeholder"
      [rows]="rows"
      [resizable]="resizable"
      [disableRichText]="disableRichText"
      [displayCharacterCounter]="displayCharacterCounter"
      [minLength]="minLength"
      [maxLength]="maxLength"
      [mentionItems]="mentionItems"></seam-rich-text>
  </div>
  `,
  providers: [
    {
      provide: THESEAM_QUILL_EDITOR_CONFIG,
      useValue: {
        ...THESEAM_QUILL_EDITOR_CONFIG_DEFAULT,
        linkPlaceholder: 'https://custom-config.com',
        modules: {
          toolbar: [
            ...THESEAM_QUILL_TOOLBAR_OPTIONS_DEFAULT,
            [{ font: [ 'sans-serif', 'serif' ]}],
            [{color: [ 'blue', 'red' ]}],
            [ 'image', 'video' ]
          ],
          mention: {
            mentionDenotationChars: [ '*', '#' ]
          }
        },
        formats: [ ...THESEAM_QUILL_FORMATS_DEFAULT, 'color', 'font' ],
        styles: { background: '#eee' }
      } satisfies TheSeamQuillEditorConfig
    }
  ]
})
class CustomConfigComponent implements OnInit {

  @Input() form: AbstractControl | undefined

  @Input() required: boolean | undefined

  @Input() placeholder: string | undefined

  @Input() rows: number | undefined

  @Input() resizable: boolean | undefined

  @Input() disableRichText: boolean | undefined

  @Input() displayCharacterCounter: boolean | undefined

  @Input() minLength: number | undefined

  @Input() maxLength: number | undefined

  @Input() mentionItems: TheSeamQuillMentionMenuItem[] | undefined

  ngOnInit(): void {
    this.form?.valueChanges.pipe(
      tap(vc => console.log({ vc, form: this.form }))
    ).subscribe()
  }

}

const meta: Meta = {
  title: 'RichText/Components',
  tags: [ 'autodocs' ],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
      ],
    }),
    moduleMetadata({
      declarations: [
        CustomConfigComponent,
        RichTextFormComponent
      ],
      imports: [
        ReactiveFormsModule,
        TheSeamMenuModule,
        TheSeamRichTextModule,
        TheSeamFormFieldModule,
        TheSeamButtonsModule
      ],
      entryComponents: [
        CustomConfigComponent,
        RichTextFormComponent
      ]
    })
  ],
}

const controlArgTypes: Partial<ArgTypes<RichTextComponent>> = {
  value: { type: 'string' },
  required: { type: 'boolean' },
  placeholder: { type: 'string', defaultValue: '' },
  rows: { type: 'number', defaultValue: 5 },
  resizable: { type: 'boolean', defaultValue: true },
  disableRichText: { type: 'boolean', defaultValue: false },
  displayCharacterCounter: { type: 'boolean' },
  minLength: { type: 'number' },
  maxLength: { type: 'number' }
}

export default meta
type Story = StoryFn<RichTextComponent>

export const Basic: Story = (args) => ({
  props: {
    ...args,
    formControl: new FormControl(args.value)
  },
  template: `
    <div style="max-width: 750px; margin: 0 auto;">
      <seam-rich-text
        [formControl]="formControl"
        [required]="required"
        [placeholder]="placeholder"
        [rows]="rows"
        [resizable]="resizable"
        [disableRichText]="disableRichText"
        [displayCharacterCounter]="displayCharacterCounter"
        [minLength]="minLength"
        [maxLength]="maxLength"></seam-rich-text>
    </div>
  `
})
Basic.args = undefined
Basic.argTypes = controlArgTypes

export const CustomConfig: Story = (args) => ({
  props: {
    ...args,
    formControl: new FormControl(args.value),
  },
  template: `
    <div style="max-width: 750px; margin: 0 auto;">
      <custom-config-component
        [form]="formControl"
        [required]="required"
        [placeholder]="placeholder"
        [rows]="rows"
        [resizable]="resizable"
        [disableRichText]="disableRichText"
        [displayCharacterCounter]="displayCharacterCounter"
        [minLength]="minLength"
        [maxLength]="maxLength"></custom-config-component>
    </div>
  `
})
CustomConfig.args = {
  value: '<p>test text with custom config</p>',
}
CustomConfig.argTypes = controlArgTypes

export const RichTextDisabled: Story = (args) => ({
  props: {
    ...args,
    formControl: new FormControl(args.value),
  },
  template: `
    <div style="max-width: 750px; margin: 0 auto;">
      <seam-rich-text
        [formControl]="formControl"
        [required]="required"
        [placeholder]="placeholder"
        [rows]="rows"
        [resizable]="resizable"
        [disableRichText]="disableRichText"
        [displayCharacterCounter]="displayCharacterCounter"
        [minLength]="minLength"
        [maxLength]="maxLength"></seam-rich-text>
    </div>
  `
})
RichTextDisabled.args = {
  value: 'test text without html rendering',
  disableRichText: true
}
RichTextDisabled.argTypes = controlArgTypes

export const CharacterCounter: Story = (args) => ({
  props: {
    ...args,
    formControl: new FormControl(args.value),
  },
  template: `
    <div style="max-width: 750px; margin: 0 auto;">
      <seam-rich-text
        [formControl]="formControl"
        [required]="required"
        [placeholder]="placeholder"
        [rows]="rows"
        [resizable]="resizable"
        [disableRichText]="disableRichText"
        [displayCharacterCounter]="displayCharacterCounter"
        [minLength]="minLength"
        [maxLength]="maxLength"></seam-rich-text>
    </div>
  `
})
CharacterCounter.args = {
  value: '<p>test text with character counter</p>',
  displayCharacterCounter: true
}
CharacterCounter.argTypes = controlArgTypes

export const CustomCharacterCounterTemplate: Story = (args) => ({
  props: {
    ...args,
    formControl: new FormControl(args.value),
  },
  template: `
    <div style="max-width: 750px; margin: 0 auto;">
      <seam-rich-text
        [formControl]="formControl"
        [required]="required"
        [placeholder]="placeholder"
        [rows]="rows"
        [resizable]="resizable"
        [disableRichText]="disableRichText"
        [displayCharacterCounter]="displayCharacterCounter"
        [characterCounterTpl]="customCharacterCounter"
        [minLength]="minLength"
        [maxLength]="maxLength"></seam-rich-text>

      <ng-template #customCharacterCounter let-minLength="minLength" let-maxLength="maxLength" let-characterCount="characterCount">
        <div class="font-weight-bold text-success text-center">
          Custom Template!
          minLength: {{ minLength || 'not set' }},
          maxLength: {{ maxLength || 'not set' }},
          characterCount: {{ characterCount }}
        </div>
      </ng-template>
    </div>
  `
})
CustomCharacterCounterTemplate.args = {
  value: '<p>test text with character counter</p>',
  displayCharacterCounter: true
}
CustomCharacterCounterTemplate.argTypes = controlArgTypes

export const Mentions: Story = (args) => ({
  props: {
    ...args,
    formControl: new FormControl(args.value),
    mentionsInterval$: interval(3000).pipe(
      take(6),
      map(i => args.mentionItems?.filter((mention, mentionIdx) => mentionIdx <= i))
    ),
    mentions$: of(args.mentionItems).pipe(
      delay(3000)
    ),
    log: (val: any) => console.log(val)
  },
  template: `
    <div style="max-width: 750px; margin: 0 auto;">
      <seam-rich-text
        [formControl]="formControl"
        [required]="required"
        [placeholder]="placeholder"
        [rows]="rows"
        [resizable]="resizable"
        [disableRichText]="disableRichText"
        [displayCharacterCounter]="displayCharacterCounter"
        [minLength]="minLength"
        [maxLength]="maxLength"
        [useMentions]="true"
        [mentionItems]="mentions$ | async"
        (mentionsUpdated)="log({ event: $event, formControl: formControl })"></seam-rich-text>
    </div>
  `
})
Mentions.args = {
  value: '<p>test text with mention functionality</p>',
  mentionItems: [
    { id: '5', value: 'ABC Farms', groupName: 'Trial Participants' },
    { id: '6', value: 'Professional Produce Farms', groupName: 'Trial Participants' },
    { id: '7', value: 'AgBest, LLC', groupName: 'Trial Participants' },
    { id: '1', value: 'Shelby Manley', userId: 1, groupName: 'Trial Admins' },
    { id: '0', value: 'Jason Sutton', userId: 2, groupName: 'Trial Admins' },
    { id: '2', value: 'David Stone', userId: 3, groupName: 'Trial Admins' },
    { type: 'divider' },
    { id: '4a', value: 'All Trial Participants', userGroupId: 5, groupName: '', searchIgnore: true },
    { id: '3a', value: 'All Trial Admins', userGroupId: 4, groupName: '', searchIgnore: true },
  ]
}
Mentions.argTypes = controlArgTypes

export const UsingSeamInput: Story = (args) => ({
  props: {
    ...args
  },
  template: `
    <div style="max-width: 750px; margin: 0 auto;">
      <rich-text-form-component
        [placeholder]="placeholder"
        [rows]="rows"
        [resizable]="resizable"
        [disableRichText]="disableRichText"
        [displayCharacterCounter]="displayCharacterCounter"
        [minLength]="minLength"
        [maxLength]="maxLength"></rich-text-form-component>
    </div>
  `
})
