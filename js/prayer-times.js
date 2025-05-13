/**
 * prayer-times.js
 * Local calculation of Islamic prayer times
 * Based on PrayTimes library by Hamid Zarrabi-Zadeh
 */

class PrayerTimes {
    constructor() {
        // Time Names
        this.timeNames = {
            fajr: 'Fajr',
            sunrise: 'Shuruq',
            dhuhr: 'Dhuhr',
            asr: 'Asr',
            sunset: 'Sunset',
            maghrib: 'Maghrib',
            isha: 'Isha',
        };

        // Calculation Methods
        this.methods = {
            MWL: {
                name: 'Muslim World League',
                params: { fajr: 18, isha: 17 }
            },
            ISNA: {
                name: 'Islamic Society of North America (ISNA)',
                params: { fajr: 15, isha: 15 }
            },
            Egypt: {
                name: 'Egyptian General Authority of Survey',
                params: { fajr: 19.5, isha: 17.5 }
            },
            Makkah: {
                name: 'Umm Al-Qura University, Makkah',
                params: { fajr: 18.5, isha: '90 min' }
            },
            Karachi: {
                name: 'University of Islamic Sciences, Karachi',
                params: { fajr: 18, isha: 18 }
            },
            Tehran: {
                name: 'Institute of Geophysics, University of Tehran',
                params: { fajr: 17.7, isha: 14, maghrib: 4.5, midnight: 'Jafari' }
            },
            Jafari: {
                name: 'Shia Ithna-Ashari, Leva Institute, Qum',
                params: { fajr: 16, isha: 14, maghrib: 4, midnight: 'Jafari' }
            },
            Gulf: {
                name: 'Gulf Region',
                params: { fajr: 19.5, isha: '90 min' }
            },
            Kuwait: {
                name: 'Kuwait',
                params: { fajr: 18, isha: 17.5 }
            },
            Qatar: {
                name: 'Qatar',
                params: { fajr: 18, isha: '90 min' }
            },
            Singapore: {
                name: 'Majlis Ugama Islam Singapura, Singapore',
                params: { fajr: 20, isha: 18 }
            },
            France: {
                name: 'Union Organization Islamic de France',
                params: { fajr: 12, isha: 12 }
            },
            Turkey: {
                name: 'Diyanet İşleri Başkanlığı, Turkey',
                params: { fajr: 18, isha: 17 }
            },
            Russia: {
                name: 'Spiritual Administration of Muslims of Russia',
                params: { fajr: 16, isha: 15 }
            }
        };

        // Default Parameters
        this.calcMethod = 'MWL';
        this.asrJuristic = 0; // 0 for Shafi'i, 1 for Hanafi
        this.adjustHighLats = 0; // 0 for none, 1 for middle of night, 2 for 1/7th, 3 for angle/60th
        this.timeFormat = '24h'; // '12h' or '24h'
        this.timeSuffixes = ['AM', 'PM'];
        this.invalidTime = '-----';

        // Time Adjustments (in minutes)
        this.timeAdjustments = {
            fajr: 0,
            sunrise: 0,
            dhuhr: 0,
            asr: 0,
            maghrib: 0,
            isha: 0
        };

        // Calculation Parameters
        this.settings = {
            imsak: '10 min',
            dhuhr: '0 min',
            maghrib: '0 min',
            midnight: 'Standard' // 'Standard' (mid sunset to sunrise) or 'Jafari' (mid sunset to fajr)
        };

        // Degree-Based Calculations
        this.methodParams = {}; // Will be initialized when method is set
    }

    /**
     * Initialize calculation parameters
     */
    initMethodParams() {
        const params = this.methods[this.calcMethod].params;
        for (const prop in params) {
            if (params.hasOwnProperty(prop)) {
                this.methodParams[prop] = params[prop];
            }
        }
    }

    /**
     * Set calculation method
     * @param {string} method - The calculation method name
     */
    setMethod(method) {
        if (this.methods[method]) {
            this.calcMethod = method;
            this.initMethodParams();
        }
    }

