export function loadStyle(content: string): Promise<HTMLStyleElement> {
  return new Promise((resolve, reject) => {
    const s = document.createElement('style')
    s.onload = () => resolve(s)
    s.onerror = e => {
      document.head.removeChild(s)
      reject(e)
    }
    s.innerHTML = content
    document.head.appendChild(s)
  })
}
