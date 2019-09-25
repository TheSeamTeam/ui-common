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

import { LibIcon } from '../icon'

const FILE_EXTENSION_ICONS = {
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

const DEFAULT_FILE_EXTENSION_ICON = faFile

export function fileExtensionIcon(extension: string | null | undefined, defaultIfNotFound: boolean = true): LibIcon | undefined {
  if (!extension) {
    return DEFAULT_FILE_EXTENSION_ICON
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
