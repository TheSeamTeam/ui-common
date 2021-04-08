export async function waitOnConditionAsync(
  condition: () => boolean,
  timeoutDuration: number = -1,
  throwOnTimeout: boolean = true
): Promise<any> {
  const timeStart: any = new Date()

  const _waitFunc = (callback: (boolean: boolean) => any) => {
    let conditionSuccess = false

    if (condition()) {
      callback(true)
      conditionSuccess = true
    }

    if (!conditionSuccess) {
      const timeNow: any = new Date()
      const duration = timeNow - timeStart
      if (timeoutDuration > -1 && duration > timeoutDuration) {
        if (throwOnTimeout) {
          throw new Error('Timed out waiting on condition.')
        } else {
          callback(false)
        }
      }

      setTimeout(() => { _waitFunc(callback) }, 30)
    }
  }

  return new Promise((resolve, reject) => {
    const fn = (b: boolean) => {
      resolve(b)
    }
    _waitFunc(fn)
  })
}
