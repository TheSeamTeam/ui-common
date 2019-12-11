import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of } from 'rxjs'

import { tap } from 'rxjs/operators'
import { JexlEvaluator } from '../../evaluators'
import { THESEAM_DYNAMIC_VALUE_EVALUATOR } from '../../tokens/dynamic-value-evaluator'
import { IDynamicActionApiArgs } from './dynamic-action-api-args'
import { DynamicActionApiService } from './dynamic-action-api.service'

@Injectable()
class MockApiService {

  constructor(
    private _http: HttpClient
  ) {}

  public profile(): Observable<any> {
    return this._http.get<any>('http://example.com/profile')
      .pipe(tap(v => console.log('profile', v)))
  }

}

fdescribe('DynamicActionApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule
    ],
    providers: [
      { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
      MockApiService
    ]
  }))

  it('should be created', () => {
    const service: DynamicActionApiService = TestBed.get(DynamicActionApiService)
    expect(service).toBeTruthy()
  })

  // A default config is providedIn root, so this just makes sure that the
  // default config is still being provided correctly.
  it('should have an api config', () => {
    const service: DynamicActionApiService = TestBed.get(DynamicActionApiService)

    // Make sure a config is provided.
    expect((service as any)._configs).toBeDefined()
    // Make sure `multi` was used, so that multiple configs can be provided.
    expect(Array.isArray((service as any)._configs)).toBe(true)
    // Default does not have an id, so this makes sure a default config is provided.
    expect((service as any)._configs.find(c => c.id === undefined)).toBeDefined()
  })

  it('should return get request data', () => {
    const service: DynamicActionApiService = TestBed.get(DynamicActionApiService)

    const args: IDynamicActionApiArgs = {
      endpoint: 'http://example.com/profile'
    }

    const profileInfo = { name: 'Bob', age: 23 }
    // const profileInfo2 = { name: 'Alice', age: 33 }
    const http = TestBed.get(HttpTestingController)
    let profileResponse

    // const mockApi = TestBed.get(MockApiService)
    // mockApi.profile().subscribe(response => profileResponse = response)

    service.exec(args).subscribe(response => profileResponse = response)

    http.expectOne('http://example.com/profile').flush(profileInfo)
    expect(profileResponse).toEqual(profileInfo)
  })

  // it('should add the default config headers to a request', () => {

  // })

  // it('should add the config headers to a request matching provided id', () => {

  // })

  // it('should still execute request if a config with matching id does not exist', () => {

  // })

  // it('should build headers value', () => {

  // })

  // it('should append config url to endpoint', () => {

  // })

  // it('should use endpoint only as url', () => {

  // })

  // it('should use correct request method', () => {

  // })

  // it('should build body value', () => {

  // })

  // it('should build params value', () => {

  // })


})
