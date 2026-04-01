// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCxvql0r_aeerphxTA0UUedRppdBxGf7wo",
    authDomain: "prayer-dome.firebaseapp.com",
    projectId: "prayer-dome",
    storageBucket: "prayer-dome.firebasestorage.app",
    messagingSenderId: "198295153196",
    appId: "1:198295153196:web:1222b31948d7974ba3bf89"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received:', payload);
    
    const notificationTitle = payload.notification?.title || '📖 Prayer Dome';
    const notificationOptions = {
        body: payload.notification?.body || 'Daily Bible Verse',
        icon: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
        badge: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: {
            url: payload.data?.url || '/index.html',
            click_action: '/index.html'
        }
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/index.html';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});