
export function dynamicActionApiNotSupportedError(): Error {
  return Error(`Dynamic action type 'api' not supported.`)
}
