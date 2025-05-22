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
        console.log("[AdhanApp DEBUG] AdhanApp Constructor called."); // Log pour le constructeur
        this.listenersAttached = false; // Drapeau pour suivre l'attachement des écouteurs

        // DOM Elements
        this.elements = {
            // Header Elements
            languageToggle: document.getElementById('languageToggle'),
            currentLangDisplay: document.querySelector('#languageToggle .current-lang'),
            languageDropdown: document.querySelector('.language-dropdown'),
            languageOptions: document.querySelectorAll('.language-option'),
            themeToggle: document.getElementById('themeToggle'),
            settingsBtn: document.getElementById('settingsBtn'),

            // Main Content Elements
            gregorianDate: document.getElementById('gregorianDate'),
            currentTime: document.getElementById('currentTime'),
            currentLocation: document.getElementById('currentLocation'),
            locationText: document.getElementById('locationText'),
            changeLocationBtn: document.getElementById('changeLocationBtn'),
            nextPrayerName: document.getElementById('nextPrayerName'),
            nextPrayerTime: document.getElementById('nextPrayerTime'),
            countdown: document.getElementById('countdown'),
            stopAdhanSoundBtn: document.getElementById('stopAdhanSoundBtn'), 

            // Prayer Time Elements
            fajrTime: document.getElementById('fajrTime'),
            sunriseTime: document.getElementById('sunriseTime'),
            dhuhrTime: document.getElementById('dhuhrTime'),
            asrTime: document.getElementById('asrTime'),
            maghribTime: document.getElementById('maghribTime'),
            ishaTime: document.getElementById('ishaTime'),
            prayerCards: document.querySelectorAll('.prayer-card'),

            // Settings Modal Elements
            settingsModal: document.getElementById('settingsModal'),
            closeSettingsBtn: document.getElementById('closeSettingsBtn'),
            calculationMethod: document.getElementById('calculationMethod'),
            asrStandard: document.getElementById('asrStandard'),
            asrHanafi: document.getElementById('asrHanafi'),
            time12h: document.getElementById('time12h'),
            time24h: document.getElementById('time24h'),
            notificationsEnabled: document.getElementById('notificationsEnabled'),
            adhanSound: document.getElementById('adhanSound'),
            testAdhanBtn: document.getElementById('testAdhanBtn'),
            audioSelectionContainer: document.getElementById('audioSelectionContainer'),
            prayerReminder: document.getElementById('prayerReminder'),
            fajrAdjust: document.getElementById('fajrAdjust'),
            sunriseAdjust: document.getElementById('sunriseAdjust'),
            dhuhrAdjust: document.getElementById('dhuhrAdjust'),
            asrAdjust: document.getElementById('asrAdjust'),
            maghribAdjust: document.getElementById('maghribAdjust'),
            ishaAdjust: document.getElementById('ishaAdjust'),
            // Additions for notification toggles, assuming these IDs exist in index.html
            fajrNotif: document.getElementById('fajrNotif'),
            sunriseNotif: document.getElementById('sunriseNotif'),
            dhuhrNotif: document.getElementById('dhuhrNotif'),
            asrNotif: document.getElementById('asrNotif'),
            maghribNotif: document.getElementById('maghribNotif'),
            ishaNotif: document.getElementById('ishaNotif'),
            colorThemeOptions: document.querySelectorAll('.color-option'),
            saveSettingsBtn: document.getElementById('saveSettingsBtn'),
            resetSettingsBtn: document.getElementById('resetSettingsBtn'),
            aboutAppBtn: document.getElementById('aboutAppBtn'),

            // Location Modal Elements
            locationModal: document.getElementById('locationModal'),
            closeLocationBtn: document.getElementById('closeLocationBtn'),
            autoLocationBtn: document.getElementById('autoLocationBtn'),
            locationSearch: document.getElementById('locationSearch'), // Restored
            searchLocationBtn: document.getElementById('searchLocationBtn'), // Restored
            // locationSearchGeosearchContainer: document.getElementById('locationSearchGeosearchContainer'), // REMOVED
            // locationModalMap: document.getElementById('locationModalMap'), // REMOVED
            searchResults: document.getElementById('searchResults'),

            // Notification Modal Elements
            notificationModal: document.getElementById('notificationModal'),
            allowNotificationsBtn: document.getElementById('allowNotificationsBtn'),
            denyNotificationsBtn: document.getElementById('denyNotificationsBtn'),

            // Loader and Install Prompt
            loader: document.getElementById('loader'),
            installPrompt: document.getElementById('installPrompt'),
            installBtn: document.getElementById('installBtn'),
            dismissInstallBtn: document.getElementById('dismissInstallBtn'),

            // Audio Element
            adhanAudio: document.getElementById('adhanAudio'),

            // Footer link
            findMosquesLinkFooter: document.getElementById('findMosquesLinkFooter'),

            // About Modal Elements
            aboutModal: document.getElementById('aboutModal'),
            closeAboutBtn: document.getElementById('closeAboutBtn'),
            // Elements for translation in About Modal
            aboutModalTitle: document.getElementById('aboutModalTitle'),
            aboutVersionLabel: document.getElementById('aboutVersionLabel'),
            aboutDescription: document.getElementById('aboutDescription'),
            aboutDescription2: document.getElementById('aboutDescription2'),
            aboutFeaturesTitle: document.getElementById('aboutFeaturesTitle'),
            aboutFeature1: document.getElementById('aboutFeature1'),
            aboutFeature2: document.getElementById('aboutFeature2'),
            aboutFeature3: document.getElementById('aboutFeature3'),
            aboutFeature4: document.getElementById('aboutFeature4'),
            aboutFeature5: document.getElementById('aboutFeature5'),
            aboutFeature6: document.getElementById('aboutFeature6'),
            aboutCreditsTitle: document.getElementById('aboutCreditsTitle'),
            aboutDevelopedWith: document.getElementById('aboutDevelopedWith'),
            aboutCopyright: document.getElementById('aboutCopyright')
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
            searchTimeout: null, // Ajout pour le debounce de la recherche
            adhanPlaying: false // Ajout pour suivre l'état de lecture de l'adhan
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
        this.updateLocation = this.updateLocation.bind(this); // Bind the new method
        this.handleAutoLocation = this.handleAutoLocation.bind(this); // Bind new method

        console.log("AdhanApp Constructor: Initial state.theme:", JSON.parse(JSON.stringify(this.state.theme)), "Initial state.colorTheme:", JSON.parse(JSON.stringify(this.state.colorTheme)));

        this.currentLocationData = null;
        this.timerInterval = null;
        this.audioContext = null;
        this.audioSource = null;
        this.deferredInstallPrompt = null;
        this.debounceTimer = null; 
        this.highlightedSuggestionIndex = -1; 

        // this.init(); // REMOVE THIS LINE to prevent double initialization
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
        console.log("[AdhanApp DEBUG] AdhanApp Init called."); // Log pour init
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
        if (this.listenersAttached) {
            console.warn("[AdhanApp DEBUG] setupEventListeners: Listeners already attached. Skipping.");
            return;
        }
        console.log("[AdhanApp DEBUG] setupEventListeners: Attaching listeners...");

        // Theme toggle
        this.elements.themeToggle.addEventListener('click', this.handleThemeToggle);
        console.log("AdhanApp EventListeners: Theme toggle listener attached.");

        // Language selector
        const languageToggle = document.getElementById('languageToggle');
        const languageDropdown = document.querySelector('.language-dropdown');
        const languageOptions = document.querySelectorAll('.language-option');

        if (languageToggle) {
            console.log("[AdhanApp DEBUG] Language toggle element found:", languageToggle);
            // Initialiser avec la langue enregistrée ou par défaut
            const savedLang = localStorage.getItem('adhan_language') || 'fr';
            this.setActiveLanguage(savedLang);

            // Ouvrir/fermer le menu déroulant de langues
            languageToggle.addEventListener('click', () => {
                console.log("[AdhanApp DEBUG] Language toggle clicked.");
                if (languageDropdown) {
                    languageDropdown.classList.toggle('active');
                    console.log("[AdhanApp DEBUG] languageDropdown classList after toggle:", languageDropdown.classList.toString());
                } else {
                    console.warn("[AdhanApp DEBUG] languageDropdown not found on toggle click.");
                }
            });

            // Fermer le menu déroulant lors d'un clic en dehors
            document.addEventListener('click', (event) => {
                if (languageDropdown &&
                    !event.target.closest('.language-selector-container') &&
                    languageDropdown.classList.contains('active')) {
                    console.log("[AdhanApp DEBUG] Click outside language selector detected, closing dropdown.");
                    languageDropdown.classList.remove('active');
                }
            });
        } else {
            console.warn("[AdhanApp DEBUG] Language toggle element NOT found.");
        }

        // Options de langue
        if (languageOptions.length > 0) {
            console.log(`[AdhanApp DEBUG] Found ${languageOptions.length} language options.`);
            languageOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const lang = option.getAttribute('data-lang');
                    console.log(`[AdhanApp DEBUG] Language option clicked. Lang: ${lang}`);
                    if (lang) {
                        this.setActiveLanguage(lang);
                        if (languageDropdown && languageDropdown.classList.contains('active')) {
                            console.log("[AdhanApp DEBUG] Closing language dropdown after option click.");
                            languageDropdown.classList.remove('active');
                        }
                    }
                });
            });
        } else {
            console.warn("[AdhanApp DEBUG] No language options found.");
        }

        // Settings modal
        this.elements.settingsBtn.addEventListener('click', this.openSettingsModal);
        this.elements.closeSettingsBtn.addEventListener('click', this.closeSettingsModal);
        this.elements.saveSettingsBtn.addEventListener('click', this.saveSettings);
        this.elements.resetSettingsBtn.addEventListener('click', this.resetSettings);

        // Location modal
        this.elements.changeLocationBtn.addEventListener('click', () => {
            this.openModal(this.elements.locationModal);
            this.updateLocationModalTexts(); 
            if (this.elements.locationSearch) {
                this.elements.locationSearch.value = ''; // Clear previous search
                this.elements.searchResults.innerHTML = ''; // Clear previous results
                this.elements.locationSearch.focus();
            }
        });

        this.elements.closeLocationBtn.addEventListener('click', () => this.closeModal(this.elements.locationModal));
        this.elements.autoLocationBtn.addEventListener('click', () => this.handleAutoLocation());

        // New incremental location search logic
        if (this.elements.locationSearch) {
            this.elements.locationSearch.addEventListener('input', () => {
                clearTimeout(this.debounceTimer);
                this.highlightedSuggestionIndex = -1; // Reset highlight on new input
                this.debounceTimer = setTimeout(() => {
                    this.handleIncrementalLocationSearch();
                }, 300); // Debounce time of 300ms
            });
            // Add keydown listener for navigation and selection
            this.elements.locationSearch.addEventListener('keydown', (event) => this.handleSearchKeyDown(event));
        } else {
            console.warn("[AdhanApp] Location search input not found for event listeners.");
        }

        // Remove or comment out the old button-based search listener if it exists
        if (this.elements.searchLocationBtn) {
            // this.elements.searchLocationBtn.addEventListener('click', () => this.handleManualLocationSearch()); // Old logic
            this.elements.searchLocationBtn.style.display = 'none'; // Hide the button as search is now incremental
        }

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
            if (element) { // Ajout de cette vérification
                element.addEventListener('change', () => {
                    this.saveNotificationSettings();
                });
            }
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

        // --- ÉCOUTEURS POUR L'ARRÊT DU SON DE L'ADHAN ---
        // Bouton "Stop sound"
        if (this.elements.stopAdhanSoundBtn && this.elements.adhanAudio) {
            this.elements.stopAdhanSoundBtn.addEventListener('click', () => {
                this.elements.adhanAudio.pause();
                this.elements.adhanAudio.currentTime = 0;
                this.elements.stopAdhanSoundBtn.style.display = 'none';
                this.state.adhanPlaying = false;
                console.log("[AdhanApp] Adhan arrêté par l'utilisateur via stopAdhanSoundBtn.");
            });
        }

        // Lorsque l'Adhan se termine naturellement
        if (this.elements.adhanAudio) {
            this.elements.adhanAudio.addEventListener('ended', () => {
                if (this.elements.stopAdhanSoundBtn) {
                    this.elements.stopAdhanSoundBtn.style.display = 'none';
                }
                this.state.adhanPlaying = false;
                console.log("[AdhanApp] Adhan terminé naturellement, stopAdhanSoundBtn masqué.");
            });
        }

        this.listenersAttached = true; // Mettre le drapeau à true après l'attachement
        console.log("[AdhanApp DEBUG] setupEventListeners: Listeners attached successfully.");
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
     * Initialize the location search with Leaflet Geosearch
     */
    initLocationSearch() {
        if (!this.elements.locationSearchGeosearchContainer || !this.elements.locationModalMap) {
            console.error('[AdhanApp] initLocationSearch: Required elements (container or map div) not found!');
            return;
        }
        console.log('[AdhanApp] initLocationSearch (v2): Starting. Container and map div found.');

        // If map already initialized and control exists, maybe just ensure it is visible or return
        if (this.locationModalMapInstance && this.modalGeosearchControl) {
            console.log('[AdhanApp] initLocationSearch (v2): Modal map and GeoSearch control already initialized.');
            // Potentially clear/reset the search bar text if needed upon modal open
            if (this.modalGeosearchControl.searchElement && this.modalGeosearchControl.searchElement.input) {
                 // this.modalGeosearchControl.searchElement.input.value = ''; // Optional: clear previous search
            }
            return;
        }

        // Initialize the hidden map if not already done
        if (!this.locationModalMapInstance) {
            try {
                this.locationModalMapInstance = L.map(this.elements.locationModalMap, {
                    center: [0,0], // Default center
                    zoom: 1,       // Default zoom
                    attributionControl: false,
                    zoomControl: false,
                    // preferCanvas: true, // Might reduce overhead for a hidden map
                });
                // Add a minimal tile layer (won't be visible, but some controls/plugins expect it)
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.locationModalMapInstance);
                console.log('[AdhanApp] initLocationSearch (v2): Hidden modal map initialized.');
            } catch (mapError) {
                console.error('[AdhanApp] initLocationSearch (v2): Error initializing hidden modal map:', mapError);
                return; // Cannot proceed without the map
            }
        }

        const PhotonProvider = {
            search: async (queryObject) => {
                const currentLang = this.state.currentLanguage || 'fr';
                if (!queryObject || typeof queryObject.query !== 'string' || !queryObject.query.trim()) return [];
                const searchTerm = queryObject.query;
                try {
                    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm)}&limit=5&lang=${currentLang}`);
                    if (!response.ok) throw new Error(`Photon API error: ${response.status}`);
                    const data = await response.json();
                    if (!data.features || !data.features.length) return [];
                    return data.features.map(feature => ({
                        x: feature.geometry.coordinates[0],
                        y: feature.geometry.coordinates[1],
                        label: [feature.properties.name, feature.properties.street, feature.properties.housenumber, feature.properties.city, feature.properties.state, feature.properties.country].filter(Boolean).join(', ') || this.translate('location.currentLocationUnknownName'),
                        bounds: feature.properties.extent ? [[feature.properties.extent[1], feature.properties.extent[0]], [feature.properties.extent[3], feature.properties.extent[2]]] : null,
                        raw: feature
                    }));
                } catch (error) {
                    console.error('Photon search error:', error);
                    this.elements.searchResults.textContent = this.translate('location.error'); 
                    this.elements.searchResults.style.display = 'block';
                    return [];
                }
            }
        };

        try {
            this.modalGeosearchControl = new GeoSearch.GeoSearchControl({
                provider: PhotonProvider,
                style: 'bar',
                searchLabel: this.translate('location.searchPlaceholder'), // Essential for usability
                notFoundMessage: this.translate('location.error'),   // Essential for usability
                // showMarker: false, // Default is false
                // showPopup: false,  // Default is false
                // resultFormat: ({ result }) => result.label, // Keep for result display
                // popupFormat: ({ result }) => result.label,   // Keep for result display (though popup is false)
                // maxMarkers: 1, // Default is 1
                // retainZoomLevel: false, // Default is false
                // animateZoom: false, 
                // autoClose: true, // Default is true for bar style
                // keepResult: true, // Default is false, but good to have true
                // updateMap: false, // Default is true, set to false if not updating a map
            });

            this.locationModalMapInstance.addControl(this.modalGeosearchControl);
            console.log('[AdhanApp] initLocationSearch (v2): GeoSearch control created and added to hidden modal map.');

            // Now, get the control's container and move it to the visible div
            const geosearchGui = this.modalGeosearchControl.getContainer();
            if (geosearchGui) {
                console.log('[AdhanApp] initLocationSearch (v2): GeoSearch GUI container HTML:', geosearchGui.innerHTML);
                this.elements.locationSearchGeosearchContainer.innerHTML = ''; // Clear the target first
                this.elements.locationSearchGeosearchContainer.appendChild(geosearchGui);
                console.log('[AdhanApp] initLocationSearch (v2): GeoSearch GUI manually moved to visible container.');
            } else {
                console.error('[AdhanApp] initLocationSearch (v2): Could not get GeoSearch GUI container to move.');
            }

            this.locationModalMapInstance.on('geosearch/showlocation', (event) => {
                console.log("GeoSearch Location Selected (Modal Map Event):", event.location);
                const { y: lat, x: lon, label: name } = event.location;
                if (lat && lon && name) {
                    this.saveLocation(lat, lon, name);
                    this.closeModal(this.elements.locationModal);
                    if (this.modalGeosearchControl.searchElement && this.modalGeosearchControl.searchElement.input) {
                        // this.modalGeosearchControl.searchElement.input.value = ''; // Optional: clear search on select
                    }
                    this.elements.searchResults.style.display = 'none';
                    this.elements.searchResults.textContent = '';
                } else {
                    console.error("Selected location data is incomplete (Modal Map Event)", event.location);
                    this.elements.searchResults.textContent = this.translate('location.error');
                    this.elements.searchResults.style.display = 'block';
                }
            });

        } catch (controlError) {
            console.error('[AdhanApp] initLocationSearch (v2): Error creating or adding GeoSearch control:', controlError);
            return;
        }
        
        this.elements.searchResults.style.display = 'none';
        this.elements.searchResults.textContent = '';
        console.log('[AdhanApp] initLocationSearch (v2): Completed successfully.');
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
            .then(() => {
                console.log("[AdhanApp Debug] playAdhan - Audio a commencé à jouer avec succès.");
                if (this.elements.stopAdhanSoundBtn) { // Cibler le nouveau bouton
                    this.elements.stopAdhanSoundBtn.style.display = 'flex'; // 'flex' pour correspondre au CSS pour le centrage
                    console.log("[AdhanApp Debug] playAdhan - Bouton stopAdhanSoundBtn affiché.");
                } else {
                    console.warn("[AdhanApp Debug] playAdhan - stopAdhanSoundBtn non trouvé pour affichage après lecture.");
                }
                this.state.adhanPlaying = true;
            })
            .catch(error => {
                console.error("[AdhanApp Debug] playAdhan - ERREUR lors de la tentative de lecture de l'audio:", error);
                if (this.elements.stopAdhanSoundBtn) { // Cibler le nouveau bouton
                    this.elements.stopAdhanSoundBtn.style.display = 'none';
                }
                this.state.adhanPlaying = false;
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
        console.log(`[AdhanApp DEBUG] setActiveLanguage called with: ${lang}`);
        // Vérifier si la langue existe dans les traductions
        if (!translations[lang]) {
            console.warn(`[AdhanApp DEBUG] Language not supported: ${lang}, defaulting to 'fr'.`);
            lang = 'fr';
        }

        // Enregistrer la langue courante dans l'état de l'application
        this.state.currentLanguage = lang;
        console.log(`[AdhanApp DEBUG] state.currentLanguage set to: ${this.state.currentLanguage}`);

        // Mettre à jour l'indicateur de langue dans le bouton
        // const currentLang = document.querySelector('.current-lang'); // Original
        const currentLangDisplay = this.elements.currentLangDisplay; // Using existing reference from this.elements
        if (currentLangDisplay) {
            currentLangDisplay.textContent = lang.toUpperCase();
            console.log(`[AdhanApp DEBUG] currentLangDisplay text set to: ${lang.toUpperCase()}`);
        } else {
            console.warn("[AdhanApp DEBUG] currentLangDisplay element (.current-lang) not found.");
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
        console.log("[AdhanApp DEBUG] Active class updated on language options.");

        // Gérer la direction du texte pour l'arabe (RTL)
        this.applyTextDirection(lang);

        // Mettre à jour immédiatement les textes de l'interface
        this.updateInterfaceTexts();

        // Sauvegarder la préférence de langue dans localStorage
        localStorage.setItem('adhan_language', lang);
        console.log(`[AdhanApp DEBUG] Language preference '${lang}' saved to localStorage.`);
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

    handleManualLocationSearch() {
        const query = this.elements.locationSearch.value.trim();
        if (!query) {
            this.showTemporaryMessage(this.elements.searchResults, this.translate('location.noInput'), 'error');
            return;
        }
        console.log("[AdhanApp] Manual location search for:", query);
        this.showTemporaryMessage(this.elements.searchResults, `${this.translate('location.searchingFor')} "${query}"...`, 'info');

        // Placeholder for actual geocoding API call
        // For now, let's simulate a result or an error
        // TODO: Implement actual geocoding API call here
        this.geocodeCity(query)
            .then(results => {
                this.elements.searchResults.innerHTML = ''; // Clear previous results/messages
                if (results && results.length > 0) {
                    // For simplicity, use the first result
                    const firstResult = results[0];
                    const city = firstResult.name;
                    const country = firstResult.country || '';
                    const locationString = `${city}${country ? ', ' + country : ''}`;
                    
                    this.updateLocation(firstResult.latitude, firstResult.longitude, city, country);
                    this.showTemporaryMessage(this.elements.searchResults, `${this.translate('location.locationSetTo')} ${locationString}`, 'success');
                    this.closeModal(this.elements.locationModal);
                } else {
                    this.showTemporaryMessage(this.elements.searchResults, this.translate('location.noResultsForQuery').replace('{query}', query), 'error');
                }
            })
            .catch(error => {
                console.error("[AdhanApp] Geocoding error:", error);
                this.showTemporaryMessage(this.elements.searchResults, this.translate('location.error'), 'error');
            });
    }

    // Placeholder for geocodeCity - replace with actual implementation
    async geocodeCity(cityName) {
        console.warn(`[AdhanApp] geocodeCity called with: ${cityName}. Using placeholder logic.`);
        // This is a placeholder. In a real app, you'd call a geocoding service.
        // For now, let's simulate some known cities for basic testing.
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (cityName.toLowerCase() === "paris") {
                    resolve([{
                        name: "Paris",
                        country: "France",
                        latitude: 48.8566,
                        longitude: 2.3522
                    }]);
                } else if (cityName.toLowerCase() === "london") {
                    resolve([{
                        name: "London",
                        country: "UK",
                        latitude: 51.5074,
                        longitude: 0.1278
                    }]);
                } else if (cityName.toLowerCase() === "new york") {
                    resolve([{
                        name: "New York",
                        country: "USA",
                        latitude: 40.7128,
                        longitude: -74.0060
                    }]);
                } else {
                    resolve([]); // No results for other cities in this placeholder
                }
            }, 500); // Simulate network delay
        });
    }

    async fetchCitySuggestions(query) {
        if (query.length < 3) {
            this.displaySuggestions([], this.translate('location.inputTooShort'));
            return;
        }

        this.elements.searchResults.innerHTML = `<div class="search-result-item">${this.translate('location.searching')}</div>`;

        try {
            // Using Photon API (OpenStreetMap based)
            const lang = this.currentLanguage || 'en'; // Photon supports lang parameter
            const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=${lang}`);
            if (!response.ok) {
                throw new Error(`Photon API error: ${response.status}`);
            }
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                this.displaySuggestions(data.features);
            } else {
                this.displaySuggestions([], this.translate('location.noResults'));
            }
        } catch (error) {
            console.error('[AdhanApp] Error fetching city suggestions:', error);
            this.displaySuggestions([], this.translate('location.apiError'));
        }
    }

    displaySuggestions(suggestions, message = '') {
        this.elements.searchResults.innerHTML = ''; // Clear previous results or messages
        this.highlightedSuggestionIndex = -1; // Reset highlighted index

        if (message) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('search-result-item', 'search-message');
            messageElement.textContent = message;
            this.elements.searchResults.appendChild(messageElement);
        }

        if (suggestions.length > 0) {
            suggestions.forEach(feature => {
                const props = feature.properties;
                const name = props.name;
                const city = props.city;
                const state = props.state;
                const country = props.country;

                let displayName = name;
                if (city && city.toLowerCase() !== name.toLowerCase()) {
                    displayName += `, ${city}`;
                }
                if (state && state.toLowerCase() !== name.toLowerCase() && (!city || state.toLowerCase() !== city.toLowerCase())) {
                    displayName += `, ${state}`;
                }
                if (country && country.toLowerCase() !== name.toLowerCase()) {
                    displayName += `, ${country}`;
                }
                if (displayName.length > 60) {
                    displayName = displayName.substring(0, 57) + "...";
                }

                const item = document.createElement('div');
                item.classList.add('search-result-item');
                item.textContent = displayName;
                item.dataset.lat = feature.geometry.coordinates[1];
                item.dataset.lon = feature.geometry.coordinates[0];
                item.dataset.name = name; 
                item.dataset.country = country || '';
                item.dataset.city = city || name; 

                // Use an arrow function for the event listener to preserve 'this' context
                item.addEventListener('click', () => {
                    const lat = parseFloat(item.dataset.lat);
                    const lon = parseFloat(item.dataset.lon);
                    const selectedName = item.dataset.city; 
                    const selectedCountry = item.dataset.country;

                    this.updateLocation(lat, lon, selectedName, selectedCountry); // 'this' here will correctly refer to AdhanApp
                    this.closeModal(this.elements.locationModal);
                    this.elements.searchResults.innerHTML = ''; 
                    this.elements.locationSearch.value = ''; 
                });
                this.elements.searchResults.appendChild(item);
            });
        }
    }

    updateSuggestionHighlight() {
        console.log('[AdhanApp DEBUG] updateSuggestionHighlight - Index:', this.highlightedSuggestionIndex);
        const items = this.elements.searchResults.querySelectorAll('.search-result-item:not(.search-message)');
        console.log('[AdhanApp DEBUG] updateSuggestionHighlight - Found items:', items.length);
        items.forEach((item, index) => {
            if (index === this.highlightedSuggestionIndex) {
                item.classList.add('search-result-item--active');
                console.log('[AdhanApp DEBUG] updateSuggestionHighlight - Added active class to item:', index);
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('search-result-item--active');
            }
        });
    }

    handleSearchKeyDown(event) {
        console.log('[AdhanApp DEBUG] handleSearchKeyDown - Key pressed:', event.key, 'Target:', event.target.id);
        const items = this.elements.searchResults.querySelectorAll('.search-result-item:not(.search-message)');
        
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown' && event.key !== 'Enter' && event.key !== 'Escape') {
            // Allow normal typing if not one of our navigation keys
            return;
        }

        // Prevent default for our navigation keys if there are items, or for Escape regardless
        if ((items.length && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter')) || event.key === 'Escape') {
            event.preventDefault();
        }

        if (!items.length && event.key !== 'Escape') { // Only allow Escape if no items
            console.log('[AdhanApp DEBUG] handleSearchKeyDown - No items to navigate for key:', event.key);
            return;
        }
        
        console.log('[AdhanApp DEBUG] handleSearchKeyDown - Navigable items:', items.length, 'Current Highlight:', this.highlightedSuggestionIndex);

        switch (event.key) {
            case 'ArrowDown':
                this.highlightedSuggestionIndex++;
                if (this.highlightedSuggestionIndex >= items.length) {
                    this.highlightedSuggestionIndex = 0; 
                }
                console.log('[AdhanApp DEBUG] handleSearchKeyDown - ArrowDown, new index:', this.highlightedSuggestionIndex);
                this.updateSuggestionHighlight();
                break;
            case 'ArrowUp':
                this.highlightedSuggestionIndex--;
                if (this.highlightedSuggestionIndex < 0) {
                    this.highlightedSuggestionIndex = items.length - 1; 
                }
                console.log('[AdhanApp DEBUG] handleSearchKeyDown - ArrowUp, new index:', this.highlightedSuggestionIndex);
                this.updateSuggestionHighlight();
                break;
            case 'Enter':
                console.log('[AdhanApp DEBUG] handleSearchKeyDown - Enter. Index:', this.highlightedSuggestionIndex);
                if (this.highlightedSuggestionIndex >= 0 && this.highlightedSuggestionIndex < items.length) {
                    items[this.highlightedSuggestionIndex].click(); 
                }
                break;
            case 'Escape':
                console.log('[AdhanApp DEBUG] handleSearchKeyDown - Escape.');
                this.elements.searchResults.innerHTML = ''; 
                this.highlightedSuggestionIndex = -1;
                break;
            // No default needed due to the check at the beginning of the function
        }
    }

    handleIncrementalLocationSearch() {
        const query = this.elements.locationSearch.value.trim();
        if (query === '') {
            this.elements.searchResults.innerHTML = ''; // Clear results if query is empty
            return;
        }
        this.fetchCitySuggestions(query);
    }

    saveLocation() {
        localStorage.setItem('adhan_location', JSON.stringify(this.state.location));
        console.log('AdhanApp: Location saved to localStorage:', this.state.location);
    }

    updateLocation(latitude, longitude, cityName, countryName = '') {
        console.log(`[AdhanApp] updateLocation called with: Lat=${latitude}, Lon=${longitude}, City=${cityName}, Country=${countryName}`);
        this.state.location.latitude = latitude;
        this.state.location.longitude = longitude;
        this.state.location.name = `${cityName}${countryName ? ', ' + countryName : ''}`;

        this.saveLocation(); // Save to localStorage
        this.updateLocationDisplay(); // Update the UI in the header
        this.updatePrayerTimes(); // Fetch new prayer times for this location
    }

    async handleAutoLocation() {
        console.log("[AdhanApp] handleAutoLocation called.");
        this.closeModal(this.elements.locationModal);
        this.showLoader(true); // Show loader for the whole operation

        try {
            await this.getGeolocation(); // Fetches location, updates state and display
            
            // After location is updated in state by getGeolocation, fetch prayer times
            await this.updatePrayerTimes(); 
                                            
            this.updateNextPrayer(); // Refresh next prayer display and countdown logic

        } catch (error) {
            console.error("[AdhanApp] Error during auto location process:", error);
            this.showError(this.translate('location.geolocationError')); 
        } finally {
            this.showLoader(false); // Hide loader once everything is done or an error occurred
        }
    }
}
