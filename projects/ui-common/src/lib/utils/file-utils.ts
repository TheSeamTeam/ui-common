import fileType from '@marklb/file-type'
// import { Buffer } from 'buffer/'
const Buffer = require('buffer/').Buffer

export function readFileAsync(file: any): Promise<ArrayBuffer | null> {
  return new Promise<ArrayBuffer | null>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as ArrayBuffer | null)
    }
    reader.readAsArrayBuffer(file)
  })
}

export async function readFileAsDataUrlAsync(file: Blob): Promise<string | null> {
  return new Promise<string | null>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result as string | null)
    }
    reader.readAsDataURL(file)
  })
}

export async function fileBufferToBlob(
  fileBuffer: Buffer,
  defaultMime: string = 'application/octet-stream'
): Promise<Blob> {
  const fType = fileType(fileBuffer)
  const mime = (fType) ? fType.mime : defaultMime
  const blob = new Blob([fileBuffer as any], { type: mime })
  return blob
}

export async function fileBufferToObjectUrl(
  fileBuffer: Buffer,
  defaultMime: string = 'application/octet-stream'
): Promise<string> {
  const file = await fileBufferToBlob(fileBuffer, defaultMime)
  const fileURL = URL.createObjectURL(file)
  return fileURL
}

export interface IFileData {
  ext?: string
  mime?: string
  blob: Blob
}

export async function fileDataFromBuffer(
  fileBuffer: Buffer | Uint8Array | ArrayBuffer,
  defaultMime: string = 'application/octet-stream'
): Promise<IFileData> {
  const _fileBuffer = Buffer.from(fileBuffer)
  const fType = fileType(_fileBuffer as any)
  const ext = fType && fType.ext || undefined
  const mime = fType ? fType.mime : defaultMime
  const blob = new Blob([_fileBuffer as any], { type: mime })
  const fileData: IFileData = { ext, mime, blob }
  return fileData
}

export function openBlob(blob: Blob, target?: string, filename?: string) {
  // NOTE: IE and MSEdge do not allow Blob resources as a source for
  // tabs or iframes. msSaveOrOpenBlob is used as a workaround. I
  // haven't been able to find a way to just open the Blob file in
  // another tab yet for IE or MSEdge.
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename)
  } else {
    const url = URL.createObjectURL(blob)
    window.open(url, target)
  }
}
