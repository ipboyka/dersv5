        // [TAKVIM-RENK] --- TAKVİM ÖZEL RENK VE KOŞUL MOTORU ---
        window.calColors = JSON.parse(localStorage.getItem('calColors')) || null;

        const defaultCalColors = {
            bgStyleCompleted: 'solid', completed: '#20c997', bgOpacityCompleted: '1', 
            bgStyleUncompleted: 'solid', uncompleted: '#f87171', bgOpacityUncompleted: '1', 
            bgStylePlanned: 'solid', planned: '#e6f2ff', bgOpacityPlanned: '1', 
            bgStyleEmpty: 'solid', empty: '#f8f9fa', bgOpacityEmpty: '1', 
            bgStyleToday: 'gradient', today: '#6f42c1', bgOpacityToday: '1',
            textCompleted: '#ffffff', textOpacityCompleted: '1', textUncompleted: '#ffffff', textOpacityUncompleted: '1', 
            textPlanned: '#007bff', textOpacityPlanned: '1', textEmpty: '#6c757d', textOpacityEmpty: '1', textToday: '#ffffff', textOpacityToday: '1',
            borderStyleCompleted: 'none', borderColorCompleted: '#20c997', borderOpacityCompleted: '1',
            borderStyleUncompleted: 'none', borderColorUncompleted: '#f87171', borderOpacityUncompleted: '1',
            borderStylePlanned: 'solid', borderColorPlanned: '#007bff', borderOpacityPlanned: '1',
            borderStyleEmpty: 'dashed', borderColorEmpty: '#6c757d', borderOpacityEmpty: '1',
            borderStyleToday: 'none', borderColorToday: '#6f42c1', borderOpacityToday: '1',
            // KOŞUL VARSAYILANLARI
            condAllTasks: true, condTimeActive: false, condTimeMins: 360, condQActive: false, condQCount: 100
        };

        document.getElementById('calSettingsBtn')?.addEventListener('click', () => {
            ['Completed', 'Uncompleted', 'Planned', 'Empty', 'Today'].forEach(t => {
                const bgSty = window.calColors?.['bgStyle'+t] || defaultCalColors['bgStyle'+t]; setCalBgStyle(t, bgSty);
                document.getElementById('calColor' + t).value = window.calColors?.[t.toLowerCase()] || defaultCalColors[t.toLowerCase()];
                const bgOpac = window.calColors?.['bgOpacity'+t] !== undefined ? window.calColors['bgOpacity'+t] : defaultCalColors['bgOpacity'+t];
                const bgOpIn = document.getElementById('calBgOpacity' + t); if(bgOpIn) { bgOpIn.value = bgOpac; document.getElementById('lblBgOpac' + t).innerText = Math.round(bgOpac * 100) + '%'; }
                document.getElementById('calTextColor' + t).value = window.calColors?.['text'+t] || defaultCalColors['text'+t];
                const txtOpac = window.calColors?.['textOpacity'+t] !== undefined ? window.calColors['textOpacity'+t] : defaultCalColors['textOpacity'+t];
                const txtOpIn = document.getElementById('calTextOpacity' + t); if(txtOpIn) { txtOpIn.value = txtOpac; document.getElementById('lblTextOpac' + t).innerText = Math.round(txtOpac * 100) + '%'; }
                const bStyle = window.calColors?.['borderStyle'+t] || defaultCalColors['borderStyle'+t];
                const bOpac = window.calColors?.['borderOpacity'+t] !== undefined ? window.calColors['borderOpacity'+t] : defaultCalColors['borderOpacity'+t];
                setCalBStyle(t, bStyle); document.getElementById('calBorderColor' + t).value = window.calColors?.['borderColor'+t] || defaultCalColors['borderColor'+t];
                const opInput = document.getElementById('calBorderOpacity' + t); if(opInput){ opInput.value = bOpac; document.getElementById('lblOpac' + t).innerText = Math.round(bOpac * 100) + '%'; }
            });

            // KOŞUL EKRANINI YÜKLE
            document.getElementById('calCondAllTasks').checked = window.calColors?.condAllTasks !== undefined ? window.calColors.condAllTasks : defaultCalColors.condAllTasks;
            document.getElementById('calCondTimeAct').checked = window.calColors?.condTimeActive || defaultCalColors.condTimeActive;
            const tMins = window.calColors?.condTimeMins !== undefined ? window.calColors.condTimeMins : defaultCalColors.condTimeMins;
            document.getElementById('calCondTimeH').value = Math.floor(tMins / 60);
            document.getElementById('calCondTimeM').value = tMins % 60;
            document.getElementById('calCondQAct').checked = window.calColors?.condQActive || defaultCalColors.condQActive;
            document.getElementById('calCondQCount').value = window.calColors?.condQCount !== undefined ? window.calColors.condQCount : defaultCalColors.condQCount;

            document.getElementById('calSettingsModal').style.display = 'flex';
        });

        const closeCalSettings = () => document.getElementById('calSettingsModal').style.display = 'none';

        const hasCalColorChanges = () => {
            const current = {};
            ['Completed', 'Uncompleted', 'Planned', 'Empty', 'Today'].forEach(t => {
                current['bgStyle'+t] = document.getElementById('calBgStyle' + t).value; current[t.toLowerCase()] = document.getElementById('calColor' + t).value;
                current['bgOpacity'+t] = document.getElementById('calBgOpacity' + t).value; current['text'+t] = document.getElementById('calTextColor' + t).value;
                current['textOpacity'+t] = document.getElementById('calTextOpacity' + t).value; current['borderStyle'+t] = document.getElementById('calBorderStyle' + t).value;
                current['borderColor'+t] = document.getElementById('calBorderColor' + t).value; current['borderOpacity'+t] = document.getElementById('calBorderOpacity' + t).value;
            });
            current['condAllTasks'] = document.getElementById('calCondAllTasks').checked;
            current['condTimeActive'] = document.getElementById('calCondTimeAct').checked;
            current['condTimeMins'] = (parseInt(document.getElementById('calCondTimeH').value) || 0) * 60 + (parseInt(document.getElementById('calCondTimeM').value) || 0);
            current['condQActive'] = document.getElementById('calCondQAct').checked;
            current['condQCount'] = parseInt(document.getElementById('calCondQCount').value) || 0;

            const saved = { ...defaultCalColors, ...window.calColors };
            return Object.keys(current).some(key => String(current[key]).toLowerCase() !== String(saved[key]).toLowerCase());
        };

        const handleCloseWithConfirm = () => { if (hasCalColorChanges()) { document.getElementById('calColorCancelConfirmModal').style.display = 'flex'; } else { closeCalSettings(); } };
        document.getElementById('closeCalSettingsModalBtn')?.addEventListener('click', handleCloseWithConfirm);
        document.getElementById('cancelCalSettingsBtn')?.addEventListener('click', handleCloseWithConfirm);
        document.getElementById('yesCalColorCancelBtn')?.addEventListener('click', () => { document.getElementById('calColorCancelConfirmModal').style.display = 'none'; closeCalSettings(); });

        document.getElementById('resetCalColorsBtn')?.addEventListener('click', () => {
            ['Completed', 'Uncompleted', 'Planned', 'Empty', 'Today'].forEach(t => {
                resetBgRow(t, defaultCalColors['bgStyle'+t], defaultCalColors[t.toLowerCase()], defaultCalColors['bgOpacity'+t]);
                document.getElementById('calTextColor' + t).value = defaultCalColors['text'+t]; document.getElementById('calTextOpacity' + t).value = defaultCalColors['textOpacity'+t]; document.getElementById('lblTextOpac' + t).innerText = '100%';
                resetBorderRow(t, defaultCalColors['borderStyle'+t], defaultCalColors['borderColor'+t], defaultCalColors['borderOpacity'+t]);
            });
            document.getElementById('calCondAllTasks').checked = defaultCalColors.condAllTasks;
            document.getElementById('calCondTimeAct').checked = defaultCalColors.condTimeActive;
            document.getElementById('calCondTimeH').value = Math.floor(defaultCalColors.condTimeMins / 60);
            document.getElementById('calCondTimeM').value = defaultCalColors.condTimeMins % 60;
            document.getElementById('calCondQAct').checked = defaultCalColors.condQActive;
            document.getElementById('calCondQCount').value = defaultCalColors.condQCount;
        });

        document.getElementById('saveCalSettingsBtn')?.addEventListener('click', () => {
            if (!hasCalColorChanges()) { closeCalSettings(); return; }
            document.getElementById('calColorSaveConfirmModal').style.display = 'flex';
        });

        document.getElementById('yesCalColorSaveBtn')?.addEventListener('click', () => {
            document.getElementById('calColorSaveConfirmModal').style.display = 'none';
            let newColors = {};
            ['Completed', 'Uncompleted', 'Planned', 'Empty', 'Today'].forEach(t => {
                newColors['bgStyle'+t] = document.getElementById('calBgStyle' + t).value; newColors[t.toLowerCase()] = document.getElementById('calColor' + t).value;
                newColors['bgOpacity'+t] = document.getElementById('calBgOpacity' + t).value; newColors['text'+t] = document.getElementById('calTextColor' + t).value;
                newColors['textOpacity'+t] = document.getElementById('calTextOpacity' + t).value; newColors['borderStyle'+t] = document.getElementById('calBorderStyle' + t).value;
                newColors['borderColor'+t] = document.getElementById('calBorderColor' + t).value; newColors['borderOpacity'+t] = document.getElementById('calBorderOpacity' + t).value;
            });
            newColors['condAllTasks'] = document.getElementById('calCondAllTasks').checked;
            newColors['condTimeActive'] = document.getElementById('calCondTimeAct').checked;
            newColors['condTimeMins'] = (parseInt(document.getElementById('calCondTimeH').value) || 0) * 60 + (parseInt(document.getElementById('calCondTimeM').value) || 0);
            newColors['condQActive'] = document.getElementById('calCondQAct').checked;
            newColors['condQCount'] = parseInt(document.getElementById('calCondQCount').value) || 0;

            window.calColors = newColors;
            localStorage.setItem('calColors', JSON.stringify(window.calColors));
            closeCalSettings();
            if (typeof renderCalendar === 'function') renderCalendar();
            if (document.getElementById('calSummaryHeader')?.style.display === 'flex') { document.getElementById('calBackBtn')?.click(); }
        });

        // [TIK-IKON] === TAMAMLANMA İKONU (TİK) SEÇİM VE KAYDETME MOTORU ===
        document.addEventListener('DOMContentLoaded', () => {
            
            // 1. AŞAMA: Sayfa açıldığında hafızadaki tiki bul ve sisteme yükle. (Yoksa ince tiki seç)
            const savedIcon = localStorage.getItem('plannerCompletedIcon') || "'\\f00c'";
            document.documentElement.style.setProperty('--completed-icon-content', savedIcon);
            
            // 2. AŞAMA: Ayarlar menüsündeki butonların tıklanma ve renk değiştirme ayarı
            const iconLabels = document.querySelectorAll('.settings-icon-option');
            iconLabels.forEach(label => {
                // Önceden seçili olanı yeşil yak
                if (label.getAttribute('data-icon-value') === savedIcon) {
                    label.classList.add('active');
                    label.querySelector('input').checked = true;
                } else {
                    label.classList.remove('active');
                }

                // Tıklandığında diğerlerini söndür, tıklananı yeşil yap
                label.addEventListener('click', function() {
                    iconLabels.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    this.querySelector('input').checked = true;
                });
            });

            // 3. AŞAMA: "Ayarları Kaydet" butonuna basıldığında yeni tiki hafızaya al ve ekrana uygula
            const savePlannerSettingsBtn = document.getElementById('savePlannerSettingsBtn'); 
            if (savePlannerSettingsBtn) {
                savePlannerSettingsBtn.addEventListener('click', () => {
                    const selectedIcon = document.querySelector('input[name="iconChoice"]:checked').value;
                    // Tarayıcı hafızasına kaydet (Sayfa yenilense de gitmez)
                    localStorage.setItem('plannerCompletedIcon', selectedIcon);
                    // CSS değişkenini anında değiştirerek tüm ekranı güncelle
                    document.documentElement.style.setProperty('--completed-icon-content', selectedIcon);
                });
            }
        });

