import { CustomModule, CustomOption, QuillModules } from 'ngx-quill'
import QuillType from 'quill'

export interface TheSeamQuillMentionMenuOption {
  /** Must be unique. */
  id: string

  /**
   * The value is used as the label for the mentions,
   * both in the text area and in the menu.
   */
  value: string

  /**
   * When `true`, this item will be included in the menu,
   * regardless of the search function applied.
   */
  searchIgnore?: boolean

  /**
   * If provided, will group items with the same `groupName`
   * under one header.
   */
  groupName?: string

  /** Any additional optional parameters */
  [key: string]: any
}

export interface TheSeamQuillMentionMenuDivider {
  type: 'divider'
  disabled?: boolean
}

export interface TheSeamQuillMentionMenuHeader {
  value: string
  type: 'groupName'
  disabled?: boolean
}

export type TheSeamQuillMentionMenuItem = TheSeamQuillMentionMenuOption | TheSeamQuillMentionMenuDivider | TheSeamQuillMentionMenuHeader

export type TheSeamQuillMentionSearchFn = (
  source: TheSeamQuillMentionMenuItem[],
  textAfter: string,
  mentionChar: string
) => TheSeamQuillMentionMenuItem[]

export type TheSeamQuillMentionSourceFn = (
  source: TheSeamQuillMentionMenuItem[],
  searchFn: TheSeamQuillMentionSearchFn,
  emptyListItem: TheSeamQuillMentionMenuItem | undefined,
  textAfter: string,
  renderList: (
    matches: {
      id: string
      value: string
      [key: string]: string | undefined
    }[],
    searchTerm: string
  ) => void,
  mentionChar: string
) => void

/**
 * Typed version of Options object, copied from quill-mention@v6.0.1 (typescript version)
 */
export interface TheSeamQuillMentionOptions {
  /**
   * Specifies which characters will cause the mention autocomplete to open
   * @default ['@']
   */
  mentionDenotationChars?: string[]

  /**
   * Whether to show the used denotation character in the mention item or not
   * @default true
   */
  showDenotationChar?: boolean

  /**
   * Allowed characters in search term triggering a search request using regular expressions. Can be a function that takes the denotationChar and returns a regex.
   * @default /^[a-zA-Z0-9_]*$/
   */
  allowedChars?: RegExp | ((char: string) => RegExp)

  /**
   * Minimum number of characters after the @ symbol triggering a search request
   * @default 0
   */
  minChars?: number

  /**
   * Maximum number of characters after the @ symbol triggering a search request
   * @default 31
   */
  maxChars?: number

  /**
   * Additional top offset of the mention container position
   * @default 2
   */
  offsetTop?: number

  /**
   * Additional left offset of the mention container position
   * @default 0
   */
  offsetLeft?: number

  /**
   * Whether or not the denotation character(s) should be isolated. For example, to avoid mentioning in an email.
   * @default false
   */
  isolateCharacter?: boolean

  /**
   * Only works if isolateCharacter is set to true. Whether or not the denotation character(s) can appear inline of the mention text. For example, to allow mentioning an email with the @ symbol as the denotation character.
   * @default false
   */
  allowInlineMentionChar?: boolean

  /**
   * When set to true, the mentions menu will be rendered above or below the quill container. Otherwise, the mentions menu will track the denotation character(s);
   * @default false
   */
  fixMentionsToQuill?: boolean

  /**
   * Options are 'normal' and 'fixed'. When 'fixed', the menu will be appended to the body and use fixed positioning. Use this if the menu is clipped by a parent element that's using `overflow:hidden
   * @default 'normal'
   */
  positioningStrategy?: 'normal' | 'fixed'

  /**
   * Options are 'bottom' and 'top'. Determines what the default orientation of the menu will be. Quill-mention will attempt to render the menu either above or below the editor. If 'top' is provided as a value, and there is not enough space above the editor, the menu will be rendered below. Vice versa, if there is not enough space below the editor, and 'bottom' is provided as a value (or no value is provided at all), the menu will be rendered above the editor.
   * @default 'bottom'
   */
  defaultMenuOrientation?: 'top' | 'bottom'

