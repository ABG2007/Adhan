/**
 * translations.js
 * Contains translations for the AdhanApp interface in multiple languages
 */

const translations = {
    // Français
    fr: {
        appTitle: "Horaires de Prière",
        nextPrayer: "Prochaine Prière",
        prayers: {
            fajr: "Fajr",
            sunrise: "Shuruq",
            dhuhr: "Dhuhr",
            asr: "Asr",
            maghrib: "Maghrib",
            isha: "Isha"
        },
        prayerListTitle: "Horaires des Prières",
        dateFormat: {
            day: "dimanche,lundi,mardi,mercredi,jeudi,vendredi,samedi",
            month: "janvier,février,mars,avril,mai,juin,juillet,août,septembre,octobre,novembre,décembre"
        },
        settings: {
            title: "Paramètres",
            calculationMethod: "Méthode de Calcul",
            sectionCalculationMethod: "Méthode de Calcul",
            asrMethod: "Méthode Asr",
            sectionAsrMethod: "Méthode Asr",
            asrStandard: "Standard (Shafi, Maliki, Hanbali)",
            asrHanafi: "Hanafi",
            timeFormat: "Format de l'Heure",
            sectionTimeFormat: "Format de l'Heure",
            time12h: "12 heures (AM/PM)",
            time24h: "24 heures",
            notifications: "Notifications",
            sectionNotifications: "Notifications",
            enableAudioNotif: "Activer les notifications audio",
            adhanSound: "Son de l'Adhan",
            prayerReminder: "Rappel avant la prière",
            minutesBefore: "minutes avant",
            timeAdjustments: "Ajustements des Horaires (minutes)",
            sectionTimeAdjustments: "Ajustements des Horaires (minutes)",
            colorTheme: "Thème de Couleur",
            sectionColorTheme: "Thème de Couleur",
            save: "Enregistrer",
            reset: "Réinitialiser",
            test: "Test",
            aboutAppButton: "À propos de l'application"
        },
        location: {
            title: "Choisir votre localisation",
            loading: "Chargement de la localisation...",
            error: "Impossible d'obtenir la position.",
            searchPlaceholder: "Entrez une ville ou un pays...",
            useCurrentPosition: "Utiliser ma position actuelle",
            or: "OU",
            change: "Changer",
            currentLocationUnknownName: "Position actuelle"
        },
        about: {
            title: "À propos de l'application",
            version: "Version",
            description: "Adhan est une application de prière islamique conçue pour fournir des horaires de prière précis et des notifications pour les cinq prières quotidiennes.",
            description2: "L'application utilise des méthodes de calcul réputées et prend en charge plusieurs langues pour servir la communauté musulmane mondiale.",
            features: "Fonctionnalités principales",
            feature1: "Horaires de prière précis basés sur votre localisation",
            feature2: "Notifications audio pour chaque prière",
            feature3: "Support multilingue (Français, Anglais, Arabe, etc.)",
            feature4: "Thèmes de couleur personnalisables",
            feature5: "Mode hors-ligne",
            feature6: "Interface réactive pour mobile et bureau",
            credits: "Crédits",
            developedWith: "Développé par ABG pour la communauté musulmane",
            copyright: "Tous droits réservés.",
            aboutAppButton: "À propos de l'application"
        },
        footer: {
            findMosques: "Trouver des mosquées à proximité",
            copyrightText: "Tous droits réservés."
        }
    },

    // Anglais
    en: {
        appTitle: "Prayer Times",
        nextPrayer: "Next Prayer",
        prayers: {
            fajr: "Fajr",
            sunrise: "Sunrise",
            dhuhr: "Dhuhr",
            asr: "Asr",
            maghrib: "Maghrib",
            isha: "Isha"
        },
        prayerListTitle: "Prayer Times",
        dateFormat: {
            day: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday",
            month: "January,February,March,April,May,June,July,August,September,October,November,December"
        },
        settings: {
            title: "Settings",
            calculationMethod: "Calculation Method",
            sectionCalculationMethod: "Calculation Method",
            asrMethod: "Asr Method",
            sectionAsrMethod: "Asr Method",
            asrStandard: "Standard (Shafi, Maliki, Hanbali)",
            asrHanafi: "Hanafi",
            timeFormat: "Time Format",
            sectionTimeFormat: "Time Format",
            time12h: "12 hours (AM/PM)",
            time24h: "24 hours",
            notifications: "Notifications",
            sectionNotifications: "Notifications",
            enableAudioNotif: "Enable audio notifications",
            adhanSound: "Adhan Sound",
            prayerReminder: "Prayer reminder",
            minutesBefore: "minutes before",
            timeAdjustments: "Time Adjustments (minutes)",
            sectionTimeAdjustments: "Time Adjustments (minutes)",
            colorTheme: "Color Theme",
            sectionColorTheme: "Color Theme",
            save: "Save",
            reset: "Reset",
            test: "Test",
            aboutAppButton: "About the Application"
        },
        location: {
            title: "Choose Location",
            useCurrentPosition: "Use my current location",
            or: "OR",
            searchPlaceholder: "...Search for a city",
            change: "Change"
        },
        about: {
            title: "About the Application",
            version: "Version",
            description: "Adhan is an Islamic prayer app designed to provide accurate prayer times and notifications for the five daily prayers.",
            description2: "The app uses reputable calculation methods and supports multiple languages to serve the global Muslim community.",
            features: "Main Features",
            feature1: "Accurate prayer times based on your location",
            feature2: "Audio notifications for each prayer",
            feature3: "Multilingual support (French, English, Arabic, etc.)",
            feature4: "Customizable color themes",
            feature5: "Offline mode",
            feature6: "Responsive interface for mobile and desktop",
            credits: "Credits",
            developedWith: "Developed by ABG for the Muslim community",
            copyright: "All rights reserved.",
            aboutAppButton: "About the Application"
        },
        footer: {
            findMosques: "Find nearby mosques",
            copyrightText: "All rights reserved."
        }
    },

    // Arabe
    ar: {
        appTitle: "أوقات الصلاة",
        nextPrayer: "الصلاة التالية",
        prayers: {
            fajr: "الفجر",
            sunrise: "الشروق",
            dhuhr: "الظهر",
            asr: "العصر",
            maghrib: "المغرب",
            isha: "العشاء"
        },
        prayerListTitle: "مواقيت الصلاة",
        dateFormat: {
            day: "الأحد,الإثنين,الثلاثاء,الأربعاء,الخميس,الجمعة,السبت",
            month: "يناير,فبراير,مارس,أبريل,مايو,يونيو,يوليو,أغسطس,سبتمبر,أكتوبر,نوفمبر,ديسمبر"
        },
        settings: {
            title: "الإعدادات",
            calculationMethod: "طريقة الحساب",
            sectionCalculationMethod: "طريقة الحساب",
            asrMethod: "طريقة حساب العصر",
            sectionAsrMethod: "طريقة حساب العصر",
            asrStandard: "قياسي (الشافعي، المالكي، الحنبلي)",
            asrHanafi: "حنفي",
            timeFormat: "تنسيق الوقت",
            sectionTimeFormat: "تنسيق الوقت",
            time12h: "12 ساعة (صباحًا/مساءً)",
            time24h: "24 ساعة",
            notifications: "الإشعارات",
            sectionNotifications: "الإشعارات",
            enableAudioNotif: "تمكين إشعارات الصوت",
            adhanSound: "صوت الأذان",
            prayerReminder: "تذكير قبل الصلاة",
            minutesBefore: "دقائق قبل",
            timeAdjustments: "تعديلات الوقت (بالدقائق)",
            sectionTimeAdjustments: "تعديلات الوقت (بالدقائق)",
            colorTheme: "لون السمة",
            sectionColorTheme: "لون السمة",
            save: "حفظ",
            reset: "إعادة ضبط",
            test: "اختبار",
            aboutAppButton: "حول التطبيق"
        },
        location: {
            title: "اختيار موقع",
            useCurrentPosition: "استخدم موقعي الحالي",
            or: "أو",
            searchPlaceholder: "...البحث عن مدينة",
            change: "تغيير"
        },
        about: {
            title: "حول التطبيق",
            version: "الإصدار",
            description: "آذان هو تطبيق صلاة إسلامي مصمم لتوفير أوقات صلاة دقيقة وإشعارات للصلوات الخمس اليومية.",
            description2: "يستخدم التطبيق طرق حساب معتمدة ويدعم لغات متعددة لخدمة المجتمع الإسلامي العالمي.",
            features: "الميزات الرئيسية",
            feature1: "أوقات صلاة دقيقة بناءً على موقعك",
            feature2: "إشعارات صوتية لكل صلاة",
            feature3: "دعم متعدد اللغات (فرنسي، إنجليزي، عربي، إلخ)",
            feature4: "سمات ألوان قابلة للتخصيص",
            feature5: "وضع عدم الاتصال",
            feature6: "واجهة متجاوبة للجوال وسطح المكتب",
            credits: "الاعتمادات",
            developedWith: "تم تطويره من طرف ABG  للمجتمع الإسلامي",
            copyright: "جميع الحقوق محفوظة.",
            aboutAppButton: "حول التطبيق"
        },
        footer: {
            findMosques: "البحث عن مساجد قريبة",
            copyrightText: "كل الحقوق محفوظة."
        }
    },

    // Espagnol
    es: {
        appTitle: "Horarios de Oración",
        nextPrayer: "Próxima Oración",
        prayers: {
            fajr: "Fajr",
            sunrise: "Amanecer",
            dhuhr: "Dhuhr",
            asr: "Asr",
            maghrib: "Maghrib",
            isha: "Isha"
        },
        prayerListTitle: "Horarios de Oraciones",
        dateFormat: {
            day: "domingo,lunes,martes,miércoles,jueves,viernes,sábado",
            month: "enero,febrero,marzo,abril,mayo,junio,julio,agosto,septiembre,octubre,noviembre,diciembre"
        },
        settings: {
            title: "Ajustes",
            calculationMethod: "Método de Cálculo",
            sectionCalculationMethod: "Método de Cálculo",
            asrMethod: "Método Asr",
            sectionAsrMethod: "Método Asr",
            asrStandard: "Estándar (Shafi, Maliki, Hanbali)",
            asrHanafi: "Hanafi",
            timeFormat: "Formato de Hora",
            sectionTimeFormat: "Formato de Hora",
            time12h: "12 horas (AM/PM)",
            time24h: "24 horas",
            notifications: "Notificaciones",
            sectionNotifications: "Notificaciones",
            enableAudioNotif: "Activar notificaciones de audio",
            adhanSound: "Sonido del Adhan",
            prayerReminder: "Recordatorio de oración",
            minutesBefore: "minutos antes",
            timeAdjustments: "Ajustes de Tiempo (minutos)",
            sectionTimeAdjustments: "Ajustes de Tiempo (minutos)",
            colorTheme: "Tema de Color",
            sectionColorTheme: "Tema de Color",
            save: "Guardar",
            reset: "Reiniciar",
            test: "Probar",
            aboutAppButton: "Acerca de la Aplicación"
        },
        location: {
            title: "Elegir Ubicación",
            useCurrentPosition: "Usar mi ubicación actual",
            or: "O",
            searchPlaceholder: "...Buscar una ciudad",
            change: "Cambiar"
        },
        about: {
            title: "Acerca de la Aplicación",
            version: "Versión",
            description: "Adhan es una aplicación de oración islámica diseñada para proporcionar horarios precisos de oración y notificaciones para las cinco oraciones diarias.",
            description2: "La aplicación utiliza métodos de cálculo acreditados y admite varios idiomas para servir a la comunidad musulmana mundial.",
            features: "Características Principales",
            feature1: "Horarios de oración precisos basados en tu ubicación",
            feature2: "Notificaciones de audio para cada oración",
            feature3: "Soporte multilingüe (Francés, Inglés, Árabe, etc.)",
            feature4: "Temas de colores personalizables",
            feature5: "Modo sin conexión",
            feature6: "Interfaz responsiva para móvil y escritorio",
            credits: "Créditos",
            developedWith: "Desarrollado por ABG para la comunidad musulmana",
            copyright: "Todos los derechos reservados.",
            aboutAppButton: "Acerca de la Aplicación"
        },
        footer: {
            findMosques: "Encontrar mezquitas cercanas",
            copyrightText: "Todos los derechos reservados."
        }
    },

    // Turc
    tr: {
        appTitle: "Namaz Vakitleri",
        nextPrayer: "Sonraki Namaz",
        prayers: {
            fajr: "İmsak",
            sunrise: "Güneş",
            dhuhr: "Öğle",
            asr: "İkindi",
            maghrib: "Akşam",
            isha: "Yatsı"
        },
        prayerListTitle: "Namaz Vakitleri",
        dateFormat: {
            day: "Pazar,Pazartesi,Salı,Çarşamba,Perşembe,Cuma,Cumartesi",
            month: "Ocak,Şubat,Mart,Nisan,Mayıs,Haziran,Temmuz,Ağustos,Eylül,Ekim,Kasım,Aralık"
        },
        settings: {
            title: "Ayarlar",
            calculationMethod: "Hesaplama Yöntemi",
            sectionCalculationMethod: "Hesaplama Yöntemi",
            asrMethod: "İkindi Metodu",
            sectionAsrMethod: "İkindi Metodu",
            asrStandard: "Standart (Şafi, Maliki, Hanbeli)",
            asrHanafi: "Hanefi",
            timeFormat: "Zaman Formatı",
            sectionTimeFormat: "Zaman Formatı",
            time12h: "12 saat (AM/PM)",
            time24h: "24 saat",
            notifications: "Bildirimler",
            sectionNotifications: "Bildirimler",
            enableAudioNotif: "Ses bildirimlerini etkinleştir",
            adhanSound: "Ezan Sesi",
            prayerReminder: "Namaz hatırlatıcısı",
            minutesBefore: "dakika önce",
            timeAdjustments: "Zaman Ayarlamaları (dakika)",
            sectionTimeAdjustments: "Zaman Ayarlamaları (dakika)",
            colorTheme: "Renk Teması",
            sectionColorTheme: "Renk Teması",
            save: "Kaydet",
            reset: "Sıfırla",
            test: "Test",
            aboutAppButton: "Uygulama Hakkında"
        },
        location: {
            title: "Konum Seç",
            useCurrentPosition: "Mevcut konumumu kullan",
            or: "VEYA",
            searchPlaceholder: "...Bir şehir ara",
            change: "Değiştir"
        },
        about: {
            title: "Uygulama Hakkında",
            version: "Sürüm",
            description: "Adhan, beş günlük namaz için doğru namaz vakitlerini ve bildirimleri sağlamak üzere tasarlanmış bir İslami namaz uygulamasıdır.",
            description2: "Uygulama, küresel Müslüman toplumuna hizmet vermek için güvenilir hesaplama yöntemleri kullanır ve birden fazla dili destekler.",
            features: "Ana Özellikler",
            feature1: "Konumunuza dayalı doğru namaz vakitleri",
            feature2: "Her namaz için sesli bildirimler",
            feature3: "Çok dilli destek (Fransızca, İngilizce, Arapça, vb.)",
            feature4: "Kişiselleştirilebilir renk temaları",
            feature5: "Çevrimdışı mod",
            feature6: "Mobil ve masaüstü için duyarlı arayüz",
            credits: "Krediler",
            developedWith: "Müslüman topluluğu için ABG tarafından geliştirilmiştir",
            copyright: "Tüm hakları saklıdır.",
            aboutAppButton: "Uygulama Hakkında"
        },
        footer: {
            findMosques: "Yakındaki camileri bul",
            copyrightText: "Tüm hakları saklıdır."
        }
    },

    // Allemand
    de: {
        appTitle: "Gebetszeiten",
        nextPrayer: "Nächstes Gebet",
        prayers: {
            fajr: "Fajr",
            sunrise: "Sonnenaufgang",
            dhuhr: "Dhuhr",
            asr: "Asr",
            maghrib: "Maghrib",
            isha: "Isha"
        },
        prayerListTitle: "Gebetszeiten",
        dateFormat: {
            day: "Sonntag,Montag,Dienstag,Mittwoch,Donnerstag,Freitag,Samstag",
            month: "Januar,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember"
        },
        settings: {
            title: "Einstellungen",
            calculationMethod: "Berechnungsmethode",
            sectionCalculationMethod: "Berechnungsmethode",
            asrMethod: "Asr-Methode",
            sectionAsrMethod: "Asr-Methode",
            asrStandard: "Standard (Schafi, Maliki, Hanbali)",
            asrHanafi: "Hanafi",
            timeFormat: "Zeitformat",
            sectionTimeFormat: "Zeitformat",
            time12h: "12 Stunden (AM/PM)",
            time24h: "24 Stunden",
            notifications: "Benachrichtigungen",
            sectionNotifications: "Benachrichtigungen",
            enableAudioNotif: "Audiobenachrichtigungen aktivieren",
            adhanSound: "Adhan-Ton",
            prayerReminder: "Gebetserinnerung",
            minutesBefore: "Minuten vorher",
            timeAdjustments: "Zeitanpassungen (Minuten)",
            sectionTimeAdjustments: "Zeitanpassungen (Minuten)",
            colorTheme: "Farbthema",
            sectionColorTheme: "Farbthema",
            save: "Speichern",
            reset: "Zurücksetzen",
            test: "Test",
            aboutAppButton: "Über die Anwendung"
        },
        location: {
            title: "Standort auswählen",
            useCurrentPosition: "Meinen aktuellen Standort verwenden",
            or: "ODER",
            searchPlaceholder: "...Stadt suchen",
            change: "Ändern"
        },
        about: {
            title: "Über die Anwendung",
            version: "Version",
            description: "Adhan ist eine islamische Gebets-App, die genaue Gebetszeiten und Benachrichtigungen für die fünf täglichen Gebete bereitstellt.",
            description2: "Die App verwendet renommierte Berechnungsmethoden und unterstützt mehrere Sprachen, um der weltweiten muslimischen Gemeinschaft zu dienen.",
            features: "Hauptfunktionen",
            feature1: "Genaue Gebetszeiten basierend auf Ihrem Standort",
            feature2: "Audiobenachrichtigungen für jedes Gebet",
            feature3: "Mehrsprachige Unterstützung (Französisch, Englisch, Arabisch, usw.)",
            feature4: "Anpassbare Farbthemen",
            feature5: "Offline-Modus",
            feature6: "Responsive Oberfläche für Mobil- und Desktop-Geräte",
            credits: "Danksagungen",
            developedWith: "Entwickelt von der ABG für die muslimische Gemeinschaft",
            copyright: "Alle Rechte vorbehalten.",
            aboutAppButton: "Über die Anwendung"
        },
        footer: {
            findMosques: "Moscheen in der Nähe finden",
            copyrightText: "Alle Rechte vorbehalten."
        }
    },

    // Indonésien
    id: {
        appTitle: "Waktu Sholat",
        nextPrayer: "Sholat Berikutnya",
        prayers: {
            fajr: "Subuh",
            sunrise: "Terbit",
            dhuhr: "Dzuhur",
            asr: "Ashar",
            maghrib: "Maghrib",
            isha: "Isya"
        },
        prayerListTitle: "Jadwal Sholat",
        dateFormat: {
            day: "Minggu,Senin,Selasa,Rabu,Kamis,Jumat,Sabtu",
            month: "Januari,Februari,Maret,April,Mei,Juni,Juli,Agustus,September,Oktober,November,Desember"
        },
        settings: {
            title: "Pengaturan",
            calculationMethod: "Metode Perhitungan",
            sectionCalculationMethod: "Metode Perhitungan",
            asrMethod: "Metode Ashar",
            sectionAsrMethod: "Metode Ashar",
            asrStandard: "Standar (Syafi'i, Maliki, Hanbali)",
            asrHanafi: "Hanafi",
            timeFormat: "Format Waktu",
            sectionTimeFormat: "Format Waktu",
            time12h: "12 jam (AM/PM)",
            time24h: "24 jam",
            notifications: "Notifikasi",
            sectionNotifications: "Notifikasi",
            enableAudioNotif: "Aktifkan notifikasi audio",
            adhanSound: "Suara Adzan",
            prayerReminder: "Pengingat sholat",
            minutesBefore: "menit sebelumnya",
            timeAdjustments: "Penyesuaian Waktu (menit)",
            sectionTimeAdjustments: "Penyesuaian Waktu (menit)",
            colorTheme: "Tema Warna",
            sectionColorTheme: "Tema Warna",
            save: "Simpan",
            reset: "Atur Ulang",
            test: "Tes",
            aboutAppButton: "Tentang Aplikasi"
        },
        location: {
            title: "Pilih Lokasi",
            useCurrentPosition: "Gunakan posisi saya saat ini",
            or: "ATAU",
            searchPlaceholder: "...Cari kota",
            change: "Ubah"
        },
        about: {
            title: "Tentang Aplikasi",
            version: "Versi",
            description: "Adhan adalah aplikasi salat Islam yang dirancang untuk memberikan waktu salat yang akurat dan notifikasi untuk lima salat harian.",
            description2: "Aplikasi ini menggunakan metode perhitungan terpercaya dan mendukung berbagai bahasa untuk melayani komunitas Muslim global.",
            features: "Fitur Utama",
            feature1: "Waktu salat yang akurat berdasarkan lokasi Anda",
            feature2: "Notifikasi audio untuk setiap salat",
            feature3: "Dukungan multibahasa (Prancis, Inggris, Arab, dll.)",
            feature4: "Tema warna yang dapat disesuaikan",
            feature5: "Mode offline",
            feature6: "Antarmuka responsif untuk seluler dan desktop",
            credits: "Kredit",
            developedWith: "Dikembangkan oleh ABG untuk komunitas Muslim",
            copyright: "Semua hak dilindungi undang-undang.",
            aboutAppButton: "Tentang Aplikasi"
        },
        footer: {
            findMosques: "Temukan masjid terdekat",
            copyrightText: "Hak cipta dilindungi undang-undang."
        }
    }
};
