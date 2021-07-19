export default class CheckboxButton {
  constructor(name, text, classname) {
    this.button = document.createElement('input');
    this.button.type = 'checkbox';
    this.button.name = name;
    this.button.id = name;
    this.button.hidden = '';
    if (classname) this.button.classList.add(classname);

    this.buttonLabel = document.createElement('label');
    this.buttonLabel.for = name;
    this.buttonLabel.id = `${name}-label`;
    this.buttonLabel.innerHTML = `<span>${text}</span>`;
    this.buttonLabel.insertAdjacentElement('afterbegin', this.button);
  }

  add(element) {
    element.insertAdjacentElement('beforeend', this.buttonLabel);
  }
}
