import { ComponentFixture, TestBed, fakeAsync, flush, waitForAsync } from '@angular/core/testing'

import { TheSeamTelInputComponent } from './tel-input.component'
import { AssetLoaderService, LoadedAssetRef } from '@theseam/ui-common/services'
import { Observable, defer } from 'rxjs'
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed'
import { TheSeamTelInputHarness } from '../testing/tel-input.harness'

describe('TheSeamTelInputComponent', () => {
  let component: TheSeamTelInputComponent
  let fixture: ComponentFixture<TheSeamTelInputComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ TheSeamTelInputComponent ],
      providers: [
        { provide: AssetLoaderService, useClass: FakeAssetLoaderService },
      ],
    })
  })

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(TheSeamTelInputComponent)
  //   component = fixture.componentInstance
  //   fixture.detectChanges()
  // })

  it('should create', () => {
    fixture = TestBed.createComponent(TheSeamTelInputComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
    expect(component).toBeTruthy()
  })

  it('should set value', fakeAsync(() => {
    // const changeSpy = jest.fn()

    fixture = TestBed.createComponent(TheSeamTelInputComponent)
    component = fixture.componentInstance
    // const somethingSpy = jest.spyOn(component, 'writeValue')
    // component.change.subscribe(changeSpy)
    component.value = '+1 901-555-5555'
    fixture.detectChanges()
    expect(document.querySelector('input')?.value).toBe('+1 901-555-5555')
    // expect(somethingSpy).toBeCalled()
    // expect(changeSpy).toBeCalledTimes(1)
    flush()
  }))

  it('should set value with harness', async () => {
    // const changeSpy = jest.fn()

    fixture = TestBed.createComponent(TheSeamTelInputComponent)
    component = fixture.componentInstance
    const harness = await TestbedHarnessEnvironment.harnessForFixture(fixture, TheSeamTelInputHarness)
    // const somethingSpy = jest.spyOn(component, 'writeValue')
    // component.change.subscribe(changeSpy)
    // component.value = '+1 901-555-5555'
    await harness.setValue('+1 901-555-5555')
    fixture.detectChanges()
    expect(document.querySelector('input')?.value).toBe('+1 901-555-5555')
    // expect(somethingSpy).toBeCalled()
    // expect(changeSpy).toBeCalledTimes(1)
  })
})

class FakeAssetLoaderService implements Partial<AssetLoaderService> {
  private readonly _delay = () => new Promise((resolve, reject) => {
    setTimeout(() => {
      return resolve(true)
    }, 1000)
  })
  public loadStyleSheet(path: string): Observable<LoadedAssetRef<HTMLLinkElement>> {
    const tmp = document.createElement('link')
    return defer(() => {
      return this._delay().then(() => {
        return new LoadedAssetRef(tmp, path)
      })
    })
  }

  public loadStyle(content: string): Observable<LoadedAssetRef<HTMLStyleElement>> {
    const tmp = document.createElement('link')
    return defer(() => this._delay().then(() => new LoadedAssetRef(tmp, undefined, content)))
  }
}

function mockIntlUtilsLoad() {
  const _win = window as any
  _win.intlTelInputGlobals.loadUtils = jest.fn()
  _win.intlTelInputGlobals.loadUtils.mockReturnValue(
    import('intl-tel-input/build/js/utils') as any)
}
mockIntlUtilsLoad()
