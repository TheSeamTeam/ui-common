import { execSync } from 'child_process'

export function isYarnInstalled(): boolean {
  try {
    execSync('yarn bin').toString()
    return true
  } catch {
    return false
  }
}
