import CheckboxButton from './checkboxButton';

export default class OrganizerUI {
  drawUI() {
    this.container = document.createElement('div');
    this.container.id = 'container';

    this.sidePanel = document.createElement('form');
    this.sidePanel.id = 'side-panel';

    this.search = document.createElement('input');
    this.search.name = 'search';
    this.search.id = 'search';
    this.search.placeholder = 'Search..';

    this.sidePanel.insertAdjacentElement('afterbegin', this.search);

    this.isFav = new CheckboxButton('fav', '⭐Favorited', 'fav');
    this.isFav.add(this.sidePanel);

    this.contains = document.createElement('div');
    this.contains.id = 'contains';

    this.containsAudio = new CheckboxButton('image', '🖼️', 'contains');
    this.containsAudio.add(this.contains);

    this.containsAudio = new CheckboxButton('audio', '🎧', 'contains');
    this.containsAudio.add(this.contains);

    this.containsVideo = new CheckboxButton('video', '📹', 'contains');
    this.containsVideo.add(this.contains);

    this.containsOther = new CheckboxButton('other', '📋', 'contains');
    this.containsOther.add(this.contains);

    this.sidePanel.insertAdjacentElement('beforeend', this.contains);

    this.tags = document.createElement('div');
    this.tags.id = 'tags';

    this.sidePanel.insertAdjacentElement('beforeend', this.tags);

    this.searchClear = document.createElement('button');
    this.searchClear.id = 'search-clear';
    this.searchClear.innerText = 'Clear';

    this.sidePanel.insertAdjacentElement('beforeend', this.searchClear);

    this.messageForm = document.createElement('form');
    this.messageForm.id = 'message-form';

    this.messages = document.createElement('div');
    this.messages.id = 'messages';

    this.messageText = document.createElement('textarea');
    this.messageText.required = true;
    this.messageText.name = 'message-text';
    this.messageText.id = 'message-text';

    this.messageControls = document.createElement('div');
    this.messageControls.id = 'message-controls';

    this.addFile = document.createElement('button');
    this.addFile.innerText = '📎 Add file';
    this.addFile.id = 'add-file';

    this.messageControls.insertAdjacentElement('afterbegin', this.addFile);

    this.markFavorite = new CheckboxButton('mark-favorite', '⭐ Mark', 'message-control');
    this.markFavorite.add(this.messageControls);

    this.addLocation = new CheckboxButton('add-location', '📍 Add location', 'message-control');
    this.addLocation.add(this.messageControls);

    this.messageClear = document.createElement('button');
    this.messageClear.innerText = 'Clear';
    this.messageClear.id = 'clear';
    this.messageControls.insertAdjacentElement('beforeend', this.messageClear);

    this.messageSend = document.createElement('button');
    this.messageSend.innerText = 'Send';
    this.messageSend.id = 'send';
    this.messageControls.insertAdjacentElement('beforeend', this.messageSend);

    this.messageAttatchments = document.createElement('div');
    this.messageAttatchments.id = 'message-attatchments';

    this.messageForm.append(this.messageText, this.messageAttatchments,
      this.messageControls);

    this.mainPanel = document.createElement('main');
    this.mainPanel.id = 'main-panel';

    this.mainPanel.append(this.messages, this.messageForm);
    this.container.append(this.mainPanel, this.sidePanel);

    document.body.appendChild(this.container);

    this.messagesHeight = this.messages.offsetHeight;
  }

  openModal() {
    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'modal-container';
    this.modalWindow = document.createElement('div');
    this.modalWindow.id = 'modal-window';
    document.body.append(this.modalContainer);
    this.modalContainer.append(this.modalWindow);
  }

  openLocationForm() {
    this.openModal();
    this.locationForm = document.createElement('form');
    this.locationForm.id = 'location-form';
    this.locationForm.name = 'location-form';

    this.location = document.createElement('input');
    this.location.id = 'location';
    this.location.name = 'location';
    this.location.required = true;

    this.saveLocation = document.createElement('button');
    this.saveLocation.id = 'save-location-button';
    this.saveLocation.innerText = 'Save';

    this.cancelLocation = document.createElement('button');
    this.cancelLocation.id = 'cancel-location-button';
    this.cancelLocation.innerText = 'Cancel';

    this.modalWindow.append(this.locationForm);
    this.locationForm.append(this.location, this.saveLocation, this.cancelLocation);
  }

  closeModal() {
    this.modalContainer.remove();
  }

  openFilesForm() {
    this.openModal();

    this.upload = document.createElement('form');
    this.upload.id = 'upload';

    this.uploadOverlay = document.createElement('div');
    this.uploadOverlay.id = 'upload-overlay';

    this.uploadInput = document.createElement('input');
    this.uploadInput.id = 'upload-input';
    this.uploadInput.type = 'file';
    this.uploadInput.multiple = false;
    this.uploadInput.required = true;

    this.cancelUpload = document.createElement('span');
    this.cancelUpload.id = 'cancel-upload';
    this.cancelUpload.innerText = '✖';

    this.confirmUpload = document.createElement('button');
    this.confirmUpload.id = 'confirm-upload-button';
    this.confirmUpload.innerText = 'Upload';

    this.modalWindow.append(this.cancelUpload);
    this.upload.append(this.uploadOverlay, this.uploadInput);
    this.modalWindow.append(this.upload);
  }

  addTag(tag) {
    const t = new CheckboxButton(`tag-${tag}`, tag, 'tag');
    t.add(this.tags);
  }
}