  /**
   * The name of the Quill Blot to be used for inserted mentions. A default implementation is provided named 'mention', which may be overridden with a custom blot.
   * @default 'mention'
   */
  blotName?: string

  /**
   * A list of data values you wish to be passed from your list data to the html node. (id, value, denotationChar, link, target are included by default).
   * @default ['id', 'value', 'denotationChar', 'link', 'target', 'disabled']
   */
  dataAttributes?: string[]

  /**
   * Link target for mentions with a link
   * @default '_blank'
   */
  linkTarget?: string

  /**
   * Style class to be used for list items (may be null)
   * @default 'ql-mention-list-item'
   */
  listItemClass?: string

  /**
   * Style class to be used for the mention list container (may be null)
   * @default 'ql-mention-list-container'
   */
  mentionContainerClass?: string

  /**
   * Style class to be used for the mention list (may be null)
   * @default 'ql-mention-list'
   */
  mentionListClass?: string

  /**
   * Whether or not insert 1 space after mention block in text
   * @default true
   */
  spaceAfterInsert?: boolean

  /**
   * An array of keyboard key codes that will trigger the select action for the mention dropdown. Default is ENTER key. See this reference for a list of numbers for each keyboard key.
   * @default [13]
   */
  selectKeys?: (string | number | string)[]

  /**
   * Required callback function to handle the search term and connect it to a data source for matches. The data source can be a local source or an AJAX request.
   * The callback should call renderList(matches, searchTerm); with matches of JSON Objects in an array to show the result for the user. The JSON Objects should have id and value but can also have other values to be used in renderItem for custom display.
   * @param textAfter
   * @param render
   * @param mentionChar
   * @returns
   */
  source: (
    textAfter: string,
    renderList: (
      matches: {
        id: string
        value: string
        [key: string]: string | undefined
      }[],
      searchTerm: string
    ) => void,
    mentionChar: string
  ) => void

  /**
   * Callback when mention dropdown is open.
   * @returns
   */
  onOpen?: () => boolean

  /**
   * Callback before the DOM of mention dropdown is removed.
   * @returns
   */
  onBeforeClose?: () => boolean

  /**
   * Callback when mention dropdown is closed.
   * @returns
   */
  onClose?: () => boolean

  /**
   * A function that gives you control over how matches from source are displayed. You can use this function to highlight the search term or change the design with custom HTML. This function will need to return either a string possibly containing unsanitized user content, or a class implementing the Node interface which will be treated as a sanitized DOM node.
   * @param item
   * @param searchTerm
   * @returns
   */
  renderItem?: (
    item: { id: string; value: string; [key: string]: unknown },
    searchTerm: string
  ) => string | HTMLElement

  /**
   * A function that returns the HTML for a loading message during async calls from source. The function will need to return either a string possibly containing unsanitized user content, or a class implementing the Node interface which will be treated as a sanitized DOM node. The default functions returns null to prevent a loading message.
   * @returns
   */
  renderLoading?: () => string | HTMLElement | null

  /**
   * Callback for a selected item. When overriding this method, insertItem should be used to insert item to the editor. This makes async requests possible.
   * @param item
   * @param insertItem
   */
  onSelect?: (
    item: DOMStringMap,
    insertItem: (
      data: Record<string, unknown>,
      programmaticInsert?: boolean,
      overriddenOptions?: object
    ) => void
  ) => void
}

export interface TheSeamQuillModules extends QuillModules {
  mention?: Partial<TheSeamQuillMentionOptions>
}

export const THESEAM_QUILL_FORMATS = [
  'align',
  'background',
  'blockquote',
  'bold',
  'code-block',
  'code',
  'color',
  'direction',
  'font',
  'header',
  'image',
  'indent',
  'italic',
  'link',
  'list',
  'script',
  'size',
  'strike',
  'underline',
  'video',
  'mention'
] as const

export type TheSeamQuillStyleFormat = (typeof THESEAM_QUILL_FORMATS)[number]

export type TheSeamQuillInputFormat = 'object' | 'html' | 'text' | 'json'

export interface TheSeamQuillEditorConfig {
  /**
   * The format of the text inside the editor.
   *
   * @default 'html'
   */
  format: TheSeamQuillInputFormat

