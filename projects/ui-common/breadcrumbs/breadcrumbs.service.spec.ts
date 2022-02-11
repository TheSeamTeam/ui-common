import { Component, NgZone, } from '@angular/core'
import { fakeAsync, tick } from '@angular/core/testing'
import { Router } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'

import { SpectatorService } from '@ngneat/spectator/jest'
import { createServiceFactory } from '@ngneat/spectator/jest'
import { TheSeamBreadcrumb } from './breadcrumb'

import { TheSeamBreadcrumbsService } from './breadcrumbs.service'

@Component({ template: `` })
class TestPlacholderComponent { }

describe('TheSeamBreadcrumbsService', () => {

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

  it('should have no crumbs when no routes', async () => {
    let crumbs: TheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(0)
  })

  it('should have no crumbs when no routes have breadcrumb data', async () => {
    router.resetConfig([ { path: '', component: TestPlacholderComponent } ])
    zone.run(() => router.initialNavigation())

    let crumbs: TheSeamBreadcrumb[] = []
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

    let crumbs: TheSeamBreadcrumb[] = []
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

    let crumbs: TheSeamBreadcrumb[] = []
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

    let crumbs: TheSeamBreadcrumb[] = []
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

  it('should have 2 crumbs when active route has two routes in path with breadcrumb data and no-data gap', async () => {
    router.resetConfig([
      {
        path: 'foo',
        component: TestPlacholderComponent,
        data: { breadcrumb: 'Foo' },
        children: [
          {
            path: 'no-data',
            component: TestPlacholderComponent,
            children: [
              {
                path: 'bar',
                component: TestPlacholderComponent,
                data: { breadcrumb: 'Bar' },
              }
            ]
          }
        ]
      },
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/foo/no-data/bar' ])

    let crumbs: TheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(2)
    expect(crumbs[0].value).toBe('Foo')
    expect(crumbs[0].path).toBe('/foo')
    expect(crumbs[0].route.snapshot.toString()).toBe(`Route(url:'foo', path:'foo')`)
    expect(crumbs[1].value).toBe('Bar')
    expect(crumbs[1].path).toBe('/foo/no-data/bar')
    expect(crumbs[1].route.snapshot.toString()).toBe(`Route(url:'bar', path:'bar')`)
  })

  it('should have 2 crumbs when active route has two routes in path with breadcrumb data and no-data start', async () => {
    router.resetConfig([
      {
        path: 'no-data',
        component: TestPlacholderComponent,
        children: [
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
          }
        ]
      },
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/no-data/foo/bar' ])

    let crumbs: TheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(2)
    expect(crumbs[0].value).toBe('Foo')
    expect(crumbs[0].path).toBe('/no-data/foo')
    expect(crumbs[0].route.snapshot.toString()).toBe(`Route(url:'foo', path:'foo')`)
    expect(crumbs[1].value).toBe('Bar')
    expect(crumbs[1].path).toBe('/no-data/foo/bar')
    expect(crumbs[1].route.snapshot.toString()).toBe(`Route(url:'bar', path:'bar')`)
  })

  it('should have 2 crumbs when active route has two routes in path with breadcrumb data and no-data end', async () => {
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
            children: [
              {
                path: 'no-data',
                component: TestPlacholderComponent,
              }
            ]
          }
        ]
      }
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/foo/bar/no-data' ])

    let crumbs: TheSeamBreadcrumb[] = []
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

  it('should not duplicate crumbs when last route has empty path', async () => {
    router.resetConfig([
      {
        path: 'foo',
        data: { breadcrumb: 'Foo' },
        children: [
          {
            path: '',
            component: TestPlacholderComponent,
          }
        ]
      }
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/foo' ])

    let crumbs: TheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(1)
    expect(crumbs[0].value).toBe('Foo')
    expect(crumbs[0].path).toBe('/foo')
    expect(crumbs[0].route.snapshot.toString()).toBe(`Route(url:'foo', path:'foo')`)
  })

  it('should add breadcrumbExtras to same if has breadcrumb prop', async () => {
    router.resetConfig([
      {
        path: 'foo',
        component: TestPlacholderComponent,
        data: {
          breadcrumb: 'Foo',
          breadcrumbExtras: {
            dataProps: [ 'extra1' ]
          },
          extra1: 'Extra 1'
        },
      }
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/foo' ])

    let crumbs: TheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(1)
    expect(crumbs[0].value).toBe('Foo (Extra 1)')
    expect(crumbs[0].path).toBe('/foo')
    expect(crumbs[0].route.snapshot.toString()).toBe(`Route(url:'foo', path:'foo')`)
  })

  it('should add breadcrumbExtras to previous if is after last with breadcrumb prop', async () => {
    router.resetConfig([
      {
        path: 'foo',
        component: TestPlacholderComponent,
        data: {
          breadcrumb: 'Foo',
          breadcrumbExtras: {
            dataProps: [ 'extra1' ]
          },
          extra1: 'Extra 1'
        },
        children: [
          {
            path: ':id',
            data: {
              breadcrumbExtras: {
                dataProps: [ 'extra2' ]
              },
              extra2: 'Extra 2'
            },
            children: [
              {
                path: 'bar',
                component: TestPlacholderComponent
              }
            ]
          }
        ],
      }
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/foo/123/bar' ])

    let crumbs: TheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(1)
    expect(crumbs[0].value).toBe('Foo (Extra 1) (Extra 2)')
    expect(crumbs[0].path).toBe('/foo')
    expect(crumbs[0].route.snapshot.toString()).toBe(`Route(url:'foo', path:'foo')`)
  })

  it('should add breadcrumbExtras to next if is before next with breadcrumb prop', async () => {
    router.resetConfig([
      {
        path: 'foo',
        component: TestPlacholderComponent,
        data: {
          breadcrumb: 'Foo',
          breadcrumbExtras: {
            dataProps: [ 'extra1' ]
          },
          extra1: 'Extra 1'
        },
        children: [
          {
            path: ':id',
            data: {
              breadcrumbExtras: {
                dataProps: [ 'extra2' ]
              },
              extra2: 'Extra 2'
            },
            children: [
              {
                path: 'bar',
                component: TestPlacholderComponent,
                data: {
                  breadcrumb: 'Bar'
                }
              }
            ]
          }
        ],
      }
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/foo/123/bar' ])

    let crumbs: TheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(2)
    expect(crumbs[0].value).toBe('Foo (Extra 1)')
    expect(crumbs[0].path).toBe('/foo')
    expect(crumbs[0].route.snapshot.toString()).toBe(`Route(url:'foo', path:'foo')`)
    expect(crumbs[1].value).toBe('Bar (Extra 2)')
    expect(crumbs[1].path).toBe('/foo/123/bar')
    expect(crumbs[1].route.snapshot.toString()).toBe(`Route(url:'bar', path:'bar')`)
  })

  it('should overwrite parent breadcrumbExtras with same property name', async () => {
    router.resetConfig([
      {
        path: 'foo',
        component: TestPlacholderComponent,
        data: {
          breadcrumb: 'Foo',
          breadcrumbExtras: {
            dataProps: [ 'extra1' ]
          },
          extra1: 'Extra 1'
        },
        children: [
          {
            path: ':id',
            data: {
              breadcrumbExtras: {
                dataProps: [ 'extra2' ]
              },
              extra2: 'Extra 2'
            },
            children: [
              {
                path: 'bar',
                component: TestPlacholderComponent,
                data: {
                  breadcrumb: 'Bar',
                  breadcrumbExtras: {
                    dataProps: [ 'extra2' ]
                  },
                  extra2: 'Extra 3'
                }
              }
            ]
          }
        ],
      }
    ])

    zone.run(() => router.initialNavigation())

    await navigate([ '/foo/123/bar' ])

    let crumbs: TheSeamBreadcrumb[] = []
    spectator.service.crumbs$.subscribe(v => crumbs = v)

    expect(crumbs).toBeDefined()
    expect(crumbs.length).toBe(2)
    expect(crumbs[0].value).toBe('Foo (Extra 1)')
    expect(crumbs[0].path).toBe('/foo')
    expect(crumbs[0].route.snapshot.toString()).toBe(`Route(url:'foo', path:'foo')`)
    expect(crumbs[1].value).toBe('Bar (Extra 3)')
    expect(crumbs[1].path).toBe('/foo/123/bar')
    expect(crumbs[1].route.snapshot.toString()).toBe(`Route(url:'bar', path:'bar')`)
  })

  //
  // Test Helpers
  //

  function navigate(commands: any[]): Promise<boolean> {
    return zone.run(() => router.navigate(commands))
  }
})
