        // [DOM-CACHE] DOM CACHE — Sık erişilen elementler bir kez sorgulanır.
        // Yeni element eklersen buraya da ekle.
        const DOM = {
            // Modallar
            saveConfirmModal:    document.getElementById('saveConfirmModal'),
            cancelConfirmModal:  document.getElementById('cancelConfirmModal'),
            customAlertModal:    document.getElementById('customAlertModal'),
            selectPlaylistModal: document.getElementById('selectPlaylistModal'),
            examFilterModal:     document.getElementById('examFilterModal'),
            // Sidebar
            sideMenu:            document.getElementById('sideMenu'),
            menuOverlay:         document.getElementById('menuOverlay'),
            // Form elementleri — sık kullanılan
            examTitleInput:      document.getElementById('examTitleInput'),
            examDateInput:       document.getElementById('examDateInput'),
            taskQuestionCount:   document.getElementById('taskQuestionCount'),
            noteStartDate:       document.getElementById('noteStartDate'),
            noteEndDate:         document.getElementById('noteEndDate'),
            profNewPassword:     document.getElementById('profNewPassword'),
            profConfirmPassword: document.getElementById('profConfirmPassword'),
            profEditFieldSelect: document.getElementById('profEditFieldSelect'),
            // Filter
            efMinNet:            document.getElementById('ef-minNet'),
            efMaxNet:            document.getElementById('ef-maxNet'),
            statsTrackWrapper:   document.getElementById('statsTrackWrapper'),
            // Butonlar
            yesTaskCompleteBtn:      document.getElementById('yesTaskCompleteBtn'),
            yesTaskMultiCompleteBtn: document.getElementById('yesTaskMultiCompleteBtn'),
            selectFromPlaylistBtn:   document.getElementById('selectFromPlaylistBtn'),
            duplicateZoneText:       document.getElementById('duplicateZoneText'),
            customAlertMessage:      document.getElementById('customAlertMessage'),
            customSpeedInput:        document.getElementById('customSpeedInput'),
        };

        // ============================================================
        // [RENDER] RENDER THROTTLE SİSTEMİ
        // Art arda gelen çağrıları tek bir frame'e sıkıştırır.
        // Bir fonksiyon kısa sürede N kez çağrılsa da DOM sadece 1 kez güncellenir.
        // ============================================================
        const _renderTimers = {};
        function scheduleRender(key, fn, delay = 16) {
            if (_renderTimers[key]) return; // Zaten planlandı, geç
            _renderTimers[key] = requestAnimationFrame(() => {
                delete _renderTimers[key];
                fn();
            });
        }

