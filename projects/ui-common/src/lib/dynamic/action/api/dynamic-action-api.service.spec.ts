import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing'

import { HttpRequest } from '@angular/common/http'
import { from, Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'

import { JexlEvaluator } from '../../evaluators'
import { THESEAM_API_CONFIG_DEFAULT } from '../../tokens/api-config'
import { THESEAM_DYNAMIC_VALUE_EVALUATOR } from '../../tokens/dynamic-value-evaluator'
import { IDynamicActionApiArgs } from './dynamic-action-api-args'
import { DynamicActionApiService } from './dynamic-action-api.service'

function isRequestMatchArgs(req: HttpRequest<any>, args: IDynamicActionApiArgs, url?: string): boolean {
  // TODO: Handle case where endpoint isn't absolute url.
  if (args.endpoint && req.url !== args.endpoint) {
    return false
  }

  if (args.method && req.method !== args.method) {
    return false
  }

  if (args.body && JSON.stringify(req.body) !== JSON.stringify(args.body)) {
    return false
  }

  return true
}


fdescribe('DynamicActionApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule
    ],
    providers: [
      { provide: THESEAM_DYNAMIC_VALUE_EVALUATOR, useClass: JexlEvaluator, multi: true },
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

  it('should return "GET" request data', fakeAsync(() => {
    const service: DynamicActionApiService = TestBed.get(DynamicActionApiService)
    const http: HttpTestingController = TestBed.get(HttpTestingController)

    const args: IDynamicActionApiArgs = {
      method: 'GET',
      endpoint: 'http://example.com/profile'
    }

    const profileInfo = { name: 'Bob', age: 24 }

    let profileResponse
    service.exec(args).subscribe(response => profileResponse = response)

    tick()

    http.expectOne((req: HttpRequest<any>) => isRequestMatchArgs(req, args)).flush(profileInfo, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(profileResponse).toEqual(profileInfo)

    http.verify()
  }))

  it('should return "POST" request data', fakeAsync(() => {
    const service: DynamicActionApiService = TestBed.get(DynamicActionApiService)
    const http: HttpTestingController = TestBed.get(HttpTestingController)

    const args: IDynamicActionApiArgs = {
      method: 'POST',
      endpoint: 'http://example.com/profile',
      body: {
        userName: 'bob@example.com'
      }
    }

    const profileInfo = { name: 'Bob', age: 24 }

    let profileResponse
    service.exec(args).subscribe(response => profileResponse = response)

    tick()

    http.expectOne((req: HttpRequest<any>) => isRequestMatchArgs(req, args))
      .flush(profileInfo)

    expect(profileResponse).toEqual(profileInfo, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    http.verify()
  }))

  it('should add the default config headers to a request', fakeAsync(() => {
    const service: DynamicActionApiService = TestBed.get(DynamicActionApiService)
    const http: HttpTestingController = TestBed.get(HttpTestingController)

    const args: IDynamicActionApiArgs = { }

    const profileInfo = { name: 'Bob', age: 24 }

    let profileResponse
    service.exec(args).subscribe(response => profileResponse = response)

    tick()

    http.expectOne((req: HttpRequest<any>) => {
      const defaultHeaders = THESEAM_API_CONFIG_DEFAULT.methodHeaders || {}
      const defaultGetHeaders = defaultHeaders['GET'] || {}
      const keys = Object.keys(defaultGetHeaders)

      return req.url === THESEAM_API_CONFIG_DEFAULT.url &&
        keys.filter(k => req.headers.get(k) === defaultGetHeaders[k]).length === keys.length
    }).flush(profileInfo)

    expect(profileResponse).toEqual(profileInfo)

    http.verify()
  }))

  // it('should add the config headers to a request matching provided id', () => {

  // })

  // it('should still execute request if a config with matching id does not exist', () => {

  // })

  // it('should build headers value', () => {

  // })

  it('should append config url to endpoint', fakeAsync(() => {
    const service: DynamicActionApiService = TestBed.get(DynamicActionApiService)
    const http: HttpTestingController = TestBed.get(HttpTestingController)

    const args: IDynamicActionApiArgs = {
      endpoint: 'user/Bob/profile'
    }

    const profileInfo = { name: 'Bob', age: 24 }

    let profileResponse
    service.exec(args).subscribe(response => profileResponse = response)

    tick()

    http.expectOne(`${THESEAM_API_CONFIG_DEFAULT.url}${args.endpoint}`).flush(profileInfo)

    expect(profileResponse).toEqual(profileInfo)

    http.verify()
  }))

  // it('should use endpoint only as url', () => {

  // })

  // it('should use correct request method', () => {

  // })

  // it('should build body value', () => {

  // })

  // it('should build params value', () => {

  // })


})
