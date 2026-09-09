/**
 * Seeds the Google Maps API key into the preview's localStorage.
 *
 * The key is read here, in Node, where `process.env` is unambiguous. Reading it
 * from a story file would depend on Storybook's DefinePlugin substitution
 * surviving `framework-preset-angular-cli`, which builds its own webpack config
 * — unverified, and not worth depending on.
 *
 * Without a key the map still renders, with a "For development purposes only"
 * watermark and a dismissible dialog.
 */
module.exports = {
  async preVisit(page) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (apiKey) {
      await page.addInitScript((key) => {
        window.localStorage.setItem('seam.googleMapsApiKey', key)
      }, apiKey)
    }
  },
}
