// firebase-messaging-sw.js - Service Worker for background notifications
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

// Bible verses for hourly notifications
const hourlyVerses = [
    { verse: "For I know the plans I have for you, declares the Lord", ref: "Jeremiah 29:11" },
    { verse: "Be strong and courageous. Do not be afraid", ref: "Joshua 1:9" },
    { verse: "I can do all things through Christ who strengthens me", ref: "Philippians 4:13" },
    { verse: "Trust in the Lord with all your heart", ref: "Proverbs 3:5" },
    { verse: "The Lord is my shepherd; I shall not want", ref: "Psalm 23:1" },
    { verse: "This is the day that the Lord has made", ref: "Psalm 118:24" },
    { verse: "Cast all your anxiety on him because he cares for you", ref: "1 Peter 5:7" },
    { verse: "Draw near to God, and he will draw near to you", ref: "James 4:8" },
    { verse: "Seek first his kingdom and his righteousness", ref: "Matthew 6:33" },
    { verse: "Do not be anxious about anything", ref: "Philippians 4:6" },
    { verse: "All things work for good for those who love God", ref: "Romans 8:28" },
    { verse: "I have overcome the world", ref: "John 16:33" },
    { verse: "Come to me, all you who are weary", ref: "Matthew 11:28" },
    { verse: "For God so loved the world", ref: "John 3:16" },
    { verse: "Your word is a lamp for my feet", ref: "Psalm 119:105" },
    { verse: "The Lord is my light and my salvation", ref: "Psalm 27:1" },
    { verse: "The fruit of the Spirit is love, joy, peace", ref: "Galatians 5:22-23" },
    { verse: "Rejoice always, pray continually", ref: "1 Thessalonians 5:16-18" },
    { verse: "I sought the Lord and he answered me", ref: "Psalm 34:4" },
    { verse: "Be still, and know that I am God", ref: "Psalm 46:10" },
    { verse: "If anyone is in Christ, the new creation has come", ref: "2 Corinthians 5:17" },
    { verse: "Let the peace of Christ rule in your hearts", ref: "Colossians 3:15" },
    { verse: "We live by faith, not by sight", ref: "2 Corinthians 5:7" },
    { verse: "My God will meet all your needs", ref: "Philippians 4:19" },
    { verse: "Jesus Christ is the same yesterday and today and forever", ref: "Hebrews 13:8" },
    { verse: "Those who hope in the Lord will renew their strength", ref: "Isaiah 40:31" },
    { verse: "The Lord is close to the brokenhearted", ref: "Psalm 34:18" },
    { verse: "Greater love has no one than this", ref: "John 15:13" },
    { verse: "Do not worry about tomorrow", ref: "Matthew 6:34" },
    { verse: "Love is patient, love is kind", ref: "1 Corinthians 13:4" },
    { verse: "Where your treasure is, there your heart will be also", ref: "Matthew 6:21" },
    { verse: "Do not let any unwholesome talk come out of your mouths", ref: "Ephesians 4:29" },
    { verse: "Humble yourselves before the Lord", ref: "James 4:10" }
];

function getHourlyVerse() {
    const hour = new Date().getHours();
    const index = hour % hourlyVerses.length;
    return hourlyVerses[index];
}

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message: ', payload);
    
    let notificationTitle = payload.notification?.title || '📖 Prayer Dome';
    let notificationBody = payload.notification?.body || '';
    
    // If no specific message, send hourly verse
    if (!payload.notification || !payload.notification.body) {
        const verse = getHourlyVerse();
        notificationTitle = `🕊️ Hour ${new Date().getHours()}:00 - Daily Verse`;
        notificationBody = `"${verse.verse}" — ${verse.ref}`;
    }
    
    const notificationOptions = {
        body: notificationBody,
        icon: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
        badge: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        silent: false,
        sound: 'default',
        data: {
            url: payload.data?.url || '/index.html',
            click_action: '/index.html'
        },
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'snooze',
                title: 'Remind Later'
            }
        ]
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'snooze') {
        const snoozeTime = 60 * 60 * 1000; // 1 hour
        setTimeout(() => {
            const verse = getHourlyVerse();
            self.registration.showNotification('⏰ Time to Pray', {
                body: `"${verse.verse}" — ${verse.ref}`,
                icon: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
                requireInteraction: true
            });
        }, snoozeTime);
        return;
    }
    
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

// Schedule hourly notifications
self.addEventListener('install', () => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', () => {
    console.log('Service Worker activated');
    
    // Schedule hourly notifications
    function scheduleHourlyNotification() {
        const now = new Date();
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1, 0, 0, 0);
        const delay = nextHour - now;
        
        setTimeout(() => {
            const verse = getHourlyVerse();
            self.registration.showNotification(`🕊️ Hour ${new Date().getHours()}:00 - Daily Verse`, {
                body: `"${verse.verse}" — ${verse.ref}`,
                icon: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
                badge: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
                vibrate: [200, 100, 200],
                requireInteraction: true,
                tag: 'hourly-verse',
                renotify: true
            });
            scheduleHourlyNotification(); // Schedule next
        }, delay);
    }
    
    scheduleHourlyNotification();
});