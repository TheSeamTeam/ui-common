import {
  faFile,
  faFileAlt,
  faFileArchive,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFilePowerpoint,
  faFileWord
} from '@fortawesome/free-regular-svg-icons'

import { SeamIcon } from '../icon'

const FILE_EXTENSION_ICONS: { [type: string]: SeamIcon } = {
  'pdf': faFilePdf,
  'doc': faFileWord,
  'docx': faFileWord,
  'xls': faFileExcel,
  'xlsx': faFileExcel,
  'gif': faFileImage,
  'jpg': faFileImage,
  'jpeg': faFileImage,
  'png': faFileImage,
  'zip': faFileArchive,
  'ppt': faFilePowerpoint,
  'pptx': faFilePowerpoint,
  'txt': faFileAlt,
  'json': faFileAlt
}

export const DEFAULT_FILE_EXTENSION_ICON: SeamIcon = faFile

export function fileExtensionIcon(extension: string | null | undefined, defaultIfNotFound: boolean = true): SeamIcon | undefined {
  if (!extension) {
    return defaultIfNotFound ? DEFAULT_FILE_EXTENSION_ICON : undefined
  }

  let ext = extension
  if (ext.charAt(0) === '.') {
    ext = ext.substr(1)
  }

  const icon = FILE_EXTENSION_ICONS[ext]
  if (!icon && defaultIfNotFound) {
    return DEFAULT_FILE_EXTENSION_ICON
  }
  return icon
}
