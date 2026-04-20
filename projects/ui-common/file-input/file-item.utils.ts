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
