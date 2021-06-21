import { Directive, TemplateRef } from '@angular/core'

@Directive({
  selector: '[seamWidgetTileSecondaryIcon]',
  exportAs: 'seamWidgetTileSecondaryIcon'
})
export class WidgetTileSecondaryIconDirective {

  constructor(public template: TemplateRef<any>) { }

}
