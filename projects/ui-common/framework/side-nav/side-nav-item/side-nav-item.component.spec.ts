import { Component } from '@angular/core'
import { fakeAsync } from '@angular/core/testing'
import { SideNavComponent } from './../side-nav.component'

import { createRoutingFactory, mockProvider, SpectatorRouting } from '@ngneat/spectator'

import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'

import { TheSeamSideNavModule } from '../side-nav.module'
import { SideNavItemComponent } from './side-nav-item.component'

@Component({ template: `` })
class TestPlacholderComponent { }

describe('SideNavItemComponent', () => {
  let spectator: SpectatorRouting<SideNavItemComponent>
  const createComponent = createRoutingFactory({
    component: SideNavItemComponent,
    imports: [
      TheSeamSideNavModule
    ],
    providers: [
      mockProvider(SideNavComponent, {
        overlay: false
      })
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

  describe('Basic', () => {

    describe('not compact', () => {
      it('should render with basic inputs', fakeAsync(() => {
        spectator = createComponent({
          props: {
            expanded: false,
            active: false,
            hierLevel: 0,
            compact: false,
            itemType: 'basic',
            icon: faAlignLeft,
            label: 'Test',
            // link: '/foo',
            // badgeText: 'bar',
            // badgeTheme: 'primary',
            // badgeSrContent: 'foo',
            // children: []
          }
        })

        expect(spectator.queryAll('[side-nav-item-label]:not(.sr-only)').length).toBe(1)
        expect(spectator.queryAll('.sr-only[side-nav-item-label]').length).toBe(0)
      }))
    })

    describe('compact', () => {
      it('should render with basic inputs', fakeAsync(() => {
        spectator = createComponent({
          props: {
            expanded: false,
            active: false,
            hierLevel: 0,
            compact: true,
            itemType: 'basic',
            icon: faAlignLeft,
            label: 'Test',
            // link: '/foo',
            // badgeText: 'bar',
            // badgeTheme: 'primary',
            // badgeSrContent: 'foo',
            // children: []
          }
        })

        expect(spectator.queryAll('[side-nav-item-label]:not(.sr-only)').length).toBe(0)
        expect(spectator.queryAll('.sr-only[side-nav-item-label]').length).toBe(1)
      }))
    })
  })
})
