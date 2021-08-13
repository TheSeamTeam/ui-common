import { Component, NgZone, } from '@angular/core'
import { fakeAsync, tick } from '@angular/core/testing'
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'

import { SpectatorService } from '@ngneat/spectator'
import { createServiceFactory } from '@ngneat/spectator/jest'
import { ITheSeamBreadcrumb } from './breadcrumb'

import { TheSeamBreadcrumbsService } from './breadcrumbs.service'

@Component({ template: `` })
class TestPlacholderComponent { }

describe('TheSeamBreadcrumbsService', () => {

  // describe('', () => {

  // })

  const createService = createServiceFactory({
    service: TheSeamBreadcrumbsService,
    declarations: [ TestPlacholderComponent ],
    imports: [
      RouterTestingModule.withRoutes([])
    ]
  })

  let spectator: SpectatorService<TheSeamBreadcrumbsService>
  let router: Router
  let zone: NgZone

  beforeEach(() => {
    spectator = createService()

    zone = spectator.inject(NgZone)
    router = spectator.inject(Router)

    zone.run(() => router.initialNavigation())
  })

  // it('should be created', () => {
  //   const service = spectator.inject(TheSeamBreadcrumbsService)
  //   expect(service).toBeTruthy()
  // })

  it('should have no crumbs when no routes', async () => {
    let crumbs: ITheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(0)
  })

  it('should have no crumbs when no routes have breadcrumb data', async () => {
    router.resetConfig([ { path: '', component: TestPlacholderComponent } ])
    zone.run(() => router.initialNavigation())

    let crumbs: ITheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(0)
  })

  it('should have no crumbs when active route has no breadcrumb data', async () => {
    router.resetConfig([
      {
        path: '',
        component: TestPlacholderComponent
      },
      {
        path: 'foo',
        component: TestPlacholderComponent,
        data: { breadcrumb: 'Foo' }
      },
    ])

    zone.run(() => router.initialNavigation())

    let crumbs: ITheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(0)
  })

  it('should have 1 crumb when active route has breadcrumb data', async () => {
    router.resetConfig([
      {
        path: '',
        component: TestPlacholderComponent
      },
      {
        path: 'foo',
        component: TestPlacholderComponent,
        data: { breadcrumb: 'Foo' },
      },
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/foo' ])

    let crumbs: ITheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(1)
    expect(crumbs[0].value).toBe('Foo')
    expect(crumbs[0].path).toBe('/foo')
    expect(crumbs[0].route.snapshot.toString()).toBe(`Route(url:'foo', path:'foo')`)
  })

  it('should have 2 crumbs when active route has two routes in path with breadcrumb data', async () => {
    router.resetConfig([
      {
        path: 'foo',
        component: TestPlacholderComponent,
        data: { breadcrumb: 'Foo' },
        children: [
          {
            path: 'bar',
            component: TestPlacholderComponent,
            data: { breadcrumb: 'Bar' },
          }
        ]
      },
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/foo/bar' ])

    let crumbs: ITheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(2)
    expect(crumbs[0].value).toBe('Foo')
    expect(crumbs[0].path).toBe('/foo')
    expect(crumbs[0].route.snapshot.toString()).toBe(`Route(url:'foo', path:'foo')`)
    expect(crumbs[1].value).toBe('Bar')
    expect(crumbs[1].path).toBe('/foo/bar')
    expect(crumbs[1].route.snapshot.toString()).toBe(`Route(url:'bar', path:'bar')`)
  })

  //
  // Test Helpers
  //

  function navigate(commands: any[]): Promise<boolean> {
    return zone.run(() => router.navigate(commands))
  }
})
