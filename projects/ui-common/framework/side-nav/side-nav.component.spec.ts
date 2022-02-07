import { Component } from '@angular/core'
import { fakeAsync } from '@angular/core/testing'
import { of } from 'rxjs'

import { createRoutingFactory, mockProvider, SpectatorRouting } from '@ngneat/spectator/jest'

import { TheSeamLayoutService } from '@theseam/ui-common/layout'

import { ITheSeamBaseLayoutNav, ITheSeamBaseLayoutRef, THESEAM_BASE_LAYOUT_REF } from './../base-layout/index'
import { SideNavComponent } from './side-nav.component'
import { TheSeamSideNavModule } from './side-nav.module'

@Component({ template: `` })
class TestPlacholderComponent { }

class MockITheSeamBaseLayoutRef implements Partial<ITheSeamBaseLayoutRef> {
  registerNav(nav: ITheSeamBaseLayoutNav): void { }
  unregisterNav(nav: ITheSeamBaseLayoutNav): void { }
}

describe('SideNavComponent', () => {
  let spectator: SpectatorRouting<SideNavComponent>
  const createComponent = createRoutingFactory({
    component: SideNavComponent,
    imports: [
      TheSeamSideNavModule
    ],
    providers: [
      { provide: THESEAM_BASE_LAYOUT_REF, useClass: MockITheSeamBaseLayoutRef }
    ],
    stubsEnabled: false,
    routes: [
      {
        path: '',
        component: TestPlacholderComponent
      },
      {
        path: 'foo',
        component: TestPlacholderComponent,
        children: [
          {
            path: 'bar',
            component: TestPlacholderComponent,
          }
        ]
      },
    ],
  })

  describe('Desktop and Mobile', () => {
    beforeEach(() => spectator = createComponent({
      providers: [
        mockProvider(TheSeamLayoutService, {
          isMobile$: of(false)
        })
      ],
      props: {
        items: [
          {
            label: '',
            itemType: 'link',
            link: '/foo'
          },
          {
            label: '',
            itemType: 'basic',
            children: [
              {
                label: '',
                itemType: 'link',
                link: '/foo/bar'
              },
              {
                label: '',
                itemType: 'basic',
                children: [
                  {
                    label: '',
                    itemType: 'link',
                    link: '/foo/bar/foo'
                  }
                ]
              }
            ]
          },
          {
            label: '',
            itemType: 'link',
            link: '/not'
          }
        ]
      }
    }))

    it('should render items', fakeAsync(() => {
      expect(spectator.queryAll('seam-side-nav-item').length).toBe(6)
      expect(spectator.queryAll('seam-side-nav-item[data-hier-level="0"]').length).toBe(3)
      expect(spectator.queryAll('seam-side-nav-item[data-hier-level="1"]').length).toBe(2)
      expect(spectator.queryAll('seam-side-nav-item[data-hier-level="2"]').length).toBe(1)
    }))
  })

  describe('Desktop', () => {
    beforeEach(() => spectator = createComponent({
      providers: [
        mockProvider(TheSeamLayoutService, {
          isMobile$: of(false)
        })
      ]
    }))

    it('should be expanded initially', () => {
      expect(spectator.component.expanded).toBe(true)
    })
  })

  describe('Mobile', () => {
    beforeEach(() => spectator = createComponent({
      providers: [
        mockProvider(TheSeamLayoutService, {
          isMobile$: of(true)
        })
      ]
    }))

    it('should be collapsed initially', () => {
      expect(spectator.component.expanded).toBe(false)
    })
  })
})
