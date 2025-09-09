import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core'

@Component({
    selector: 'seam-widget-footer',
    templateUrl: './widget-footer.component.html',
    styleUrls: ['./widget-footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class WidgetFooterComponent { }
