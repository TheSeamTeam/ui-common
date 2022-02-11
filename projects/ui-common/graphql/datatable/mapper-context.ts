import { EmptyObject } from 'apollo-angular/types'

export type MapperContext<TExtraVariables = EmptyObject> = {
  extraVariables: TExtraVariables
} & {
  [name: string]: any
}
