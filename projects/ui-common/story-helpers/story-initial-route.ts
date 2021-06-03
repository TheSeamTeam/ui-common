import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core'

import { storyInitialRouteFactory } from './initial-route-factory'
import { StoryInitialRouteService, STORY_INITIAL_ROUTE_URL } from './initial-route.service'

@NgModule()
export class StoryInitialRouteModule {
  static forRoot(url: string): ModuleWithProviders<StoryInitialRouteModule> {
    return {
      ngModule: StoryInitialRouteModule,
      providers: [
        StoryInitialRouteService,
        {
          provide: APP_INITIALIZER,
          useFactory: storyInitialRouteFactory,
          deps: [ StoryInitialRouteService ],
          multi: true
        },
        { provide: STORY_INITIAL_ROUTE_URL, useValue: url }
      ]
    }
  }

}
