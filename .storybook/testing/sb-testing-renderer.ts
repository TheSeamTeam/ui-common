import { AfterViewInit, Component, ElementRef, enableProdMode, Inject, Injector, NgModule, NgZone, OnDestroy, OnInit, PlatformRef, Provider, Type } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
// import { RendererFactory } from '@storybook/angular/dist/ts3.9/client/preview/angular-beta/RendererFactory'

import { createStorybookModule, getStorybookModuleMetadata } from '@storybook/angular/dist/ts3.9/client/preview/angular-beta/StorybookModule'
import { storyPropsProvider, STORY_PROPS } from '@storybook/angular/dist/ts3.9/client/preview/angular-beta/StorybookProvider'
import { ICollection, StoryFnAngularReturnType } from '@storybook/angular/dist/ts3.9/client/preview/types'
import { Parameters, Story } from '@storybook/angular/types-6-0'
import { BehaviorSubject, Observable, Subject, Subscriber } from 'rxjs'
import { stringify } from 'telejson'

interface StoryRenderInfo {
  storyFnAngular: StoryFnAngularReturnType
  moduleMetadataSnapshot: string
}

interface RenderableStoryAndModule {
  component: any
  module: Type<any>
}

// platform must be init only if render is called at least once
// let platformRef: PlatformRef
// function getPlatform(newPlatform?: boolean): PlatformRef {
//   if (!platformRef || newPlatform) {
//     platformRef = platformBrowserDynamic()
//   }
//   return platformRef
// }

export class SbTestingRenderer {
  /**
   * Wait and destroy the platform
   */
  // public static resetPlatformBrowserDynamic() {
  //   return new Promise<void>((resolve) => {
  //     if (platformRef && !platformRef.destroyed) {
  //       platformRef.onDestroy(async () => {
  //         resolve();
  //       });
  //       // Destroys the current Angular platform and all Angular applications on the page.
  //       // So call each angular ngOnDestroy and avoid memory leaks
  //       platformRef.destroy();
  //       return;
  //     }
  //     resolve();
  //   }).then(() => {
  //     getPlatform(true);
  //   });
  // }

  /**
   * Reset compiled components because we often want to compile the same component with
   * more than one NgModule.
   */
  // protected static resetCompiledComponents = async () => {
  //   try {
  //     // Clear global Angular component cache in order to be able to re-render the same component across multiple stories
  //     //
  //     // References:
  //     // https://github.com/angular/angular-cli/blob/master/packages/angular_devkit/build_angular/src/webpack/plugins/hmr/hmr-accept.ts#L50
  //     // https://github.com/angular/angular/blob/2ebe2bcb2fe19bf672316b05f15241fd7fd40803/packages/core/src/render3/jit/module.ts#L377-L384
  //     const { ɵresetCompiledComponents } = await import('@angular/core');
  //     ɵresetCompiledComponents();
  //   } catch (e) {
  //     /**
  //      * noop catch
  //      * This means angular removed or modified ɵresetCompiledComponents
  //      */
  //   }
  // };

  protected previousStoryRenderInfo?: StoryRenderInfo

  // Observable to change the properties dynamically without reloading angular module&component
  public storyProps$: Subject<ICollection> = new Subject<ICollection>()

  protected isFirstRender: boolean = true

  constructor(public storyId: string) {
    // if (typeof NODE_ENV === 'string' && NODE_ENV !== 'development') {
    //   try {
    //     // platform should be set after enableProdMode()
    //     enableProdMode();
    //   } catch (e) {
    //     // eslint-disable-next-line no-console
    //     console.debug(e);
    //   }
    // }
  }

  // protected abstract beforeFullRender(): Promise<void>;

  // protected abstract afterFullRender(): Promise<void>;

  /**
   * Bootstrap main angular module with main component or send only new `props` with storyProps$
   *
   * @param storyFnAngular {StoryFnAngularReturnType}
   * @param forced {boolean} If :
   * - true render will only use the StoryFn `props' in storyProps observable that will update sotry's component/template properties. Improves performance without reloading the whole module&component if props changes
   * - false fully recharges or initializes angular module & component
   * @param parameters {Parameters}
   */
  // public async render({
  //   storyFnAngular,
  //   forced,
  //   parameters,
  //   targetDOMNode,
  // }: {
  //   storyFnAngular: StoryFnAngularReturnType;
  //   forced: boolean;
  //   parameters: Parameters;
  //   targetDOMNode: HTMLElement;
  // }) {
  //   const targetSelector = `${this.storyId}`;

