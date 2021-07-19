export default class CoordsValidator {
  validate(coords) {
    this.regex = /\[?(-?[0-9]+\.[0-9]+)\s?,\s?(-?[0-9]+\.[0-9]+)\]?/gm;
    const regTest = this.regex.exec(coords);
    if (!regTest) {
      throw new Error('Неверный формат координат.');
    }

    const latitude = regTest[1];
    const longitude = regTest[2];

    if (parseFloat(latitude.replace('-', '')) > 90
            || parseFloat(longitude.replace('-', '')) > 180) {
      throw new Error('Координаты за пределами допустимых значений.');
    }

    return { latitude, longitude };
  }
}
