# Proje Yapısı Rehberi

## Ne Değişti?
Eski `ders.html` dosyasındaki 10.455 satırlık inline `<script>` bloğu 22 ayrı kaynak dosyasına bölündü. `bash build.sh` ile hepsi tekrar `ders.html`'e birleştirilir — çıktı orijinalle birebir aynı.

## Nasıl Kullanılır?
1. `src/` klasöründeki ilgili dosyayı düzenle
2. `bash build.sh` çalıştır
3. `ders.html` güncellenir, tarayıcıda yenile

## Dosya Yapısı
```
├── ders.html               ← build.sh tarafından oluşturulur
├── build.sh                ← Derleme scripti
├── _html_before.html       ← HTML üst kısım (script öncesi)
├── _html_after.html        ← HTML alt kısım (script sonrası)
└── src/
    ├── 01-firebase.js      ← Firebase import/config/init + navigasyon haritası
    ├── 02-core.js          ← DOM cache, render throttle
    ├── 03-sidebar.js       ← Yan menü
    ├── 04-playlist-modal.js← Playlist ekleme modalı
    ├── 05-countdown.js     ← YKS geri sayım
    ├── 06-calendar.js      ← Takvim motoru
    ├── 07-lessons.js       ← Dersler + konular + bulut ayar
    ├── 08-notes-init.js    ← Not sistemi başlatma
    ├── 09-auth.js          ← Kullanıcı giriş + veri yükleme
    ├── 10-notes-ui.js      ← Not kartları + modal + medya + kaydetme
    ├── 11-exams.js         ← Deneme ekleme/grafik/detay
    ├── 12-panels.js        ← Sürüklenebilir paneller
    ├── 13-planner.js       ← Haftalık planlayıcı + bugün
    ├── 14-tasks.js         ← Görev modal + aksiyon (en büyük: 1567 satır)
    ├── 15-playlist-cards.js← Playlist kart çizme + video seçim
    ├── 16-side-panel.js    ← Yan panel
    ├── 17-analytics.js     ← Analiz merkezi + hedef net
    ├── 18-settings.js      ← Ders renkleri ayarları
    ├── 19-export.js        ← Dışa aktarma
    ├── 20-profile.js       ← Profil + çoklu program
    ├── 21-stats.js         ← İstatistikler
    └── 22-calendar-colors.js ← Takvim renk + tık ikonu
```

## Önemli Not
- `src/` dosyalarının sırası kritik! Orijinal koddaki sıra korunmuştur.
- `08-notes-init.js` ve `10-notes-ui.js` ayrı çünkü `09-auth.js` orijinalde bu ikisinin arasında yer alıyor.
- `build.sh` çıktısı orijinal `ders.html` ile byte-for-byte aynıdır.
