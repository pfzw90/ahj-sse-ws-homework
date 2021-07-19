/* eslint-disable no-param-reassign */
import TypeChecker from './typeChecker';

export default class MediaPreview {
  constructor(file) {
    this.fileType = new TypeChecker().check(file.name);
    this.reader = new FileReader();
    this.elem = document.createElement('div');
    this.elem.id = 'preview-container';

    this.elem.innerHTML = `<span>${/(.*)\.{1}[a-zA-Z0-9]*$/gm.exec(file.name)[1]} ${file.type}</span>`;

    this.reader.onload = (e) => {
      const buffer = e.target.result;
      const blob = new Blob([new Uint8Array(buffer)], { type: file.type });
      const result = window.URL.createObjectURL(blob);

      if (this.fileType !== 'other') {
        this.preview = document.createElement(this.fileType);
        this.preview.className = 'preview';
        this.preview.src = result;

        if (this.fileType !== 'img') {
          this.preview.controls = true;
        }
      } else {
        this.preview = document.createElement('div');
        this.preview.innerHTML = '📄';
        this.preview.className = 'no-preview';
      }

      if (this.fileType === 'video') {
        this.preview.load();
      }

      this.elem.append(this.preview);
    };

    this.reader.readAsArrayBuffer(file);
  }
}
