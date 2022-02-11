import { Component, NgZone, } from '@angular/core'
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'

import { SpectatorService } from '@ngneat/spectator/jest'
import { createServiceFactory } from '@ngneat/spectator/jest'

import { isExpanded, isNavItemActive } from './side-nav-utils'
import { ISideNavItem } from './side-nav.models'
import { TheSeamSideNavService } from './side-nav.service'

@Component({ template: `` })
class TestPlacholderComponent { }

describe('TheSeamSideNavService', () => {
  const createService = createServiceFactory({
    service: TheSeamSideNavService,
    declarations: [ TestPlacholderComponent ],
    imports: [
      RouterTestingModule.withRoutes([
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
      ])
    ]
  })

  let spectator: SpectatorService<TheSeamSideNavService>
  let router: Router
  let zone: NgZone

  beforeEach(() => {
    spectator = createService()

    zone = spectator.inject(NgZone)
    router = spectator.inject(Router)

    zone.run(() => router.initialNavigation())
  })

  it('should be created', () => {
    const service = spectator.inject(TheSeamSideNavService)
    expect(service).toBeTruthy()
  })

  it('should be active at first level', async () => {
    await navigate([ '/foo' ])

    const activeItem: ISideNavItem = {
      label: '',
      itemType: 'link',
      link: '/foo'
    }

    const notActiveItem: ISideNavItem = {
      label: '',
      itemType: 'link',
      link: '/not'
    }

    const items: ISideNavItem[] = [
      activeItem,
      notActiveItem
    ]
    spectator.service.updateItemsStates(items)
    expect(isNavItemActive(activeItem)).toBe(true)
    expect(isNavItemActive(notActiveItem)).toBe(false)
  })

  it('should be active at second level', async () => {
    await navigate([ '/foo' ])

    const activeItem: ISideNavItem = {
      label: '',
      itemType: 'link',
      link: '/foo'
    }

    const notActiveItem: ISideNavItem = {
      label: '',
      itemType: 'link',
      link: '/not'
    }

    const items: ISideNavItem[] = [
      {
        label: '',
        itemType: 'basic',
        children: [
          activeItem,
          notActiveItem
        ]
      }
    ]
    spectator.service.updateItemsStates(items)
    expect(isNavItemActive(activeItem)).toBe(true)
    expect(isNavItemActive(notActiveItem)).toBe(false)
  })

  it('should update link items states when navigated', async () => {
    await navigate([ '/foo' ])

    const items: ISideNavItem[] = [
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
          }
        ]
      },
      {
        label: '',
        itemType: 'link',
        link: '/not'
      }
    ]

    spectator.service.createItemsObservable(items).subscribe()

    expect(isNavItemActive(items[0])).toBe(true)
    expect(isNavItemActive((items[1] as any).children[0])).toBe(false)
    expect(isNavItemActive(items[2])).toBe(false)

    await navigate([ '/foo/bar' ])

    expect(isNavItemActive(items[0])).toBe(true)
    expect(isNavItemActive((items[1] as any).children[0])).toBe(true)
    expect(isNavItemActive(items[2])).toBe(false)

    await navigate([ '/' ])

    expect(isNavItemActive(items[0])).toBe(false)
    expect(isNavItemActive((items[1] as any).children[0])).toBe(false)
    expect(isNavItemActive(items[2])).toBe(false)
  })

  it('should be expanded with active child', async () => {
    const items: ISideNavItem[] = [
      {
        label: '',
        itemType: 'link',
        link: ''
      },
      {
        label: '',
        itemType: 'basic',
        children: [
          {
            label: '',
            itemType: 'link',
            link: '/foo'
          },
        ]
      },
      {
        label: '',
        itemType: 'link',
        link: '/not',
        children: [
          {
            label: '',
            itemType: 'link',
            link: '/bar'
          }
        ]
      },
      {
        label: '',
        itemType: 'basic',
        children: [
          {
            label: '',
            itemType: 'basic',
            children: [
              {
                label: '',
                itemType: 'link',
                link: '/foo'
              },
            ]
          },
        ]
      },
    ]

    spectator.service.createItemsObservable(items).subscribe()

    expect(isExpanded(items[0])).toBe(false)
    expect(isExpanded(items[1])).toBe(false)
    expect(isExpanded((items as any)[1].children[0])).toBe(false)
    expect(isExpanded(items[2])).toBe(false)
    expect(isExpanded((items as any)[2].children[0])).toBe(false)
    expect(isExpanded(items[3])).toBe(false)
    expect(isExpanded((items as any)[3].children[0])).toBe(false)
    expect(isExpanded((items as any)[3].children[0].children[0])).toBe(false)

    await navigate([ '/foo' ])

    expect(isExpanded(items[0])).toBe(false)
    expect(isExpanded(items[1])).toBe(true)
    expect(isExpanded((items as any)[1].children[0])).toBe(false)
    expect(isExpanded(items[2])).toBe(false)
    expect(isExpanded((items as any)[2].children[0])).toBe(false)
    expect(isExpanded(items[3])).toBe(true)
    expect(isExpanded((items as any)[3].children[0])).toBe(true)
    expect(isExpanded((items as any)[3].children[0].children[0])).toBe(false)
  })

  //
  // Test Helpers
  //

  function navigate(commands: any[]): Promise<boolean> {
    return zone.run(() => router.navigate(commands))
  }
})
