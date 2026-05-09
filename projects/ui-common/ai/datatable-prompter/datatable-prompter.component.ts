import { ChangeDetectorRef, Component, inject, Input } from '@angular/core'
import { AsyncPipe, JsonPipe, NgForOf, NgIf } from '@angular/common'
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'

import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs'
import {
  ColumnsAlterationState,
  DatatableComponent,
  DatatablePreferencesService,
  EMPTY_DATATABLE_PREFERENCES,
  mapColumnsAlterationsStates,
  THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
} from '@theseam/ui-common/datatable'
import { TheSeamLoadingModule } from '@theseam/ui-common/loading'
import { TheSeamRichTextModule } from '@theseam/ui-common/rich-text'
import { TheSeamFormFieldModule } from '@theseam/ui-common/form-field'
import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import {
  AlterationDisplayItem,
  AlterationsDiffComponent,
} from '@theseam/ui-common/datatable-alterations-display'

import {
  assistantPrompt,
  getUserPrompt,
  parseResponse,
  THESEAM_DATATABLE_PROMPTER_PROVIDER,
} from './datatable-prompter-prompt-provider'

@Component({
  selector: 'seam-datatable-prompter',
  templateUrl: './datatable-prompter.component.html',
  styleUrls: ['./datatable-prompter.component.scss'],
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    JsonPipe,
    NgForOf,
    NgIf,
    TheSeamLoadingModule,
    TheSeamRichTextModule,
    TheSeamFormFieldModule,
    TheSeamButtonsModule,
    AlterationsDiffComponent,
  ],
})
export class TheSeamDatatablePrompterComponent {
  // cdr = inject(ChangeDetectorRef)

  private readonly _prefsAccessor = inject(
    THESEAM_DATATABLE_PREFERENCES_ACCESSOR,
    { optional: true },
  )
  private readonly _dtPrefsService = inject(DatatablePreferencesService)
  private readonly _aiProvider = inject(THESEAM_DATATABLE_PROMPTER_PROVIDER, {
    optional: true,
  })

  readonly _loadingSubject = new BehaviorSubject<boolean>(false)
  readonly _altsDataSubject = new BehaviorSubject<
    | {
        currentItems: AlterationDisplayItem[]
        pendingItems: AlterationDisplayItem[]
      }
    | undefined
  >(undefined)

  public readonly loading$ = this._loadingSubject.asObservable()

  @Input() diffMode: 'auto' | 'manual' = 'auto'
  @Input() compact = true

  @Input()
  set prompt(value: string | undefined | null) {
    if (value) {
      this._form.controls.prompt.setValue(value)
    } else {
      this._form.controls.prompt.setValue('Sort color descending order')
    }
  }

  @Input()
  set datatable(value: DatatableComponent | undefined | null) {
    this._datatableSubject.next(value)
  }
  get datatable(): DatatableComponent | undefined | null {
    return this._datatableSubject.value
  }
  private _datatableSubject = new BehaviorSubject<
    DatatableComponent | undefined | null
  >(null)

  @Input() showAlts = true

  readonly _form = new FormGroup({
    prompt: new FormControl<string | null>('Sort color descending order', [
      Validators.required,
    ]),
  })

  _alterations$: Observable<ColumnsAlterationState[]> = this._datatableSubject
    .asObservable()
    .pipe(
      switchMap((dt): Observable<DatatableComponent | null | undefined> => {
        if (!dt) {
          return of(dt)
        }
        return (dt as any)._columnsAlterationsManager.changes.pipe(
          startWith(undefined),
          map(() => dt),
        )
      }),
      switchMap((datatable) => {
        if (!datatable) {
          return of([] as ColumnsAlterationState[])
        }
        const key = datatable.preferencesKey
        if (!key) {
          // eslint-disable-next-line no-console
          console.warn(
            'No preferences key set on datatable, returning empty alterations.',
          )
          return of([] as ColumnsAlterationState[])
        }

        return (
          this._dtPrefsService.preferences(key).pipe(
            switchMap((prefs) => {
              // console.log('~~~~Current preferences:', prefs)
              if (!prefs) {
                return of(
                  JSON.parse(JSON.stringify(EMPTY_DATATABLE_PREFERENCES))
                    .alterations as ColumnsAlterationState[],
                )
              }
              // return of(JSON.parse(prefs).alterations as ColumnsAlterationState[])
              return of(prefs.alterations as ColumnsAlterationState[])
            }),
          ) ?? of([] as ColumnsAlterationState[])
        )
      }),
      // tap(v => console.log('%cAlterations:', 'color: limegreen;', v)),
    )

