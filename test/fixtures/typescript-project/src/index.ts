/**
 * He's such a good boi!
 *
 * No srsly. such good
 */
export default class Dog {

  // Property
  /**
   * What's the dog's current mood?
   */
  mood = 'happy';

  // Params
  /**
   * Make some noise
   *
   * @param volume How loud?
   */
  public bark(volume: number) {
    if (!this.burrow()) {
      // ...
    }
  }

  // Returns
  /**
   * Checks if this.goodBoi is true, and if so, requests a belly rub.
   * Returns true if belly rub was successful.
   *
   * @returns Was the belly rub successful?
   */
  protected requestBellyRub() {
    return Math.random() > 0.5;
  }

  // Custom tags, private
  /**
   * Digs a hole in blankets or dirt
   *
   * @isGoodBoi true
   */
  private burrow() {

  }

}