import { BooleanInput } from '@angular/cdk/coercion'
import { ChangeDetectionStrategy, Component, Inject, Input, OnChanges, Optional, SimpleChanges } from '@angular/core'
import { Observable, shareReplay, startWith, Subject, switchMap } from 'rxjs'

import { InputBoolean } from '@theseam/ui-common/core'

import { FORM_FIELD_COMPONENT } from './form-field-tokens'

@Component({
  selector: 'seam-form-field-required-indicator',
  template: `
    <ng-container *ngIf="_controlRequired$; else noControl">
      <ng-container *ngIf="_controlRequired$ | async">*</ng-container>
    </ng-container>
    <ng-template #noControl>
      <ng-container *ngIf="required">*</ng-container>
    </ng-template>
  `,
  styles: [],
  host: {
    'class': 'text-danger'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldRequiredIndicatorComponent implements OnChanges {
  static ngAcceptInputType_required: BooleanInput

  private readonly _requiredChange = new Subject<boolean>()

  /** Used if a form control is not found. */
  @Input() @InputBoolean() required = false

  readonly _controlRequired$: Observable<boolean> | undefined

  constructor(
    @Optional() @Inject(FORM_FIELD_COMPONENT) public readonly _formField: any
  ) {
    if (_formField) {
      this._controlRequired$ = _formField._contentInputSubject.pipe(
        switchMap((contentInput: any) => {
          if (!contentInput) {
            return this._requiredChange.pipe(
              startWith(this.required),
            )
          }

          return contentInput.requiredChange.pipe(
            startWith(contentInput.required),
          )
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      )
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.required) {
      this._requiredChange.next(this.required)
    }
  }

}