  _alterationsDisplayItems$: Observable<AlterationDisplayItem[]> =
    this._alterations$.pipe(
      switchMap((alterations) => {
        console.log('~~~~~Current alterations:', alterations)
        if (!alterations || alterations.length === 0) {
          return of([] as AlterationDisplayItem[])
        }
        const alts = mapColumnsAlterationsStates(alterations)
        console.log('~~~~~Mapped alterations:', alts)
        return of(alts.map((a) => a.toDisplayItem()))
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    )

  _pendingAlterationsSubject = new BehaviorSubject<ColumnsAlterationState[]>([])
  _pendingAlterationsDisplayItems$: Observable<AlterationDisplayItem[]> =
    this._pendingAlterationsSubject.asObservable().pipe(
      switchMap((pending) => {
        if (!pending || pending.length === 0) {
          return of([] as AlterationDisplayItem[])
        }
        const alts = mapColumnsAlterationsStates(pending)
        console.log('~~~~~Mapped alterations2:', alts)
        return of(alts.map((a) => a.toDisplayItem()))
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    )

  _onSubmit() {
    console.log('Submitting prompt:', this._form.value)
    if (this._form.invalid) {
      return
    }
    if (this._loadingSubject.value) {
      console.warn('Already loading, ignoring submit.')
      return
    }

    const prompt = this._form.value.prompt
    if (!prompt) {
      return
    }
    console.log('datatable', this._datatableSubject.value)
    const columns = (
      this._datatableSubject.value?.ngxDatatable?.columns || []
    ).map((col) => ({
      prop: col.prop,
      name: col.name,
      cellType: (col as any).cellType || 'string',
      sortable: col.sortable,
      filterable: true,
      visible: true,
      resizable: col.resizeable,
      draggable: col.draggable,
    }))

    console.log('columns', columns)
    const userPrompt = getUserPrompt(columns, prompt)
    console.log('userPrompt', userPrompt)

    this._loadingSubject.next(true)
    if (!this._aiProvider) {
      console.error('No AI provider configured, cannot submit prompt.')
      this._loadingSubject.next(false)
      return
    }
    this._aiProvider
      .chat({
        messages: [
          {
            role: 'user',
            content: `${assistantPrompt}\n\n---\n\n${userPrompt}`,
          },
        ],
      })
      .then(async (response) => {
        const alterations = parseResponse(response.content, undefined)
        // this._form.reset()
        console.log('Received alterations:', alterations)
        const datatable = this._datatableSubject.value
        if (!datatable) {
          console.error('No datatable found to apply alterations to.')
          return
        }

        const key = this.datatable!.preferencesKey as string

        const before = await this._prefsAccessor?.get(key).toPromise()
        console.log('Current preferences before update:', before)

        const _apply = async () => {
          console.log('Preferences updated successfully.')
          const _cols = this.datatable!.ngxDatatable!.columns
          const cols = [..._cols]
          console.log('this.datatable!.columns', cols)

          const after = await this._prefsAccessor?.get(key).toPromise()
          let _after = (JSON.parse(after || '{}').alterations ||
            []) as ColumnsAlterationState[]
          if (!Array.isArray(_after)) {
            _after = [_after]
          }

          const mgr = (this.datatable as any)._columnsAlterationsManager
          console.log('_columnsAlterationsManager', mgr, mgr.get())
          const alts = mapColumnsAlterationsStates(_after)
          console.log('Mapped alterations:', alts)
          const columnsBefore = JSON.parse(
            JSON.stringify(
              this.datatable!.ngxDatatable!.columns.map((x) => x.prop),
            ),
          )
          console.log('Columns before applying alterations:', columnsBefore)
          for (const a of alts) {
            console.log('Applying alteration:', a)
            a.apply(cols, this.datatable!)
          }
          console.log('Current preferences after update:', after)
          console.log(_after)

          this.datatable!.columns = [...cols]
          const columnsAfter = JSON.parse(
            JSON.stringify(
              this.datatable!.ngxDatatable!.columns.map((x) => x.prop),
            ),
          )
          console.log('Columns after applying alterations:', columnsAfter)
          mgr.add(alts)
          datatable._cdr.detectChanges()

          this._pendingAlterationsSubject.next(_after)
        }

        this._prefsAccessor
          ?.update(
            key,
            JSON.stringify({
              version: 2,
              alterations,
            }),
          )
          .subscribe(async () => {
            // TODO: Cleanup. This is a hack to ensure the datatable updates after the preferences are set.
            await _apply()
            datatable.rows = [...datatable.rows]
            datatable._cdr.detectChanges()
            await _apply()

            this._loadingSubject.next(false)
          })
      })
      .catch((err) => {
        console.error('Error submitting prompt:', err)
        this._loadingSubject.next(false)
      })
  }
}
