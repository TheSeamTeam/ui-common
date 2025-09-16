import { EmptyObject } from '../models'

export type MapperContext<TExtraVariables = EmptyObject> = {
  extraVariables: TExtraVariables
} & {
  [name: string]: any
}
