export default class Chat {
  constructor() {
    this.createElements();
    this.request = {};
  }

  createElements() {
    this.container = document.createElement('div');
    this.container.id = 'container';

    this.chatWindow = document.createElement('div');
    this.chatWindow.id = 'chat-window';

    this.chat = document.createElement('div');
    this.chat.id = 'chat';

    this.users = document.createElement('div');
    this.users.id = 'users';

    this.messageForm = document.createElement('form');
    this.messageForm.id = 'message-form';

    this.messages = document.createElement('div');
    this.messages.id = 'messages';

    this.messageText = document.createElement('textarea');
    this.messageText.required = true;
    this.messageText.name = 'message-text';
    this.messageText.id = 'message-text';

    this.messageSend = document.createElement('button');
    this.messageSend.innerText = 'Отправить';
    this.messageSend.id = 'send';

    this.messageClear = document.createElement('button');
    this.messageClear.innerText = 'Очистить';
    this.messageClear.id = 'clear';

    this.messageForm.append(this.messageText, this.messageSend, this.messageClear);
    this.chatWindow.append(this.users, this.messages, this.messageForm);
    this.container.append(this.chatWindow);

    this.loginWindow = document.createElement('div');
    this.loginWindow.id = 'login-window';

    this.loginForm = document.createElement('form');
    this.loginForm.id = 'login-form';

    this.loginName = document.createElement('input');
    this.loginName.required = true;
    this.loginName.name = 'login-name';
    this.loginName.id = 'login-name';

    this.loginSend = document.createElement('button');
    this.loginSend.innerText = 'Войти';
    this.loginSend.id = 'send';

    this.loginForm.append(this.loginName, this.loginSend);
    this.loginWindow.append(this.loginForm);

    this.loginError = document.createElement('span');
    this.loginError.innerText = 'Этот никнейм уже занят. Повторите попытку.';
  }

  showMessage(time, user, message, type) {
    const msg = document.createElement('div');
    msg.className = 'message';
    msg.className = type;

    const msgTime = document.createElement('span');
    msgTime.innerText = `${time} | `;
    const msgUser = document.createElement('span');
    msgUser.innerText = user;
    const msgMessage = document.createElement('span');
    msgMessage.innerText = `: ${message}`;

    msg.append(msgTime, msgUser, msgMessage);
    this.messages.insertAdjacentElement('beforeend', msg);
  }

  connect() {
    this.ws = new WebSocket('wss://ws-homework.herokuapp.com');
    console.log(this.ws)

    this.ws.addEventListener('open', () => {
      document.body.appendChild(this.loginWindow);
      this.loginForm.addEventListener('submit', (loginEvent) => {
        loginEvent.preventDefault();
        this.username = this.loginName.value;
        this.request.user = this.loginName.value;
        this.request.type = 'login';
        this.ws.send(JSON.stringify(this.request));
      });
    });

    this.ws.addEventListener('message', (evt) => {
      const data = (JSON.parse(evt.data));

      switch (data.type) {
        case 'login':
          if (data.success === 'false') {
            this.loginName.value = '';
            this.loginForm.appendChild(this.loginError);
          } else {
            this.loginWindow.remove();
            document.body.appendChild(this.container);
            this.container.appendChild(this.chatWindow);

            this.messageForm.addEventListener('submit', (sendMessageEvent) => {
              sendMessageEvent.preventDefault();
              this.request.type = 'chatmessage';
              this.request.time = `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
              this.request.message = this.messageText.value;
              this.ws.send(JSON.stringify(this.request));
              this.messageText.value = '';
            });

            this.messageClear.addEventListener('click', (clearMessageEvent) => {
              clearMessageEvent.preventDefault();
              this.messageText.value = '';
            });

            data.users.forEach((u) => {
              const user = document.createElement('span');
              user.innerText = u;
              this.users.insertAdjacentElement('beforeend', user);
            });
          }
          break;

        case 'userLogin':
          this.users.insertAdjacentHTML('beforeend', `<span>${data.user}</span>`);
          this.showMessage(data.time, data.user, 'Пользователь зашел в чат.', 'loginmessage');
          break;

        case 'userLogout':
          Array.from(this.users.querySelectorAll('span')).forEach((u) => {
            if (u.innerText === data.user) u.remove();
          });
          this.showMessage(data.time, data.user, 'Пользователь покинул чат.', 'logoutmessage');
          break;

        case 'chatmessage':
          this.showMessage(data.time, data.user, data.message, 'chatmessage');
          break;

        default:
          return;
      }

      Array.from(this.chatWindow.querySelectorAll('span')).forEach((elem) => {
        if (elem.innerText === this.username) {
          elem.insertAdjacentHTML('afterend', '<span>YOU</span>');
          if (elem.closest('div').className === 'chatmessage') elem.closest('div').classList.add('you');
          elem.remove();
        }
      });

      this.ws.addEventListener('close', () => {
        this.messageText.disabled = 'true';
        this.messageSend.disabled = 'true';
      });

      this.ws.addEventListener('error', (err) => {
        this.showMessage(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 'SERVER', err, '');
      });
    });
  }
}
