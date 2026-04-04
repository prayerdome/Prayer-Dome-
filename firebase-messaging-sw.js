// firebase-messaging-sw.js - Complete Service Worker with Hourly Verses
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

// ==================== COMPLETE HOURLY VERSE DATABASE ====================
const hourlyVerses = [
    { hour: 0, verse: "The Lord is my light and my salvation—whom shall I fear?", ref: "Psalm 27:1", theme: "midnight", message: "🌙 Midnight Hour - God's protection surrounds you." },
    { hour: 1, verse: "I will both lie down in peace, and sleep; for You alone, O Lord, make me dwell in safety.", ref: "Psalm 4:8", theme: "rest", message: "😴 Rest in God's perfect peace." },
    { hour: 2, verse: "He gives sleep to those He loves.", ref: "Psalm 127:2", theme: "rest", message: "💤 Let your soul rest in the Father's embrace." },
    { hour: 3, verse: "My soul waits for the Lord more than watchmen wait for the morning.", ref: "Psalm 130:6", theme: "waiting", message: "🌅 The dawn is coming - keep trusting God." },
    { hour: 4, verse: "Weeping may endure for a night, but joy comes in the morning.", ref: "Psalm 30:5", theme: "hope", message: "☀️ Your breakthrough is closer than you think!" },
    { hour: 5, verse: "Awake, my soul! Awake, harp and lyre! I will awaken the dawn.", ref: "Psalm 57:8", theme: "praise", message: "🎵 Start your day with worship!" },
    { hour: 6, verse: "This is the day the Lord has made; let us rejoice and be glad in it.", ref: "Psalm 118:24", theme: "morning", message: "☀️ Good morning! Rejoice in God's new mercies!" },
    { hour: 7, verse: "Let the morning bring me word of your unfailing love.", ref: "Psalm 143:8", theme: "morning", message: "💖 God's love for you is new every morning." },
    { hour: 8, verse: "Be strong and courageous. Do not be afraid.", ref: "Joshua 1:9", theme: "strength", message: "💪 God is with you wherever you go today!" },
    { hour: 9, verse: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13", theme: "strength", message: "🙌 You have divine power for every task!" },
    { hour: 10, verse: "Trust in the Lord with all your heart.", ref: "Proverbs 3:5", theme: "trust", message: "🤲 Lean not on your own understanding." },
    { hour: 11, verse: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1", theme: "provision", message: "🐑 God will provide for all your needs." },
    { hour: 12, verse: "Give thanks to the Lord, for He is good.", ref: "Psalm 136:1", theme: "thanksgiving", message: "🕛 Noon - Pause and give thanks!" },
    { hour: 13, verse: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7", theme: "peace", message: "😌 Release your worries to God right now." },
    { hour: 14, verse: "Draw near to God, and he will draw near to you.", ref: "James 4:8", theme: "prayer", message: "🙏 Take a moment to pray right now." },
    { hour: 15, verse: "Seek first his kingdom and his righteousness.", ref: "Matthew 6:33", theme: "priority", message: "👑 Put God first in everything you do." },
    { hour: 16, verse: "Do not be anxious about anything.", ref: "Philippians 4:6", theme: "peace", message: "🕊️ Present your requests to God with thanksgiving." },
    { hour: 17, verse: "All things work for good for those who love God.", ref: "Romans 8:28", theme: "hope", message: "✨ God is working behind the scenes for you!" },
    { hour: 18, verse: "I have overcome the world.", ref: "John 16:33", theme: "victory", message: "🏆 You are more than a conqueror through Christ!" },
    { hour: 19, verse: "Come to me, all you who are weary.", ref: "Matthew 11:28", theme: "rest", message: "🌙 Evening - Find rest in Jesus tonight." },
    { hour: 20, verse: "For God so loved the world.", ref: "John 3:16", theme: "love", message: "💗 God's love for you is immeasurable!" },
    { hour: 21, verse: "Your word is a lamp for my feet.", ref: "Psalm 119:105", theme: "guidance", message: "🕯️ Let God's Word guide your steps." },
    { hour: 22, verse: "Be still, and know that I am God.", ref: "Psalm 46:10", theme: "stillness", message: "🌙 Quiet your heart - God is in control." },
    { hour: 23, verse: "Let the peace of Christ rule in your hearts.", ref: "Colossians 3:15", theme: "peace", message: "💤 Rest well knowing God watches over you." }
];

// Get verse for current hour
function getHourlyVerse() {
    const now = new Date();
    const hour = now.getHours();
    const verseData = hourlyVerses.find(v => v.hour === hour) || hourlyVerses[hour % 24];
    
    // Format the notification message
    const title = `🕊️ Prayer Dome - ${formatHour(hour)}`;
    const body = `"${verseData.verse}" — ${verseData.ref}\n\n${verseData.message}`;
    
    return { title, body, verseData };
}

// Format hour display (12-hour format)
function formatHour(hour) {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:00 ${ampm}`;
}

// ==================== SCHEDULE HOURLY NOTIFICATIONS ====================
let notificationInterval = null;

function scheduleHourlyNotification() {
    // Clear existing interval
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }
    
    // Calculate time until next hour
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1, 0, 0, 0);
    const delay = nextHour - now;
    
    console.log(`⏰ Scheduling next verse notification in ${Math.round(delay / 60000)} minutes`);
    
    // Schedule first notification at the next hour
    setTimeout(() => {
        sendHourlyVerseNotification();
        
        // Then set interval for every hour (60 minutes)
        notificationInterval = setInterval(() => {
            sendHourlyVerseNotification();
        }, 60 * 60 * 1000); // 1 hour
    }, delay);
}

// Send the hourly verse notification
async function sendHourlyVerseNotification() {
    const { title, body, verseData } = getHourlyVerse();
    
    console.log(`📖 Sending hourly verse: ${title}`, verseData);
    
    const notificationOptions = {
        body: body,
        icon: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
        badge: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        silent: false,
        sound: 'default',
        tag: `hourly-verse-${verseData.hour}`,
        renotify: true,
        data: {
            url: '/bible.html',
            click_action: '/bible.html',
            type: 'verse',
            hour: verseData.hour,
            verse: verseData.verse,
            ref: verseData.ref
        },
        actions: [
            {
                action: 'read',
                title: '📖 Read Bible'
            },
            {
                action: 'pray',
                title: '🙏 Pray Now'
            },
            {
                action: 'snooze',
                title: '⏰ Remind in 30 min'
            }
        ]
    };
    
    // Show the notification
    await self.registration.showNotification(title, notificationOptions);
    
    // Also store in IndexedDB for history (optional)
    storeVerseInHistory(verseData);
}

// Store verse history in IndexedDB (for tracking)
async function storeVerseInHistory(verseData) {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction(['verseHistory'], 'readwrite');
        const store = transaction.objectStore('verseHistory');
        store.add({
            timestamp: new Date().toISOString(),
            hour: verseData.hour,
            verse: verseData.verse,
            ref: verseData.ref
        });
    } catch (error) {
        console.log('IndexedDB not available for history');
    }
}

// Open IndexedDB for storing verse history
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PrayerDomeDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('verseHistory')) {
                db.createObjectStore('verseHistory', { autoIncrement: true });
            }
        };
    });
}

// ==================== FCM BACKGROUND MESSAGES ====================
messaging.onBackgroundMessage((payload) => {
    console.log('📨 Received background message:', payload);
    
    let notificationTitle = payload.notification?.title || '📖 Prayer Dome';
    let notificationBody = payload.notification?.body || '';
    let notificationIcon = payload.notification?.icon || 'https://i.ibb.co/TB5Fx4tb/logo-0.png';
    
    // If it's a verse notification, enhance it
    if (payload.data?.type === 'verse' || payload.notification?.tag?.includes('verse')) {
        const hour = new Date().getHours();
        const verseData = hourlyVerses.find(v => v.hour === hour) || hourlyVerses[0];
        notificationBody = `"${verseData.verse}" — ${verseData.ref}\n\n${verseData.message}`;
    }
    
    const notificationOptions = {
        body: notificationBody,
        icon: notificationIcon,
        badge: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: payload.data || {},
        actions: [
            {
                action: 'open',
                title: '🔔 Open Prayer Dome'
            },
            {
                action: 'read',
                title: '📖 Read Bible'
            }
        ]
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// ==================== NOTIFICATION CLICK HANDLER ====================
self.addEventListener('notificationclick', (event) => {
    console.log('🔘 Notification clicked:', event);
    event.notification.close();
    
    const action = event.action;
    const notificationData = event.notification.data || {};
    
    let urlToOpen = '/';
    
    switch (action) {
        case 'read':
            urlToOpen = '/bible.html';
            break;
        case 'pray':
            urlToOpen = '/prayer.html';
            break;
        case 'snooze':
            // Schedule a reminder in 30 minutes
            setTimeout(() => {
                const { title, body } = getHourlyVerse();
                self.registration.showNotification('⏰ Prayer Reminder', {
                    body: 'Time to pause and pray! ' + body.substring(0, 100),
                    icon: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
                    requireInteraction: false
                });
            }, 30 * 60 * 1000);
            return;
        default:
            urlToOpen = notificationData.url || '/';
    }
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(windowClients => {
                for (let i = 0; i < windowClients.length; i++) {
                    const client = windowClients[i];
                    if (client.url.includes(urlToOpen) && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// ==================== SERVICE WORKER LIFECYCLE ====================
self.addEventListener('install', (event) => {
    console.log('⚙️ Service Worker installed - Hourly verses active!');
    self.skipWaiting();
    
    // Pre-cache verse data
    event.waitUntil(
        caches.open('prayerdome-verses-v1').then((cache) => {
            return cache.put('/hourly-verses', new Response(JSON.stringify(hourlyVerses)));
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated - Starting hourly verse schedule!');
    event.waitUntil(clients.claim());
    
    // Start the hourly notification schedule
    scheduleHourlyNotification();
    
    // Also send a welcome notification
    setTimeout(() => {
        self.registration.showNotification('🙏 Welcome to Prayer Dome', {
            body: 'You will receive a Bible verse every hour. Stay blessed!',
            icon: 'https://i.ibb.co/TB5Fx4tb/logo-0.png',
            requireInteraction: false
        });
    }, 5000);
});

// ==================== PERIODIC SYNC (for Chrome) ====================
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'hourly-verse') {
        event.waitUntil(sendHourlyVerseNotification());
    }
});

// Register periodic sync if supported
if ('periodicSync' in self.registration) {
    self.registration.periodicSync.register('hourly-verse', {
        minInterval: 60 * 60 * 1000 // 1 hour
    }).then(() => {
        console.log('✅ Periodic sync registered for hourly verses');
    }).catch((err) => {
        console.log('Periodic sync not supported:', err);
    });
}

console.log('🎉 Prayer Dome Service Worker Loaded - Hourly verses active!');