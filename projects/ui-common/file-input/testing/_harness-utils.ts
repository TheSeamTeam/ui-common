export function dataTransferFromFiles(files: File[]): unknown {
  const dt = new DataTransfer()
  for (const f of files) dt.items.add(f)
  return dt
}
