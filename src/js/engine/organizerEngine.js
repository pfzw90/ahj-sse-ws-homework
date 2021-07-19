/* eslint-disable class-methods-use-this */
/* eslint-disable no-param-reassign */
import Note from './note';
import Filter from './filter';
import OrganizerUI from '../ui/organizerUI';
import CoordsValidator from './coordsValidator';
import MediaPreview from './previewMaker';
import TypeChecker from './typeChecker';
import Attatchment from './attatchment';

const baseUrl = 'https://ahj-diploma.herokuapp.com/';

export default class Organizer {
  constructor() {
    this.request = {};
    this.filter = new Filter();
    this.ui = new OrganizerUI();
    this.ui.drawUI();
    this.notes = [];
    this.tags = new Set();
    this.validator = new CoordsValidator();
    this.typeChecker = new TypeChecker();
    this.data = {};
    this.manualCoords = false;
  }

  loadNoteOnScroll() {
    const windowRelativeBottom = this.ui.messages.getBoundingClientRect().bottom;
    if (!(windowRelativeBottom > this.ui.messages.clientHeight + 100)) this.requireNextNote();
  }

  requireNextNote(id = null) {
    const data = { type: 'getnext' };
    if (id) data.startfrom = id;
    if (this.checkMessagesContainer()) this.ws.send(JSON.stringify(data));
  }

  checkMessagesContainer() {
    const lastVisible = Array.from(document.getElementsByClassName('note')).slice(-1)[0];
    if (lastVisible) {
      return (lastVisible.getBoundingClientRect().bottom
            < this.ui.messages.getBoundingClientRect().bottom);
    }
    return true;
  }

  connect() {
    this.ws = new WebSocket('wss://ahj-diploma.herokuapp.com/ws');

    this.ws.addEventListener('open', () => {
      this.requireNextNote();
    });

    this.ws.addEventListener('message', (evt) => {
      const data = JSON.parse(evt.data);
      if (data.value) {
        const note = new Note(JSON.parse(data.value), this.ui);
        if (this.notes.indexOf(note) < 0) {
          note.buildElement();
          this.filter.filter([note]);
          note.draw(data.new || false);
          this.notes.push(note);

          note.tags.forEach((t) => {
            if (!this.tags.has(t)) {
              this.ui.addTag(t);
              this.tags.add(t);
              document.getElementById(`tag-${t}`).addEventListener('change', () => {
                const i = this.filter.tags.indexOf(t);
                if (i >= 0) this.filter.tags.splice(i, 1);
                else this.filter.tags.push(t);
                this.filter.filter(this.notes);
              });
            }
          });

          const changeEv = new Event('change');
          Array.from(note.note.querySelectorAll('.message-tag')).forEach((t) => {
            t.addEventListener('click', (ev) => {
              ev.preventDefault();
              const tagBtn = document.getElementById(`tag-${ev.target.innerText}`);
              tagBtn.dispatchEvent(changeEv);
              tagBtn.checked = !tagBtn.checked;
            });
          });

          note.favbutton.button.addEventListener('change', () => {
            note.fav = note.favbutton.button.checked;
            this.filter.filter([note]);
          });
        }
      }

      if (!data.done) {
        this.requireNextNote();
        if (!this.ui.messages.onscroll) {
          this.ui.messages.onscroll = this.loadNoteOnScroll.bind(this);
        }
      } else if (data.done) { this.ui.messages.onscroll = null; }
    });

    this.ws.addEventListener('close', () => {
    });

    this.ws.addEventListener('error', (err) => {
      this.showMessage(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 'SERVER', err, '');
    });
  }

