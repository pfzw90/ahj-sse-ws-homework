export default class TypeChecker {
  constructor() {
    this.audio = ['wav', 'mp3', 'flac', 'wma', 'aac'];
    this.video = ['mp4', 'mpeg', 'mov', 'wmv', 'flv', 'avi', 'mkv'];
    this.image = ['png', 'jpg', 'jpeg', 'gif'];
  }

  check(text) {
    const t = text.split('.').pop();
    if (this.audio.indexOf(t) >= 0) return 'audio';
    if (this.video.indexOf(t) >= 0) return 'video';
    if (this.image.indexOf(t) >= 0) return 'img';
    return 'other';
  }
}
