import { faFilePdf } from '@fortawesome/free-regular-svg-icons'

import { DEFAULT_FILE_EXTENSION_ICON, fileExtensionIcon } from './file-extension-icon'

fdescribe('fileExtensionIcon', () => {

  describe('`defaultIfNotFound` is `true`', () => {

    it('should return `DEFAULT_FILE_EXTENSION_ICON` if the input is `undefined or `null`', () => {
      expect(fileExtensionIcon(undefined, true)).toBe(DEFAULT_FILE_EXTENSION_ICON)
      expect(fileExtensionIcon(null, true)).toBe(DEFAULT_FILE_EXTENSION_ICON)
    })

    it('should return the icon if the input is a known file extension', () => {
      expect(fileExtensionIcon('pdf', true)).toBe(faFilePdf)
    })

    it('should return `DEFAULT_FILE_EXTENSION_ICON` if the input is not a known file extension', () => {
      expect(fileExtensionIcon('test', true)).toBe(DEFAULT_FILE_EXTENSION_ICON)
    })

  })

  describe('`defaultIfNotFound` is `false`', () => {

    it('should return `undefined` if the input is `undefined or `null`', () => {
      expect(fileExtensionIcon(undefined, false)).toBe(undefined)
      expect(fileExtensionIcon(null, false)).toBe(undefined)
    })

    it('should return the icon if the input is a known file extension', () => {
      expect(fileExtensionIcon('pdf', false)).toBe(faFilePdf)
    })

    it('should return `undefined` if the input is not a known file extension', () => {
      expect(fileExtensionIcon('test', false)).toBe(undefined)
    })

  })

})
