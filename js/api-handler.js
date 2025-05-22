/**
 * api-handler.js
 * Handles API requests for fetching prayer times and other data
 */

class AdhanApiHandler {
    constructor() {
        // Base URL for AlAdhan API
        this.baseUrl = 'https://api.aladhan.com/v1/';

        // Cached data to minimize API calls
        this.cache = {
            timings: {},
            locations: {}
        };

        // API request timeout in milliseconds
        this.timeout = 10000;
    }

    /**
     * Get prayer times for a specific date and location
     * @param {Date} date - The date object
     * @param {Object} location - Object containing latitude and longitude
     * @param {Object} params - Additional parameters for calculation method
     * @returns {Promise} Promise that resolves to prayer times data
     */
    async getPrayerTimes(date, location, params = {}) {
        try {
            // Format the date as YYYY-MM-DD
            const formattedDate = this.formatDate(date);

            // Clear cache to force refresh
            this.clearCache();
            console.log('Cache nettoyé pour garantir des données fraîches');

            // Forcer l'utilisation de l'API AlAdhan
            // Construire l'URL de l'API - utiliser let pour pouvoir modifier l'endpoint
            let endpoint = 'timingsByCity';

            // Paramètres de requête - utiliser la localisation fournie
            const queryParams = new URLSearchParams({
                city: location.city || '',
                country: location.country || '',
                method: params.method || 5, // Méthode par défaut si non spécifié
                school: params.school  // 0 = Standard (Shafi, Maliki, Hanbali), 1 = Hanafi
            });

            // Si nous avons les coordonnées GPS, les utiliser plutôt que le nom de la ville
            // car c'est plus précis et fonctionne pour n'importe quel endroit
            if (location.latitude && location.longitude) {
                // On supprime city et country car on va utiliser les coordonnées
                queryParams.delete('city');
                queryParams.delete('country');

                // On ajoute les coordonnées
                queryParams.append('latitude', location.latitude);
                queryParams.append('longitude', location.longitude);

                // Force explicitement l'école pour l'Asr - s'assurer qu'elle est correctement interprétée
                // 0 = Standard (Shafi, Maliki, Hanbali), 1 = Hanafi
                queryParams.delete('school'); // Enlever l'ancienne valeur
                queryParams.append('school', params.school); // Ajouter la nouvelle valeur

                console.log('Méthode de calcul Asr envoyée à l\'API:', params.school === 0 ? 'Standard' : 'Hanafi');

                // On ajuste l'endpoint pour utiliser les coordonnées au lieu du nom de ville
                endpoint = 'timings';
            }

            // Ajouter des paramètres supplémentaires si présents
            if (params.adjustment) {
                queryParams.append('adjustment', params.adjustment);
            }

            if (params.tune) {
                queryParams.append('tune', params.tune);
            }

            // Afficher l'URL complète pour débogage
            const fullUrl = `${this.baseUrl}${endpoint}?${queryParams.toString()}`;
            console.log('Appel de l\'API AlAdhan avec URL:', fullUrl);

            // Effectuer la requête HTTP
            const response = await fetch(fullUrl);
            const data = await response.json();

            // Afficher la réponse brute pour débogage
            console.log('Réponse brute de l\'API AlAdhan:', data);

            // Débogage spécifique pour le problème de l'Asr
            if (data && data.data && data.data.meta) {
                console.log('Métadonnées de l\'API AlAdhan:');
                console.log(' - Méthode de calcul:', data.data.meta.method?.name || 'Non spécifiée');
                console.log(' - École pour l\'Asr:', data.data.meta.school || 'Non spécifiée');
                console.log(' - Fuseau horaire:', data.data.meta.timezone || 'Non spécifié');
                console.log(' - Valeur de l\'Asr non ajustée:', data.data.timings?.Asr || 'Non disponible');
            }

            // Valider la réponse de l'API
            if (!data || data.code !== 200 || !data.data) {
                throw new Error('Réponse invalide de l\'API AlAdhan');
            }

            // Formater les horaires en format standard
            const formattedData = this.formatPrayerTimesData(data.data);
            console.log('Données formatées des horaires de prière:', formattedData);

            return formattedData;
        } catch (error) {
            console.error('Erreur lors de la récupération des horaires de prière:', error);
            alert('Erreur lors de la récupération des horaires de prière depuis l\'API AlAdhan. Vérifiez la console pour plus de détails.');
            throw error;
        }
    }

    /**
     * Get prayer times for a full month
     * @param {number} year - The year
     * @param {number} month - The month (1-12)
     * @param {Object} location - Object containing latitude and longitude
     * @param {Object} params - Additional parameters for calculation method
     * @returns {Promise} Promise that resolves to monthly prayer times data
     */
    async getMonthlyPrayerTimes(year, month, location, params = {}) {
        try {
            // Create cache key
            const cacheKey = `${year}_${month}_${location.latitude}_${location.longitude}_${params.method || '0'}`;

            // Return cached data if available
            if (this.cache.timings[cacheKey]) {
                return this.cache.timings[cacheKey];
            }

            // Build query params
            const queryParams = new URLSearchParams({
                latitude: location.latitude,
                longitude: location.longitude,
                method: params.method || 0,
                month: month,
                year: year,
                adjustment: params.adjustment || 0
            });

            // Add Asr calculation method if provided
            if (params.school !== undefined) {
                queryParams.append('school', params.school);
            }

            // Fetch data from API
            const response = await this.fetchWithTimeout(`${this.baseUrl}calendar?${queryParams.toString()}`);
            const data = await response.json();

            // Validate API response
            if (!data || data.code !== 200 || !data.data) {
                throw new Error('Invalid response from monthly prayer times API');
            }

            // Cache the results
            this.cache.timings[cacheKey] = data.data;

            return data.data;
        } catch (error) {
            console.error('Error fetching monthly prayer times:', error);
            throw error;
        }
    }

