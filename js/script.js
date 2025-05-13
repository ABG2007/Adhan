/**
 * script.js
 * Main script for AdhanApp - Islamic Prayer Times Application
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize app components
    const app = new AdhanApp();
    app.init();
});

/**
 * AdhanApp Class
 * Main application class handling app initialization and core functionality
 */
class AdhanApp {
    constructor() {
        // DOM Elements
        this.elements = {
            // Date and Location Elements
            gregorianDate: document.getElementById('gregorianDate'),
            currentTime: document.getElementById('currentTime'),
            locationText: document.getElementById('locationText'),
            changeLocationBtn: document.getElementById('changeLocationBtn'),

            // Next Prayer Elements
            nextPrayerName: document.getElementById('nextPrayerName'),
            nextPrayerTime: document.getElementById('nextPrayerTime'),
            countdown: document.getElementById('countdown'),

            // Prayer Time Elements
            fajrTime: document.getElementById('fajrTime'),
            sunriseTime: document.getElementById('sunriseTime'),
            dhuhrTime: document.getElementById('dhuhrTime'),
            asrTime: document.getElementById('asrTime'),
            maghribTime: document.getElementById('maghribTime'),
            ishaTime: document.getElementById('ishaTime'),

            // Notification Elements
            fajrNotif: document.getElementById('fajrNotif'),
            sunriseNotif: document.getElementById('sunriseNotif'),
            dhuhrNotif: document.getElementById('dhuhrNotif'),
            asrNotif: document.getElementById('asrNotif'),
            maghribNotif: document.getElementById('maghribNotif'),
            ishaNotif: document.getElementById('ishaNotif'),

            // Modal Elements
            settingsModal: document.getElementById('settingsModal'),
            locationModal: document.getElementById('locationModal'),
            notificationModal: document.getElementById('notificationModal'),

            // Settings Elements
            calculationMethod: document.getElementById('calculationMethod'),
            asrStandard: document.getElementById('asrStandard'),
            asrHanafi: document.getElementById('asrHanafi'),
            time12h: document.getElementById('time12h'),
            time24h: document.getElementById('time24h'),
            notificationsEnabled: document.getElementById('notificationsEnabled'),
            adhanSound: document.getElementById('adhanSound'),
            prayerReminder: document.getElementById('prayerReminder'),

            // Prayer Time Adjustments
            fajrAdjust: document.getElementById('fajrAdjust'),
            sunriseAdjust: document.getElementById('sunriseAdjust'),
            dhuhrAdjust: document.getElementById('dhuhrAdjust'),
            asrAdjust: document.getElementById('asrAdjust'),
            maghribAdjust: document.getElementById('maghribAdjust'),
            ishaAdjust: document.getElementById('ishaAdjust'),

            // Buttons and Interactive Elements
            themeToggle: document.getElementById('themeToggle'),
            settingsBtn: document.getElementById('settingsBtn'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            resetSettingsBtn: document.getElementById('resetSettingsBtn'),
            autoLocationBtn: document.getElementById('autoLocationBtn'),
            locationSearch: document.getElementById('locationSearch'),
            searchLocationBtn: document.getElementById('searchLocationBtn'),
            searchResults: document.getElementById('searchResults'),
            closeLocationBtn: document.getElementById('closeLocationBtn'),
            allowNotificationsBtn: document.getElementById('allowNotificationsBtn'),
            denyNotificationsBtn: document.getElementById('denyNotificationsBtn'),
            testAdhanBtn: document.getElementById('testAdhanBtn'),
            installBtn: document.getElementById('installBtn'),
            dismissInstallBtn: document.getElementById('dismissInstallBtn'),
            installPrompt: document.getElementById('installPrompt'),
            loader: document.getElementById('loader'),

            // Audio Element
            adhanAudio: document.getElementById('adhanAudio')
        };

        // App State
        this.state = {
            // Prayer Times Data
            prayerTimes: null,
            nextPrayer: {
                time: null,
                name: null
            },

            // Location Data
            location: {
                latitude: null,
                longitude: null,
                name: null
            },

            // Settings
            settings: {
                calculationMethod: 0, // Default: Muslim World League
                asrMethod: 0, // Default: Standard (Shafi'i)
                timeFormat: '24h',
                notificationsEnabled: true,
                adhanSound: 'adhan.mp3',
                prayerReminder: 0, // Minutes avant la prière (0 = désactivé)
                adjustments: {
                    fajr: 0,
                    sunrise: 0,
                    dhuhr: 0,
                    asr: 0,
                    maghrib: 0,
                    isha: 0
                }
            },

            // App Settings
            theme: 'light', // Default theme
            currentLanguage: 'fr', // Langue par défaut
            colorTheme: 'green', // Default color theme
            notificationPermission: 'default',
            installPromptEvent: null,
            countdownInterval: null,
            notificationTimeout: null,
            offlineMode: false,
            searchTimeout: null // Ajout pour le debounce de la recherche
        };

        // Prayer Times Calculator
        this.prayerTimesCalculator = new PrayerTimes();

        // Check if service worker is registered
        this.serviceWorkerRegistered = 'serviceWorker' in navigator;

        // Bind methods to this context
        this.updatePrayerTimes = this.updatePrayerTimes.bind(this);
        this.updateNextPrayer = this.updateNextPrayer.bind(this);
        this.updateCountdown = this.updateCountdown.bind(this);
        this.initNotifications = this.initNotifications.bind(this);
        this.playAdhan = this.playAdhan.bind(this);
        this.getGeolocation = this.getGeolocation.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.openSettingsModal = this.openSettingsModal.bind(this);
        this.closeSettingsModal = this.closeSettingsModal.bind(this);
        this.saveSettings = this.saveSettings.bind(this);
        this.resetSettings = this.resetSettings.bind(this);
        this.updateReminderOptions = this.updateReminderOptions.bind(this);

        console.log("AdhanApp Constructor: Initial state.theme:", JSON.parse(JSON.stringify(this.state.theme)), "Initial state.colorTheme:", JSON.parse(JSON.stringify(this.state.colorTheme)));
    }

    /**
     * Met à jour les options du sélecteur de rappel de prière avec les traductions appropriées
     */
    updateReminderOptions() {
        // Récupérer le texte traduit pour 'minutes avant'
        const minutesBeforeText = this.translate('settings.minutesBefore');

        // Mettre à jour le texte de chaque option (sauf l'option 'aucun rappel')
        const reminderOptions = this.elements.prayerReminder.options;

        // L'option 0 est '-' (aucun rappel)
        reminderOptions[0].textContent = '-';

        // Pour les autres options (5, 10, 15, 20, 30 minutes)
        for (let i = 1; i < reminderOptions.length; i++) {
            const minutes = reminderOptions[i].value;
            reminderOptions[i].textContent = `${minutes} ${minutesBeforeText}`;
        }
    }

    /**
     * Initialize the application
     */
    init() {
        console.log("AdhanApp Init: Start");
        // Show loader while initializing
        this.showLoader(true);

        // Set default location (Paris) immediately to avoid NaN:NaN display
        if (!this.state.location || !this.state.location.latitude) {
            this.state.location = {
                latitude: 48.8566,
                longitude: 2.3522,
                name: 'Paris, France (par défaut)'
            };
            this.updateLocationDisplay();
        }

        // Load settings from localStorage
        console.log("AdhanApp Init: Before loadSettings. state.theme:", this.state.theme, "state.colorTheme:", this.state.colorTheme);
        this.loadSettings(); // This should load theme and colorTheme into this.state.settings and this.state
        console.log("AdhanApp Init: After loadSettings. state.theme:", this.state.theme, "state.colorTheme:", this.state.colorTheme, "state.settings.theme:", this.state.settings.theme, "state.settings.colorTheme:", this.state.settings.colorTheme);

        // Initialiser la langue
        const savedLanguage = localStorage.getItem('adhan_language');
        if (savedLanguage) {
            this.state.currentLanguage = savedLanguage;
        }

        // Apply theme
        console.log("AdhanApp Init: Before applyTheme. Current state.theme:", this.state.theme);
        this.applyTheme();
        console.log("AdhanApp Init: After applyTheme.");

        // Apply color theme from state, which should have been loaded by loadSettings
        console.log("AdhanApp Init: Before applyColorTheme. Current state.colorTheme:", this.state.colorTheme);
        this.applyColorTheme(this.state.colorTheme);
        console.log("AdhanApp Init: After applyColorTheme.");

        // Appliquer les traductions
        this.updateInterfaceTexts();

        // Initialize current date
        this.updateDate();

        // Get user location and prayer times
        this.initLocation()
            .then(() => {
                // Update prayer times
                return this.updatePrayerTimes();
            })
            .then(() => {
                // Start countdown to next prayer
                this.updateNextPrayer();
                this.startCountdown();

                // Initialize notifications
                this.initNotifications();

                // Hide loader
                this.showLoader(false);
            })
            .catch(error => {
                console.error('Error initializing app:', error);
                // Even if there's an error, we should still try to display prayer times with default location
                this.updatePrayerTimes().catch(e => console.error('Failed to get prayer times with default location:', e));
                this.showLoader(false);
            });

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('AdhanApp: Service Worker registered successfully with scope:', registration.scope);
                    })
                    .catch(error => {
                        console.error('AdhanApp: Service Worker registration failed:', error);
                    });
            });
        } else {
            console.log('AdhanApp: Service Worker not supported in this browser.');
        }

        // Add event listeners
        this.setupEventListeners();

        // Check for install prompt
        this.initInstallPrompt();

        // Set up offline mode detection
        this.setupOfflineDetection();
    }

    /**
     * Set up event listeners for user interactions
     */
    setupEventListeners() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', this.handleThemeToggle);
        console.log("AdhanApp EventListeners: Theme toggle listener attached.");

        // Language selector
        const languageToggle = document.getElementById('languageToggle');
        const languageDropdown = document.querySelector('.language-dropdown');
        const languageOptions = document.querySelectorAll('.language-option');

        if (languageToggle) {
            // Initialiser avec la langue enregistrée ou par défaut
            const savedLang = localStorage.getItem('adhan_language') || 'fr';
            this.setActiveLanguage(savedLang);

            // Ouvrir/fermer le menu déroulant de langues
            languageToggle.addEventListener('click', () => {
                languageDropdown.classList.toggle('active');
            });

            // Fermer le menu déroulant lors d'un clic en dehors
            document.addEventListener('click', (event) => {
                if (!event.target.closest('.language-selector-container') &&
                    languageDropdown.classList.contains('active')) {
                    languageDropdown.classList.remove('active');
                }
            });
        }

        // Options de langue
        if (languageOptions.length > 0) {
            languageOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const lang = option.getAttribute('data-lang');
                    if (lang) {
                        this.setActiveLanguage(lang);
                        if (languageDropdown.classList.contains('active')) {
                            languageDropdown.classList.remove('active');
                        }
                    }
                });
            });
        }

        // Settings modal
        this.elements.settingsBtn.addEventListener('click', this.openSettingsModal);
        this.elements.closeSettingsBtn.addEventListener('click', this.closeSettingsModal);
        this.elements.saveSettingsBtn.addEventListener('click', this.saveSettings);
        this.elements.resetSettingsBtn.addEventListener('click', this.resetSettings);

        // Location modal
        this.elements.changeLocationBtn.addEventListener('click', () => this.openModal(this.elements.locationModal));
        this.elements.closeLocationBtn.addEventListener('click', () => this.closeModal(this.elements.locationModal));
        this.elements.autoLocationBtn.addEventListener('click', () => {
            this.getGeolocation()
                .then(() => {
                    this.updatePrayerTimes();
                    this.closeModal(this.elements.locationModal);
                })
                .catch(error => {
                    console.error('Error getting geolocation:', error);
                    this.showError('Impossible d\'obtenir votre position. Veuillez entrer votre ville manuellement.');
                });
        });

        // Location search
        this.elements.searchLocationBtn.addEventListener('click', () => this.searchLocation());
        this.elements.locationSearch.addEventListener('keyup', (e) => {
            console.log(`AdhanApp: locationSearch keyup - Key: "${e.key}"`);

            // Si la touche Entrée est pressée, lance la recherche immédiatement
            if (e.key === 'Enter') {
                console.log("AdhanApp: locationSearch keyup - Enter pressed.");
                clearTimeout(this.state.searchTimeout); // Annule le timeout précédent s'il y en a un
                this.searchLocation();
                return;
            }

            // Ignore les touches qui ne modifient pas le texte (flèches, Shift, Ctrl, etc.)
            // sauf pour Backspace et Delete qui doivent déclencher une recherche.
            // Les touches fléchées sont aussi gérées pour la navigation dans les résultats, ne devraient pas relancer une recherche ici.
            if (e.key.length > 1 && e.key !== 'Backspace' && e.key !== 'Delete' && !e.key.startsWith('Arrow')) {
                console.log(`AdhanApp: locationSearch keyup - Ignoring non-text modifying key: "${e.key}"`);
                return;
            }

            // Si la query est vide après un backspace/delete, on ne lance pas de recherche mais on vide les résultats
            const query = this.elements.locationSearch.value.trim();
            if (!query && (e.key === 'Backspace' || e.key === 'Delete')) {
                console.log("AdhanApp: locationSearch keyup - Query is empty after backspace/delete. Clearing results and timeout.");
                clearTimeout(this.state.searchTimeout);
                if (this.elements.searchResults) {
                    this.elements.searchResults.innerHTML = '';
                    this.elements.searchResults.style.display = 'none';
                }
                return;
            }

            // Annule le timeout précédent s'il y en a un
            clearTimeout(this.state.searchTimeout);
            console.log("AdhanApp: locationSearch keyup - Previous timeout cleared.");

            // Définit un nouveau timeout pour lancer la recherche après 500ms
            console.log("AdhanApp: locationSearch keyup - Setting new timeout for searchLocation.");
            this.state.searchTimeout = setTimeout(() => {
                console.log("AdhanApp: locationSearch keyup - Timeout expired, calling searchLocation.");
                this.searchLocation();
            }, 500); // Délai de 500ms
        });

        // Notification modal
        this.elements.allowNotificationsBtn.addEventListener('click', () => {
            this.requestNotificationPermission()
                .then(() => {
                    this.closeModal(this.elements.notificationModal);
                });
        });
        this.elements.denyNotificationsBtn.addEventListener('click', () => {
            this.closeModal(this.elements.notificationModal);
        });

        // Notification toggles
        const notifElements = [
            this.elements.fajrNotif,
            this.elements.sunriseNotif,
            this.elements.dhuhrNotif,
            this.elements.asrNotif,
            this.elements.maghribNotif,
            this.elements.ishaNotif
        ];

        notifElements.forEach(element => {
            element.addEventListener('change', () => {
                this.saveNotificationSettings();
            });
        });

        // Test Adhan sound
        this.elements.testAdhanBtn.addEventListener('click', () => {
            const sound = this.elements.adhanSound.value;
            this.playAdhanTest(sound);
        });

        // Sélection du thème de couleur dans la modale des paramètres
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                const themeName = option.getAttribute('data-theme');
                console.log(`AdhanApp EventListeners: Color option clicked. Theme name: ${themeName}`);
                if (themeName) {
                    this.applyColorTheme(themeName);
                }
            });
        });
        console.log("AdhanApp EventListeners: Color option listeners attached.");

        // Installation
        this.elements.installBtn.addEventListener('click', () => {
            this.installApp();
        });
        this.elements.dismissInstallBtn.addEventListener('click', () => {
            this.dismissInstallPrompt();
        });

        // Audio ended event
        this.elements.adhanAudio.addEventListener('ended', () => {
            console.log('Adhan playback finished');
        });

        // About App Modal
        const aboutAppBtn = document.getElementById('aboutAppBtn');
        const aboutModal = document.getElementById('aboutModal');
        const closeAboutBtn = document.getElementById('closeAboutBtn');

        if (aboutAppBtn && aboutModal && closeAboutBtn) {
            aboutAppBtn.addEventListener('click', () => {
                this.openModal(aboutModal);
            });

            closeAboutBtn.addEventListener('click', () => {
                this.closeModal(aboutModal);
            });
        }

        // Handle visibility change to update prayer times when tab becomes visible again
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Update date and times if tab has been hidden for a while
                const now = new Date();
                if (this.lastUpdate && (now - this.lastUpdate) > 60000) { // Update if more than 1 minute
                    this.updateDate();
                    this.updatePrayerTimes();
                }
            }
        });
    }

    /**
     * Initialize location data
     * Try to get from localStorage first, then try geolocation API
     * @returns {Promise} Promise that resolves when location is initialized
     */
    async initLocation() {
        console.log('AdhanApp: Initializing location...');
        try {
            const savedLocation = localStorage.getItem('adhan_location');
            if (savedLocation) {
                this.state.location = JSON.parse(savedLocation);
                this.updateLocationDisplay();
                console.log('AdhanApp: Loaded location from localStorage:', this.state.location);
                return Promise.resolve(); // Location loaded, resolve immediately
            }
        } catch (error) {
            console.error('AdhanApp: Error loading location from localStorage:', error);
            localStorage.removeItem('adhan_location'); // Clear corrupted data
        }

        // If no saved location, try to get geolocation
        console.log('AdhanApp: No saved location, attempting geolocation...');
        return this.getGeolocation();
    }

    /**
     * Get user's location using Geolocation API
     * @returns {Promise} Promise that resolves when location is obtained
     */
    getGeolocation() {
        console.log('AdhanApp: getGeolocation called');
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log(`AdhanApp: Geolocation success - Lat: ${latitude}, Lon: ${longitude}`);
                        this.state.location.latitude = latitude;
                        this.state.location.longitude = longitude;

                        try {
                            const locationName = await this.getLocationName(latitude, longitude);
                            this.state.location.name = locationName || 'Position actuelle (détails non trouvés)';
                            console.log(`AdhanApp: Location name resolved to: "${this.state.location.name}"`);
                            this.saveLocation();
                            this.updateLocationDisplay();
                            resolve();
                        } catch (nameError) {
                            console.error('AdhanApp: Error getting location name after geolocation:', nameError);
                            this.state.location.name = 'Position actuelle (erreur nom)';
                            this.updateLocationDisplay(); // Update with error message for name
                            // Resolve even if name fetching fails, as we have coordinates
                            resolve();
                        }
                    },
                    (error) => {
                        console.error('AdhanApp: Geolocation error:', error);
                        // Fallback to IP-based location if geolocation fails
                        this.getLocationByIP().then(resolve).catch(reject);
                    },
                    { timeout: 10000, enableHighAccuracy: true }
                );
            } else {
                console.warn('AdhanApp: Geolocation not supported by this browser.');
                // Fallback to IP-based location if geolocation is not supported
                this.getLocationByIP().then(resolve).catch(reject);
            }
        });
    }

    /**
     * Get location by IP address as fallback
     * @returns {Promise} Promise that resolves when location is obtained
     */
    async getLocationByIP() {
        console.log('AdhanApp: Attempting to get location by IP...');
        try {
            // Utilisation d'une API compatible CORS pour la géolocalisation par IP (par exemple, ip-api.com)
            // Attention : vérifiez les limites d'utilisation des API gratuites.
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) {
                throw new Error(`IP Geolocation API error: ${response.status}`);
            }
            const data = await response.json();
            console.log('AdhanApp: IP Geolocation data:', data);
            if (data.latitude && data.longitude) {
                this.state.location.latitude = data.latitude;
                this.state.location.longitude = data.longitude;
                this.state.location.name = `${data.city || 'Ville inconnue'}, ${data.country_name || 'Pays inconnu'} (via IP)`;
                this.saveLocation();
                this.updateLocationDisplay();
            } else {
                throw new Error('IP Geolocation did not return coordinates.');
            }
        } catch (error) {
            console.error('AdhanApp: Error getting location by IP:', error);
            // En dernier recours, utiliser la localisation par défaut si tout échoue
            if (!this.state.location.latitude) { // Seulement si aucune coordonnée n'est définie
                this.state.location = {
                    latitude: 48.8566, longitude: 2.3522, name: 'Paris, France (par défaut)'
                };
                this.updateLocationDisplay();
                console.log('AdhanApp: Fallback to default location (Paris).');
            }
            throw error; // Rethrow error to be caught by initLocation or caller
        }
    }

    /**
     * Get human-readable location name from coordinates using reverse geocoding
     * @param {number} latitude - Latitude
     * @param {number} longitude - Longitude
     * @returns {Promise<string>} Promise that resolves to location name
     */
    async getLocationName(latitude, longitude) {
        console.log(`AdhanApp: Getting location name for Lat: ${latitude}, Lon: ${longitude}`);
        try {
            const lang = this.state.currentLanguage || 'fr';
            // Utilisation de l'API BigDataCloud (compatible CORS, pas de clé requise)
            const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${lang}`;
            console.log('AdhanApp: BigDataCloud URL:', url);
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`BigDataCloud API error: ${response.status}`);
            }
            const data = await response.json();
            console.log('AdhanApp: BigDataCloud response data:', data);

            if (data && (data.city || data.locality || data.principalSubdivision)) {
                const cityName = data.city || data.locality || data.principalSubdivision;
                const countryName = data.countryName || '';
                const locationName = `${cityName}, ${countryName}`.replace(/, $/, ''); // Nettoyer la virgule finale
                console.log(`AdhanApp: Location name from BigDataCloud: "${locationName}"`);
                return locationName;
            } else {
                console.warn('AdhanApp: No sufficient location details from BigDataCloud.');
                return null; // Retourner null si pas de détails suffisants
            }
        } catch (error) {
            console.error('AdhanApp: Error fetching location name from BigDataCloud:', error);
            return null; // Retourner null en cas d'erreur
        }
    }

    /**
     * Update location display in the UI
     * Only displays the first part of the location (before the first comma)
     */
    updateLocationDisplay() {
        if (this.elements.locationText && this.state.location && this.state.location.name) {
            let displayName = this.state.location.name;
            const commaIndex = displayName.indexOf(',');
            if (commaIndex !== -1) {
                displayName = displayName.substring(0, commaIndex);
            }
            this.elements.locationText.textContent = displayName;
            console.log(`AdhanApp: updateLocationDisplay - Displaying location as: "${displayName}"`);
        } else if (this.elements.locationText) {
            this.elements.locationText.textContent = this.translate('location.unknown');
            console.log("AdhanApp: updateLocationDisplay - Displaying location as unknown.");
        }
    }

    /**
     * Mettre à jour les textes de la modal de localisation
     */
    updateLocationModalTexts() {
        // Titre de la modal
        const locationTitle = document.querySelector('#locationModal .modal-header h2');
        if (locationTitle) {
            locationTitle.textContent = this.translate('location.title');
        }

        // Bouton "Utiliser ma position actuelle"
        const autoLocationBtn = document.querySelector('#autoLocationBtn');
        if (autoLocationBtn) {
            const btnIcon = autoLocationBtn.querySelector('i') ? autoLocationBtn.querySelector('i').outerHTML : '';
            autoLocationBtn.innerHTML = btnIcon + ' ' + this.translate('location.useCurrentPosition');
        }

        // Texte "OU"
        const orDivider = document.querySelector('.or-divider');
        if (orDivider) {
            orDivider.textContent = this.translate('location.or');
        }

        // Placeholder du champ de recherche
        const locationSearch = document.querySelector('#locationSearch');
        if (locationSearch) {
            locationSearch.placeholder = this.translate('location.searchPlaceholder');
        }
    }

    /**
     * Search for a location by name
     */
    async searchLocation() {
        const query = this.elements.locationSearch.value.trim();
        // Log au début de la fonction, avant toute modification de searchResults
        if (this.elements.searchResults) {
            console.log(`AdhanApp: searchLocation - Top. Query: "${query}". searchResults initial innerHTML length: ${this.elements.searchResults.innerHTML.length}, initial classList: ${this.elements.searchResults.classList.toString()}`);
        } else {
            console.error("AdhanApp: searchLocation - FATAL: this.elements.searchResults is null or undefined at the very beginning!");
            return; // Ne pas continuer si l'élément n'existe pas
        }

        if (!query) {
            this.elements.searchResults.innerHTML = '<p class="error-message">Veuillez entrer un lieu à rechercher.</p>';
            this.elements.searchResults.classList.add('active');
            console.log('AdhanApp: searchLocation - No query. searchResults classList after message:', this.elements.searchResults.classList.toString());
            return;
        }
        this.showLoader(true, 'Recherche de lieux...');
        this.elements.searchResults.innerHTML = ''; // Vider les anciens résultats
        this.elements.searchResults.classList.remove('active'); // Cacher en attendant les nouveaux résultats
        console.log(`AdhanApp: searchLocation called with query: "${query}". searchResults classList after reset: ${this.elements.searchResults.classList.toString()}`);

        try {
            const lang = this.state.currentLanguage || 'fr';
            const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=7&lang=${lang}`;
            // ... (logs existants pour l'URL Photon, statut, et données brutes) ...
            console.log(`AdhanApp: Photon search URL: ${url}`);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.error(`AdhanApp: Photon API error! Status: ${response.status}`);
                    this.elements.searchResults.innerHTML = `<p class="error-message">${this.translate("errors.photonGeneric")} (Status: ${response.status})</p>`;
                    this.elements.searchResults.style.display = 'block';
                    this.showLoader(false);
                    return;
                }
                const data = await response.json();
                console.log("AdhanApp: Photon search results data:", data);

                this.showLoader(false);
                this.elements.searchResults.innerHTML = '';
                this.elements.searchResults.style.display = 'block'; // Assurez-vous qu'il est visible

                // Log avant d'entrer dans la boucle
                console.log("AdhanApp: searchLocation - Attempting to process features. Number of features:", data.features ? data.features.length : 0);


                if (data.features && data.features.length > 0) {
                    data.features.forEach((feature, index) => {
                        // Log à l'entrée de chaque itération
                        console.log(`AdhanApp: searchLocation - Processing feature ${index + 1}/${data.features.length}:`, feature);

                        const name = feature.properties.name;
                        const city = feature.properties.city || '';
                        const state = feature.properties.state || '';
                        const country = feature.properties.country || '';
                        const osm_value = feature.properties.osm_value || ''; // ex: "administrative", "residential"

                        // Priorité à city, puis state, puis country si le nom principal est déjà une ville ou un état.
                        let displayName = name;
                        let contextName = [city, state, country].filter(Boolean).join(', ');

                        // Tentative de construction d'un nom plus lisible
                        // Si le nom principal est une ville, et que `city` est redondant, on ne l'affiche pas dans le contexte.
                        if (name === city && state && country) {
                            contextName = [state, country].filter(Boolean).join(', ');
                        } else if (name === city && state && !country) {
                            contextName = state;
                        } else if (name === city && !state && country) {
                            contextName = country;
                        } else if (name === city) {
                            contextName = ''; // Si name est la ville et il n'y a ni état ni pays, pas besoin de contexte redondant
                        }


                        if (contextName && name !== contextName.split(', ')[0]) {
                            displayName = `${name}, ${contextName}`;
                        } else if (!contextName && name) {
                            displayName = name;
                        } else if (contextName) { // Si name est vide mais contextName existe (peu probable pour Photon mais pour être sûr)
                            displayName = contextName;
                        }


                        // Éviter les doublons si name est déjà dans contextName (ex: "Paris, Paris, Île-de-France, France")
                        const parts = displayName.split(', ').map(p => p.trim());
                        const uniqueParts = [];
                        const seen = new Set();
                        for (const part of parts) {
                            if (!seen.has(part) && part.length > 0) {
                                uniqueParts.push(part);
                                seen.add(part);
                            }
                        }
                        displayName = uniqueParts.join(', ');

                        // Log du nom d'affichage final
                        console.log(`AdhanApp: searchLocation - DisplayName for feature ${index + 1}: ${displayName}`);


                        const resultItem = document.createElement('div');
                        resultItem.textContent = displayName;
                        resultItem.dataset.latitude = feature.geometry.coordinates[1];
                        resultItem.dataset.longitude = feature.geometry.coordinates[0];
                        resultItem.dataset.name = displayName;
                        resultItem.setAttribute('tabindex', '0');
                        resultItem.classList.add('search-result-item'); // Ajout de la classe

                        // Log avant d'ajouter l'écouteur d'événements
                        console.log(`AdhanApp: searchLocation - Adding event listener for feature ${index + 1}: ${displayName}`);

                        resultItem.addEventListener('click', () => {
                            console.log(`AdhanApp: searchLocation - Clicked on: ${displayName}`, feature.geometry.coordinates);
                            this.saveLocation(feature.geometry.coordinates[1], feature.geometry.coordinates[0], displayName);
                            this.closeModal(this.elements.locationModal); // Correction ici
                            this.updatePrayerTimes();
                        });

                        this.elements.searchResults.appendChild(resultItem);
                    });
                    this.elements.searchResults.classList.add('active'); // Ajout de la classe active
                    this.setupKeyboardNavigation();
                } else {
                    console.log(`AdhanApp: No features found by Photon for query: ${query}`);
                    this.elements.searchResults.innerHTML = `<div class="no-results">${this.translate("location.noResults")}</div>`;
                    console.log("AdhanApp: searchLocation - No results message. searchResults.classList:", this.elements.searchResults.classList, "Computed display style:", window.getComputedStyle(this.elements.searchResults).display, "offsetHeight:", this.elements.searchResults.offsetHeight);
                }
            } catch (error) {
                console.error("AdhanApp: Error in searchLocation:", error);
                this.elements.searchResults.innerHTML = `<p class="error-message">${this.translate("errors.photonSearch")} (${error.message})</p>`;
                this.elements.searchResults.style.display = 'block';
                this.showLoader(false);
            }
        } catch (error) {
            console.error('AdhanApp: Error searching location with Photon:', error);
            this.showLoader(false);
            this.elements.searchResults.innerHTML = `<p class="error-message">Erreur lors de la recherche: ${error.message}</p>`;
            this.elements.searchResults.classList.add('active');
            console.log('AdhanApp: searchLocation - Error message. searchResults classList:', this.elements.searchResults.classList.toString(), 'Computed display style:', window.getComputedStyle(this.elements.searchResults).display, 'offsetHeight:', this.elements.searchResults.offsetHeight);
        }
    }

    /**
     * Configure la navigation clavier pour les résultats de recherche
     */
    setupKeyboardNavigation() {
        // Récupérer le conteneur de résultats et le champ de recherche
        const resultsContainer = this.elements.searchResults;
        const searchInput = this.elements.locationSearch;

        console.log("AdhanApp: setupKeyboardNavigation - Called."); // Log initial

        if (!resultsContainer) {
            console.error("AdhanApp: setupKeyboardNavigation - resultsContainer is null!");
            return;
        }

        // Variable pour suivre l'élément actif
        let currentIndex = -1;
        const resultItems = resultsContainer.querySelectorAll('.search-result-item');

        console.log(`AdhanApp: setupKeyboardNavigation - Found ${resultItems.length} result items.`); // Log du nombre d'items

        if (resultItems.length === 0) {
            console.log("AdhanApp: setupKeyboardNavigation - No result items to navigate.");
            return;
        }

        // Fonction pour activer un élément
        const activateItem = (index) => {
            // Désactiver tous les éléments d'abord
            resultItems.forEach(item => {
                item.classList.remove('active-result');
            });

            // Gérer le débordement cyclique
            if (index < 0) index = resultItems.length - 1;
            if (index >= resultItems.length) index = 0;

            // Activer l'élément courant
            currentIndex = index;
            resultItems[currentIndex].classList.add('active-result');
            // resultItems[currentIndex].focus(); // COMMENTÉ: Ne pas donner le focus pour permettre de continuer à taper

            // Assurer que l'élément est visible
            resultItems[currentIndex].scrollIntoView({ block: 'nearest' });
        };

        // Ajouter l'écouteur d'événement sur le champ de recherche
        searchInput.addEventListener('keydown', (e) => {
            // Ne rien faire si les résultats ne sont pas affichés
            if (!resultsContainer.classList.contains('active')) {
                console.log("AdhanApp: setupKeyboardNavigation (searchInput keydown) - resultsContainer is not active.");
                return;
            }
            console.log(`AdhanApp: setupKeyboardNavigation (searchInput keydown) - Key: ${e.key}`);

            const activeResult = resultsContainer.querySelector('.search-result-item.active-result');

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault(); // Empêcher le défilement de la page
                    activateItem(currentIndex + 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    activateItem(currentIndex - 1);
                    break;
                case 'Enter':
                    if (activeResult) {
                        e.preventDefault(); // Empêche la soumission du formulaire si le champ de recherche est dans un formulaire
                        console.log("AdhanApp: setupKeyboardNavigation (searchInput keydown) - Enter pressed with active result. Clicking active result.");
                        activeResult.click(); // Simule un clic sur l'élément actif
                    } else {
                        // Si aucun élément n'est actif, et que l'utilisateur appuie sur Entrée, on peut considérer que c'est une recherche (déjà géré par le keyup)
                        console.log("AdhanApp: setupKeyboardNavigation (searchInput keydown) - Enter pressed with NO active result. Search will be triggered by keyup.");
                    }
                    break;
                case 'Escape':
                    // Fermer les résultats
                    console.log("AdhanApp: setupKeyboardNavigation (searchInput keydown) - Escape pressed. Closing results.");
                    resultsContainer.classList.remove('active');
                    resultsContainer.innerHTML = ''; // Vider les résultats pour éviter de les remontrer si on retape la même chose
                    // searchInput.focus(); // Le focus devrait déjà y être
                    break;
            }
        });

        // Ajouter les écouteurs pour la navigation entre les résultats eux-mêmes
        // Cet écouteur devient moins pertinent si le focus reste sur searchInput, mais on le garde au cas où.
        resultsContainer.addEventListener('keydown', (e) => {
            console.log(`AdhanApp: setupKeyboardNavigation (resultsContainer keydown) - Key: ${e.key}`);
            const activeResult = resultsContainer.querySelector('.search-result-item.active-result');

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    activateItem(currentIndex + 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    activateItem(currentIndex - 1);
                    break;
                case 'Enter': // Permet aussi d'activer avec Entrée si le focus est sur un item (par ex. via lecteur d'écran)
                    if (activeResult) {
                        e.preventDefault();
                        console.log("AdhanApp: setupKeyboardNavigation (resultsContainer keydown) - Enter pressed on active result. Clicking it.");
                        activeResult.click();
                    }
                    break;
                // Pas besoin de 'Escape' ici car le focus principal est sur searchInput
            }
        });

        // Activer le premier élément par défaut (mais sans lui donner le focus)
        if (resultItems.length > 0) {
            activateItem(0);
        }
    }

    /**
     * Save location to localStorage
     */
    saveLocation(latitude, longitude, name) {
        console.log(`AdhanApp: saveLocation called with Lat: ${latitude}, Lon: ${longitude}, Name: "${name}"`);
        if (latitude !== undefined && longitude !== undefined && name !== undefined) {
            this.state.location = {
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                name: name
            };
            console.log("AdhanApp: saveLocation - this.state.location updated to:", this.state.location);
        } else {
            console.log("AdhanApp: saveLocation - called without new coordinates/name, saving current state.location:", this.state.location);
        }

        if (this.state.location && this.state.location.name) { // Assurer qu'il y a quelque chose à sauvegarder
            localStorage.setItem('adhan_location', JSON.stringify(this.state.location));
            console.log("AdhanApp: saveLocation - Location saved to localStorage.");
        } else {
            console.warn("AdhanApp: saveLocation - Attempted to save an invalid or empty location state.");
        }
    }

    /**
     * Update date display and current time
     */
    updateDate() {
        // Get current date
        const now = new Date();

        // Format date based on current language
        const formattedDate = this.formatDateInCurrentLanguage(now);
        if (this.elements.gregorianDate) {
            this.elements.gregorianDate.textContent = formattedDate;
        }

        // Afficher l'heure actuelle
        this.updateCurrentTime();

        // Démarrer la mise à jour de l'heure toutes les secondes
        if (!this.timeInterval) {
            this.timeInterval = setInterval(() => this.updateCurrentTime(), 1000);
        }
    }

    /**
     * Met à jour l'affichage de l'heure actuelle
     */
    updateCurrentTime() {
        if (!this.elements.currentTime) return;

        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        this.elements.currentTime.textContent = `${hours}:${minutes}:${seconds}`;

        // Appliquer un style pour rendre l'heure bien visible
        this.elements.currentTime.style.fontSize = '1.2rem';
        this.elements.currentTime.style.fontWeight = 'bold';
        this.elements.currentTime.style.color = 'var(--primary-color)';
    }

    /**
     * Update prayer times based on current location and settings
     * @returns {Promise} Promise that resolves when prayer times are updated
     */
    async updatePrayerTimes() {
        // Supprimer l'indicateur API s'il existe
        const oldStatus = document.getElementById('api-status');
        if (oldStatus) {
            oldStatus.remove();
        }

        // Mettre à jour l'affichage de la localisation AVANT de récupérer les horaires
        // pour refléter immédiatement le changement si la sauvegarde a eu lieu.
        console.log("AdhanApp: updatePrayerTimes - Current location before display update:", this.state.location ? this.state.location.name : 'undefined');
        this.updateLocationDisplay();

        // Vérifier si la localisation est définie
        if (!this.state.location || !this.state.location.latitude || !this.state.location.longitude) {
            this.showError('Position non définie. Veuillez définir votre localisation.');
            return Promise.reject(new Error('Location not set'));
        }

        this.showLoader(true);

        try {
            // Paramètres de calcul selon les préférences de l'utilisateur
            const params = {
                method: this.state.settings.calculationMethod,  // Méthode de calcul personnalisable 
                school: this.state.settings.asrMethod,          // Méthode Asr personnalisable
                adjustment: 0                                  // Ajustements manuels appliqués séparément
            };

            let prayerTimes;
            let sourceDonnees = '';

            if (navigator.onLine) {
                try {
                    console.log(`Récupération des horaires via API AlAdhan pour ${this.state.location.name}...`);

                    // Utilisation prioritaire de l'API AlAdhan pour toutes les localisations
                    prayerTimes = await apiHandler.getPrayerTimes(new Date(), this.state.location, params);
                    console.log('SUCCÈS: Horaires récupérés depuis l\'API AlAdhan:', prayerTimes);

                    sourceDonnees = 'API AlAdhan';

                } catch (error) {
                    console.error('ERREUR avec l\'API AlAdhan:', error);

                    // Solution de secours en cas d'échec de l'API
                    console.warn('Solution de secours: Calcul local activé');
                    prayerTimes = this.calculatePrayerTimes();
                    sourceDonnees = 'Calcul local (suite à erreur API)';
                }
            } else {
                // Mode hors ligne - utilisation du calcul local
                console.log('Mode hors ligne: Calcul local activé');
                prayerTimes = this.calculatePrayerTimes();
                sourceDonnees = 'Calcul local (hors ligne)';
            }

            // Ajouter la source des données à l'état de l'application
            this.state.dataSource = sourceDonnees;

            // Apply time adjustments (convert from minutes to hours first)
            if (prayerTimes) {
                this.state.prayerTimes = this.applyTimeAdjustments(prayerTimes);
                this.displayPrayerTimes();
            }

            // Update next prayer and start countdown
            this.updateNextPrayer();

            this.showLoader(false);
            return Promise.resolve();
        } catch (error) {
            console.error('Error updating prayer times:', error);
            this.showError('Erreur lors de la mise à jour des horaires de prière.');
            this.showLoader(false);
            return Promise.reject(error);
        }
    }

    /**
     * Calculate prayer times locally (fallback method)
     * @returns {Object} Prayer times object
     */
    calculatePrayerTimes() {
        try {
            // Configure calculator with current settings
            this.prayerTimesCalculator.setMethod(Object.keys(this.prayerTimesCalculator.methods)[this.state.settings.calculationMethod]);
            this.prayerTimesCalculator.setAsrJuristic(this.state.settings.asrMethod);
            this.prayerTimesCalculator.setTimeFormat(this.state.settings.timeFormat);

            // Calculate times without applying adjustments (will do that separately)
            const times = this.prayerTimesCalculator.getTimes(
                new Date(),
                this.state.location.latitude,
                this.state.location.longitude
            );

            return times;
        } catch (error) {
            console.error('Error calculating prayer times locally:', error);
            throw error;
        }
    }

    /**
     * Apply time adjustments to prayer times
     * @param {Object} times - Prayer times object
     * @returns {Object} Adjusted prayer times object
     */
    applyTimeAdjustments(times) {
        const adjustedTimes = { ...times };
        const adjustments = this.state.settings.adjustments;

        // Helper function to adjust time string
        const adjustTime = (timeStr, minutes) => {
            if (!timeStr || timeStr === '--:--') return timeStr;

            const [hours, mins] = timeStr.split(':').map(Number);
            let totalMins = hours * 60 + mins + minutes;

            // Handle overflow/underflow
            while (totalMins < 0) totalMins += 24 * 60;
            totalMins = totalMins % (24 * 60);

            const adjustedHours = Math.floor(totalMins / 60);
            const adjustedMins = totalMins % 60;

            // Format according to settings
            if (this.state.settings.timeFormat === '12h') {
                const period = adjustedHours >= 12 ? 'PM' : 'AM';
                const hours12 = adjustedHours % 12 || 12;
                return `${hours12}:${adjustedMins.toString().padStart(2, '0')} ${period}`;
            } else {
                return `${adjustedHours.toString().padStart(2, '0')}:${adjustedMins.toString().padStart(2, '0')}`;
            }
        };

        // Apply adjustments to each prayer time
        if (adjustedTimes.fajr) adjustedTimes.fajr = adjustTime(adjustedTimes.fajr, adjustments.fajr);
        if (adjustedTimes.sunrise) adjustedTimes.sunrise = adjustTime(adjustedTimes.sunrise, adjustments.sunrise);
        if (adjustedTimes.dhuhr) adjustedTimes.dhuhr = adjustTime(adjustedTimes.dhuhr, adjustments.dhuhr);
        if (adjustedTimes.asr) adjustedTimes.asr = adjustTime(adjustedTimes.asr, adjustments.asr);
        if (adjustedTimes.maghrib) adjustedTimes.maghrib = adjustTime(adjustedTimes.maghrib, adjustments.maghrib);
        if (adjustedTimes.isha) adjustedTimes.isha = adjustTime(adjustedTimes.isha, adjustments.isha);

        return adjustedTimes;
    }

    /**
     * Display prayer times in the UI
     */
    displayPrayerTimes() {
        if (!this.state.prayerTimes) {
            // Provide default prayer times if none are available
            this.state.prayerTimes = this.getDefaultPrayerTimes();
        }

        // Make sure we have valid values for each prayer time
        const prayerTimes = this.ensureValidPrayerTimes(this.state.prayerTimes);

        // Update prayer time elements
        this.elements.fajrTime.textContent = prayerTimes.fajr;
        this.elements.sunriseTime.textContent = prayerTimes.sunrise;
        this.elements.dhuhrTime.textContent = prayerTimes.dhuhr;
        this.elements.asrTime.textContent = prayerTimes.asr;
        this.elements.maghribTime.textContent = prayerTimes.maghrib;
        this.elements.ishaTime.textContent = prayerTimes.isha;

        // Déterminer la prochaine prière
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Définir les horaires de prière dans l'ordre
        const prayers = [
            { name: 'fajr', time: this.timeStringToMinutes(prayerTimes.fajr) },
            { name: 'sunrise', time: this.timeStringToMinutes(prayerTimes.sunrise) },
            { name: 'dhuhr', time: this.timeStringToMinutes(prayerTimes.dhuhr) },
            { name: 'asr', time: this.timeStringToMinutes(prayerTimes.asr) },
            { name: 'maghrib', time: this.timeStringToMinutes(prayerTimes.maghrib) },
            { name: 'isha', time: this.timeStringToMinutes(prayerTimes.isha) }
        ];

        // Trouver la prochaine prière (la première prière dont l'heure n'est pas encore passée)
        let nextPrayer = null;
        for (let i = 0; i < prayers.length; i++) {
            if (prayers[i].time > currentTime) {
                nextPrayer = prayers[i];
                break;
            }
        }

        // Si aucune prière n'est à venir aujourd'hui, prendre la première prière du jour suivant (Fajr)
        if (!nextPrayer) {
            nextPrayer = prayers[0];
        }

        // Reset active classes
        const prayerCards = document.querySelectorAll('.prayer-card');
        prayerCards.forEach(card => card.classList.remove('active'));

        // Mettre en évidence la prochaine prière
        if (nextPrayer) {
            const nextPrayerCard = document.querySelector(`.prayer-card[data-prayer="${nextPrayer.name}"]`);
            if (nextPrayerCard) {
                nextPrayerCard.classList.add('active');
            }
        }
    }

    /**
     * Ensure all prayer times have valid values
     * @param {Object} times - Prayer times object
     * @returns {Object} Prayer times with validated values
     */
    ensureValidPrayerTimes(times) {
        const defaultTimes = this.getDefaultPrayerTimes();
        const validTimes = { ...times };

        // Check each prayer time and replace invalid ones with defaults
        for (const prayer of ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']) {
            // Check if time is missing, NaN, or invalid format
            if (!validTimes[prayer] ||
                validTimes[prayer] === '--:--' ||
                validTimes[prayer].includes('NaN') ||
                !(/^\d{1,2}:\d{2}( [AP]M)?$/.test(validTimes[prayer]))) {
                validTimes[prayer] = defaultTimes[prayer];
            }
        }

        return validTimes;
    }

    /**
     * Get default prayer times for when calculation fails
     * @returns {Object} Default prayer times object
     */
    getDefaultPrayerTimes() {
        // Accurate prayer times for 10 May 2025
        // Times will be used as fallback when calculation fails
        return {
            fajr: '03:57',
            sunrise: '05:30',
            dhuhr: '12:35',
            asr: '16:22',
            maghrib: '19:40',
            isha: '21:06'
        };
    }

    /**
     * Update next prayer information
     */
    updateNextPrayer() {
        if (!this.state.prayerTimes) return;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        // Define prayer times in order
        const prayers = [
            { name: 'fajr', label: this.translate('prayers.fajr'), time: this.timeStringToMinutes(this.state.prayerTimes.fajr) },
            { name: 'sunrise', label: this.translate('prayers.sunrise'), time: this.timeStringToMinutes(this.state.prayerTimes.sunrise) },
            { name: 'dhuhr', label: this.translate('prayers.dhuhr'), time: this.timeStringToMinutes(this.state.prayerTimes.dhuhr) },
            { name: 'asr', label: this.translate('prayers.asr'), time: this.timeStringToMinutes(this.state.prayerTimes.asr) },
            { name: 'maghrib', label: this.translate('prayers.maghrib'), time: this.timeStringToMinutes(this.state.prayerTimes.maghrib) },
            { name: 'isha', label: this.translate('prayers.isha'), time: this.timeStringToMinutes(this.state.prayerTimes.isha) }
        ];

        // Find the next prayer
        let nextPrayer = null;
        let currentPrayer = null;

        for (let i = 0; i < prayers.length; i++) {
            if (prayers[i].time > currentTime) {
                nextPrayer = prayers[i];
                if (i > 0) {
                    currentPrayer = prayers[i - 1];
                } else {
                    // If the first prayer of the day is next, the current is last prayer of previous day
                    currentPrayer = prayers[prayers.length - 1];
                }
                break;
            }
        }

        // If we've passed all prayers for today, next prayer is first prayer of tomorrow
        if (!nextPrayer) {
            nextPrayer = prayers[0]; // Fajr for tomorrow
            currentPrayer = prayers[prayers.length - 1]; // Isha for today

            // Adjust time for tomorrow's prayer
            nextPrayer = {
                ...nextPrayer,
                time: nextPrayer.time + 24 * 60 // Add 24 hours
            };
        }

        // Store next prayer info
        this.state.nextPrayer = {
            name: nextPrayer.name,
            label: nextPrayer.label,
            time: nextPrayer.time,
            timeFormatted: this.state.prayerTimes[nextPrayer.name],
            current: currentPrayer.name
        };

        // Update UI
        this.elements.nextPrayerName.textContent = nextPrayer.label;
        this.elements.nextPrayerTime.textContent = this.state.prayerTimes[nextPrayer.name];

        // Supprimer toutes les animations existantes des icônes
        document.querySelectorAll('.prayer-icon i').forEach(icon => {
            icon.classList.remove('fa-fade', 'fa-beat', 'fa-spin-pulse');
        });

        // Ajouter l'animation uniquement à l'icône de la prochaine prière
        const nextPrayerCard = document.querySelector(`.prayer-card[data-prayer="${nextPrayer.name}"]`);
        if (nextPrayerCard) {
            const icon = nextPrayerCard.querySelector('.prayer-icon i');
            if (icon) {
                icon.classList.add('fa-fade');
            }
        }

        // Update countdown
        this.updateCountdown();
    }

    /**
     * Convert time string to minutes since midnight
     * @param {string} timeStr - Time string in format HH:MM or H:MM AM/PM
     * @returns {number} Minutes since midnight
     */
    timeStringToMinutes(timeStr) {
        if (!timeStr || timeStr === '--:--') return 0;

        let hours, minutes;

        if (timeStr.includes('AM') || timeStr.includes('PM')) {
            // 12-hour format
            const [timePart, period] = timeStr.split(' ');
            const [h, m] = timePart.split(':').map(Number);

            hours = h;
            minutes = m;

            if (period === 'PM' && hours < 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }
        } else {
            // 24-hour format
            const [h, m] = timeStr.split(':').map(Number);
            hours = h;
            minutes = m;
        }

        return hours * 60 + minutes;
    }

    /**
     * Update the countdown to next prayer
     */
    updateCountdown() {
        if (!this.state.nextPrayer) return;

        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const currentSeconds = now.getSeconds();

        // Calculate remaining time in minutes and seconds
        let remainingMinutes = this.state.nextPrayer.time - currentMinutes;
        let remainingSeconds = 60 - currentSeconds;

        if (remainingSeconds === 60) {
            remainingSeconds = 0;
        } else {
            remainingMinutes--;
        }

        // Handle case when countdown goes negative
        if (remainingMinutes < 0) {
            // Time to refresh prayer times
            this.updatePrayerTimes();
            return;
        }

        // Calculate hours, minutes, seconds
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;
        const seconds = remainingSeconds;

        // Format countdown
        const countdownText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.elements.countdown.textContent = countdownText;

        // Check if it's time for Adhan
        if (hours === 0 && minutes === 0 && seconds === 0) {
            this.playAdhan(this.state.nextPrayer.name);
        }

        // Check if it's time for prayer reminder
        const reminderMinutes = this.state.settings.prayerReminder;
        if (reminderMinutes > 0 && hours === 0 && minutes === reminderMinutes && seconds === 0) {
            // Afficher une notification de rappel avant la prière
            this.showReminderNotification(this.state.nextPrayer.name, reminderMinutes);
        }
    }

    /**
     * Start countdown timer
     */
    startCountdown() {
        // Clear any existing interval
        if (this.state.countdownInterval) {
            clearInterval(this.state.countdownInterval);
        }

        // Set up new interval
        this.state.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    /**
     * Initialize notification system
     */
    initNotifications() {
        // Check notification permission
        if ('Notification' in window) {
            this.state.notificationPermission = Notification.permission;

            // If permission status is not determined, ask after a delay
            if (this.state.notificationPermission === 'default') {
                setTimeout(() => {
                    this.openModal(this.elements.notificationModal);
                }, 5000); // Ask after 5 seconds
            }
        }

        // Load notification settings
        this.loadNotificationSettings();
    }

    /**
     * Request notification permission
     * @returns {Promise} Promise that resolves with the permission result
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            return Promise.reject(new Error('Notifications not supported'));
        }

        try {
            const permission = await Notification.requestPermission();
            this.state.notificationPermission = permission;
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return Promise.reject(error);
        }
    }

    /**
     * Load notification settings from localStorage
     */
    loadNotificationSettings() {
        // Load global notification setting
        const notificationsEnabled = localStorage.getItem('adhan_notifications_enabled');
        if (notificationsEnabled !== null) {
            this.state.settings.notificationsEnabled = notificationsEnabled === 'true';
            this.elements.notificationsEnabled.checked = this.state.settings.notificationsEnabled;
        }

        // Load prayer-specific notification settings
        const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        prayers.forEach(prayer => {
            const enabled = localStorage.getItem(`adhan_notification_${prayer}`);
            if (enabled !== null) {
                const element = this.elements[`${prayer}Notif`];
                if (element) {
                    element.checked = enabled === 'true';
                }
            }
        });

        // Load sound setting
        const sound = localStorage.getItem('adhan_sound');
        if (sound) {
            this.state.settings.adhanSound = sound;
            this.elements.adhanSound.value = sound;
        }
    }

    /**
     * Save notification settings to localStorage
     */
    saveNotificationSettings() {
        // Save global notification setting
        this.state.settings.notificationsEnabled = this.elements.notificationsEnabled.checked;
        localStorage.setItem('adhan_notifications_enabled', this.state.settings.notificationsEnabled);

        // Save prayer-specific notification settings
        const prayers = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
        prayers.forEach(prayer => {
            const element = this.elements[`${prayer}Notif`];
            if (element) {
                localStorage.setItem(`adhan_notification_${prayer}`, element.checked);
            }
        });

        // Save sound setting
        this.state.settings.adhanSound = this.elements.adhanSound.value;
        localStorage.setItem('adhan_sound', this.state.settings.adhanSound);
    }

    /**
     * Play Adhan for the specified prayer
     * @param {string} prayer - Prayer name
     */
    playAdhan(prayer) {
        // Check if notifications are enabled globally
        if (!this.state.settings.notificationsEnabled) return;

        // Check if notification is enabled for this prayer
        const notifElement = this.elements[`${prayer}Notif`];
        if (!notifElement || !notifElement.checked) return;

        // Update audio source
        const audioElement = this.elements.adhanAudio;
        audioElement.src = `assets/audio/${this.state.settings.adhanSound}`;

        // Play the Adhan
        audioElement.play()
            .catch(error => {
                console.error('Error playing Adhan:', error);
                // Show visual notification if audio failed
                this.showVisualNotification(prayer);
            });
    }

    /**
     * Play a test Adhan sound
     * @param {string} sound - Sound file name
     */
    playAdhanTest(sound) {
        const audioElement = this.elements.adhanAudio;
        audioElement.src = `assets/audio/${sound}`;
        audioElement.play()
            .catch(error => {
                console.error('Error playing test Adhan:', error);
            });
    }

    /**
     * Show a visual notification for a prayer
     * @param {string} prayer - Prayer name
     */
    showVisualNotification(prayer) {
        if (!('Notification' in window) || this.state.notificationPermission !== 'granted') {
            return;
        }

        const prayerNames = {
            fajr: 'Fajr',
            sunrise: 'Shuruq',
            dhuhr: 'Dhuhr',
            asr: 'Asr',
            maghrib: 'Maghrib',
            isha: 'Isha'
        };

        const notification = new Notification('AdhanApp', {
            body: `Il est l'heure de ${prayerNames[prayer]} !`,
            icon: 'assets/images/icon-192x192.png'
        });

        // Close notification after 10 seconds
        setTimeout(() => notification.close(), 10000);
    }

    /**
     * Afficher une notification de rappel avant la prière
     * @param {string} prayer - Nom de la prière
     * @param {number} reminderMinutes - Minutes de rappel avant la prière
     */
    showReminderNotification(prayer, reminderMinutes) {
        if (!('Notification' in window) || this.state.notificationPermission !== 'granted' || !this.state.settings.notificationsEnabled) {
            return;
        }

        // Vérifier si la notification est activée pour cette prière
        const notifCheckbox = this.elements[`${prayer}Notif`];
        if (notifCheckbox && !notifCheckbox.checked) {
            return;
        }

        const prayerNames = {
            fajr: this.translate('prayers.fajr'),
            sunrise: this.translate('prayers.sunrise'),
            dhuhr: this.translate('prayers.dhuhr'),
            asr: this.translate('prayers.asr'),
            maghrib: this.translate('prayers.maghrib'),
            isha: this.translate('prayers.isha')
        };

        // Créer le message de rappel
        let message;
        if (reminderMinutes === 1) {
            message = `${prayerNames[prayer]} dans 1 minute !`;
        } else {
            message = `${prayerNames[prayer]} dans ${reminderMinutes} minutes !`;
        }

        // Créer la notification
        const notification = new Notification('Adhan - Rappel', {
            body: message,
            icon: 'assets/images/icon-192x192.png',
            silent: false  // Permettre un son de notification
        });

        // Jouer un son discret (différent de l'adhan)
        const audio = new Audio('assets/audio/reminder.mp3');
        audio.volume = 0.5;
        audio.play().catch(err => console.log('Erreur de lecture audio:', err));

        // Fermer la notification après 8 secondes
        setTimeout(() => notification.close(), 8000);
    }

    /**
     * Initialize app state from localStorage
     */
    initState() {
        // Theme
        this.state.theme = localStorage.getItem('adhan_theme') || 'light';
        this.applyTheme();

        // Theme color
        this.state.colorTheme = localStorage.getItem('adhan_color_theme') || 'green';
        this.applyColorTheme();
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        console.log("AdhanApp loadSettings: Start.");
        const savedSettings = localStorage.getItem('adhan_settings');

        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.state.settings = { ...this.state.settings, ...settings };

                // Apply loaded settings to UI
                this.applySettingsToUI();
            } catch (error) {
                console.error('Error parsing saved settings:', error);
            }
        }

        // Load theme separately
        const savedTheme = localStorage.getItem('adhan_theme');
        if (savedTheme) {
            this.state.theme = savedTheme;
            console.log(`AdhanApp loadSettings: Loaded adhan_theme from localStorage: ${savedTheme}`);
        } else {
            console.log("AdhanApp loadSettings: No adhan_theme found in localStorage, keeping state.theme:", this.state.theme);
        }

        // Load color theme separately and ensure it's in this.state for applyColorTheme
        const savedColorTheme = localStorage.getItem('adhan_color_theme');
        if (savedColorTheme) {
            this.state.colorTheme = savedColorTheme; // Directly update this.state.colorTheme
            console.log(`AdhanApp loadSettings: Loaded adhan_color_theme from localStorage: ${savedColorTheme}`);
        } else {
            console.log("AdhanApp loadSettings: No adhan_color_theme found in localStorage, keeping state.colorTheme:", this.state.colorTheme);
        }
        console.log("AdhanApp loadSettings: End. state.theme:", this.state.theme, "state.colorTheme:", this.state.colorTheme);
    }

    /**
     * Apply settings to UI elements
     */
    applySettingsToUI() {
        // Calculation method
        if (this.elements.calculationMethod) {
            this.elements.calculationMethod.value = this.state.settings.calculationMethod;
        }

        // Asr method
        if (this.state.settings.asrMethod === 1) {
            this.elements.asrHanafi.checked = true;
        } else {
            this.elements.asrStandard.checked = true;
        }

        // Time format
        if (this.state.settings.timeFormat === '12h') {
            this.elements.time12h.checked = true;
        } else {
            this.elements.time24h.checked = true;
        }

        // Prayer reminder
        if (this.elements.prayerReminder) {
            this.elements.prayerReminder.value = this.state.settings.prayerReminder || 0;
        }

        // Adjustments
        const adjustElements = {
            fajr: this.elements.fajrAdjust,
            sunrise: this.elements.sunriseAdjust,
            dhuhr: this.elements.dhuhrAdjust,
            asr: this.elements.asrAdjust,
            maghrib: this.elements.maghribAdjust,
            isha: this.elements.ishaAdjust
        };

        for (const prayer in adjustElements) {
            if (adjustElements[prayer]) {
                adjustElements[prayer].value = this.state.settings.adjustments[prayer] || 0;
            }
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        // Get all settings from UI
        this.state.settings.calculationMethod = parseInt(this.elements.calculationMethod.value);
        this.state.settings.asrMethod = this.elements.asrHanafi.checked ? 1 : 0;
        this.state.settings.timeFormat = this.elements.time12h.checked ? '12h' : '24h';
        this.state.settings.prayerReminder = parseInt(this.elements.prayerReminder.value) || 0;

        // Get time adjustments
        this.state.settings.adjustments = {
            fajr: parseInt(this.elements.fajrAdjust.value) || 0,
            sunrise: parseInt(this.elements.sunriseAdjust.value) || 0,
            dhuhr: parseInt(this.elements.dhuhrAdjust.value) || 0,
            asr: parseInt(this.elements.asrAdjust.value) || 0,
            maghrib: parseInt(this.elements.maghribAdjust.value) || 0,
            isha: parseInt(this.elements.ishaAdjust.value) || 0
        };

        // Save to localStorage
        localStorage.setItem('adhan_settings', JSON.stringify(this.state.settings));

        // Update prayer times with new settings
        this.updatePrayerTimes();

        // Close settings modal
        this.closeSettingsModal();

        // Show success message
        this.showSuccess('Paramètres enregistrés avec succès');
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?')) {
            // Default settings
            this.state.settings = {
                calculationMethod: 0, // Muslim World League
                asrMethod: 0, // Standard (Shafi'i)
                timeFormat: '24h',
                notificationsEnabled: true,
                adhanSound: 'adhan.mp3',
                adjustments: {
                    fajr: 0,
                    sunrise: 0,
                    dhuhr: 0,
                    asr: 0,
                    maghrib: 0,
                    isha: 0
                }
            };

            // Apply to UI
            this.applySettingsToUI();

            // Save to localStorage
            localStorage.setItem('adhan_settings', JSON.stringify(this.state.settings));

            // Update prayer times with new settings
            this.updatePrayerTimes();

            // Reset notification settings
            this.elements.notificationsEnabled.checked = true;
            this.saveNotificationSettings();

            // Show success message
            this.showSuccess('Paramètres réinitialisés avec succès');
        }
    }

    /**
     * Handle theme toggle
     */
    handleThemeToggle() {
        console.log("AdhanApp handleThemeToggle: Start. Current theme:", this.state.theme);
        // Toggle theme
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        console.log("AdhanApp handleThemeToggle: New theme:", this.state.theme);

        // Apply theme
        this.applyTheme();

        // Save to localStorage
        localStorage.setItem('adhan_theme', this.state.theme);
    }

    /**
     * Apply theme to document
     */
    applyTheme() {
        console.log("AdhanApp applyTheme: Applying theme:", this.state.theme);
        if (this.state.theme === 'dark') {
            document.body.classList.add('dark-theme');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            this.elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    /**
     * Apply color theme to document
     */
    applyColorTheme(themeName = null) {
        const themeToApply = themeName || this.state.colorTheme;
        console.log(`AdhanApp applyColorTheme: Called with themeName: ${themeName}. Theme to apply: ${themeToApply}. Current state.colorTheme before change: ${this.state.colorTheme}`);

        // Vérifier que le thème existe
        const validThemes = ['green', 'blue', 'crimson', 'orange', 'pink', 'purple', 'emerald'];
        if (!validThemes.includes(themeToApply)) return;

        // Enlever toutes les classes de thème existantes
        const themeClasses = validThemes
            .filter(t => t !== 'green') // Le thème vert est le défaut
            .map(t => `${t}-theme`);

        document.documentElement.classList.remove(...themeClasses);

        // Si le thème est autre que vert (défaut), ajouter la classe appropriée
        if (themeToApply !== 'green') {
            document.documentElement.classList.add(`${themeToApply}-theme`);
        }

        // Mettre à jour l'UI si nécessaire
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            if (option.getAttribute('data-theme') === themeToApply) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Sauvegarder le thème
        this.state.colorTheme = themeToApply; // Update state
        localStorage.setItem('adhan_color_theme', themeToApply);
        console.log(`AdhanApp applyColorTheme: Theme applied and saved. New state.colorTheme: ${this.state.colorTheme}, localStorage adhan_color_theme: ${localStorage.getItem('adhan_color_theme')}`);
    }

    /**
     * Open settings modal
     */
    openSettingsModal() {
        this.openModal(this.elements.settingsModal);
    }

    /**
     * Close settings modal
     */
    closeSettingsModal() {
        this.closeModal(this.elements.settingsModal);
    }

    /**
     * Open a modal
     * @param {HTMLElement} modal - Modal element to open
     */
    openModal(modal) {
        if (modal) {
            modal.classList.add('active');

            // Mettre à jour les traductions spécifiques à la modal
            if (modal === this.elements.locationModal) {
                this.updateLocationModalTexts();
            } else if (modal.id === 'aboutModal') {
                this.updateAboutModalTexts();
            }
        }
    }

    /**
     * Close a modal
     * @param {HTMLElement} modal - Modal element to close
     */
    closeModal(modal) {
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Show loader
     * @param {boolean} show - Whether to show or hide the loader
     */
    showLoader(show) {
        if (this.elements.loader) {
            if (show) {
                this.elements.loader.classList.add('active');
            } else {
                this.elements.loader.classList.remove('active');
            }
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to show
     */
    showError(message) {
        alert(message);
    }

    /**
     * Show success message
     * @param {string} message - Success message to show
     */
    showSuccess(message) {
        // Create a temporary div for success message
        const successDiv = document.createElement('div');
        successDiv.classList.add('success-message');
        successDiv.textContent = message;

        // Append to body
        document.body.appendChild(successDiv);

        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(successDiv);
            }, 500);
        }, 3000);
    }

    /**
     * Initialize PWA install prompt
     */
    initInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();

            // Store the event for later use
            this.state.installPromptEvent = e;

            // Show install prompt with delay
            setTimeout(() => {
                if (this.elements.installPrompt && !localStorage.getItem('adhan_install_dismissed')) {
                    this.elements.installPrompt.classList.add('active');
                }
            }, 10000); // Show after 10 seconds
        });
    }

    /**
     * Obtenir une traduction pour la clé fournie dans la langue actuelle
     * @param {string} key - La clé de traduction à récupérer
     * @returns {string} - La traduction pour la clé donnée
     */
    translate(key) {
        const lang = this.state.currentLanguage || 'fr';

        // Vérifier si la clé contient des sous-niveaux (ex: 'prayers.fajr')
        const keyParts = key.split('.');

        if (keyParts.length > 1) {
            let result = translations[lang];

            // Parcourir les niveaux de la clé
            for (const part of keyParts) {
                if (result && result[part]) {
                    result = result[part];
                } else {
                    return key; // Retourner la clé si aucune traduction n'est trouvée
                }
            }

            return result;
        }

        // Cas simple d'une clé à un seul niveau
        if (translations[lang] && translations[lang][key]) {
            return translations[lang][key];
        }

        // Fallback au français si la traduction n'existe pas
        if (translations['fr'] && translations['fr'][key]) {
            return translations['fr'][key];
        }

        // Retourner la clé si aucune traduction n'est trouvée
        return key;
    }

    /**
     * Appliquer la direction du texte en fonction de la langue
     * @param {string} lang - Code de la langue
     */
    applyTextDirection(lang) {
        // Appliquer RTL pour l'arabe seulement
        if (lang === 'ar') {
            document.documentElement.setAttribute('dir', 'rtl');
            document.body.classList.add('rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
            document.body.classList.remove('rtl');
        }
    }

    /**
     * Mettre à jour les textes de l'interface avec les traductions
     */
    updateInterfaceTexts() {
        console.log('Mise à jour des traductions...', this.state.currentLanguage);

        // Mettre à jour le titre de la section de la prochaine prière
        const nextPrayerTitle = document.querySelector('.next-prayer-info h2');
        if (nextPrayerTitle) {
            nextPrayerTitle.textContent = this.translate('nextPrayer');
        }

        // Mettre à jour le titre de la section des horaires de prières
        const prayerTimesTitle = document.querySelector('.prayer-times > h2');
        if (prayerTimesTitle) {
            prayerTimesTitle.textContent = this.translate('prayerListTitle');
        }

        // Mettre à jour les noms des prières dans les cartes
        const prayerCards = document.querySelectorAll('.prayer-card');
        prayerCards.forEach(card => {
            const prayerType = card.getAttribute('data-prayer');
            const nameElement = card.querySelector('.prayer-name');
            if (nameElement && prayerType) {
                nameElement.textContent = this.translate(`prayers.${prayerType}`);
            }
        });

        // Mettre à jour le bouton de changement de localisation
        const changeLocationBtn = this.elements.changeLocationBtn;
        if (changeLocationBtn) {
            const btnIcon = changeLocationBtn.querySelector('i') ? changeLocationBtn.querySelector('i').outerHTML : '';
            changeLocationBtn.innerHTML = btnIcon + ' ' + this.translate('location.change');
        }

        // Mettre à jour les textes de la modal des paramètres
        this.updateSettingsModalTexts();

        // Mettre à jour les options du sélecteur de rappel
        this.updateReminderOptions();

        // Mettre à jour les textes de la modal de localisation
        this.updateLocationModalTexts();

        // Mettre à jour les textes de la modal À propos
        this.updateAboutModalTexts();

        // Mettre à jour les textes du footer
        const findMosquesFooterSpan = document.querySelector('#findMosquesLinkFooter span[data-translate="footer.findMosques"]');
        if (findMosquesFooterSpan) {
            findMosquesFooterSpan.textContent = this.translate('footer.findMosques');
        }

        const copyrightFooterSpan = document.querySelector('.copyright span[data-translate="footer.copyrightText"]');
        if (copyrightFooterSpan) {
            copyrightFooterSpan.textContent = this.translate('footer.copyrightText');
        }

        // Mettre à jour la date
        this.updateDate();

        // Mettre à jour la prochaine prière si elle est déjà définie
        if (this.state.nextPrayer && this.state.nextPrayer.name) {
            this.elements.nextPrayerName.textContent = this.translate(`prayers.${this.state.nextPrayer.name}`);
        }
    }

    /**
     * Mettre à jour les textes de la modale À propos
     */
    updateAboutModalTexts() {
        // Titre de la modale
        const aboutTitle = document.getElementById('aboutModalTitle');
        if (aboutTitle) {
            aboutTitle.textContent = this.translate('about.title');
        }

        // Version
        const versionLabel = document.getElementById('aboutVersionLabel');
        if (versionLabel) {
            versionLabel.textContent = this.translate('about.version');
        }

        // Description
        const description = document.getElementById('aboutDescription');
        if (description) {
            description.textContent = this.translate('about.description');
        }

        const description2 = document.getElementById('aboutDescription2');
        if (description2) {
            description2.textContent = this.translate('about.description2');
        }

        // Fonctionnalités
        const featuresTitle = document.getElementById('aboutFeaturesTitle');
        if (featuresTitle) {
            featuresTitle.textContent = this.translate('about.features');
        }

        // Liste des fonctionnalités
        for (let i = 1; i <= 6; i++) {
            const feature = document.getElementById(`aboutFeature${i}`);
            if (feature) {
                feature.textContent = this.translate(`about.feature${i}`);
            }
        }

        // Crédits
        const creditsTitle = document.getElementById('aboutCreditsTitle');
        if (creditsTitle) {
            creditsTitle.textContent = this.translate('about.credits');
        }

        const developedWith = document.getElementById('aboutDevelopedWith');
        if (developedWith) {
            developedWith.textContent = this.translate('about.developedWith');
        }

        const copyright = document.getElementById('aboutCopyright');
        if (copyright) {
            copyright.textContent = this.translate('about.copyright');
        }
    }

    /**
     * Mettre à jour les textes de la modal des paramètres
     */
    updateSettingsModalTexts() {
        const lang = this.state.currentLanguage;
        const currentTranslations = translations[lang] || translations.en;

        if (!currentTranslations || !currentTranslations.settings) {
            console.error(`AdhanApp: Missing settings translations for language: ${lang}`);
            return;
        }

        const settingsTexts = currentTranslations.settings;

        // Titre principal du modal
        const settingsModalTitleEl = this.elements.settingsModal.querySelector('.modal-header h2');
        if (settingsModalTitleEl) settingsModalTitleEl.textContent = settingsTexts.title || 'Settings';

        // Options pour Asr Method
        const asrStandardLabel = this.elements.settingsModal.querySelector('label[for="asrMethodStandard"]');
        if (asrStandardLabel) asrStandardLabel.textContent = settingsTexts.asrStandard || 'Standard (Shafi, Maliki, Hanbali)';
        const asrHanafiLabel = this.elements.settingsModal.querySelector('label[for="asrHanafi"]');
        if (asrHanafiLabel) asrHanafiLabel.textContent = settingsTexts.asrHanafi || 'Hanafi';

        // Options pour Time Format
        const time12hLabel = this.elements.settingsModal.querySelector('label[for="time12h"]');
        if (time12hLabel) time12hLabel.textContent = settingsTexts.time12h || '12 hours (AM/PM)';
        const time24hLabel = this.elements.settingsModal.querySelector('label[for="time24h"]');
        if (time24hLabel) time24hLabel.textContent = settingsTexts.time24h || '24 hours';

        // Notifications
        const enableAudioNotifLabel = this.elements.settingsModal.querySelector('.toggle-option span');
        if (enableAudioNotifLabel) enableAudioNotifLabel.textContent = settingsTexts.enableAudioNotif || 'Enable audio notifications';

        const adhanSoundLabel = this.elements.settingsModal.querySelector('label[for="adhanSound"]');
        if (adhanSoundLabel) adhanSoundLabel.textContent = settingsTexts.adhanSound || 'Adhan Sound';

        // La traduction de 'label[for="prayerReminder"]' est gérée par data-translate="settings.prayerReminder"
        // La traduction de 'minutesBeforeText' est gérée par updateReminderOptions()

        // Boutons
        if (this.elements.saveSettingsBtn) this.elements.saveSettingsBtn.textContent = settingsTexts.save || 'Save';
        if (this.elements.resetSettingsBtn) this.elements.resetSettingsBtn.textContent = settingsTexts.reset || 'Reset';
        if (this.elements.testAdhanBtn) this.elements.testAdhanBtn.textContent = settingsTexts.test || 'Test';

        // Mettre à jour tous les éléments avec data-translate dans le modal des paramètres
        this.elements.settingsModal.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.dataset.translate;
            const translation = this.translate(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });

        // Traduction des labels d'ajustement (Fajr, Dhuhr, etc.)
        const adjustmentLabels = this.elements.settingsModal.querySelectorAll('.adjustment-item label');
        adjustmentLabels.forEach(label => {
            const forAttr = label.getAttribute('for');
            if (forAttr && forAttr.endsWith('Adjust')) {
                const prayerKey = forAttr.replace('Adjust', '').toLowerCase(); // e.g., 'fajr', 'dhuhr'
                const translatedPrayerName = this.translate(`prayers.${prayerKey}`);
                if (translatedPrayerName && translatedPrayerName !== `prayers.${prayerKey}`) {
                    label.textContent = translatedPrayerName;
                }
            }
        });

        console.log("AdhanApp: Settings modal texts updated for language:", lang);
    }

    /**
     * Format date in current language
     * @param {Date} date - The date to format
     * @returns {string} Formatted date string
     */
    formatDateInCurrentLanguage(date) {
        const lang = this.state.currentLanguage || 'fr';

        try {
            // Get day and month names in current language
            const dayNames = this.translate('dateFormat.day').split(',');
            const monthNames = this.translate('dateFormat.month').split(',');

            const day = date.getDay(); // 0-6 (Sunday is 0)
            const dayOfMonth = date.getDate(); // 1-31
            const month = date.getMonth(); // 0-11
            const year = date.getFullYear();

            // Format date string based on language
            if (lang === 'ar') {
                return `${dayNames[day]} ${dayOfMonth} ${monthNames[month]} ${year}`;
            } else {
                return `${dayNames[day]} ${dayOfMonth} ${monthNames[month]} ${year}`;
            }
        } catch (error) {
            console.error('Error formatting date:', error);
            // Fallback to browser's localization
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', options);
        }
    }

    /**
     * Définir la langue active dans l'interface
     * @param {string} lang - Code de la langue (fr, en, es, etc.)
     */
    setActiveLanguage(lang) {
        // Vérifier si la langue existe dans les traductions
        if (!translations[lang]) {
            console.warn(`Langue non prise en charge: ${lang}, utilisation du français par défaut`);
            lang = 'fr';
        }

        // Enregistrer la langue courante dans l'état de l'application
        this.state.currentLanguage = lang;

        // Mettre à jour l'indicateur de langue dans le bouton
        const currentLang = document.querySelector('.current-lang');
        if (currentLang) {
            currentLang.textContent = lang.toUpperCase();
        }

        // Mettre en évidence l'option sélectionnée dans le menu déroulant
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            if (option.getAttribute('data-lang') === lang) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        // Gérer la direction du texte pour l'arabe (RTL)
        this.applyTextDirection(lang);

        // Mettre à jour immédiatement les textes de l'interface
        this.updateInterfaceTexts();

        // Sauvegarder la préférence de langue dans localStorage
        localStorage.setItem('adhan_language', lang);
    }

    /**
     * Install the app
     */
    installApp() {
        if (this.state.installPromptEvent) {
            // Show the install prompt
            this.state.installPromptEvent.prompt();

            // Wait for the user to respond to the prompt
            this.state.installPromptEvent.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }

                // Clear the saved prompt since it can't be used again
                this.state.installPromptEvent = null;

                // Hide the install prompt
                this.elements.installPrompt.classList.remove('active');
            });
        }
    }

    /**
     * Dismiss the install prompt
     */
    dismissInstallPrompt() {
        if (this.elements.installPrompt) {
            this.elements.installPrompt.classList.remove('active');
            localStorage.setItem('adhan_install_dismissed', 'true');
        }
    }

    /**
     * Set up offline mode detection
     */
    setupOfflineDetection() {
        // Check if we're currently offline
        if (!navigator.onLine) {
            this.state.offlineMode = true;
            this.showOfflineIndicator(true);
        }

        // Listen for online event
        window.addEventListener('online', () => {
            this.state.offlineMode = false;
            this.showOfflineIndicator(false);

            // Refresh data when coming back online
            this.updateDate();
            this.updatePrayerTimes();
        });

        // Listen for offline event
        window.addEventListener('offline', () => {
            this.state.offlineMode = true;
            this.showOfflineIndicator(true);
        });
    }

    /**
     * Show or hide offline indicator
     * @param {boolean} show - Whether to show or hide the indicator
     */
    showOfflineIndicator(show) {
        // Check if offline indicator exists, create if not
        let offlineIndicator = document.getElementById('offlineIndicator');

        if (!offlineIndicator && show) {
            offlineIndicator = document.createElement('div');
            offlineIndicator.id = 'offlineIndicator';
            offlineIndicator.className = 'offline-indicator';
            offlineIndicator.innerHTML = '<i class="fas fa-wifi-slash"></i> Mode hors ligne';
            document.body.appendChild(offlineIndicator);
        } else if (offlineIndicator) {
            if (show) {
                offlineIndicator.classList.add('active');
            } else {
                offlineIndicator.classList.remove('active');
            }
        }
    }
}
