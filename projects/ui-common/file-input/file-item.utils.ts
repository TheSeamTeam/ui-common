import { SeamFileItem } from './file-item.models'

export function seamFileItemFromFile(file: File, id?: string): SeamFileItem {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    source: { kind: 'file', file },
    id,
  }
}
