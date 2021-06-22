
export function gqlVar(varName: string): { gqlVar: string } {
  return { gqlVar: `$${varName}` }
}
