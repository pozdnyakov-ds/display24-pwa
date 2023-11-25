importScripts('https://www.gstatic.com/firebasejs/9.6.8/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.8/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: 'AIzaSyBfTrlk1mDUHw124QEIPVRvk8o8aW8wTpM',
    projectId: 'display24-3c078',
    messagingSenderId: '121461843745',
    appId: '1:121461843745:android:d2996ed490c740b6a78060',
});

const messaging = firebase.messaging();

// Обработка входящих уведомлений
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  // Вы можете выполнить дополнительную обработку уведомления здесь
  const notificationTitle = 'Фоновое обновление дисплея';
  const notificationOptions = {
    body: 'Дисплей: 12345',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
