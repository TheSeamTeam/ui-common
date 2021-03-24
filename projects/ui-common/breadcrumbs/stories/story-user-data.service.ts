import { Injectable } from '@angular/core'
import { of } from 'rxjs'

@Injectable()
export class StoryUsersDataService {
  public users$ = of([
    { id: 123, name: 'User 1' },
    { id: 987, name: 'User 2' },
    { id: 456, name: 'User 3' },
    { id: 654, name: 'User 4' },
  ])
}
