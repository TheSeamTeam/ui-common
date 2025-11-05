// TODO: We may be able to avoid this by getting the Storybook tsconfig and our
// apps Angular builds more in-sync or when Storybook updates the builder that
// it uses. For now, this should give a reliable ESM and CJS interop for the
// XLSX library.

/**
 * Imports the XLSX library.
 *
 * This should be used instead of direct dynamic imports to ensure
 * compatibility. It may be better to just import normally, but most datatables
 * don't do client-side XLSX processing so dynamic imports are preferred.
 *
 * @returns The XLSX library.
 */
export async function importXlsx(): Promise<any> {
  // TODO: Fix typing for the dynamic imports
  const XLSX = await import('xlsx')
  return XLSX.default ?? XLSX
}
