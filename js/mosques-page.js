document.addEventListener('DOMContentLoaded', () => {
    // Fonction de traduction qui lit toujours la langue courante depuis le localStorage
    const translate = (key, replacements = {}) => {
        const lang = localStorage.getItem('adhan_language') || 'fr';
        if (typeof window.translations !== 'undefined' && typeof window.translations[lang] !== 'undefined') {
            let text = key.split('.').reduce((obj, i) => obj && obj[i], window.translations[lang]);
            if (typeof text === 'string') {
                if (replacements) {
                    Object.keys(replacements).forEach(k => {
                        text = text.replace(`{${k}}`, replacements[k]);
                    });
                }
                return text;
            }
        }
        // Fallback si la traduction n'est pas trouvée ou si window.translations n'est pas défini
        // Essayons de récupérer une traduction de secours directement depuis l'objet translations si la clé est complète
        if (typeof translations !== 'undefined' && typeof translations[lang] !== 'undefined') {
             let fallbackText = key.split('.').reduce((obj, i) => obj && obj[i], translations[lang]);
             if (typeof fallbackText === 'string') return fallbackText; // Retourne la clé si la traduction n'est pas trouvée
        }
        return key.substring(key.lastIndexOf('.') + 1); // Fallback simple au dernier segment de la clé
    };

    // Met à jour les éléments statiques (titre, labels, etc.) avec la langue courante
    function applyStaticTranslations() {
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = translate(key);
        });
        document.querySelectorAll('[data-translate-attr]').forEach(element => {
            const [attr, key] = element.getAttribute('data-translate-attr').split(',');
            if (attr && key) {
                element.setAttribute(attr.trim(), translate(key.trim()));
            }
        });
    }

    // Appliquer les traductions statiques dès que le DOM est prêt
    applyStaticTranslations();

    // Recharge la page si la langue change dans un autre onglet
    window.addEventListener('storage', function(e) {
        if (e.key === 'adhan_language') {
            window.location.reload();
        }
    });

    // --- DOM Elements ---
    const mapElement = document.getElementById('map');
    const radiusSelect = document.getElementById('radiusSelect');
    const recenterMapBtn = document.getElementById('recenterMapBtn');
    const mosquesListContainer = document.getElementById('mosquesList');
    const mapLoadingIndicator = document.getElementById('mapLoadingIndicator');
    const mapLoadingText = document.getElementById('mapLoadingText');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const useCurrentLocationBtn = document.getElementById('useCurrentLocationBtn');
    const mobileSearchInput = document.getElementById('mobileSearchInput');

    // --- Map Variables ---
    let map = null;
    let userMarker = null;
    let radiusCircle = null;
    let mosqueMarkersLayer = L.layerGroup();
    let userLocation = null;
    let currentRadius = parseInt(radiusSelect.value, 10);
    let isUsingManualLocation = false; // Flag to track location mode

    // --- Map Initialization ---
    function initMap() {
        if (!mapElement) return;
        showLoading(translate('mosques.loadingLocation'));
        map = L.map(mapElement, { zoomControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        mosqueMarkersLayer.addTo(map);
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        if (!isMobile()) {
            const lang = localStorage.getItem('adhan_language') || 'fr';
            const PhotonProvider = {
                search: async (queryObject) => {
                    const currentLang = localStorage.getItem('adhan_language') || 'fr';
                    if (!queryObject || typeof queryObject.query !== 'string') return [];
                    const searchTerm = queryObject.query;
                    if (!searchTerm.trim()) return [];
                    try {
                        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(searchTerm)}&limit=5&lang=${currentLang}`);
                        if (!response.ok) throw new Error(`Photon API error: ${response.status}`);
                        const data = await response.json();
                        if (!data.features || !data.features.length) return [];
                        return data.features.map(feature => ({
                            x: feature.geometry.coordinates[0],
                            y: feature.geometry.coordinates[1],
                            label: [feature.properties.name, feature.properties.street, feature.properties.housenumber, feature.properties.city, feature.properties.state, feature.properties.country].filter(Boolean).join(', ') || translate('mosques.unnamed'),
                            bounds: feature.properties.extent ? [[feature.properties.extent[1], feature.properties.extent[0]], [feature.properties.extent[3], feature.properties.extent[2]]] : null,
                            raw: feature
                        }));
                    } catch (error) {
                        console.error('Photon search error:', error);
                        return [];
                    }
                }
            };
            const searchControl = new GeoSearch.GeoSearchControl({
                provider: PhotonProvider,
                style: 'bar', showMarker: false, showPopup: false,
                marker: { icon: L.divIcon({ html: '' }), draggable: false },
                popupFormat: ({ result }) => result.label,
                resultFormat: ({ result }) => result.label,
                maxMarkers: 1, retainZoomLevel: false, animateZoom: true, autoClose: true,
                searchLabel: translate('mosques.geoSearchPlaceholder'),
                keepResult: true, notFoundMessage: translate('mosques.genericError')
            });
            map.addControl(searchControl);

            /* // Début du commentaire du bloc de stylisation
            const geosearchContainer = searchControl.getContainer(); 
            if (geosearchContainer) {
                console.log("Attempting to style GeoSearch container via JS:", geosearchContainer);
                geosearchContainer.style.position = 'absolute';
                geosearchContainer.style.left = '10px';
                geosearchContainer.style.top = '70px';      
                geosearchContainer.style.right = 'auto';
                geosearchContainer.style.width = 'calc(100% - 20px)'; 
                geosearchContainer.style.maxWidth = '300px'; 
                geosearchContainer.style.margin = '0';
                geosearchContainer.style.zIndex = '1000'; 

                const inputElement = geosearchContainer.querySelector('form input[type="text"]');
                if (inputElement) {
                    inputElement.style.width = '100%';
                }
            } else {
                console.error("GeoSearch container not found in JS styling attempt.");
            }
            */ // Fin du commentaire du bloc de stylisation

            map.on('geosearch/showlocation', onGeoSearchLocationSelected);
        }
        locateUser();
    }

    function updateMapWithLocation(latLng, locationName) {
        const finalLocationName = locationName || translate('mosques.userLocation');
        if (!userMarker) {
            const locationIcon = L.divIcon({ html: '<i class="fas fa-map-marker-alt user-location-icon"></i>', className: 'user-location-marker', iconSize: [30, 30], iconAnchor: [15, 30] });
            userMarker = L.marker(latLng, { icon: locationIcon }).addTo(map);
        } else {
            userMarker.setLatLng(latLng);
        }
        userMarker.bindPopup(finalLocationName).openPopup();
        updateRadiusCircle(currentRadius);
        if (map.getZoom() < 13) map.setView(latLng, 13); else map.panTo(latLng);
    }

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

    function locateUser() {
        showLoading(translate('mosques.loadingLocation'));
        console.log('Attempting map.locate()');
        map.locate({ setView: true, maxZoom: 15, timeout: 10000, enableHighAccuracy: true });
    }

    function onGeoSearchLocationSelected(e) {
        userLocation = L.latLng(e.location.y, e.location.x);
        isUsingManualLocation = true;
        console.log('GeoSearch location selected:', e.location.label, userLocation);

        hideLoading();
        updateMapWithLocation(userLocation, e.location.label);
        findNearbyMosques(userLocation.lat, userLocation.lng, currentRadius);
    }

    async function getBigDataCloudReverseData(lat, lon) {
        try {
            console.log('Getting reverse geocoding data for:', lat, lon);

            const lang = localStorage.getItem('adhan_language') || 'fr';
            // Utiliser BigDataCloud qui est compatible CORS et ne nécessite pas de clé API
            const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`;
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

    radiusSelect.addEventListener('change', (e) => {
        currentRadius = parseInt(e.target.value, 10);
        updateRadiusCircle(currentRadius);
        if (userLocation) {
            findNearbyMosques(userLocation.lat, userLocation.lng, currentRadius);
        }
    });

    recenterMapBtn.addEventListener('click', recenterMap);
    useCurrentLocationBtn.addEventListener('click', locateUser);

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

    function parseOverpassResponse(data, userLat, userLon) {
        const mosques = [];
        if (!data || !data.elements) return mosques;

        const lang = localStorage.getItem('adhan_language') || 'fr';

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

            const name = element.tags?.[`name:${lang}`] || element.tags?.name || null;
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

    async function fetchAddressForDisplay(lat, lon, elementToUpdate) {
        elementToUpdate.textContent = translate('mosques.addressLoading');

        try {
            const lang = localStorage.getItem('adhan_language') || 'fr';
            // Utiliser BigDataCloud qui est compatible CORS 
            const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=${lang}`;
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

    // Initialisation de la carte
    initMap();

    function isMobile() {
        return window.matchMedia('(max-width: 600px)').matches;
    }

    // Afficher la barre de recherche mobile si sur mobile
    if (isMobile()) {
        const mobileBar = document.getElementById('mobileSearchBar');
        if (mobileBar) mobileBar.style.display = 'flex';
    }

    // Logique de recherche mobile améliorée
    let mobileResultsDiv = null;
    let mobileResults = [];
    let selectedResultIndex = -1;

    async function searchAddressMobile(query) {
      if (!query || query.length < 3) return;
      const lang = localStorage.getItem('selectedLanguage') || 'fr';
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=${lang}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.features && data.features.length > 0) {
        showMobileSearchResults(data.features);
      } else {
        showMobileSearchResults([]);
      }
    }

    function showMobileSearchResults(features) {
      if (!mobileResultsDiv) {
        mobileResultsDiv = document.createElement('div');
        mobileResultsDiv.id = 'mobileSearchResults';
        mobileResultsDiv.style.position = 'absolute';
        mobileResultsDiv.style.top = '48px';
        mobileResultsDiv.style.left = '10px';
        mobileResultsDiv.style.right = '10px';
        mobileResultsDiv.style.background = '#fff';
        mobileResultsDiv.style.zIndex = '1200';
        mobileResultsDiv.style.borderRadius = '0 0 8px 8px';
        mobileResultsDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        document.getElementById('mobileSearchBar').appendChild(mobileResultsDiv);
      }
      mobileResultsDiv.innerHTML = '';
      mobileResults = features;
      selectedResultIndex = -1;
      if (features.length === 0) {
        mobileResultsDiv.innerHTML = '<div style="padding:8px;">Aucun résultat</div>';
        return;
      }
      features.forEach((f, idx) => {
        const item = document.createElement('div');
        item.style.padding = '8px';
        item.style.cursor = 'pointer';
        item.textContent = [f.properties.name, f.properties.city, f.properties.country].filter(Boolean).join(', ');
        item.tabIndex = 0;
        item.onmouseenter = () => highlightResult(idx);
        item.onclick = () => selectResult(idx);
        mobileResultsDiv.appendChild(item);
      });
    }

    function highlightResult(idx) {
      const children = mobileResultsDiv.children;
      for (let i = 0; i < children.length; i++) {
        children[i].style.background = (i === idx) ? '#e0f0ff' : '';
      }
      selectedResultIndex = idx;
    }

    function selectResult(idx) {
      const f = mobileResults[idx];
      if (!f) return;
      map.setView([f.geometry.coordinates[1], f.geometry.coordinates[0]], 15);
      findNearbyMosques(f.geometry.coordinates[1], f.geometry.coordinates[0], currentRadius);
      mobileResultsDiv.innerHTML = '';
      mobileSearchInput.value = [f.properties.name, f.properties.city, f.properties.country].filter(Boolean).join(', ');
    }

    if (mobileSearchInput) {
      mobileSearchInput.addEventListener('input', () => {
        if (mobileSearchInput.value.length >= 3) {
          searchAddressMobile(mobileSearchInput.value);
        } else if (mobileResultsDiv) {
          mobileResultsDiv.innerHTML = '';
        }
      });
      mobileSearchInput.addEventListener('keydown', (e) => {
        if (!mobileResults || mobileResults.length === 0) return;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (selectedResultIndex < mobileResults.length - 1) {
            highlightResult(selectedResultIndex + 1);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (selectedResultIndex > 0) {
            highlightResult(selectedResultIndex - 1);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedResultIndex >= 0) {
            selectResult(selectedResultIndex);
          } else if (mobileResults.length > 0) {
            selectResult(0);
          }
        }
      });
    }
}); 