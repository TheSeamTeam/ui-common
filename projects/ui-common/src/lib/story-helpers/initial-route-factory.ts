import { StoryInitialRouteService } from './initial-route.service'

export function storyInitialRouteFactory(_storyInitialRouteService: StoryInitialRouteService) {
  return () => _storyInitialRouteService.setInitialRoute()
}
