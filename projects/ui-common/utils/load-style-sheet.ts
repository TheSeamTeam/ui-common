export function loadStyleSheet(path: string): Promise<HTMLLinkElement> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('link')
    s.onload = () => resolve(s)
    s.onerror = e => {
      document.head.removeChild(s)
      reject(e)
    }
    s.rel = 'stylesheet'
    s.href = path
    document.head.appendChild(s)
  })
}
