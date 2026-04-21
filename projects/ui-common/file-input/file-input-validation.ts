import { SeamFileRejection, SeamFileRejectionReason } from './file-item.models'

export interface FileValidationOptions {
  accept: string
  maxSize: number | null
  maxFiles: number | null
}

export interface FileValidationResult {
  accepted: File[]
  rejected: SeamFileRejection[]
}

/**
 * Validates a batch of files against accept / maxSize / maxFiles.
 *
 * `accept` is parsed as the standard comma-separated list: `.ext`, `mime/*`,
 * or `mime/subtype`. Matching against `file.type` is case-insensitive; when
 * `file.type` is empty, extension tokens (`.csv`) are tried against the file
 * name. Each rejected file accumulates ALL applicable reasons rather than
 * short-circuiting, so consumers can display comprehensive errors.
 *
 * `maxFiles` caps the total accepted count; files past the cap are rejected
 * with reason `'count'` in arrival order.
 */
export function validateFiles(
  files: File[],
  opts: FileValidationOptions,
): FileValidationResult {
  const acceptTokens = _parseAccept(opts.accept)
  const accepted: File[] = []
  const rejected: SeamFileRejection[] = []

  for (const file of files) {
    const reasons: SeamFileRejectionReason[] = []

    if (acceptTokens.length > 0 && !_matchesAccept(file, acceptTokens)) {
      reasons.push('type')
    }

    if (opts.maxSize !== null && file.size > opts.maxSize) {
      reasons.push('size')
    }

    if (reasons.length > 0) {
      rejected.push({ file, reasons })
      continue
    }

    if (opts.maxFiles !== null && accepted.length >= opts.maxFiles) {
      rejected.push({ file, reasons: ['count'] })
      continue
    }

    accepted.push(file)
  }

  return { accepted, rejected }
}

function _parseAccept(accept: string): string[] {
  return accept
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0)
}

function _matchesAccept(file: File, tokens: string[]): boolean {
  const mime = file.type.toLowerCase()
  const name = file.name.toLowerCase()

  for (const token of tokens) {
    if (token.startsWith('.')) {
      if (name.endsWith(token)) return true
      continue
    }
    if (!mime) continue
    if (token.endsWith('/*')) {
      const prefix = token.slice(0, -1) // keep the slash
      if (mime.startsWith(prefix)) return true
      continue
    }
    if (token === mime) return true
  }
  return false
}
