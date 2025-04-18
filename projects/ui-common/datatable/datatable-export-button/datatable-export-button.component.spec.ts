import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { BehaviorSubject, Observable, of } from 'rxjs'

import { ToastrService } from 'ngx-toastr'

import { TheSeamButtonsModule } from '@theseam/ui-common/buttons'
import { TheSeamIconModule } from '@theseam/ui-common/icon'
import { TheSeamLoadingOverlayService } from '@theseam/ui-common/loading'
import { TheSeamMenuModule } from '@theseam/ui-common/menu'
import { ExportersDataEvaluator, JexlEvaluator, THESEAM_DYNAMIC_VALUE_EVALUATOR } from '@theseam/ui-common/dynamic'

import { FakeTheSeamLoadingOverlayService } from '../../loading/fake-loading-overlay'
import { FakeToastrService } from '../../testing/fake-toastr'

import { THESEAM_DATATABLE } from '../datatable/datatable.component'
import { TheSeamDatatableColumn } from '../models/table-column'
import { DatatableExportButtonComponent } from './datatable-export-button.component'

describe('DatatableExportButtonComponent', () => {
  let component: DatatableExportButtonComponent
  let fixture: ComponentFixture<DatatableExportButtonComponent>

  beforeEach(waitForAsync(() => {
    // tslint:disable:no-use-before-declare
    TestBed.configureTestingModule({
    declarations: [
        DatatableExportButtonComponent,
    ],
    imports: [
        TheSeamButtonsModule,
        TheSeamMenuModule,
        TheSeamIconModule
    ],
    providers: [
        { provide: THESEAM_DATATABLE, useClass: FakeDatatableComponent },
        { provide: ToastrService, useClass: FakeToastrService },
        { provide: TheSeamLoadingOverlayService, useClass: FakeTheSeamLoadingOverlayService },
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
        { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: ExportersDataEvaluator, multi: true },
    ],
    teardown: { destroyAfterEach: false }
})
    .compileComponents()
    // tslint:enable:no-use-before-declare
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DatatableExportButtonComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})

//
// Test helpers
//

export class FakeDatatableComponent {
  columns: TheSeamDatatableColumn[] = []

  get rows(): any[] { return this._rows.value }
  set rows(value: any[]) { this._rows.next(value || []) }
  private _rows = new BehaviorSubject<any[]>([])

  public rows$: Observable<any[]> = of([])
}