    /**
     * Get Hijri date for a given Gregorian date
     * @param {Date} date - The Gregorian date object
     * @returns {Promise} Promise that resolves to Hijri date information
     */
    async getHijriDate(date) {
        try {
            // Format the date as YYYY-MM-DD
            const formattedDate = this.formatDate(date);

            // Create cache key
            const cacheKey = `hijri_${formattedDate}`;

            // Return cached data if available
            if (this.cache.timings[cacheKey]) {
                return this.cache.timings[cacheKey];
            }

            // Build query params
            const queryParams = new URLSearchParams({
                date: formattedDate
            });

            // Fetch data from API
            const response = await this.fetchWithTimeout(`${this.baseUrl}gToH?${queryParams.toString()}`);
            const data = await response.json();

            // Validate API response
            if (!data || data.code !== 200 || !data.data) {
                throw new Error('Invalid response from Hijri date API');
            }

            // Format Hijri date
            const hijriData = {
                day: data.data.hijri.day,
                month: {
                    number: data.data.hijri.month.number,
                    en: data.data.hijri.month.en,
                    ar: data.data.hijri.month.ar
                },
                year: data.data.hijri.year,
                format: data.data.hijri.date,
                weekday: {
                    en: data.data.hijri.weekday.en,
                    ar: data.data.hijri.weekday.ar
                }
            };

            // Cache the results
            this.cache.timings[cacheKey] = hijriData;

            return hijriData;
        } catch (error) {
            console.error('Error fetching Hijri date:', error);
            throw error;
        }
    }

    /**
     * Search for a location by city name
     * @param {string} query - The city name to search for
     * @returns {Promise} Promise that resolves to location data
     */
    async searchLocation(query) {
        try {
            // Create cache key
            const cacheKey = `location_${query.toLowerCase()}`;

            // Return cached data if available
            if (this.cache.locations[cacheKey]) {
                return this.cache.locations[cacheKey];
            }

            // Utiliser notre proxy local au lieu d'appeler Nominatim directement
            console.log(`Recherche de localisation pour "${query}" via le proxy local`);
            const response = await this.fetchWithTimeout(
                `http://localhost:3000/search?q=${encodeURIComponent(query)}`
            );
            const data = await response.json();

            // Format location data
            const locations = data.map(location => ({
                latitude: parseFloat(location.lat),
                longitude: parseFloat(location.lon),
                name: location.display_name,
                country: location.address?.country || '',
                city: location.address?.city || location.address?.town || location.address?.village || ''
            }));

            // Cache the results
            this.cache.locations[cacheKey] = locations;

            return locations;
        } catch (error) {
            console.error('Error searching location:', error);
            throw error;
        }
    }

    /**
     * Get location from IP address
     * @returns {Promise} Promise that resolves to location data
     */
    async getLocationByIP() {
        try {
            // Using a free IP geolocation API
            const response = await this.fetchWithTimeout('https://ipapi.co/json/');
            const data = await response.json();

            // Format location data
            const location = {
                latitude: data.latitude,
                longitude: data.longitude,
                name: `${data.city}, ${data.country_name}`,
                country: data.country_name,
                city: data.city
            };

            return location;
        } catch (error) {
            console.error('Error getting location by IP:', error);
            throw error;
        }
    }

    /**
     * Format prayer times data into a standard format
     * @param {Object} data - Raw API response data
     * @returns {Object} Formatted prayer times data
     */
    formatPrayerTimesData(data) {
        // Extract just the prayer timings object from the API response
        const timings = data.timings || {};

        // Return only the times we need in a standardized format
        return {
            fajr: timings.Fajr,
            sunrise: timings.Sunrise,
            dhuhr: timings.Dhuhr,
            asr: timings.Asr,
            maghrib: timings.Maghrib,
            isha: timings.Isha,
            date: {
                gregorian: data.date?.gregorian,
                hijri: data.date?.hijri
            }
        };
    }

    /**
     * Format a date object as YYYY-MM-DD
     * @param {Date} date - The date object
     * @returns {string} Formatted date string
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Fetch with timeout to avoid hanging requests
     * @param {string} url - The URL to fetch
     * @param {Object} options - Fetch options
     * @returns {Promise} Promise that resolves to fetch response
     */
    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            clearTimeout(timeout);
            return response;
        } catch (error) {
            clearTimeout(timeout);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.cache = {
            timings: {},
            locations: {}
        };
    }
}

// Create a singleton instance to be used throughout the application
const apiHandler = new AdhanApiHandler();

// Export the instance for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiHandler;
}
