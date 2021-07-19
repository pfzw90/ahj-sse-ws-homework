export default class Filter {
  constructor() {
    this.state = false;
    this.fav = false;
    this.audio = false;
    this.video = false;
    this.image = false;
    this.other = false;
    this.tags = [];
    this.text = null;
  }

  filter(notes) {
    notes.forEach((note) => {
      let matches = false;
      (() => {
        if (this.fav && !note.fav) return;
        if (this.audio && !note.attatchments.filter((a) => a.type === 'audio').length) return;
        if (this.image && !note.attatchments.filter((a) => a.type === 'img').length) return;
        if (this.video && !note.attatchments.filter((a) => a.type === 'video').length) return;
        if (this.other && !note.attatchments.filter((a) => a.type === 'other').length) return;
        if (this.tags.length
            && this.tags.filter((tag) => !note.tags.includes(tag)).length) return;
        if (this.text) {
          if (note.text.indexOf(this.text) < 0) return;
          const noteText = note.note.querySelector('.note-text');
          noteText.innerHTML = noteText.innerHTML.replace(this.text, `<span class="text-match">${this.text}</span>`);
        }
        matches = true;
      })();
      if (!matches) note.hide();
      else note.show();
    });
  }
}
