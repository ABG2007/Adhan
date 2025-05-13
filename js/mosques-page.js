document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const mapElement = document.getElementById('map');
    const radiusSelect = document.getElementById('radiusSelect');
    const recenterMapBtn = document.getElementById('recenterMapBtn');
    const mosquesListContainer = document.getElementById('mosquesList');
    const mapLoadingIndicator = document.getElementById('mapLoadingIndicator');
    const mapLoadingText = document.getElementById('mapLoadingText');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const useCurrentLocationBtn = document.getElementById('useCurrentLocationBtn');

    // --- Map Variables ---
    let map = null;
    let userMarker = null;
    let radiusCircle = null;
    let mosqueMarkersLayer = L.layerGroup(); // Layer group for mosque markers
    let userLocation = null; // Store user lat/lng
    let currentRadius = parseInt(radiusSelect.value, 10);
    let isUsingManualLocation = false; // Flag to track location mode

    // --- Translation Function (Basic Placeholder) ---
    // Assuming global `translate` function and `currentLanguage` exist from translations.js
    const currentLanguage = typeof window.currentLanguage !== 'undefined' ? window.currentLanguage : 'fr';
    const translate = (key, replacements = {}) => {
        if (typeof window.translate === 'function') {
            return window.translate(key, replacements);
        }
        // Basic fallback for key elements used here
        const fallbackTranslations = {
            'mosques.loadingLocation': 'Recherche de votre position...',
            'mosques.loadingMosques': 'Recherche des mosquées...',
            'mosques.locationFound': 'Position trouvée.',
            'mosques.locationError': 'Erreur de localisation',
            'mosques.geolocationNotSupported': 'La géolocalisation n\'est pas supportée par ce navigateur.',
            'mosques.locationPermissionDenied': 'Permission de localisation refusée.',
            'mosques.locationTimeout': 'Impossible d\'obtenir la localisation (timeout).',
            'mosques.geoSearchPlaceholder': 'Rechercher une adresse ou un lieu...',
            'mosques.apiError': 'Erreur API Overpass',
            'mosques.apiErrorNominatim': 'Erreur API de géocodage',
            'mosques.genericError': 'Une erreur est survenue.',
            'mosques.noResultsInRadius': 'Aucune mosquée trouvée dans un rayon de {radius} km.',
            'mosques.unnamed': 'Mosquée (sans nom)',
            'mosques.distanceAway': '{distance} km',
            'mosques.addressLoading': 'Chargement de l\'adresse...',
            'mosques.addressNotFound': 'Adresse non disponible',
            'mosques.itinerary': 'Itinéraire',
            'mosques.openInOSM': 'Voir sur OpenStreetMap',
            'mosques.userLocation': 'Votre position'
        };
        let text = fallbackTranslations[key] || key;
        for (const placeholder in replacements) {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        }
        return text;
    };

    // --- Update map with new location (auto or manual) ---
    function updateMapWithLocation(latLng, locationName) {
        if (!map) {
            console.error("updateMapWithLocation called before map is initialized");
            return;
        }
        console.log(`Attempting to update map with location: "${locationName}"`, latLng);

        const finalLocationName = locationName || translate('mosques.userLocation');
        console.log(`Final location name for popup: "${finalLocationName}"`);

        if (!userMarker) {
            const locationIcon = L.divIcon({
                html: '<i class="fas fa-map-marker-alt user-location-icon"></i>',
                className: 'user-location-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            });
            userMarker = L.marker(latLng, { icon: locationIcon }).addTo(map);
            console.log('User marker created.');
        } else {
            userMarker.setLatLng(latLng);
            console.log('User marker LatLng updated.');
        }

        // Toujours (re)lier et ouvrir le popup pour garantir la mise à jour
        userMarker.bindPopup(finalLocationName).openPopup();
        console.log(`User marker popup set to: "${finalLocationName}" and explicitly opened.`);

        updateRadiusCircle(currentRadius);
        // map.setView(latLng, 13); // Centrage géré par map.locate ou GeoSearch
        if (map.getZoom() < 13) { // Zoom si on est trop dézoomé
            map.setView(latLng, 13);
        } else {
            map.panTo(latLng); // Simple pan si le zoom est suffisant
        }
    }

    // --- Map Initialization ---
    function initMap() {
        if (!mapElement) return;

        showLoading(translate('mosques.loadingLocation'));

        map = L.map(mapElement, {
            zoomControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        mosqueMarkersLayer.addTo(map);

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const PhotonProvider = {
            search: async (queryObject) => {
                console.log('PhotonProvider search called with:', queryObject);
                if (!queryObject || typeof queryObject.query !== 'string') {
                    console.error('PhotonProvider: Invalid query object received:', queryObject);
                    return [];
                }
                const searchTerm = queryObject.query;
                if (!searchTerm.trim()) {
                    console.log('PhotonProvider: Empty search term, returning empty.');
                    return [];
                }
                console.log('PhotonProvider: Search term:', searchTerm);

                try {
                    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm)}&limit=5&lang=${currentLanguage}`);
                    console.log('Photon API response status:', response.status);
                    if (!response.ok) {
                        throw new Error(`Photon API error: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log('Photon API raw data:', data);

                    if (!data.features || !data.features.length) {
                        console.log('PhotonProvider: No features found.');
                        return [];
                    }

                    const results = data.features.map(feature => {
                        const { coordinates } = feature.geometry;
                        const properties = feature.properties;
                        const parts = [];
                        if (properties.name) parts.push(properties.name);
                        if (properties.street) parts.push(properties.street);
                        if (properties.housenumber) parts.push(properties.housenumber);
                        if (properties.city) parts.push(properties.city);
                        if (properties.state) parts.push(properties.state);
                        if (properties.country) parts.push(properties.country);
                        const label = parts.join(', ') || 'Lieu inconnu';

                        return {
                            x: coordinates[0],
                            y: coordinates[1],
                            label: label,
                            bounds: properties.extent ? [[properties.extent[1], properties.extent[0]], [properties.extent[3], properties.extent[2]]] : null,
                            raw: feature
                        };
                    });
                    console.log('PhotonProvider formatted results:', results);
                    return results;
                } catch (error) {
                    console.error('Photon search error:', error);
                    return [];
                }
            }
        };

        const searchControl = new GeoSearch.GeoSearchControl({
            provider: PhotonProvider,
            style: 'bar',
            showMarker: false,
            showPopup: false,
            marker: { icon: L.divIcon({ html: '' }), draggable: false },
            popupFormat: ({ result }) => result.label,
            resultFormat: ({ result }) => result.label,
            maxMarkers: 1,
            retainZoomLevel: false,
            animateZoom: true,
            autoClose: true,
            searchLabel: translate('mosques.geoSearchPlaceholder'),
            keepResult: true,
            notFoundMessage: 'Aucun résultat trouvé'
        });
        map.addControl(searchControl);

        map.on('geosearch/showlocation', onGeoSearchLocationSelected);

        locateUser(); // Appel pour la géolocalisation initiale
    }

    // --- Geolocation Handlers ---
    function onLocationFound(e) {
        userLocation = e.latlng;
        isUsingManualLocation = false;
        console.log('onLocationFound triggered. User LatLng:', userLocation);
        showLoading(translate('mosques.locationFound'));

        getBigDataCloudReverseData(userLocation.lat, userLocation.lng)
            .then(fetchedName => {
                hideLoading();
                const displayName = fetchedName || translate('mosques.userLocation');
                console.log(`Name for user location (fetched or fallback): "${displayName}"`);
                updateMapWithLocation(userLocation, displayName);
                findNearbyMosques(userLocation.lat, userLocation.lng, currentRadius);
            })
            .catch(error => {
                console.error('Error in onLocationFound processing:', error);
                hideLoading();
                updateMapWithLocation(userLocation, translate('mosques.userLocation')); // Fallback
                findNearbyMosques(userLocation.lat, userLocation.lng, currentRadius);
            });
    }

    function onLocationError(e) {
        console.error("Location error:", e);
        hideLoading();
        let message = translate('mosques.genericError');
        if (e.code === 1) message = translate('mosques.locationPermissionDenied');
        else if (e.code === 2) message = translate('mosques.locationError');
        else if (e.code === 3) message = translate('mosques.locationTimeout');

        displayError(message, true);

        // Set default view
        if (!userLocation) {
            map.setView([48.8566, 2.3522], 11);
            resultsPlaceholder.textContent = translate('mosques.geoSearchPlaceholder');
            resultsPlaceholder.style.color = 'var(--text-color-light)';
            resultsPlaceholder.style.display = 'block';
        }
    }

    // Function pour géolocalisation
    function locateUser() {
        showLoading(translate('mosques.loadingLocation'));
        console.log('Attempting map.locate()');
        map.locate({ setView: true, maxZoom: 15, timeout: 10000, enableHighAccuracy: true });
    }

    // Handler pour la sélection d'un lieu via GeoSearch
    function onGeoSearchLocationSelected(e) {
        userLocation = L.latLng(e.location.y, e.location.x);
        isUsingManualLocation = true;
        console.log('GeoSearch location selected:', e.location.label, userLocation);

        hideLoading();
        updateMapWithLocation(userLocation, e.location.label);
        findNearbyMosques(userLocation.lat, userLocation.lng, currentRadius);
    }

    // --- API Reverse Geocoding ---
    async function getBigDataCloudReverseData(lat, lon) {
        try {
            console.log('Getting reverse geocoding data for:', lat, lon);

            // Utiliser BigDataCloud qui est compatible CORS et ne nécessite pas de clé API
            const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${currentLanguage}`;
            console.log('Reverse geocoding URL:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`BigDataCloud API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('BigDataCloud data:', data);

            if (data) {
                // Construire une adresse formatée
                const parts = [];
                if (data.locality) parts.push(data.locality);
                if (data.city) parts.push(data.city);
                if (data.principalSubdivision) parts.push(data.principalSubdivision);
                if (data.countryName) parts.push(data.countryName);

                return parts.join(', ');
            }

            return null;
        } catch (error) {
            console.error('Error fetching location data:', error);
            return null;
        }
    }

    // --- UI Updates ---
    function showLoading(message) {
        mapLoadingText.textContent = message;
        mapLoadingIndicator.style.display = 'flex';
        console.log(`Loading: ${message}`);
    }

    function hideLoading() {
        mapLoadingIndicator.style.display = 'none';
        console.log("Loading indicator hidden");
    }

    function displayError(message, isPersistent = false) {
        console.error("Error:", message);
        if (resultsPlaceholder) {
            resultsPlaceholder.textContent = message;
            resultsPlaceholder.style.color = 'red';
            resultsPlaceholder.style.display = 'block';
        } else {
            alert(message);
        }
        if (!isPersistent) {
            // Hide temporary errors after delay?
        }
        hideLoading();
    }

    // --- Map Interaction ---
    function updateRadiusCircle(radiusMeters) {
        if (!userLocation) return;

        if (!radiusCircle) {
            radiusCircle = L.circle(userLocation, {
                radius: radiusMeters,
                weight: 1,
                color: 'var(--primary-color)',
                fillColor: 'var(--primary-color)',
                fillOpacity: 0.15
            }).addTo(map);
        } else {
            radiusCircle.setRadius(radiusMeters);
            radiusCircle.setLatLng(userLocation);
        }
    }

    function recenterMap() {
        if (userLocation) {
            map.setView(userLocation, 15);
        } else {
            locateUser();
        }
    }

    // --- Event Listeners Setup ---
    radiusSelect.addEventListener('change', (e) => {
        currentRadius = parseInt(e.target.value, 10);
        updateRadiusCircle(currentRadius);
        if (userLocation) {
            findNearbyMosques(userLocation.lat, userLocation.lng, currentRadius);
        }
    });

    recenterMapBtn.addEventListener('click', recenterMap);
    useCurrentLocationBtn.addEventListener('click', locateUser);

    // --- Mosque Finding Logic (Overpass API) ---
    let currentSearchController = null;

    async function findNearbyMosques(lat, lon, radius) {
        console.log(`Finding mosques within ${radius}m of ${lat}, ${lon}`);
        showLoading(translate('mosques.loadingMosques'));
        resultsPlaceholder.style.display = 'none';
        mosquesListContainer.innerHTML = '';
        mosqueMarkersLayer.clearLayers();

        if (currentSearchController) {
            currentSearchController.abort();
        }
        currentSearchController = new AbortController();
        const signal = currentSearchController.signal;

        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const query = `
            [out:json][timeout:30];
            (
              node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
              way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
              relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
              node["building"="mosque"](around:${radius},${lat},${lon});
              way["building"="mosque"](around:${radius},${lat},${lon});
              relation["building"="mosque"](around:${radius},${lat},${lon});
            );
            out center; 
        `;

        try {
            const response = await fetch(overpassUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `data=${encodeURIComponent(query)}`,
                signal: signal
            });

            console.log('Overpass API response. Status:', response.status);
            if (!response.ok) {
                throw new Error(`${translate('mosques.apiError')} (${response.status} ${response.statusText})`);
            }

            const data = await response.json();
            console.log('Overpass API response parsed successfully.');
            currentSearchController = null;

            console.log('Parsing Overpass response...');
            const mosques = parseOverpassResponse(data, lat, lon);
            console.log(`Parsed ${mosques.length} mosques. Displaying...`);
            displayMosques(mosques, radius);
            console.log('Mosques displayed.');
            hideLoading();

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Search request aborted.');
                return;
            }
            console.error('Error fetching or processing mosques:', error);
            currentSearchController = null;
            hideLoading();
            let apiErrorMessage = translate('mosques.genericError');
            if (error.message.includes(translate('mosques.apiError'))) {
                apiErrorMessage = error.message;
            }
            displayError(apiErrorMessage);
            mosquesListContainer.innerHTML = '';
            resultsPlaceholder.textContent = apiErrorMessage;
            resultsPlaceholder.style.color = 'red';
            resultsPlaceholder.style.display = 'block';
        }
    }

    // --- Response Parsing & Display ---
    function parseOverpassResponse(data, userLat, userLon) {
        const mosques = [];
        if (!data || !data.elements) return mosques;

        data.elements.forEach(element => {
            let lat, lon, center;
            if (element.type === 'node') {
                lat = element.lat;
                lon = element.lon;
            } else if (element.center) {
                lat = element.center.lat;
                lon = element.center.lon;
                center = element.center;
            } else {
                return;
            }

            const name = element.tags?.[`name:${currentLanguage}`] || element.tags?.name || null;
            const distance = calculateDistance(userLat, userLon, lat, lon);

            if (!mosques.some(m => m.lat.toFixed(6) === lat.toFixed(6) && m.lon.toFixed(6) === lon.toFixed(6))) {
                mosques.push({
                    id: element.id,
                    name: name,
                    lat: lat,
                    lon: lon,
                    distance: distance,
                    tags: element.tags || {},
                    type: element.type,
                    center: center
                });
            }
        });

        return mosques.sort((a, b) => a.distance - b.distance);
    }

    // --- Display Mosques ---  
    function displayMosques(mosques, radiusMeters) {
        console.log(`Displaying ${mosques.length} mosques for radius ${radiusMeters}m`);
        mosquesListContainer.innerHTML = ''; // Clear previous results
        mosqueMarkersLayer.clearLayers(); // Clear previous markers

        const resultsCountSpan = document.getElementById('resultsCount');
        if (resultsCountSpan) {
            resultsCountSpan.textContent = `(${mosques.length})`;
        }

        if (mosques.length === 0) {
            resultsPlaceholder.textContent = translate('mosques.noResultsInRadius', { radius: (radiusMeters / 1000) });
            resultsPlaceholder.style.color = 'var(--text-color-light)';
            resultsPlaceholder.style.display = 'block';
            return;
        }

        resultsPlaceholder.style.display = 'none';

        const mosqueIcon = L.divIcon({
            html: '<i class="fas fa-mosque mosque-icon"></i>',
            className: 'mosque-marker',
            iconSize: [24, 24],
            iconAnchor: [12, 24],
            popupAnchor: [0, -24]
        });

        mosques.forEach(mosque => {
            // --- Add Marker to Map ---
            const marker = L.marker([mosque.lat, mosque.lon], { icon: mosqueIcon })
                .addTo(mosqueMarkersLayer)
                .bindPopup(`<b>${mosque.name || translate('mosques.unnamed')}</b><br>${translate('mosques.distanceAway', { distance: (mosque.distance / 1000).toFixed(1) })}`);

            // --- Create Result Card ---
            const card = document.createElement('div');
            card.className = 'mosque-card';
            card.innerHTML = `
                <div class="mosque-card-header">
                    <div class="mosque-card-name">${mosque.name || translate('mosques.unnamed')}</div>
                    <div class="mosque-card-distance">
                         <i class="fas fa-route"></i> 
                         <span>${translate('mosques.distanceAway', { distance: (mosque.distance / 1000).toFixed(1) })}</span>
                    </div>
                    <div class="mosque-card-address" data-lat="${mosque.lat}" data-lon="${mosque.lon}">
                        <i class="fas fa-map-pin"></i>
                        <span>${translate('mosques.addressLoading')}</span>
                    </div>
                </div>
                <div class="mosque-card-actions">
                    <a href="#" class="itinerary-btn" data-lat="${mosque.lat}" data-lon="${mosque.lon}" target="_blank" rel="noopener noreferrer">
                        <i class="fas fa-directions"></i> ${translate('mosques.itinerary')}
                    </a>
                     <a href="https://www.openstreetmap.org/?mlat=${mosque.lat}&mlon=${mosque.lon}#map=17/${mosque.lat}/${mosque.lon}" 
                        title="${translate('mosques.openInOSM')}" target="_blank" rel="noopener noreferrer" class="osm-link-btn">
                         <i class="fas fa-external-link-alt"></i>
                     </a>
                </div>
            `;
            mosquesListContainer.appendChild(card);

            // Add event listener for itinerary button
            const itineraryBtn = card.querySelector('.itinerary-btn');
            itineraryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const destLat = e.currentTarget.dataset.lat;
                const destLon = e.currentTarget.dataset.lon;
                // Construct Google Maps Directions URL
                const mapsUrl = userLocation
                    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLon}&travelmode=driving`
                    : `https://www.google.com/maps?q=${destLat},${destLon}`;
                window.open(mapsUrl, '_blank');
            });

            // Fetch address asynchronously
            fetchAddressForDisplay(mosque.lat, mosque.lon, card.querySelector('.mosque-card-address span'));

            // Highlight card and marker on hover/click
            card.addEventListener('mouseenter', () => marker.openPopup());
            marker.on('click', () => {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                card.classList.add('highlighted');
                setTimeout(() => card.classList.remove('highlighted'), 1500);
            });
        });
    }

    // --- Address Fetching ---
    async function fetchAddressForDisplay(lat, lon, elementToUpdate) {
        elementToUpdate.textContent = translate('mosques.addressLoading');

        try {
            // Utiliser BigDataCloud qui est compatible CORS 
            const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${currentLanguage}`;
            console.log('Fetching address with URL:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`BigDataCloud API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Address data:', data);

            if (data) {
                // Construire une adresse formatée avec plus de détails
                const parts = [];
                if (data.locality) parts.push(data.locality);
                if (data.city) parts.push(data.city);
                if (data.principalSubdivision) parts.push(data.principalSubdivision);
                if (data.countryName) parts.push(data.countryName);

                const address = parts.join(', ');
                elementToUpdate.textContent = address || translate('mosques.addressNotFound');
            } else {
                throw new Error('No address data found');
            }
        } catch (error) {
            console.error("Error fetching address:", error);
            elementToUpdate.textContent = translate('mosques.addressNotFound');
            elementToUpdate.style.fontStyle = 'italic';
        }
    }

    // --- Helper Function: Calculate Distance (Haversine formula) ---
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const d = R * c; // in metres
        return d;
    }

    // --- Initial Load ---
    initMap();
}); 