    /**
     * Set Asr juristic method
     * @param {number} juristic - 0 for Shafi'i, 1 for Hanafi
     */
    setAsrJuristic(juristic) {
        this.asrJuristic = juristic;
    }

    /**
     * Set time adjustments
     * @param {Object} adjustments - Object with time adjustments in minutes
     */
    setTimeAdjustments(adjustments) {
        for (const prayer in adjustments) {
            if (this.timeAdjustments.hasOwnProperty(prayer)) {
                this.timeAdjustments[prayer] = parseInt(adjustments[prayer]);
            }
        }
    }

    /**
     * Set time format
     * @param {string} format - '12h' or '24h'
     */
    setTimeFormat(format) {
        this.timeFormat = format;
    }

    /**
     * Convert decimal time to formatted time string
     * @param {number} time - Time in decimal notation
     * @returns {string} Formatted time string
     */
    getFormattedTime(time) {
        if (isNaN(time)) {
            return this.invalidTime;
        }

        // Fix for negative times
        time = this.fixhour(time + 0.5 / 60);

        let hours = Math.floor(time);
        const minutes = Math.floor((time - hours) * 60);
        
        // Format hours based on 12h or 24h
        if (this.timeFormat === '12h') {
            const suffix = hours >= 12 ? this.timeSuffixes[1] : this.timeSuffixes[0];
            hours = ((hours + 12 - 1) % 12) + 1;
            return `${hours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
        } else {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Calculate prayer times for a given date and coordinates
     * @param {Date} date - The date object
     * @param {number} latitude - The latitude
     * @param {number} longitude - The longitude
     * @param {number} timezone - The timezone offset in hours
     * @returns {Object} Prayer times object
     */
    getTimes(date, latitude, longitude, timezone) {
        this.initMethodParams();
        
        // Set default timezone if not provided
        timezone = timezone || this.getTimeZone(date);
        
        // Set coordinates
        const jDate = this.julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - longitude / (15 * 24);

        // Calculate prayer times
        const times = {
            imsak: this.computePrayerTime(jDate, this.methodParams.imsak, latitude, 'imsak'),
            fajr: this.computePrayerTime(jDate, this.methodParams.fajr, latitude, 'fajr'),
            sunrise: this.computeDayPortion(jDate, 0.833, latitude, 'sunrise'),
            dhuhr: this.computeMidDay(jDate, 'dhuhr'),
            asr: this.computeAsr(jDate, this.asrJuristic, latitude, 'asr'),
            sunset: this.computeDayPortion(jDate, 0.833, latitude, 'sunset'),
            maghrib: this.computePrayerTime(jDate, this.methodParams.maghrib, latitude, 'maghrib'),
            isha: this.computePrayerTime(jDate, this.methodParams.isha, latitude, 'isha'),
            midnight: this.computeMidnight(jDate, 'midnight')
        };

        // Adjust times with time zone and daylight saving time
        for (const i in times) {
            if (times.hasOwnProperty(i)) {
                times[i] += timezone;
            }
        }

        // Add adjustments
        for (const i in this.timeAdjustments) {
            if (times.hasOwnProperty(i)) {
                times[i] += this.timeAdjustments[i] / 60;
            }
        }

        // Format times
        const result = {};
        for (const i in times) {
            if (times.hasOwnProperty(i) && this.timeNames[i]) {
                result[i] = this.getFormattedTime(times[i]);
            }
        }

        return result;
    }

    /**
     * Calculate prayer times by API for a given date and coordinates or city
     * This only acts as a proxy to show compatibility with the direct calculation version
     * @param {Date} date - The date object
     * @param {Object} params - The parameters for calculation
     * @returns {Promise} Promise that resolves to prayer times object
     */
    getTimesByApi(date, params) {
        // This will be implemented in api-handler.js
        console.warn('getTimesByApi should be called from api-handler.js');
        return Promise.resolve({});
    }

    // ------------------ Helper Functions ------------------

    /**
     * Get timezone for a given date
     * @param {Date} date - The date object
     * @returns {number} Timezone offset in hours
     */
    getTimeZone(date) {
        return -date.getTimezoneOffset() / 60;
    }

    /**
     * Convert Gregorian date to Julian day
     * @param {number} year - Year in Gregorian calendar
     * @param {number} month - Month in Gregorian calendar
     * @param {number} day - Day in Gregorian calendar
     * @returns {number} Julian day
     */
    julian(year, month, day) {
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        const a = Math.floor(year / 100);
        const b = 2 - a + Math.floor(a / 4);
        return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524.5;
    }

    /**
     * Compute mid-day (Dhuhr)
     * @param {number} jDate - Julian date
     * @param {string} time - Prayer time name
     * @returns {number} Time in decimal notation
     */
    computeMidDay(jDate, time) {
        const eqt = this.sunPosition(jDate + 0.5).equation;
        let noon = 12 - eqt;
        
        // Dhuhr adjustment
        if (time === 'dhuhr' && this.settings.dhuhr !== '0 min') {
            const adjustment = parseInt(this.settings.dhuhr);
            noon += adjustment / 60;
        }
        
        return noon;
    }

    /**
     * Compute Asr time
     * @param {number} jDate - Julian date
     * @param {number} juristic - Asr juristic method (0 for Shafi'i, 1 for Hanafi)
     * @param {number} latitude - The latitude
     * @param {string} time - Prayer time name
     * @returns {number} Time in decimal notation
     */
    computeAsr(jDate, juristic, latitude, time) {
        // Shadow factor
        const factor = juristic === 1 ? 2 : 1;
        
        const decl = this.sunPosition(jDate + 0.5).declination;
        const angle = -this.darctan(1 / (factor + this.dtan(Math.abs(latitude - decl))));
        
        return this.computeTime(jDate, angle, latitude, time);
    }

    /**
     * Compute prayer time
     * @param {number} jDate - Julian date
     * @param {number|string} angle - Angle or time string
     * @param {number} latitude - The latitude
     * @param {string} time - Prayer time name
     * @returns {number} Time in decimal notation
     */
    computePrayerTime(jDate, angle, latitude, time) {
        if (typeof angle === 'string' && angle.includes('min')) {
            const minutes = parseInt(angle);
            const base = time === 'imsak' ? 'fajr' : (time === 'maghrib' || time === 'isha' ? 'sunset' : 'sunrise');
            const baseTime = this.computeDayPortion(jDate, 0.833, latitude, base);
            return baseTime + (time === 'imsak' ? -minutes / 60 : minutes / 60);
        }
        
        return this.computeTime(jDate, angle, latitude, time);
    }

    /**
     * Compute time for a given angle
     * @param {number} jDate - Julian date
     * @param {number} angle - Angle in degrees
     * @param {number} latitude - The latitude
     * @param {string} time - Prayer time name
     * @returns {number} Time in decimal notation
     */
    computeTime(jDate, angle, latitude, time) {
        const decl = this.sunPosition(jDate).declination;
        const noon = this.computeMidDay(jDate, time);
        const t = 1/15 * this.darccos((-this.dsin(angle) - this.dsin(decl) * this.dsin(latitude)) / 
                                       (this.dcos(decl) * this.dcos(latitude)));
        
        return noon + (time === 'fajr' || time === 'imsak' || time === 'sunrise' ? -t : t);
    }

    /**
     * Compute portion of day for sunrise/sunset
     * @param {number} jDate - Julian date
     * @param {number} angle - Angle in degrees
     * @param {number} latitude - The latitude
     * @param {string} time - Prayer time name
     * @returns {number} Time in decimal notation
     */
    computeDayPortion(jDate, angle, latitude, time) {
        return this.computeTime(jDate, 0.833, latitude, time);
    }

    /**
     * Compute midnight time
     * @param {number} jDate - Julian date
     * @param {string} time - Prayer time name
     * @returns {number} Time in decimal notation
     */
    computeMidnight(jDate, time) {
        if (this.settings.midnight === 'Jafari') {
            const fajr = this.computePrayerTime(jDate + 1, this.methodParams.fajr, 0, 'fajr');
            const sunset = this.computeDayPortion(jDate, 0.833, 0, 'sunset');
            return sunset + (fajr - sunset) / 2;
        } else {
            const sunset = this.computeDayPortion(jDate, 0.833, 0, 'sunset');
            const sunrise = this.computeDayPortion(jDate + 1, 0.833, 0, 'sunrise');
            return sunset + (sunrise - sunset) / 2;
        }
    }

    /**
     * Calculate sun position
     * @param {number} jd - Julian date
     * @returns {Object} Object with declination and equation of time
     */
    sunPosition(jd) {
        const D = jd - 2451545.0;
        const g = this.fixangle(357.529 + 0.98560028 * D);
        const q = this.fixangle(280.459 + 0.98564736 * D);
        const L = this.fixangle(q + 1.915 * this.dsin(g) + 0.020 * this.dsin(2 * g));
        
        const e = 23.439 - 0.00000036 * D;
        
        const RA = this.darctan2(this.dcos(e) * this.dsin(L), this.dcos(L)) / 15;
        const eqt = q / 15 - this.fixhour(RA);
        const decl = this.darcsin(this.dsin(e) * this.dsin(L));
        
        return { declination: decl, equation: eqt };
    }

    // ------------------ Trigonometric Functions ------------------
    
    /**
     * Degree to radian conversion
     * @param {number} d - Angle in degrees
     * @returns {number} Angle in radians
     */
    dtr(d) { return (d * Math.PI) / 180.0; }
    
    /**
     * Radian to degree conversion
     * @param {number} r - Angle in radians
     * @returns {number} Angle in degrees
     */
    rtd(r) { return (r * 180.0) / Math.PI; }

    /**
     * Sine of angle in degrees
     * @param {number} d - Angle in degrees
     * @returns {number} Sine value
     */
    dsin(d) { return Math.sin(this.dtr(d)); }
    
    /**
     * Cosine of angle in degrees
     * @param {number} d - Angle in degrees
     * @returns {number} Cosine value
     */
    dcos(d) { return Math.cos(this.dtr(d)); }
    
    /**
     * Tangent of angle in degrees
     * @param {number} d - Angle in degrees
     * @returns {number} Tangent value
     */
    dtan(d) { return Math.tan(this.dtr(d)); }
    
    /**
     * Arc cosine in degrees
     * @param {number} x - Cosine value
     * @returns {number} Angle in degrees
     */
    darccos(x) { return this.rtd(Math.acos(x)); }
    
    /**
     * Arc sine in degrees
     * @param {number} x - Sine value
     * @returns {number} Angle in degrees
     */
    darcsin(x) { return this.rtd(Math.asin(x)); }
    
    /**
     * Arc tangent in degrees
     * @param {number} x - Tangent value
     * @returns {number} Angle in degrees
     */
    darctan(x) { return this.rtd(Math.atan(x)); }
    
    /**
     * Arc tangent of y/x in degrees
     * @param {number} y - Y coordinate
     * @param {number} x - X coordinate
     * @returns {number} Angle in degrees
     */
    darctan2(y, x) { return this.rtd(Math.atan2(y, x)); }

    /**
     * Fix angle to be between 0 and 360 degrees
     * @param {number} a - Angle in degrees
     * @returns {number} Fixed angle in degrees
     */
    fixangle(a) {
        a = a - 360.0 * Math.floor(a / 360.0);
        return a < 0 ? a + 360.0 : a;
    }

    /**
     * Fix hour to be between 0 and 24
     * @param {number} a - Hour value
     * @returns {number} Fixed hour value
     */
    fixhour(a) {
        a = a - 24.0 * Math.floor(a / 24.0);
        return a < 0 ? a + 24.0 : a;
    }
}

// Export the class for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrayerTimes;
}
