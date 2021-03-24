

export interface IDynamicRouteDef {
  path?: string
  // pathMatch?: string
  component?: string
  // redirectTo?: string
  // outlet?: string
  // canActivate?: any[]
  // canActivateChild?: any[]
  // canDeactivate?: any[]
  // canLoad?: any[]
  data?: { [name: string]: any }
  // resolve?: ResolveData

  children?: IDynamicRouteDef[]

  // runGuardsAndResolvers?: RunGuardsAndResolvers
}
