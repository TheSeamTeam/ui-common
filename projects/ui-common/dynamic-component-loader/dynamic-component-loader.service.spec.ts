import { Component, ViewContainerRef } from '@angular/core'
import { TestBed, waitForAsync } from '@angular/core/testing'
import { TheSeamDynamicComponentLoaderModule } from './dynamic-component-loader.module'

import { TheSeamDynamicComponentLoader } from './dynamic-component-loader.service'
import { IDynamicComponentManifest } from './dynamic-component-manifest'

@Component({ selector: 'testing-root', template: `` })
class TestingRootComponent {}

describe('TheSeamDynamicComponentLoader', () => {
  const manifests: IDynamicComponentManifest[] = [
    {
      componentId: 'lazy-comp',
      path: 'lazy-comp',
      loadChildren: () => import('./testing/lazy-module').then(m => m.LazyModule),
    },
  ]

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [
        TestingRootComponent,
    ],
    imports: [
        TheSeamDynamicComponentLoaderModule.forRoot(manifests),
    ],
    teardown: { destroyAfterEach: false }
}).compileComponents()
  }))

  it('should be created', () => {
    const service: TheSeamDynamicComponentLoader = TestBed.inject(TheSeamDynamicComponentLoader)
    expect(service).toBeTruthy()
  })

  it('should create component', async () => {
    const service = TestBed.inject(TheSeamDynamicComponentLoader)

    const fixture = TestBed.createComponent(TestingRootComponent)
    const vcr = fixture.componentRef.injector.get(ViewContainerRef)

    const factory = await service.getComponentFactory('lazy-comp').toPromise()
    vcr.createComponent(factory)
    // const factory2 = (<any /* ComponentFactoryBoundToModule */>factory).ngModule.componentFactoryResolver
    //   .resolveComponentFactory(factory.componentType)
    // vcr.createComponent(factory2)
    expect(document.body.querySelectorAll('lazy-comp').length).toBe(1)
  })
})
