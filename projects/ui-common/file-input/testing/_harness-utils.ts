import type { EventData } from '@angular/cdk/testing'

export function dataTransferFromFiles(files: File[]): EventData {
  const dt = new DataTransfer()
  for (const f of files) dt.items.add(f)
  return dt as unknown as EventData
}
