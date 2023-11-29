importScripts('https://www.gstatic.com/firebasejs/9.6.8/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.8/firebase-messaging-compat.js');

// import { useIndexStore } from '../stores/index'
// const indexStore = useIndexStore()

firebase.initializeApp({
    apiKey: 'AIzaSyBfTrlk1mDUHw124QEIPVRvk8o8aW8wTpM',
    projectId: 'display24-3c078',
    messagingSenderId: '121461843745',
    appId: '1:121461843745:web:5eaf59e3dabbaf79a78060',
});

const messaging = firebase.messaging();

// Обработка входящих уведомлений
// messaging.setBackgroundMessageHandler(function (payload) {
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const data = { ...payload.notification, ...payload.data }
  if (data && data.mode) {
    // indexStore.mode = data.mode
  }

  // Вы можете выполнить дополнительную обработку уведомления здесь
  // const notificationTitle = 'Фоновое обновление дисплея';
  // const notificationOptions = {
  //   // body: 'Дисплей: 12345',
  //   body: '',
  // };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
