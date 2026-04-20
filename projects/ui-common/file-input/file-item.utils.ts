import {
  faFile,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFileWord,
} from '@fortawesome/free-solid-svg-icons'

import { SeamIcon } from '@theseam/ui-common/icon'

import { SeamFileItem } from './file-item.models'

export function seamFileItemFromFile(file: File, id?: string): SeamFileItem {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    source: { kind: 'file', file },
    id,
  }
}

export interface SeamFileItemFromUrlOptions {
  name?: string
  type?: string
  size?: number
  id?: string
  thumbnailUrl?: string
}

export function seamFileItemFromUrl(
  url: string,
  opts: SeamFileItemFromUrlOptions = {},
): SeamFileItem {
  return {
    name: opts.name ?? _basenameFromUrl(url) ?? url,
    size: opts.size,
    type: opts.type,
    source: { kind: 'url', url },
    id: opts.id,
    thumbnailUrl: opts.thumbnailUrl,
  }
}

function _basenameFromUrl(url: string): string | null {
  // Strip query string and fragment before pulling the final path segment.
  const hashIdx = url.indexOf('#')
  const noHash = hashIdx >= 0 ? url.slice(0, hashIdx) : url
  const queryIdx = noHash.indexOf('?')
  const path = queryIdx >= 0 ? noHash.slice(0, queryIdx) : noHash

  // Find the last path segment (after the last /)
  const lastSlash = path.lastIndexOf('/')
  if (lastSlash < 0) return null

  const basename = path.slice(lastSlash + 1)

  // If there's an actual filename after the last slash, decode and return it
  if (basename) {
    try {
      return decodeURIComponent(basename)
    } catch {
      return basename
    }
  }

  // No basename (e.g., trailing slash or just protocol/domain), return null
  return null
}

/**
 * Extracts native `File` objects from items whose source is `file`. Items
 * backed by a URL or a Blob are ignored. Useful for submit-side mapping
 * when the consumer only cares about newly-uploaded blobs.
 */
export function seamFilesFromItems(items: SeamFileItem[]): File[] {
  const files: File[] = []
  for (const item of items) {
    if (item.source.kind === 'file') {
      files.push(item.source.file)
    }
  }
  return files
}

const WORD_MIMES = new Set<string>([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const EXCEL_MIMES = new Set<string>([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
])

/**
 * Maps a MIME type to a built-in SeamIcon. Returns a generic file icon for
 * unknown, empty, or missing types. Returns SeamIcon (not IconDefinition) so
 * the icon set can change later without a breaking signature change.
 */
export function iconForMime(type: string | undefined): SeamIcon {
  if (!type) return faFile
  if (type === 'application/pdf') return faFilePdf
  if (type.startsWith('image/')) return faFileImage
  if (WORD_MIMES.has(type)) return faFileWord
  if (EXCEL_MIMES.has(type)) return faFileExcel
  return faFile
}
