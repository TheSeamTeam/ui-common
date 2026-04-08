import {
  fileBufferToBlob,
  fileBufferToObjectUrl,
  fileDataFromBuffer,
  readFileAsync,
  readFileAsDataUrlAsync,
} from './file-utils'

jest.mock('file-type', () => ({
  fileTypeFromBuffer: jest.fn(),
}))

import { fileTypeFromBuffer } from 'file-type'

const mockFileTypeFromBuffer = fileTypeFromBuffer as jest.Mock

describe('file-utils', () => {
  beforeEach(() => {
    mockFileTypeFromBuffer.mockReset()
  })

  describe('readFileAsync', () => {
    it('should read a File as ArrayBuffer', async () => {
      const content = new Uint8Array([1, 2, 3, 4])
      const file = new File([content], 'test.bin')

      const result = await readFileAsync(file)

      expect(result).toBeInstanceOf(ArrayBuffer)
      expect(new Uint8Array(result!)).toEqual(content)
    })
  })

  describe('readFileAsDataUrlAsync', () => {
    it('should read a Blob as data URL', async () => {
      const blob = new Blob(['hello'], { type: 'text/plain' })

      const result = await readFileAsDataUrlAsync(blob)

      expect(result).toMatch(/^data:/)
    })
  })

  describe('fileBufferToBlob', () => {
    it('should detect mime type from buffer', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'png',
        mime: 'image/png',
      })
      const buffer = new ArrayBuffer(8)

      const blob = await fileBufferToBlob(buffer)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
    })

    it('should use default mime when type is not detected', async () => {
      mockFileTypeFromBuffer.mockResolvedValue(undefined)
      const buffer = new ArrayBuffer(8)

      const blob = await fileBufferToBlob(buffer)

      expect(blob.type).toBe('application/octet-stream')
    })

    it('should use custom default mime', async () => {
      mockFileTypeFromBuffer.mockResolvedValue(undefined)
      const buffer = new ArrayBuffer(8)

      const blob = await fileBufferToBlob(buffer, 'text/plain')

      expect(blob.type).toBe('text/plain')
    })

    it('should accept Uint8Array', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'bin',
        mime: 'application/octet-stream',
      })
      const buffer = new Uint8Array([1, 2, 3])

      const blob = await fileBufferToBlob(buffer)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBe(3)
    })
  })

  describe('fileBufferToObjectUrl', () => {
    it('should return an object URL', async () => {
      const mockUrl = 'blob:http://localhost/fake-id'
      const original = URL.createObjectURL
      URL.createObjectURL = jest.fn().mockReturnValue(mockUrl)
      mockFileTypeFromBuffer.mockResolvedValue(undefined)
      const buffer = new ArrayBuffer(4)

      const url = await fileBufferToObjectUrl(buffer)

      expect(url).toBe(mockUrl)
      expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob))
      URL.createObjectURL = original
    })
  })

  describe('fileDataFromBuffer', () => {
    it('should return ext, mime, and blob when type is detected', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'pdf',
        mime: 'application/pdf',
      })
      const buffer = new ArrayBuffer(8)

      const result = await fileDataFromBuffer(buffer)

      expect(result.ext).toBe('pdf')
      expect(result.mime).toBe('application/pdf')
      expect(result.blob).toBeInstanceOf(Blob)
      expect(result.blob.type).toBe('application/pdf')
    })

    it('should return undefined ext and default mime when type is not detected', async () => {
      mockFileTypeFromBuffer.mockResolvedValue(undefined)
      const buffer = new ArrayBuffer(8)

      const result = await fileDataFromBuffer(buffer)

      expect(result.ext).toBeUndefined()
      expect(result.mime).toBe('application/octet-stream')
    })

    it('should accept Uint8Array input', async () => {
      mockFileTypeFromBuffer.mockResolvedValue({
        ext: 'jpg',
        mime: 'image/jpeg',
      })
      const buffer = new Uint8Array([0xff, 0xd8, 0xff])

      const result = await fileDataFromBuffer(buffer)

      expect(result.ext).toBe('jpg')
      expect(result.blob.size).toBe(3)
    })
  })
})
