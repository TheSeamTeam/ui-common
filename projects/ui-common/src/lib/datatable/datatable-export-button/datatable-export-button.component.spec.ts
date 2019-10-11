import { async, ComponentFixture, TestBed } from '@angular/core/testing'

import { BehaviorSubject, Observable } from 'rxjs'

import { ToastrService } from 'ngx-toastr'

import { FakeToastrService } from '../../../testing/fake-toastr'
import { TheSeamButtonsModule } from '../../buttons/index'
import { TheSeamIconModule } from '../../icon/index'
import { FakeTheSeamLoadingOverlayService } from '../../loading/fake-loading-overlay'
import { TheSeamLoadingOverlayService } from '../../loading/loading-overlay.service'
import { TheSeamMenuModule } from '../../menu/menu.module'

import { THESEAM_DATATABLE } from '../datatable/datatable.component'
import { ITheSeamDatatableColumn } from '../models/table-column'
import { DatatableExportButtonComponent } from './datatable-export-button.component'

describe('DatatableExportButtonComponent', () => {
  let component: DatatableExportButtonComponent
  let fixture: ComponentFixture<DatatableExportButtonComponent>

  beforeEach(async(() => {
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
        { provide: TheSeamLoadingOverlayService, useClass: FakeTheSeamLoadingOverlayService }
      ]
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
  columns: ITheSeamDatatableColumn[]

  get rows(): any[] { return this._rows.value }
  set rows(value: any[]) { this._rows.next(value || []) }
  private _rows = new BehaviorSubject<any[]>([])

  public rows$: Observable<any[]>
}
