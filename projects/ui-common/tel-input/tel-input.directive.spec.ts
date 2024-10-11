import { Component, ViewChild } from '@angular/core'
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing'

import { TheSeamTelInputDirective } from './tel-input.directive'
import { AssetLoaderService, LoadedAssetRef } from '@theseam/ui-common/services'
import { Observable, defer } from 'rxjs'
import { TEL_INPUT_UTILS_PATH } from '@theseam/ui-common/tel-input'

describe('TelInputDirective', () => {
  let component: TestTelInputHostComponent
  let fixture: ComponentFixture<TestTelInputHostComponent>

  describe('TestTelInputHostComponent', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [ TestTelInputHostComponent ],
        providers: [
          { provide: AssetLoaderService, useClass: FakeAssetLoaderService },
        ],
      })
    })

    it('should create an instance', () => {
      fixture = TestBed.createComponent(TestTelInputHostComponent)
      component = fixture.componentInstance
      expect(component.telInput).toBeTruthy()
    })

    it('should set value', fakeAsync(() => {
      // const changeSpy = jest.fn()
      // mockIntlUtilsLoad()

      fixture = TestBed.createComponent(TestTelInputHostComponent)
      component = fixture.componentInstance
      // const somethingSpy = jest.spyOn(component, 'writeValue')
      // component.change.subscribe(changeSpy)
      component.telInput.value = '+1 901-555-5555'
      fixture.detectChanges()
      // tick(5000)
      // expect(somethingSpy).toBeCalled()
      // expect(changeSpy).toBeCalledTimes(1)
      expect(document.querySelector('input')?.value).toBe('+1 901-555-5555')
      flush()
    }))
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

@Component({
  selector: 'test-tel-input-host',
  template: '<input seamTelInput />',
  standalone: true,
  imports: [
    TheSeamTelInputDirective,
  ],
})
class TestTelInputHostComponent {
  @ViewChild(TheSeamTelInputDirective, { static: true }) telInput!: TheSeamTelInputDirective
}

function mockIntlUtilsLoad() {
  const _win = window as any
  _win.intlTelInputGlobals.loadUtils = jest.fn()
  _win.intlTelInputGlobals.loadUtils.mockReturnValue(
    import('intl-tel-input/build/js/utils') as any)
}
mockIntlUtilsLoad()
