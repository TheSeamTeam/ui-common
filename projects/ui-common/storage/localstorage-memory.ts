
export class LocalStorageMemory implements Storage {
  [name: string]: any

  private _cache: { [key: string]: string } = {}

  /**
   * Number of stored items.
   */
  public length = 0

  /**
   * Removes all stored items and sets length to 0.
   */
  public clear(): void {
    this._cache = {}
    this.length = 0
  }

  /**
   * Returns item for passed key, or null.
   *
   * @param key name of item to be returned.
   */
  public getItem(key: string): string | null {
    if (key in this._cache) {
      return this._cache[key]
    }

    return null
  }

  /**
   * Returns name of key at passed index.
   *
   * @param index position for key to be returned (starts at 0).
   */
  public key(index: number): string | null {
    return Object.keys(this._cache)[index] || null
  }

  /**
   * Removes item for passed key.
   *
   * @param key name of item to be removed.
   */
  public removeItem(key: string): void {
    if (Object.prototype.hasOwnProperty.call(this._cache, key)) {
      delete this._cache[key]
      this.length--
    }
  }

  /**
   * Sets item for key to passed value, as string.
   *
   * @param key name of item to be set.
   * @param value value, will always be turned into a string.
   */
  public setItem(key: string, value: string): void {
    if (typeof value === 'undefined') {
      this.removeItem(key)
    } else {
      if (!Object.prototype.hasOwnProperty.call(this._cache, key)) {
        this.length++
      }

      this._cache[key] = `${value}`
    }
  }

}
