/** Tagged union describing where a file item's bytes (or asset pointer) live. */
export type SeamFileItemSource =
  | { kind: 'file'; file: File }
  | { kind: 'url'; url: string }
  | { kind: 'blob'; blob: Blob }

/**
 * A file entry usable by `<seam-file-tile>` and `<seam-file-field>`.
 *
 * Covers three cases:
 * - Pending upload (File source)
 * - Already-uploaded server asset (URL source)
 * - In-memory bytes without a File wrapper (Blob source)
 */
export interface SeamFileItem {
  /** Display name. */
  name: string
  /** Bytes. Known for File/Blob; optional for URL. */
  size?: number
  /** MIME type. Known for File/Blob; may be absent for URL. */
  type?: string
  /** Where the bytes (or the asset pointer) live. */
  source: SeamFileItemSource
  /** Consumer-supplied tracking key (e.g. documentId, syncId). */
  id?: string
  /** Override thumbnail URL. Otherwise derived for image sources. */
  thumbnailUrl?: string
}

/** Why a file was rejected at selection/drop time. */
export type SeamFileRejectionReason = 'type' | 'size' | 'count'

/** One rejected file and the set of reasons it failed validation. */
export interface SeamFileRejection {
  file: File
  reasons: SeamFileRejectionReason[]
}

/** Tile layout. `row` = horizontal list item; `preview` = thumbnail tile. */
export type SeamFileTileVariant = 'row' | 'preview'
