import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, Component, EventEmitter, Inject, Input, OnInit, Optional, Output, Provider, Renderer2, TemplateRef, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Blur, ContentChange, EditorChangeContent, EditorChangeSelection, Focus, QuillEditorComponent, SelectionChange } from 'ngx-quill';
import { Delta } from 'quill';
import 'quill-mention';
import { BehaviorSubject, Observable, Subject, combineLatest, filter, lastValueFrom, map, of, shareReplay, startWith, switchMap, take, tap } from 'rxjs';

import { isNullOrUndefined, notNullOrUndefined } from '@theseam/ui-common/utils';
import { TheSeamCharacterCounterFn, TheSeamQuillEditorConfig, TheSeamQuillMentionMenuItem, TheSeamQuillMentionMenuOption, TheSeamQuillMentionSearchFn, TheSeamQuillMentionSourceFn, TheSeamQuillModules } from '../utils/models';
import { THESEAM_QUILL_EDITOR_CONFIG, THESEAM_QUILL_EDITOR_CONFIG_DEFAULT, THESEAM_QUILL_MENTION_OPTIONS_DEFAULT, defaultHtmlCharacterCounterFn, defaultMentionRenderListFn, defaultMentionSearchFn, isMentionMenuOption } from '../utils/utils';

export const RICH_TEXT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RichTextComponent),
  multi: true
}

@Component({
  selector: 'seam-rich-text',
  templateUrl: './rich-text.component.html',
  styleUrls: ['./rich-text.component.scss'],
  providers: [
    RICH_TEXT_VALUE_ACCESSOR
  ]
})
export class RichTextComponent implements OnInit, AfterViewInit, ControlValueAccessor {

  onChange: any
  onTouched: any

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('value') val: string | undefined

  formControl = new FormControl<string | null>(null)

