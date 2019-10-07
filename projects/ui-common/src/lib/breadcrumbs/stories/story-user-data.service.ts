import { Injectable } from '@angular/core'
import { of } from 'rxjs'

@Injectable()
export class StoryUsersDataService {
  public users$ = of([
    { id: 123, name: 'user1' },
    { id: 987, name: 'user2' },
    { id: 456, name: 'user3' },
    { id: 654, name: 'user4' },
  ])
}