  //   const newStoryProps$ = new BehaviorSubject<ICollection>(storyFnAngular.props);
  //   const moduleMetadata = getStorybookModuleMetadata(
  //     { storyFnAngular, parameters, targetSelector },
  //     newStoryProps$
  //   );

  //   if (
  //     !this.fullRendererRequired({
  //       storyFnAngular,
  //       moduleMetadata,
  //       forced,
  //     })
  //   ) {
  //     this.storyProps$.next(storyFnAngular.props);

  //     return;
  //   }
  //   // await this.beforeFullRender();

  //   // Complete last BehaviorSubject and set a new one for the current module
  //   if (this.storyProps$) {
  //     this.storyProps$.complete();
  //   }
  //   this.storyProps$ = newStoryProps$;

  //   // this.initAngularRootElement(targetDOMNode, targetSelector);

  //   // await getPlatform().bootstrapModule(
  //   //   createStorybookModule(moduleMetadata),
  //   //   parameters.bootstrapModuleOptions ?? undefined
  //   // );
  //   // await this.afterFullRender();
  // }

  public getRenderableComponent({
    storyFnAngular,
    forced,
    parameters,
    // targetDOMNode,
  }: {
    storyFnAngular: StoryFnAngularReturnType;
    forced: boolean;
    parameters: Parameters;
    // targetDOMNode: HTMLElement;
  }): Type<any> | null {
    const targetSelector = `${this.storyId}`

    const newStoryProps$ = new BehaviorSubject<ICollection>(storyFnAngular.props ?? {})
    const _moduleMetadata = getStorybookModuleMetadata(
      { storyFnAngular, parameters, targetSelector },
      newStoryProps$
    )
    const moduleMetadata = {
      declarations: [
        // ...(requiresComponentDeclaration ? [component] : []),
        // ComponentToInject,
        // ...(moduleMetadata.declarations ?? []),
        ...(_moduleMetadata.declarations ?? [])
      ],
      imports: [
        // BrowserModule, ...(moduleMetadata.imports ?? [])
        ...(_moduleMetadata.imports ?? [])
      ],
      providers: [
        // storyPropsProvider(storyProps$), ...(moduleMetadata.providers ?? [])
        ...(_moduleMetadata.providers ?? [])
      ],
      entryComponents: [
        // ...(moduleMetadata.entryComponents ?? [])
        ...(_moduleMetadata.entryComponents ?? [])
      ],
      schemas: [
        // ...(moduleMetadata.schemas ?? [])
        ...(_moduleMetadata.schemas ?? [])
      ],
      exports: [
        // ComponentToInject
        ...((storyFnAngular.moduleMetadata as any).exports ?? []),
        // ...(_moduleMetadata.bootstrap ?? [])
      ],
    }

    if (
      !this.fullRendererRequired({
        storyFnAngular,
        moduleMetadata,
        forced,
      })
    ) {
      this.storyProps$.next(storyFnAngular.props)

      return null
    }

    if (!this.isFirstRender) {
      return null
    }

    // await this.beforeFullRender();

    // Complete last BehaviorSubject and set a new one for the current module
    // if (this.storyProps$) {
    //   this.storyProps$.complete();
    // }
    this.storyProps$ = newStoryProps$

    // this.initAngularRootElement(targetDOMNode, targetSelector);

    // await getPlatform().bootstrapModule(
    //   createStorybookModule(moduleMetadata),
    //   parameters.bootstrapModuleOptions ?? undefined
    // );
    // await this.afterFullRender();

    return createStorybookModule(moduleMetadata)
  }

  public completeStory(): void {
    // Complete last BehaviorSubject and set a new one for the current module
    if (this.storyProps$) {
      this.storyProps$.complete()
    }
  }

  // protected initAngularRootElement(targetDOMNode: HTMLElement, targetSelector: string) {
  //   // Adds DOM element that angular will use as bootstrap component
  //   // eslint-disable-next-line no-param-reassign
  //   targetDOMNode.innerHTML = '';
  //   targetDOMNode.appendChild(document.createElement(targetSelector));
  // }

