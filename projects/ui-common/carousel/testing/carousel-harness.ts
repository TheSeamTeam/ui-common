import { ComponentHarness } from '@angular/cdk/testing'

export class TheSeamCarouselHarness extends ComponentHarness {
  static hostSelector = 'seam-carousel'

  _content = this.locatorFor('.carousel-content')
  _prevSlideButton = this.locatorForOptional('[title="Go to previous slide"]')
  _nextSlideButton = this.locatorForOptional('[title="Go to next slide"]')
  _playButton = this.locatorForOptional('[title="Play"]')
  _pauseButton = this.locatorForOptional('[title="Pause"]')

  public async activeTileIndex() {
    return (await this._content()).getAttribute('data-slide-index')
  }

  public async goToPreviousSlide() {
    const prevSlideButton = await this._prevSlideButton()
    if (prevSlideButton === null) {
      throw Error('Previous slide button not found.')
    }
    return prevSlideButton.click()
  }

  public async goToNextSlide() {
    const nextSlideButton = await this._nextSlideButton()
    if (nextSlideButton === null) {
      throw Error('Next slide button not found.')
    }
    return nextSlideButton.click()
  }

  public async goToSlide(index: number) {
    return (await this.locatorFor(`[title="Go to slide ${index + 1}"]`)()).click()
  }

  public async hasPreviousSlideButton() {
    return (await this._prevSlideButton()) !== null
  }

  public async hasNextSlideButton() {
    return (await this._nextSlideButton()) !== null
  }

  public async hasSlideButton(index: number) {
    return (await this.locatorForAll(`[title="Go to slide ${index + 1}"]`)()) !== null
  }

  public async hasSlideButtons() {
    return (await this.locatorForAll('[title^="Go to slide"]')()).length > 0
  }

  public async hasAutoPlayToggleButton() {
    return ((await this._playButton()) !== null) || ((await this._pauseButton()) !== null)
  }

}