  @Input()
  get required(): boolean {
    return this._required
  }
  set required(value: boolean | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._required = coerceBooleanProperty(value)
    }
  }
  private _required = false

  /** @default '' (empty string) */
  @Input()
  get placeholder(): string {
    return this._placeholder
  }
  set placeholder(value: string | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._placeholder = value
    }
  }
  private _placeholder = ''

  /**
   * Initial rows visible in text area, set using `height` and `minHeight`.
   *
   * NOTE: Resizable editors will not be able to size below the height calculated from this value.
   *
   * @default 5
   */
  @Input()
  get rows(): number {
    return this._rows
  }
  set rows(value: number | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._rows = value

      this._pollCalculatedRowHeight.next()
    }
  }
  private _rows = 5

  /**
   * When `true`, text area can be resized vertically.
   *
   * @default true
   */
  @Input()
  get resizable(): boolean {
    return this._resizable
  }
  set resizable(value: boolean | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._resizable = coerceBooleanProperty(value)
    }
  }
  private _resizable = true

  /** @default false */
  get readOnly(): boolean {
    return this._readOnly
  }
  set readOnly(value: boolean | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._readOnly = coerceBooleanProperty(value)
    }
  }
  private _readOnly = false

  // TODO: fix bug where initial html value is rendered in plain text
  /**
   * When `true`, overrides all other provided settings to present the editor
   * as a standard textbox.
   *
   * NOTE: For the moment, `<p></p>` tags are still allowed, triggered by the `Enter` key.
   * https://github.com/slab/quill/issues/1432
   *
   * @default false
   */
  @Input()
  get disableRichText(): boolean {
    return this._disableRichText
  }
  set disableRichText(value: boolean | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._disableRichText = coerceBooleanProperty(value)

      this._updateQuillConfig()
    }
  }
  private _disableRichText = false

  /**
   * When `true`, displays a character counter at the bottom of the editor.
   * Character counter text is determined by values provided in `minLength`
   * and `maxLength`.
   *
   * The default count algorithm strips out html entities and replaces them
   * with spaces to get the string length. To override this behavior, pass
   * a custom function to `characterCounterFn`.
   *
   * To override default character counter display, pass a custom template to `characterCountTpl`.
   *
   * @default false
   */
  @Input()
  get displayCharacterCounter(): boolean {
    return this._displayCharacterCounter
  }
  set displayCharacterCounter(value: boolean | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._displayCharacterCounter = coerceBooleanProperty(value)
    }
  }
  private _displayCharacterCounter = false

  @Input()
  get minLength(): number | undefined {
    return this._minLength
  }
  set minLength(value: number | undefined) {
    if (notNullOrUndefined(value)) {
      this._minLength = value
    }
  }
  private _minLength: number | undefined

  @Input()
  get maxLength(): number | undefined {
    return this._maxLength
  }
  set maxLength(value: number | undefined) {
    if (notNullOrUndefined(value)) {
      this._maxLength = value
    }
  }
  private _maxLength: number | undefined

  /**
   * Set to override default character counter display.
   *
   * Template context includes variables `minLength`, `maxLength`, and `characterCount`.
   */
  @Input()
  get characterCounterTpl(): TemplateRef<any> | null {
    return this._characterCounterTpl
  }
  set characterCounterTpl(value) {
    if (notNullOrUndefined(value)) {
      this._characterCounterTpl = value
    }
  }
  private _characterCounterTpl: TemplateRef<any> | null = null

  /**
   * Set to override default counter function, which strips html entities and
   * replaces them with a space.
   */
  @Input() get characterCounterFn(): TheSeamCharacterCounterFn {
    return this._characterCounterFn
  }
  set characterCounterFn(value: TheSeamCharacterCounterFn | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._characterCounterFn = value
    }
  }
  private _characterCounterFn = defaultHtmlCharacterCounterFn

  /**
   * If `true`, component will configure the Quill editor with the quill-mentions extension
   * and listen for values passed to `mentionItems` to populate the mentions menu.
   *
   * @default false
   */
  @Input()
  get useMentions(): boolean {
    return this._useMentions
  }
  set useMentions(value: boolean | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._useMentions = coerceBooleanProperty(value)

      this._updateQuillConfig()
    }
  }
  private _useMentions: boolean = false

  /**
   * List of users, user groups, or other entities to display in mentions menu.
   * Minimum required properties are `id` (unique) and `value`, which acts as the label.
   *
   * By default, the menu is triggered by typing the `@` symbol into the text area.
   */
  @Input()
  get mentionItems(): TheSeamQuillMentionMenuItem[] | null | undefined {
    return this._mentionItems.value
  }
  set mentionItems(value: TheSeamQuillMentionMenuItem[] | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._mentionItems.next(value)
    }
  }
  private _mentionItems = new BehaviorSubject<TheSeamQuillMentionMenuItem[] | null | undefined>(undefined)
  public mentionItems$ = this._mentionItems.asObservable().pipe(
    filter(mentions => notNullOrUndefined(mentions) && mentions.length > 0),
    shareReplay({ bufferSize: 1, refCount: true })
  )

  /**
   * Set to override default search function when user is typing a mention.
   */
  @Input()
  get mentionSearchFn(): TheSeamQuillMentionSearchFn {
    return this._mentionSearchFn
  }
  set mentionSearchFn(value: TheSeamQuillMentionSearchFn | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._mentionSearchFn = value
    }
  }
  private _mentionSearchFn: TheSeamQuillMentionSearchFn = defaultMentionSearchFn

  /**
   * Set to override default render function for mentions list.
   *
   * Function should call `renderList`.
   */
  @Input()
  get mentionRenderListFn(): TheSeamQuillMentionSourceFn {
    return this._mentionRenderListFn
  }
  set mentionRenderListFn(value: TheSeamQuillMentionSourceFn | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._mentionRenderListFn = value
    }
  }
  private _mentionRenderListFn: TheSeamQuillMentionSourceFn = defaultMentionRenderListFn

  /**
   * Set to override default text shown while mention items are loading.
   *
   * @default 'Loading...'
   */
  @Input()
  get mentionListLoadingText(): string {
    return this._mentionListLoadingText
  }
  set mentionListLoadingText(value: string | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._mentionListLoadingText = value
    }
  }
  private _mentionListLoadingText: string = 'Loading...'

  /**
   * Set to override default text shown when a mention search returns no items.
   *
   * @default 'No matches found.'
   */
  @Input()
  get mentionListEmptyText(): string {
    return this._mentionListEmptyText
  }
  set mentionListEmptyText(value: string | null | undefined) {
    if (notNullOrUndefined(value)) {
      this._mentionListEmptyText = value
    }
  }
  private _mentionListEmptyText: string = 'No matches found.'

  get mentionListEmptyItem(): TheSeamQuillMentionMenuOption {
    return {
      id: 'undefined',
      value: this.mentionListEmptyText,
      disabled: true,
      emptyList: true
    }
  }

  @Output() quillEditorCreated: EventEmitter<any> = new EventEmitter()
  @Output() quillEditorChanged: EventEmitter<EditorChangeContent | EditorChangeSelection> = new EventEmitter()
  @Output() quillContentChanged: EventEmitter<ContentChange> = new EventEmitter()
  @Output() quillSelectionChanged: EventEmitter<SelectionChange> = new EventEmitter()
  @Output() quillFocus: EventEmitter<Focus> = new EventEmitter()
  @Output() quillBlur: EventEmitter<Blur> = new EventEmitter()

  @Output() mentionsUpdated: EventEmitter<TheSeamQuillMentionMenuOption[]> = new EventEmitter()

  @ViewChild('quillEditor')
  get quillEditor(): TemplateRef<QuillEditorComponent> | undefined {
    return this._quillEditor
  }
  set quillEditor(value: TemplateRef<QuillEditorComponent> | undefined) {
    this._quillEditor = value

    // setTimeout because full html isn't available until the next tick
    setTimeout(() => {
      this._pollCalculatedRowHeight.next()
    }, 0)
  }
  private _quillEditor: TemplateRef<QuillEditorComponent> | undefined

  @ViewChild('characterCounter') defaultCharacterCounterTpl: TemplateRef<any> | undefined

  private _isWritingValue = false

  private _pollCalculatedRowHeight = new Subject<void>()

  private _configSet = new BehaviorSubject<boolean>(false)
  public configSet$ = this._configSet.asObservable()

  private _stylesSet = new BehaviorSubject<boolean>(false)
  private _templateSet = new BehaviorSubject<boolean>(false)

  public initialized$: Observable<boolean>

  public characterCount$: Observable<number>

  private _config = new BehaviorSubject<TheSeamQuillEditorConfig | undefined>(undefined)
  public config$ = this._config.asObservable()

  private _selectedMentions = new BehaviorSubject<TheSeamQuillMentionMenuOption[]>([])
  public selectedMentions$ = this._selectedMentions.asObservable()

  constructor(
    private readonly _renderer: Renderer2,
    @Optional() @Inject(THESEAM_QUILL_EDITOR_CONFIG) private _customConfig?: TheSeamQuillEditorConfig
  ) {
    this.initialized$ = combineLatest([
      this._configSet.asObservable(),
      this._stylesSet.asObservable(),
      this._templateSet.asObservable(),
    ]).pipe(
      map(sets => sets.findIndex(s => !s) === -1)
    )

    this.characterCount$ = this.initialized$.pipe(
      filter(i => i),
      switchMap(() => {
        if (notNullOrUndefined(this.formControl)) {
          return this.formControl.valueChanges.pipe(
            startWith(this.formControl.value),
            map(v => this.characterCounterFn(v || '' as string, this._config.value?.format)),
          )
        }

        return of(0)
      })
    )

    this.selectedMentions$.pipe(
      tap(mentions => this.mentionsUpdated.emit(mentions))
    ).subscribe()
  }

  ngOnInit(): void {
    // TODO: test this more
    // ignore quill initial valueChange event, to keep functionality in line with other inputs
    let initialEmitComplete = false
    this._configSet.pipe(
      filter(s => s),
      switchMap(() => this.formControl.valueChanges.pipe(
        // skip(1),
        take(1),
        tap(() => initialEmitComplete = true)
      ))
    ).subscribe()

    this.formControl.valueChanges.pipe(
      filter(() => !this._isWritingValue && initialEmitComplete),
      tap(value => this.value = value)
    ).subscribe()

    this._pollCalculatedRowHeight.asObservable().pipe(
      tap(() => {
        this._stylesSet.next(false)

        const calculatedRowsHeight = `${this.rows * 1.5}rem`

        if (notNullOrUndefined(this.rows) && notNullOrUndefined(this._quillEditor)) {
          const editorEl = this._quillEditor.elementRef.nativeElement.querySelector('.ql-editor')

          if (notNullOrUndefined(editorEl)) {
            this._renderer.setStyle(editorEl, 'height', calculatedRowsHeight)
            this._renderer.setStyle(editorEl, 'min-height', calculatedRowsHeight)
          }
        }

        this._stylesSet.next(true)
      })
    ).subscribe()

    this._buildQuillConfig()
  }

  ngAfterViewInit(): void {
    if (isNullOrUndefined(this.characterCounterTpl)) {
      this.characterCounterTpl = this.defaultCharacterCounterTpl || null
    }

    this._templateSet.next(true)
  }

  private _buildQuillConfig() {
    this._configSet.next(false)

    const config: TheSeamQuillEditorConfig = {
      ...THESEAM_QUILL_EDITOR_CONFIG_DEFAULT
    }

    if (this.disableRichText) {
      config.format = 'text'
      config.formats = []
      config.modules = {
        toolbar: false
      }
    }
    else {
      config.format = this._getConfigOrDefault('format')
      config.formats = this._getConfigOrDefault('formats')
      config.modules = {
        ...this._getConfigOrDefault('modules')
      }
    }

    if (this.useMentions) {
      const mentionModules: TheSeamQuillModules = {
        ...config.modules,
        mention: {
          ...THESEAM_QUILL_MENTION_OPTIONS_DEFAULT,
          renderLoading: () => this.mentionListLoadingText,
          source: async (searchTerm: string, renderList: (list: any[], searchTerm: string) => void, mentionChar: string) => {
            // this function is called every time the menu is triggered,
            // so it will always have the latest value from mentionItems$
            const mentionsAsync = await lastValueFrom(this.mentionItems$.pipe(take(1)))

            if (notNullOrUndefined(mentionsAsync)) {
              this.mentionRenderListFn(mentionsAsync, this.mentionSearchFn, this.mentionListEmptyItem, searchTerm, renderList, mentionChar)
            }
          },
          ...config.modules?.mention,
        }
      }

      config.modules = mentionModules
    }

    config.theme = this._getConfigOrDefault('theme')
    config.debug = this._getConfigOrDefault('debug')
    config.customToolbarPosition = this._getConfigOrDefault('customToolbarPosition')
    config.sanitize = this._getConfigOrDefault('sanitize')
    config.styles = this._getConfigOrDefault('styles')
    config.strict = this._getConfigOrDefault('strict')
    config.scrollingContainer = this._getConfigOrDefault('scrollingContainer')
    config.bounds = this._getConfigOrDefault('bounds')
    config.customOptions = this._getConfigOrDefault('customOptions')
    config.customModules = this._getConfigOrDefault('customModules')
    config.trackChanges = this._getConfigOrDefault('trackChanges')
    config.preserveWhitespace = this._getConfigOrDefault('preserveWhitespace')
    config.classes = this._getConfigOrDefault('classes')
    config.trimOnValidation = this._getConfigOrDefault('trimOnValidation')
    config.linkPlaceholder = this._getConfigOrDefault('linkPlaceholder')
    config.compareValues = this._getConfigOrDefault('compareValues')
    config.filterNull = this._getConfigOrDefault('filterNull')
    config.debounceTime = this._getConfigOrDefault('debounceTime')

    this._config.next(config)

    // setTimeout bc ngx-quill library doesn't listen for input changes,
    // so we must destroy and create the component each time config is updated
    setTimeout(() => {
      this._configSet.next(true)
    }, 0)
  }

  private _getConfigOrDefault<K extends keyof TheSeamQuillEditorConfig>(prop: K): TheSeamQuillEditorConfig[K] {
    if (this._customConfig && Object.prototype.hasOwnProperty.call(this._customConfig, prop)) {
      return this._customConfig[prop]
    }
    return THESEAM_QUILL_EDITOR_CONFIG_DEFAULT[prop]
  }

  private _updateQuillConfig() {
    if (this._configSet.value) {
      this._buildQuillConfig()
    }
  }

  // Not usable, bc config has to be set immediately, potentially before mentions populate.
  // To set customDataAttributes, provide a custom config.
  // private _getCustomDataAttributes(mentions: TheSeamQuillMentionMenuOption[]): string[] {
  //   return mentions.reduce((acc, mention) => {
  //     const keys = Object.keys(mention)

  //     keys.forEach(key => {
  //       if (acc.findIndex(a => a === key) === -1) {
  //         acc.push(key)
  //       }
  //     })

  //     return acc
  //   }, <string[]>[] satisfies string[])
  // }

  get value(): string | undefined | null {
    return this._value
  }
  set value(value: string | undefined | null) {
    this._value = value

    if (this.onChange) { this.onChange(value) }
    if (this.onTouched) { this.onTouched() }
  }
  private _value: string | undefined | null

  writeValue(value: any): void {
    this._isWritingValue = true

    this.formControl.setValue(value)
    this.value = value

    this._isWritingValue = false
  }

  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }

  setDisabledState(isDisabled: boolean): void {
    this.readOnly = isDisabled
  }

  _onEditorCreated(event: any) {
    this.quillEditorCreated.emit(event)
  }

  _onEditorChanged(event: EditorChangeContent | EditorChangeSelection) {
    this.quillEditorChanged.emit(event)
  }

  _onContentChanged(event: ContentChange) {
    this.quillContentChanged.emit(event)

    this._updateMentionsFromDelta(event.content)
  }

  _onSelectionChanged(event: SelectionChange) {
    this.quillSelectionChanged.emit(event)
  }

  _onFocus(event: Focus) {
    this.quillFocus.emit(event)
  }

  _onBlur(event: Blur) {
    this.quillBlur.emit(event)

    if (this.onTouched) {
      this.onTouched()
    }
  }

  /**
   * Hacky way to track mention inserts/deletes
   */
  private _updateMentionsFromDelta(content: Delta) {
    if (notNullOrUndefined(content.ops)) {
      const contentMentionIds = content.ops.map(o => o.insert?.mention?.id).filter(notNullOrUndefined)
      const selectedMentions = [ ...this._selectedMentions.value ]
      const mentionOptions = [ ...this._mentionItems.value || [] ]

      const newMentions: TheSeamQuillMentionMenuOption[] = contentMentionIds.reduce((acc, mentionId) => {
        const insertMention = mentionOptions.find(m => isMentionMenuOption(m) && m.id === mentionId)

        if (notNullOrUndefined(insertMention)) {
          acc.push(insertMention)
        }
        else {
          console.warn('Mention addition failed! Selected mention option not found:', mentionId)
        }

        return acc
      }, <TheSeamQuillMentionMenuOption[]>[])

      let emitUpdate = false
      if (selectedMentions.length !== newMentions.length) {
        // if the length has changed, we know an update occurred
        emitUpdate = true
      }
      else {
        // otherwise, test ids for old and new items to see if we need to emit a change
        const selectedMentionIds = this._selectedMentions.value.map(m => m.id)
        const newMentionIds = newMentions.map(m => m.id)

        if (
          selectedMentionIds.findIndex(m => !newMentionIds.includes(m)) !== -1 ||
          newMentionIds.findIndex(m => !selectedMentionIds.includes(m)) !== -1
        ) {
          emitUpdate = true
        }
      }

      if (emitUpdate) {
        this._selectedMentions.next(newMentions)
      }
    }
  }
}