  private fullRendererRequired({
    storyFnAngular,
    moduleMetadata,
    forced,
  }: {
    storyFnAngular: StoryFnAngularReturnType;
    moduleMetadata: NgModule;
    forced: boolean;
  }) {
    const { previousStoryRenderInfo } = this

    const currentStoryRender = {
      storyFnAngular,
      moduleMetadataSnapshot: stringify(moduleMetadata),
    }

    this.previousStoryRenderInfo = currentStoryRender

    if (
      // check `forceRender` of story RenderContext
      !forced ||
      // if it's the first rendering and storyProps$ is not init
      !this.storyProps$
    ) {
      return true
    }

    // force the rendering if the template has changed
    const hasChangedTemplate =
      !!storyFnAngular?.template &&
      previousStoryRenderInfo?.storyFnAngular?.template !== storyFnAngular.template
    if (hasChangedTemplate) {
      return true
    }

    // force the rendering if the metadata structure has changed
    const hasChangedModuleMetadata =
      currentStoryRender.moduleMetadataSnapshot !== previousStoryRenderInfo?.moduleMetadataSnapshot

    return hasChangedModuleMetadata
  }
}





const _storyPropsProvider = (storyProps$: () => Subject<ICollection | undefined>): Provider => ({
  provide: STORY_PROPS,
  // useFactory: storyDataFactory(storyProps$.asObservable()),
  useFactory: storyDataFactory(storyProps$),
  deps: [NgZone],
})

function storyDataFactory<T>(data: () => Observable<T>) {
  return (ngZone: NgZone) =>
    new Observable((subscriber: Subscriber<T>) => {
      const sub = data().subscribe(
        (v: T) => {
          ngZone.run(() => subscriber.next(v))
        },
        (err) => {
          ngZone.run(() => subscriber.error(err))
        },
        () => {
          ngZone.run(() => subscriber.complete())
        }
      )

      return () => {
        sub.unsubscribe()
      }
    })
}



// export function createMountableStoryComponent(story: Story, rendererFactory: RendererFactory): any {
export function createMountableStoryComponent(story: Story): RenderableStoryAndModule {

  const storyId = 'testing-story'
  const renderer = new SbTestingRenderer(storyId)

  const tpl = `<${storyId}></${storyId}>`

  // template: `<${storyId}></${storyId}>`,
  @Component({
    selector: 'sb-testing-mount',
    template: tpl,
    providers: [
      // storyPropsProvider(renderer.storyProps$ as any)
      _storyPropsProvider(() => renderer.storyProps$ as any)
    ],

    // Get story components inputs/outputs to watch for ngChanges on or try to proxy.
    inputs: [],
    outputs: []
  })
  class SbTestingMount implements OnInit, OnDestroy, AfterViewInit {

    constructor(
      private readonly _elementRef: ElementRef,
      // @Inject(STORY_PROPS) private readonly _props: Observable<ICollection>
      private readonly _injector: Injector
    ) {
      // console.log('injector', _injector.get(STORY_PROPS))
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
      renderer.completeStory()
    }

    ngAfterViewInit(): void {
      // const _render = await rendererFactory.getRendererInstance('my-story', rootTargetDOMNode)
      // const storyId = 'testing-story'
      // const _render = new SbTestingRenderer(storyId)
      // await _render.render({
      //   storyFnAngular: (Basic as any)(),
      //   forced: false,
      //   parameters: {} as any,
      //   targetDOMNode: rootTargetDOMNode,
      // })


      renderer.getRenderableComponent({
        storyFnAngular: story as any,
        forced: false,
        parameters: {} as any,
        // targetDOMNode: rootTargetDOMNode,
      })

    }

  }

  const _storyTmp: any = story
  // _story.moduleMetadata.declarations.push(SbTestingMount)
  // _story.moduleMetadata.exports.push(SbTestingMount)

  const _story: any = {
    ..._storyTmp,
    moduleMetadata: {
      declarations: [
        ...(_storyTmp.moduleMetadata?.declarations ?? []),
        SbTestingMount
      ],
      imports: [
        ...(_storyTmp.moduleMetadata?.imports ?? [])
      ],
      providers: [
        ...(_storyTmp.moduleMetadata?.providers ?? [])
      ],
      entryComponents: [
        ...(_storyTmp.moduleMetadata?.entryComponents ?? [])
      ],
      schemas: [
        ...(_storyTmp.moduleMetadata?.schemas ?? [])
      ],
      exports: [
        ...(_storyTmp.moduleMetadata?.exports ?? []),
        SbTestingMount
      ],
    }
  }

  const _module = renderer.getRenderableComponent({
    storyFnAngular: _story as any,
    forced: false,
    parameters: {} as any,
    // targetDOMNode: rootTargetDOMNode,
  })

  if (_module === null) {
    throw Error(`Must initially have module`)
  }

  return {
    component: SbTestingMount,
    module: _module
  }
}
