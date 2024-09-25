import { InjectionToken } from "@angular/core"
import { QuillToolbarConfig } from "ngx-quill"
import { TheSeamQuillModules, TheSeamQuillStyleFormat, TheSeamQuillEditorConfig, TheSeamQuillMentionMenuOption, TheSeamQuillInputFormat, TheSeamQuillMentionOptions, TheSeamQuillMentionSourceFn, TheSeamQuillMentionSearchFn, TheSeamCharacterCounterFn, TheSeamQuillMentionMenuItem } from "./models"
import { isNullOrUndefined, notNullOrUndefined, notNullOrUndefinedOrEmpty } from "@theseam/ui-common/utils"

export const HTML_ENTITY_REGEX = /<[^>]+>/gm

export const THESEAM_QUILL_TOOLBAR_OPTIONS_DEFAULT: QuillToolbarConfig = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [0, 1, 2, 3, 4, 5] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link'],
  ['clean'],
]

export const THESEAM_QUILL_MENTION_OPTIONS_DEFAULT: Partial<TheSeamQuillMentionOptions> = {
  spaceAfterInsert: false,
  positioningStrategy: 'fixed',
  dataAttributes: [ 'type' ]
}

export const THESEAM_QUILL_MODULES_DEFAULT: TheSeamQuillModules = {
  toolbar: THESEAM_QUILL_TOOLBAR_OPTIONS_DEFAULT
}

export const THESEAM_QUILL_FORMATS_DEFAULT: TheSeamQuillStyleFormat[] = [
  'align',
  'bold',
  'header',
  'indent',
  'italic',
  'link',
  'list',
  'size',
  'strike',
  'underline',
  'mention'
]

export const THESEAM_QUILL_EDITOR_CONFIG_DEFAULT: TheSeamQuillEditorConfig = {
  format: 'html',
  modules: THESEAM_QUILL_MODULES_DEFAULT,
  formats: THESEAM_QUILL_FORMATS_DEFAULT,
  linkPlaceholder: 'https://google.com',
  customToolbarPosition: 'top',
  sanitize: false,
  strict: true,
  customOptions: [],
  customModules: [],
  preserveWhitespace: false,
  trimOnValidation: false,
  compareValues: false,
  filterNull: false
}

export const THESEAM_QUILL_EDITOR_CONFIG = new InjectionToken<TheSeamQuillEditorConfig>('TheSeamQuillEditorConfig')

export const defaultHtmlCharacterCounterFn: TheSeamCharacterCounterFn = (value: string, format: TheSeamQuillInputFormat | undefined): number => {
  if (format === 'html') {
    return value.replace(HTML_ENTITY_REGEX, ' ').replace(/\s\s+/g, ' ').trim().length
  }
  else if (format === 'text') {
    return value.replace(/\s\s+/g, ' ').trim().length
  }
  else {
    console.warn(`Format ${format} not supported!`)
    return 0
  }
}

export function isMentionMenuOption(value: TheSeamQuillMentionMenuItem | undefined): value is TheSeamQuillMentionMenuOption {
  if (isNullOrUndefined(value) || typeof value !== 'object') {
    return false
  }

  return Object.prototype.hasOwnProperty.call(value, 'id')
}

export const defaultMentionSearchFn: TheSeamQuillMentionSearchFn = (source: TheSeamQuillMentionMenuItem[], textAfter: string, mentionChar: string) => {
  return source.filter(u => {
    if (!isMentionMenuOption(u) || u.searchIgnore === true) {
      return true
    }

    return u.value.toLowerCase().includes(textAfter.toLowerCase())
  })
}

export const defaultMentionRenderListFn: TheSeamQuillMentionSourceFn = (source: TheSeamQuillMentionMenuItem[], searchFn: TheSeamQuillMentionSearchFn, emptyListItem: TheSeamQuillMentionMenuItem | undefined, textAfter: string, renderList: (list: any[], searchTerm: string) => any, mentionChar: string) => {
  let list = searchFn(source, textAfter, mentionChar)

  if (list.length === 0 && notNullOrUndefined(emptyListItem)) {
    list.push(emptyListItem)
  }
  else {
    let reduceIdx = 0
    list = list.reduce((acc, mention) => {
      const previousMenuItem = acc[reduceIdx - 1]
      const previousMenuItemGroupName = isMentionMenuOption(previousMenuItem) ? previousMenuItem.groupName : undefined
      if (isMentionMenuOption(mention)
          && notNullOrUndefinedOrEmpty(mention.groupName)
          && mention.groupName !== previousMenuItemGroupName
      ) {
        acc.push({
          value: mention.groupName,
          disabled: true,
          type: 'groupName'
        })

        reduceIdx++
      }

      if (!isMentionMenuOption(mention)) {
        mention.disabled = true
      }

      acc.push(mention)
      reduceIdx++

      return acc
    }, <TheSeamQuillMentionMenuItem[]>[] satisfies TheSeamQuillMentionMenuItem[])
  }

  renderList(list, textAfter)
}

// Keeping this as an example for a custom menu item.
// There doesn't appear to be a better way of passing in a custom template.
// export const defaultMentionRenderItem = (item: TheSeamQuillMentionListItem) => {
  // if (item.type === 'groupName') {
  //   const text = document.createElement('div')
  //   text.setAttribute('class', 'small text-black-50')
  //   text.innerText = item.value

  //   return text.outerHTML
  // }
  // else if (item.type === 'divider') {
  //   const div = document.createElement('hr')
  //   div.setAttribute('class', 'my-2')
  //   return div.outerHTML
  // }
  // else {
  //   return item.value
  // }
// }
