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

import { createRoutingFactory, SpectatorRouting } from '@ngneat/spectator/jest'

import { ISideNavItem } from './side-nav.models'
import { TheSeamSideNavService } from './side-nav.service'

@Component({ template: `<router-outlet></router-outlet>` })
class TestPlacholderComponent {
  constructor(public router: Router) { }
}

describe('TheSeamSideNavService', () => {
  // let service: TheSeamSideNavService

  // let location: Location
  // let router: Router

  // beforeEach(async () => {
  //   TestBed.configureTestingModule({
  //     imports: [
  //       RouterTestingModule.withRoutes([
  //         { path: 'foo', component: TestPlacholderComponent },
  //       ])
  //     ],
  //     providers: [ TheSeamSideNavService ]
  //   })
  //   service = TestBed.inject(TheSeamSideNavService)

  //   router = TestBed.inject(Router)
  //   location = TestBed.inject(Location)
  // })

  // afterEach(() => {
  //   jest.clearAllMocks()

  //   // tslint:disable: max-line-length
  //   // Necessary to avoid this error "Provided value for `preserveWhitespaces` can not be changed once it has been set." :
  //   // Source: https://github.com/angular/angular/commit/e342ffd855ffeb8af7067b42307ffa320d82177e#diff-92b125e532cc22977b46a91f068d6d7ea81fd61b772842a4a0212f1cfd875be6R28
  //   // tslint:enable: max-line-length
  //   ɵresetJitOptions()
  // })

  let spectator: SpectatorRouting<TestPlacholderComponent>
  const createComponent = createRoutingFactory({
    component: TestPlacholderComponent,
    providers: [ TheSeamSideNavService ],
    routes: [
      { path: '', component: TestPlacholderComponent },
      { path: 'foo', component: TestPlacholderComponent },
    ]
  })

  beforeEach(() => spectator = createComponent())

  it('should be created', () => {
    const service = spectator.inject(TheSeamSideNavService)
    expect(service).toBeTruthy()
  })

  it('should be active', async () => {
    const service = spectator.inject(TheSeamSideNavService)
    const router = spectator.inject(Router)

    await spectator.fixture.whenStable()

    router.navigateByUrl('/foo')

    await spectator.fixture.whenStable()

    const items: ISideNavItem[] = [
      {
        label: '',
        itemType: 'link',
        link: '/foo'
      }
    ]
    service.updateItemsStates(items)
    const item = items[0]

    expect(item.__state).toBe(true)
  })
})
