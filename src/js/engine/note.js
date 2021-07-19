/* eslint-disable no-cond-assign */
import { v4 as uuidv4 } from 'uuid';
import CheckboxButton from '../ui/checkboxButton';
import Attatchment from './attatchment';
import hyperlink from './hyperlink';

const baseURL = `https://ahj-diploma.herokuapp.com/`

export default class Note {
  constructor(note, ui) {
    this.id = note.id || uuidv4();
    this.location = note.location || null;
    this.text = note.text;
    this.created = note.created || new Date().toISOString();
    this.tags = note.tags || this.getTags(this.text);
    this.attatchments = note.attatchments || [];
    this.fav = note.fav || false;
    this.ui = ui;
  }

  getTags(text) {
    this.regex = /#[a-zA-Z0-9]*/gm;
    const result = [];
    let m;
    while ((m = this.regex.exec(text)) !== null) {
      if (m.index === this.regex.lastIndex) {
        this.regex.lastIndex += 1;
      }
      m.forEach((match) => {
        result.push(match.replace('#', ''));
      });
    }
    return result;
  }

  buildElement() {
    this.note = document.createElement('div');
    this.note.className = 'note';
    this.note.id = `${this.id}`;
    let locationText = 'Location unknown';
    if (this.location) {
      locationText = `[${this.location.latitude}, ${this.location.longitude}]`;
    }

    this.noteInfo = document.createElement('div');
    this.noteInfo.className = 'note-info';
    this.noteInfo.innerHTML = `<span class = 'created'> ${new Date(this.created).toLocaleString('en-GB')} </span>
    <span class = 'location'> ${locationText}</span>`;

    this.favbutton = new CheckboxButton('note-fav', '⭐', 'note-fav');
    this.favbutton.button.checked = this.fav;
    this.favbutton.add(this.noteInfo);

    this.favbutton.button.addEventListener('change', (ev) => {
      ev.preventDefault();
      fetch(`${baseURL}${this.url}`, { method: 'PUT' });
    });

    this.note.insertAdjacentElement('beforeend', this.noteInfo);

    this.noteText = document.createElement('div');
    this.noteText.className = 'note-text';
    this.noteText.innerHTML = this.text.replace(hyperlink, '<a href = "$&" target=_blank>$&</a>');

    this.note.insertAdjacentElement('beforeend', this.noteText);

    if (this.attatchments.length) {
      const attatchments = document.createElement('ul');
      attatchments.className = 'attatchments';
      this.attatchments.forEach((a) => {
        const attatchment = new Attatchment(null, a, this.ui);
        attatchment.addElem(attatchments, false);
      });
      this.note.insertAdjacentElement('beforeend', attatchments);
    }

    if (this.tags.length) {
      this.tags.forEach((t) => {
        const tag = document.createElement('span');
        tag.className = 'message-tag';
        tag.innerText = `${t}`;
        this.note.insertAdjacentElement('beforeend', tag);
      });
    }
  }

  hide() { this.note.className = 'note-hidden'; }

  show() { this.note.className = 'note'; }

  draw(isNew) {
    let position = 'beforeend';
    if (isNew) position = 'afterbegin';
    document.getElementById('messages').insertAdjacentElement(position, this.note);
  }
}
