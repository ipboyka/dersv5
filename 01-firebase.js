        // ╔════════════════════════════════════════════════════════════════╗
        // ║              ANA UYGULAMA MODÜLÜ — NAVİGASYON HARİTASI       ║
        // ╠════════════════════════════════════════════════════════════════╣
        // ║                                                              ║
        // ║  Aramak istediğin bölümün etiketini kopyala ve               ║
        // ║  Ctrl+F ile yapıştırarak hızlıca o bölüme atla.             ║
        // ║                                                              ║
        // ║  [FIREBASE]     Firebase bağlantısı ve kurulum               ║
        // ║  [DOM-CACHE]    Sık kullanılan DOM elementleri               ║
        // ║  [RENDER]       Render throttle sistemi                      ║
        // ║  [SIDEBAR]      Yan menü (sidebar) motoru                    ║
        // ║  [PLAYLIST]     Playlist modal ve çekme otomasyonu           ║
        // ║  [YKS-SAYAC]    YKS 2026 geri sayım sayacı                  ║
        // ║  [TAKVIM]       Takvim motoru (interaktif)                   ║
        // ║  [DERSLER]      Dinamik ders ve menü motoru                  ║
        // ║  [KONULAR]      Konu verileri ve takip sistemi               ║
        // ║  [BULUT-AYAR]   Bulut ayar senkronizasyon motoru             ║
        // ║  [NOTLAR]       Firebase not motoru (alt koleksiyonlu)       ║
        // ║  [AUTH]         Kullanıcı giriş durumu dinleyici             ║
        // ║  [NOT-KART]     Not kartlarını ekrana çizme                  ║
        // ║  [NOT-MODAL]    Not penceresi açma/kapatma işlemleri         ║
        // ║  [MEDYA]        Akıllı medya motoru                         ║
        // ║  [NOT-KAYDET]   Not kaydetme tetikleyicisi                   ║
        // ║  [DENEME]       Deneme ekleme motoru                         ║
        // ║  [TOOLTIP]      Küresel ipucu (tooltip) motoru               ║
        // ║  [DENEME-KART]  Denemeleri ekrana çizme motoru               ║
        // ║  [GRAFIK]       Gelişim grafiği (Chart.js) motoru            ║
        // ║  [DENEME-DETAY] Deneme görüntüleme/düzenleme/kaydetme       ║
        // ║  [PANEL]        Sürüklenebilir paneller (boyutlandırma)      ║
        // ║  [PLANLAYICI]   Haftalık planlayıcı ve görev motoru          ║
        // ║  [BUGUN]        Ana ekran bugünün görevleri                  ║
        // ║  [GOREV-MODAL]  Görev görüntüleme/ekleme/düzenleme          ║
        // ║  [GOREV-AKSYON] Görev aksiyon (çoğalt/sil/tamamla) motoru   ║
        // ║  [PL-KART]      Playlist kart çizme ve yönetim              ║
        // ║  [PL-VIDEO]     Video seçimi ve hız matematiği              ║
        // ║  [YAN-PANEL]    Yan panel sistemi                            ║
        // ║  [ANALIZ]       Deneme analiz merkezi ve grafikler           ║
        // ║  [HEDEF-NET]    Hedef net ve ayarlar sistemi                 ║
        // ║  [DERS-RENK]    Planlayıcı ayarları (ders renkleri)         ║
        // ║  [VIDEO-IZLE]   Video izleyici modal sistemi                 ║
        // ║  [DISA-AKTAR]   Program indirme ve dışa aktarma             ║
        // ║  [PROFIL]       Profil ekranı ve kayıt motoru               ║
        // ║  [COK-PROGRAM]  Çoklu program (profil) yönetimi             ║
        // ║  [ISTATISTIK]   İstatistikler modalı ve hesaplama           ║
        // ║  [TAKVIM-RENK]  Takvim özel renk ve koşul motoru           ║
        // ║  [TIK-IKON]     Tamamlanma ikonu seçim/kaydetme             ║
        // ║                                                              ║
        // ╚════════════════════════════════════════════════════════════════╝

        // [FIREBASE] Firebase bağlantısı ve kurulum
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
        import { getAuth, onAuthStateChanged, signOut, updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
        import { getFirestore, doc, setDoc, getDoc, collection, getDocs, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAKpk8odLUEZTJh_4qvyrcu59t4eoNNIe8",
            authDomain: "tripturkey-79e75.firebaseapp.com",
            projectId: "tripturkey-79e75",
            storageBucket: "tripturkey-79e75.firebasestorage.app",
            messagingSenderId: "69790477258",
            appId: "1:69790477258:web:6ad1f6bc4f9bc437e2bd33"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