  /** @default 'snow' */
  theme?: string

  /**
   * Used to set custom config for built-in and add-on modules.
   *
   * See `SEAM_QUILL_MODULES_DEFAULT` for default value.
   */
  modules?: TheSeamQuillModules

  /**
   * Console level for debug messages.
   *
   * @default `warn`
   */
  debug?: 'warn' | 'log' | 'error' | false

  /**
   * List of formats allowed in editor.
   *
   * See `SEAM_QUILL_FORMATS_DEFAULT` for default value.
   *
   * NOTE: Adding or removing a value will enable/disable that format
   * in the editor, but has no effect on the toolbar buttons.
   * To modify the toolbar display, update `modules.toolbar`.
   */
  formats?: TheSeamQuillStyleFormat[] | null

  /** @default 'top' */
  customToolbarPosition: 'top' | 'bottom'

  /**
   * When `true`, runs the control value through Angular's DOM sanitizer
   * before setting the value.
   *
   * @default false
   */
  sanitize: boolean

  /** Custom css styles to add to the `.ql-container` element. */
  styles?: { [key: string]: string } | null

  /**
   * When `false`, user interactions in the toolbar will emit even
   * if the editor is marked as `readOnly`. This allows the user to
   * make some formatting changes (e.g. creating a list) to a value
   * that should be disabled.
   *
   * @default true.
   */
  strict: boolean

  /**
   * An element or selector that specifies the scrolling element of the editor.
   *
   * Default scrollingContainer is the `.ql-editor` element.
   */
  scrollingContainer?: HTMLElement | string | null

  /**
   * An element or selector that specifies the confining element of the editor.
   *
   * Default boundary container is the document's `body` element.
   */
  bounds?: HTMLElement | string

  /**
   * Defines custom formats for the editor. Can be used to overwrite existing options.
   *
   * TODO: Research this more.
   */
  customOptions: CustomOption[]

  /**
   * Defines custom modules for the editor. Can be used to overwrite existing modules.
   *
   * TODO: Research this more.
   */
  customModules: CustomModule[]

  /**
   * When `user`, only change events from the user will trigger a model change.
   * This is the default behavior, and is preferred.
   *
   * Changing to `all` is not recommended.
   */
  trackChanges?: 'user' | 'all'

  /**
   * When `true`, preserves duplicated whitespaces.
   *
   * @default false
   */
  preserveWhitespace: boolean

  /** Custom classes to add to the `.ql-container` element. */
  classes?: string

  /**
   * When `true`, trims leading/trailing newlines when validation is run.
   *
   * @default false
   */
  trimOnValidation: boolean

  /**
   * Sets a placeholder for the link input in the hyperlink form.
   *
   * @default 'https://quilljs.com'
   */
  linkPlaceholder?: string

  /**
   * When `true`, does a basic compare (using JSON.stringify) between the old
   * and new value on `writeValue()`. If the values are the same, it skips the update.
   *
   * @default false
   */
  compareValues: boolean

  /**
   * When `true`, skips the update for null values on `writeValue()`.
   *
   * @default false
   */
  filterNull: boolean

  /**
   * Debounces `onContentChanged()`, `onEditorChanged()`, `ngModel` and form control `valueChange()`.
   *
   * Defaults to `undefined`, so changes always emit immediately.
   *
   * @default undefined
   */
  debounceTime?: number

  /**
   * @deprecated The `ngx-quill` library doesn't accurately handle undefined
   * inputs, and the default `valueGetter` function is impossible to reference here,
   * so this config option is not used.
   *
   * Defines custom logic for reading the html value of the editor.
   */
  valueGetter?: (
    quillEditor: QuillType,
    editorElement: HTMLElement
  ) => string | any

  /**
   * @deprecated The `ngx-quill` library doesn't accurately handle undefined
   * inputs, and the default `valueSetter` function is impossible to reference here,
   * so this config option is not used.
   *
   * Defines custom logic for setting the html value of the editor.
   */
  valueSetter?: (quillEditor: QuillType, value: any) => any
}

export type TheSeamCharacterCounterFn = (
  value: string,
  format: TheSeamQuillInputFormat | undefined
) => number
