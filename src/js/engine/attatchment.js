import byteSize from 'byte-size';
import MediaPreview from './previewMaker';
import TypeChecker from './typeChecker';

const baseURL = 'https://ahj-diploma.herokuapp.com/'

export default class Attatchment {
  constructor(file = null, data = null, ui) {
    if (file) {
      this.file = file;
      this.url = file.path.split('\\').pop();
      this.size = `${byteSize(file.size)}`;
      this.name = file.name;
      this.type = new TypeChecker().check(this.name);
    } else {
      this.url = data.url;
      this.size = data.size;
      this.name = data.name;
      this.type = data.type;
    }
    this.ui = ui;
  }

  addElem(elem, removable = false) {
    this.attatchmentElem = document.createElement('li');
    this.attatchmentElem.className = 'attatchment';
    this.attatchmentElem.innerHTML = `<span class = "attatchment-name">${this.name}</span> 
    <span class = "attatchment-size">${this.size}</span>`;

    this.attatchmentElem.dataset.url = this.url;
    this.attatchmentElem.dataset.size = this.size;
    this.attatchmentElem.dataset.name = this.name;
    this.attatchmentElem.dataset.type = this.type;

    elem.append(this.attatchmentElem);
    if (removable) {
      this.removeAttatchment = document.createElement('span');
      this.removeAttatchment.className = 'remove-attatchment';
      this.removeAttatchment.innerText = '✖';
      this.attatchmentElem.insertAdjacentElement('beforeend', this.removeAttatchment);

      this.removeAttatchment.addEventListener('click', () => {
        fetch(`${baseURL}${this.url}`, { method: 'DELETE' })
          .then(() => {
            this.attatchmentElem.remove();
            this.removeAttatchment.remove();
          })
          .catch((err) => { throw new Error(err); });
      });
    }

    this.attatchmentElem.querySelector('.attatchment-name').addEventListener('click', () => {
      this.ui.openModal();
      this.closePreview = document.createElement('span');
      this.closePreview.id = 'close-preview-button';
      this.closePreview.innerText = '✖';

      this.closePreview.addEventListener('click', (ev) => {
        ev.preventDefault();
        this.ui.closeModal();
      });

      fetch(`${baseURL}${this.url}`).then((response) => {
        response.blob().then((blob) => {
          const file = new File([blob], this.name);
          const preview = new MediaPreview(file).elem;
          this.ui.modalWindow.insertAdjacentElement('beforeend', this.closePreview);
          this.ui.modalWindow.append(preview);
          const url = window.URL.createObjectURL(blob);
          const download = document.createElement('a');
          download.className = 'download';
          download.href = url;
          download.download = this.url;
          download.innerText = `Download ${this.size}`;
          this.ui.modalWindow.insertAdjacentElement('beforeend', download);
        });
      });
    });
  }
}
