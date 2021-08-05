import { Component } from '@angular/core'
import { fakeAsync } from '@angular/core/testing'

import { createRoutingFactory, SpectatorRouting } from '@ngneat/spectator/jest'

import { SideNavItemComponent } from './side-nav-item.component'
import { TheSeamSideNavModule } from '../side-nav.module'
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons'

@Component({ template: `` })
class TestPlacholderComponent { }

describe('SideNavItemComponent', () => {
  let spectator: SpectatorRouting<SideNavItemComponent>
  const createComponent = createRoutingFactory({
    component: SideNavItemComponent,
    imports: [
      TheSeamSideNavModule
    ],
    providers: [ ],
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

      expect(spectator.queryAll('seam-side-nav-item').length).toBe(6)
      expect(spectator.queryAll('seam-side-nav-item[data-hier-level="0"]').length).toBe(3)
      expect(spectator.queryAll('seam-side-nav-item[data-hier-level="1"]').length).toBe(2)
      expect(spectator.queryAll('seam-side-nav-item[data-hier-level="2"]').length).toBe(1)
    }))
  })
})
