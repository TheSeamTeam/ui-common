import {
  FakeData,
  installFakeGoogleMaps,
  uninstallFakeGoogleMaps,
} from './fake-google-maps'

describe('fake google maps', () => {
  beforeEach(() => installFakeGoogleMaps())
  afterEach(() => uninstallFakeGoogleMaps())

  it('exposes a Map carrying a data layer', () => {
    const map = new google.maps.Map(document.createElement('div'))
    expect(map.data).toBeInstanceOf(FakeData)
  })

  it('records the last fitBounds call', () => {
    const map: any = new google.maps.Map(document.createElement('div'))
    const bounds = new google.maps.LatLngBounds()
    map.fitBounds(bounds, 12)
    expect(map.bounds).toBe(bounds)
    expect(map.padding).toBe(12)
  })

  it('raises setproperty on the layer when an added feature is written to', () => {
    const map: any = new google.maps.Map(document.createElement('div'))
    const events: any[] = []
    map.data.addListener('setproperty', (event: any) => events.push(event))

    const feature = map.data.add(
      new google.maps.Data.Feature({ geometry: null, properties: {} }),
    )
    feature.setProperty('FIELD_NAME', 'North 40')

    expect(events).toHaveLength(1)
    expect(events[0].feature).toBe(feature)
    expect(events[0].name).toBe('FIELD_NAME')
  })

  it('raises removeproperty on the layer', () => {
    const map: any = new google.maps.Map(document.createElement('div'))
    const events: any[] = []
    map.data.addListener('removeproperty', (event: any) => events.push(event))

    const feature = map.data.add(
      new google.maps.Data.Feature({
        geometry: null,
        properties: { FIELD_NAME: 'North 40' },
      }),
    )
    feature.removeProperty('FIELD_NAME')

    expect(events).toHaveLength(1)
    expect(events[0].name).toBe('FIELD_NAME')
  })

  it('stops raising events once a feature is removed from the layer', () => {
    const map: any = new google.maps.Map(document.createElement('div'))
    const feature = map.data.add(
      new google.maps.Data.Feature({ geometry: null, properties: {} }),
    )
    map.data.remove(feature)

    const events: any[] = []
    map.data.addListener('setproperty', (event: any) => events.push(event))
    feature.setProperty('FIELD_NAME', 'North 40')

    expect(events).toHaveLength(0)
  })

  it('raises nothing for a feature that was never added', () => {
    const events: any[] = []
    const data: any = new FakeData()
    data.addListener('setproperty', (event: any) => events.push(event))

    const feature = new google.maps.Data.Feature({
      geometry: null,
      properties: {},
    })
    feature.setProperty('FIELD_NAME', 'North 40')

    expect(events).toHaveLength(0)
  })
})
