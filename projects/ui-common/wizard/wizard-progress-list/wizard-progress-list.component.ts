import { animate, style, transition, trigger } from '@angular/animations'
import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, ContentChild, Input, OnInit, ViewEncapsulation } from '@angular/core'

// import { IconProp } from '@fortawesome/fontawesome-svg-core'
// import { faAngleDown, faCog } from '@fortawesome/free-solid-svg-icons'

// import { InputBoolean } from '@theseam/ui-common/core'
// import { SeamIcon } from '@theseam/ui-common/icon'


/**
 * Widget
 *
 * Widgets are designed with the intention of being on a dashboard. Other uses
 * may be supported as the need arises.
 *
 * The only HTML/CSS use should be a widget content component, unless there is a
 * case requiring more advanced design. This is so that we can manage a common
 * style for our widgets. If a case requiring non widget content components is
 * used then the situation should be considered for becoming a widget component.
 */
@Component({
  selector: 'seam-wizard-progress-list',
  templateUrl: './wizard-progress-list.component.html',
  styleUrls: ['./wizard-progress-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [],

})
export class TheSeamWizarProgressListComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
