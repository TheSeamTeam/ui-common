/** A file the map tried to import and could not read. */
export interface TheSeamMapFileImportError {
  /** The file as the consumer's user chose or dropped it. */
  file: File

  /**
   * Whatever `readGeoFile` rejected with. Usually an `Error` carrying one of
   * its messages — `Shape data not found.`, `Unable to parse as GeoJSON.` —
   * but a malformed file can surface anything a parser throws, so it is not
   * narrowed.
   */
  error: unknown
}
