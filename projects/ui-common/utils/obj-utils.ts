/** Returns object without property */
export function withoutProperty<T, K extends keyof T>(obj: T, propName: K): Pick<T, Exclude<keyof T, K>> {
  const { [propName]: _, ...without } = obj
  return without
}

/** Returns object without properties */
export function withoutProperties<T, K extends keyof T>(obj: T, propNames: K[]): Pick<T, Exclude<keyof T, K>> {
  let without: any = obj
  for (const propName of propNames) {
    without = withoutProperty(without, propName)
  }
  return without
}

/** Delete property of object */
export function deleteProperty<T extends {}, K extends keyof T>(obj: T, propName: K): void {
  if (obj.hasOwnProperty(propName)) {
    delete obj[propName]
  }
}

/** Delete properties of object */
export function deleteProperties<T extends {}, K extends keyof T>(obj: T, propNames: K[]): void {
  for (const propName of propNames) {
    deleteProperty(obj, propName)
  }
}
