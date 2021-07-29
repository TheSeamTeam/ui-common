import {
  Component,
  getPlatform,
  Input,
  OnChanges,
  SimpleChanges,
  ɵresetJitOptions,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing'
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'

import { TheSeamSideNavService } from './side-nav.service'

@Component({ template: `Url: {{ router.url }}` })
class TestPlacholderComponent {
  constructor(public router: Router) { }
}

describe('TheSeamSideNavService', () => {
  let service: TheSeamSideNavService

  let location: Location
  let router: Router

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'foo', component: TestPlacholderComponent },
        ])
      ],
      providers: [ TheSeamSideNavService ]
    })
    service = TestBed.inject(TheSeamSideNavService)

    router = TestBed.inject(Router)
    location = TestBed.inject(Location)
  })

  afterEach(() => {
    jest.clearAllMocks()

    // Necessary to avoid this error "Provided value for `preserveWhitespaces` can not be changed once it has been set." :
    // Source: https://github.com/angular/angular/commit/e342ffd855ffeb8af7067b42307ffa320d82177e#diff-92b125e532cc22977b46a91f068d6d7ea81fd61b772842a4a0212f1cfd875be6R28
    ɵresetJitOptions()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should be active', () => {
    const state = service.getItemsState([])
    expect(state).toBeTruthy()
  })
})
