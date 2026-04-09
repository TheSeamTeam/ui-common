import { fileTypeFromBuffer } from 'file-type'

export function readFileAsync(file: Blob): Promise<ArrayBuffer | null> {
  return new Promise<ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer | null)
    }
    reader.readAsArrayBuffer(file)
  })
}

export async function readFileAsDataUrlAsync(
  file: Blob,
): Promise<string | null> {
  return new Promise<string | null>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string | null)
    }
    reader.readAsDataURL(file)
  })
}

/** Coerce a buffer to an ArrayBuffer suitable for use as a BlobPart. */
function toArrayBuffer(buffer: Uint8Array | ArrayBuffer): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) {
    return buffer
  }
  // Slice to get an owned ArrayBuffer, avoiding SharedArrayBuffer TS issues with BlobPart.
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer
}

export async function fileBufferToBlob(
  buffer: Uint8Array | ArrayBuffer,
  defaultMime: string = 'application/octet-stream',
): Promise<Blob> {
  const fType = await fileTypeFromBuffer(buffer)
  const mime = fType ? fType.mime : defaultMime
  return new Blob([toArrayBuffer(buffer)], { type: mime })
}

export async function fileBufferToObjectUrl(
  buffer: Uint8Array | ArrayBuffer,
  defaultMime: string = 'application/octet-stream',
): Promise<string> {
  const file = await fileBufferToBlob(buffer, defaultMime)
  return URL.createObjectURL(file)
}

export interface IFileData {
  ext?: string
  mime?: string
  blob: Blob
}

export async function fileDataFromBuffer(
  buffer: Uint8Array | ArrayBuffer,
  defaultMime: string = 'application/octet-stream',
): Promise<IFileData> {
  const fType = await fileTypeFromBuffer(buffer)
  const ext = fType?.ext
  const mime = fType ? fType.mime : defaultMime
  const blob = new Blob([toArrayBuffer(buffer)], { type: mime })
  return { ext, mime, blob }
}

export function openBlob(blob: Blob, target?: string, filename?: string) {
  const url = URL.createObjectURL(blob)
  const win = window.open(url, target)
  // TODO: Consider if always setting opener to null is to restrictive
  // if (win && target && target.toLowerCase() === '_blank') {
  //   win.opener = null
  // }
}