  bindLocationForm() {
    this.ui.locationForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
    });

    this.ui.saveLocation.addEventListener('click', (ev) => {
      ev.preventDefault();
      try {
        this.data.location = this.validator.validate(this.ui.location.value);
        this.ui.closeModal();
      } catch (e) {
        if (this.ui.location.nextSibling.className === 'warning') this.ui.location.nextSibling.remove();
        this.ui.location.insertAdjacentHTML('afterend', `<span class="warning">${e.message}</span>`);
      }
    });

    this.ui.cancelLocation.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.ui.closeModal();
      this.ui.addLocation.button.checked = false;
    });
  }

  uploadFile(ev) {
    ev.preventDefault();
    const file = ev.target.files && ev.target.files[0];
    if (file) {
      const prev = document.getElementById('preview-container');
      if (prev) prev.remove();
      this.ui.modalWindow.insertAdjacentElement('beforeend', new MediaPreview(file).elem);
      this.ui.modalWindow.insertAdjacentElement('beforeend', this.ui.confirmUpload);

      this.ui.confirmUpload.addEventListener('click', (confirmEv) => {
        confirmEv.preventDefault();

        const data = new FormData();
        data.append('file', file);
        const req = new XMLHttpRequest();

        req.addEventListener('load', () => {
          if (req.status >= 200 && req.status < 300) {
            try {
              const result = JSON.parse(req.response);
              const attatcment = new Attatchment(result, null, this.ui);
              this.ui.closeModal();

              if (!this.ui.attatchmentsList) {
                this.ui.attatchmentsList = document.createElement('ul');
                this.ui.attatchmentsList.className = 'attatchments-list';
                this.ui.messageForm.appendChild(this.ui.attatchmentsList);
              }
              attatcment.addElem(this.ui.attatchmentsList, true);
            } catch (e) {
              throw new Error(e);
            }
          }
        });

        req.open('POST', `${baseUrl}`, true);
        req.send(data);
      });
    }
  }

  bindFilesForm() {
    this.ui.uploadInput.addEventListener('change', this.uploadFile.bind(this));
    this.ui.uploadInput.addEventListener('dragdrop', this.uploadFile.bind(this));

    this.ui.cancelUpload.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.ui.upload.reset();
      this.ui.closeModal();
    });
  }

  requestPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => { resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }); },
        (err) => { reject(err); },
        { timeout: 5000 },
      );
    });
  }

  sendMessage() {
    this.data.text = this.ui.messageText.value;
    this.data.fav = this.ui.markFavorite.button.checked;
    this.data.attatchments = [];

    const attatchments = Array.from(document.querySelectorAll('#message-form .attatchment'));
    attatchments.forEach((a) => {
      this.data.attatchments.push(a.dataset);
      a.remove();
    });

    const note = new Note(this.data);
    this.ui.messageForm.reset();
    delete this.data.attatchments;
    delete this.data.text;
    delete this.manualCoords;
    delete this.data.location;
    this.ws.send(JSON.stringify({ type: 'newnote', content: note }));
  }

  bind() {
    this.ui.sidePanel.addEventListener('submit', (ev) => {
      ev.preventDefault();
    });

    this.ui.messages.onscroll = this.loadNoteOnScroll.bind(this);

    Array.from(this.ui.contains.querySelectorAll('input[type="checkbox"]')).concat(this.ui.isFav.button).forEach((btn) => {
      btn.addEventListener('change', (ev) => {
        ev.preventDefault();
        this.filter[btn.id] = !this.filter[btn.id];
        this.filter.filter(this.notes);
        this.requireNextNote(this.notes.slice(-1)[0].id);
      });
    });

    this.ui.search.addEventListener('input', (ev) => {
      ev.preventDefault();
      this.filter.text = ev.target.value;
      this.notes.forEach((n) => {
        n.note.querySelector('.note-text').innerText = n.text;
      });
      this.filter.filter(this.notes);
      this.requireNextNote(this.notes.slice(-1)[0].id);
    });

    this.ui.searchClear.addEventListener('click', (ev) => {
      ev.preventDefault();
      this.filter = new Filter();
      this.ui.sidePanel.reset();
      this.filter.filter(this.notes);
      this.requireNextNote(this.notes.slice(-1)[0].id);
    });

    this.ui.messageForm.addEventListener('submit', (submitEv) => {
      submitEv.preventDefault();
    });

    this.ui.messageClear.addEventListener('click', (clearEv) => {
      clearEv.preventDefault();
      this.ui.messageForm.reset();
    });

    this.ui.addFile.addEventListener('click', (addFilesEv) => {
      addFilesEv.preventDefault();
      this.ui.openFilesForm();
      this.bindFilesForm();
    });

    this.ui.messageSend.addEventListener('click', (sendEv) => {
      sendEv.preventDefault();

      if (this.ui.addLocation.button.checked && !this.data.location) {
        if (!this.manualCoords) {
          this.requestPosition().then((result) => {
            this.data.location = result;
            this.sendMessage();
          }).catch((e) => {
            this.ui.openLocationForm();
            this.bindLocationForm();
            this.manualCoords = true;
          });
        } else {
          this.ui.openLocationForm();
          this.bindLocationForm();
        }
      } else { this.sendMessage(); }
    });
  }
}
