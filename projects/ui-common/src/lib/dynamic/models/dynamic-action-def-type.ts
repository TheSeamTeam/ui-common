import { IDynamicActionLinkDef } from 'projects/ui-common/src/lib/dynamic/action'
import { IDynamicActionModalDef } from 'projects/ui-common/src/lib/dynamic/action'
import { IDynamicActionApiDef } from '../action/api/dynamic-action-api-def'

export type DynamicActionDefTypeName =
  'api' |
  'link' |
  'modal'

export type DynamicActionDefType<T = DynamicActionDefTypeName> =
  T extends 'api' ? IDynamicActionApiDef :
  T extends 'link' ? IDynamicActionLinkDef :
  T extends 'modal' ? IDynamicActionModalDef :
  any
