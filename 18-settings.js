        // [DERS-RENK] --- PLANLAYICI AYARLARI (DERS RENKLERİ) MOTORU ---
        const openPlannerSettingsBtn = document.getElementById('openPlannerSettingsBtn');
        const plannerSettingsModal = document.getElementById('plannerSettingsModal');
        const closePlannerSettingsBtn = document.getElementById('closePlannerSettingsBtn');
        const savePlannerSettingsBtn = document.getElementById('savePlannerSettingsBtn');

        const colorExamRadios = document.getElementsByName('colorExamType');
        const colorAytRadios = document.getElementsByName('colorAytField'); 
        const colorAytContainer = document.getElementById('colorAytFieldContainer');
        const colorSubjectsContainer = document.getElementById('subjectColorsContainer');

        function createUnsavedChangesModal() {
            if(document.getElementById('unsavedColorChangesModal')) return;
            const modalHtml = `
                <div id="unsavedColorChangesModal" class="custom-modal" style="z-index: 3800; display: none; background: rgba(0,0,0,0.5);">
                    <div class="custom-modal-content" style="max-width: 320px; width: 90%; padding: 25px; border-radius: var(--radius-lg); background: var(--color-bg-card); box-shadow: var(--shadow-modal); text-align: center;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 45px; color: #ffc107; margin-bottom: 15px;"></i>
                        <h4 style="margin: 0 0 10px 0; color: var(--color-text-main); font-size: 17px; font-weight: 800;">Kaydedilmemiş Değişiklikler</h4>
                        <p style="font-size: 13px; color: var(--color-text-muted); margin-bottom: 20px;">Renklerde yaptığın değişiklikleri kaydetmeden çıkmak üzeresin. Ne yapmak istersin?</p>
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button id="discardColorBtn" style="flex: 1; padding: 10px; border: 1px solid #ccc; background: var(--color-bg-input); border-radius: var(--radius-md); cursor: pointer; color: var(--color-text-main); font-weight: bold; transition: var(--transition-fast);" onmouseover="this.style.background='#e2e6ea'" onmouseout="this.style.background='#f8f9fa'">Sadece Çık</button>
                            <button id="saveColorBtn" style="flex: 1; padding: 10px; border: none; background: var(--color-success); border-radius: var(--radius-md); cursor: pointer; color: white; font-weight: bold; transition: var(--transition-fast);" onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">Kaydet</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Çık Butonuna Basılırsa (Değişiklikleri Çöpe At)
            document.getElementById('discardColorBtn').addEventListener('click', () => {
                // Hafızayı eski haline geri döndür
                window.subjectColors = JSON.parse(localStorage.getItem('subjectColors')) || {};
                window.hasUnsavedColorChanges = false;
                
                document.getElementById('unsavedColorChangesModal').style.display = 'none';
                if(plannerSettingsModal) plannerSettingsModal.style.display = 'none';
            });

            // Kaydet Butonuna Basılırsa (Normal Kaydetmiş Gibi İşlem Yap)
            document.getElementById('saveColorBtn').addEventListener('click', () => {
                document.getElementById('unsavedColorChangesModal').style.display = 'none';
                if(savePlannerSettingsBtn) savePlannerSettingsBtn.click(); // Asıl kaydet butonunu tetikler
            });
        }

        // Kendi Özel Renk Penceremizi (Modal) HTML'e Otomatik Ekleyen Fonksiyon
        function createCustomColorModal() {
            if(document.getElementById('customColorPaletteModal')) return; 
            
            const modalHtml = `
                <div id="customColorPaletteModal" class="custom-modal" style="z-index: 3700; display: none;">
                    <div class="custom-modal-content" style="max-width: 350px; width: 90%; padding: 25px; border-radius: var(--radius-lg); background: var(--color-bg-card); box-shadow: var(--shadow-modal);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <h4 style="margin: 0; color: var(--color-text-main); font-size: 16px; font-weight: 800;"><i class="fa-solid fa-palette" style="color:#e83e8c;"></i> Özel Renk Seç</h4>
                            <span onclick="document.getElementById('customColorPaletteModal').style.display='none'" style="cursor: pointer; font-size: 26px; color: var(--color-text-muted); line-height: 1; transition: color 0.2s;" onmouseover="this.style.color='#ff4757'" onmouseout="this.style.color='#888'">&times;</span>
                        </div>
                        
                        <div id="customColorGrid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px;">
                        </div>
                        
                        <div style="display: flex; gap: 10px; align-items: center; background: var(--color-bg-input); padding: 10px; border-radius: var(--radius-md); border: 1px solid #e9ecef;">
                            <div id="customColorPreview" style="width: 32px; height: 32px; border-radius: var(--radius-sm); border: 1px solid #ccc; background-color: var(--color-bg-card); flex-shrink: 0; transition: background-color 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);"></div>
                            
                            <div style="display: flex; align-items: center; border: 1px solid #ccc; border-radius: var(--radius-sm); background: var(--color-bg-card); padding: 0 8px; flex: 1; transition: border-color 0.2s;">
                                <span style="color: var(--color-text-muted); font-weight: bold; font-size: 14px;">#</span>
                                <input type="text" id="customHexInput" placeholder="000000" oninput="window.handleHexInput(this)" style="border: none; outline: none; padding: 8px 4px; font-size: 13px; font-weight: bold; color: var(--color-text-secondary); width: 100%; background: transparent;">
                            </div>

                            <button onclick="window.applyCustomColor(document.getElementById('customHexInput').value)" style="background: var(--color-primary); color: white; border: none; padding: 8px 15px; border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; font-weight: bold; transition: background 0.2s;" onmouseover="this.style.background='var(--color-primary-hover)'" onmouseout="this.style.background='var(--color-primary)'">Uygula</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }

        // Dersleri Filtreleyip Ekrana Çizen Fonksiyon
        function renderColorSubjects() {
            if (!colorSubjectsContainer) return;
            createCustomColorModal();

            const examTypeInput = document.querySelector('input[name="colorExamType"]:checked');
            const examType = examTypeInput ? examTypeInput.value : 'TYT';
            const aytFieldInput = document.querySelector('input[name="colorAytField"]:checked');
            const aytField = aytFieldInput ? aytFieldInput.value : 'sayisal';

            let subjectsToRender = [];
            if (typeof lessonData !== 'undefined') {
                if (examType === 'TYT') {
                    subjectsToRender = lessonData.tyt.map(l => l.name || l);
                } else {
                    if (lessonData.ayt && lessonData.ayt[aytField]) {
                        subjectsToRender = lessonData.ayt[aytField].map(l => l.name || l);
                    }
                }
            }
            subjectsToRender = [...new Set(subjectsToRender)].sort();

            const currentPalette = ['#007bff', '#ff4757', '#2ed573', '#ffa502', '#9b59b6'];

            colorSubjectsContainer.innerHTML = '';
            subjectsToRender.forEach(sub => {
                const colorVal = window.subjectColors[sub] || 'var(--color-primary)'; 
                
                let dotsHtml = currentPalette.map(color => {
                    let isSelected = (color === colorVal);
                    const borderStyle = isSelected ? 'border: 2px solid #333; transform: scale(1.2); box-shadow: 0 2px 4px rgba(0,0,0,0.2); opacity: 1;' : 'border: 2px solid transparent; opacity: 0.3;';
                    return `<div class="color-dot" onclick="window.selectSubjectColor('${sub}', '${color}')" style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; cursor: pointer; ${borderStyle} transition: var(--transition-fast);"></div>`;
                }).join('');

                let isCustomSelected = !currentPalette.includes(colorVal);
                let customBgColor = isCustomSelected ? colorVal : '#f1f3f5';
                let customIconColor = isCustomSelected ? '#fff' : '#555';
                let customBorderStyle = isCustomSelected ? 'border: 2px solid #333; transform: scale(1.2); box-shadow: 0 2px 4px rgba(0,0,0,0.2); opacity: 1;' : 'border: 2px solid #ccc; opacity: 0.8;';

                dotsHtml += `
                    <div onclick="window.openCustomColorPalette('${sub}')" style="width: 22px; height: 22px; border-radius: 50%; background-color: ${customBgColor}; color: ${customIconColor}; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: var(--transition-fast); font-weight: bold; ${customBorderStyle}" data-custom-title="Özel Renk Seç">
                        <i class="fa-solid fa-plus" style="font-size: 10px; text-shadow: ${isCustomSelected ? '0 0 2px rgba(0,0,0,0.5)' : 'none'};"></i>
                    </div>
                `;

                colorSubjectsContainer.innerHTML += `
                    <div style="background: var(--color-bg-input); padding: 12px; border-radius: var(--radius-md); border: 1px solid #e2e6ea; display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 11px; font-weight: 800; color: #495057;">${sub}</label>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                            ${dotsHtml}
                        </div>
                    </div>
                `;
            });
        }

        window.selectSubjectColor = function(sub, color) {
            window.subjectColors[sub] = color;
            window.hasUnsavedColorChanges = true;            renderColorSubjects();
        };

        window.openCustomColorPalette = function(sub) {
            window.activeColorSubject = sub; 
            const modal = document.getElementById('customColorPaletteModal');
            const grid = document.getElementById('customColorGrid');
            
            const extendedColorPool = [
                '#ff7675', '#d63031', '#e84393', '#fd79a8',
                '#fdcb6e', '#ffeaa7', '#e17055', '#fab1a0',
                '#00b894', '#55efc4', '#00cec9', '#81ecec',
                '#0984e3', '#74b9ff', '#6c5ce7', '#a29bfe',
                '#2d3436', '#636e72', '#b2bec3', '#dfe6e9' 
            ];
            
            grid.innerHTML = '';
            extendedColorPool.forEach(color => {
                grid.innerHTML += `
                    <div class="custom-palette-color" data-color="${color}" onclick="window.previewCustomColor('${color}')" style="background-color: ${color}; height: 35px; border-radius: var(--radius-md); cursor: pointer; border: 2px solid transparent; transition: var(--transition-fast); box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onmouseover="if(!this.classList.contains('selected')) { this.style.transform='scale(1.15)'; this.style.border='2px solid #333'; }" onmouseout="if(!this.classList.contains('selected')) { this.style.transform='scale(1)'; this.style.border='2px solid transparent'; }"></div>
                `;
            });
            
            const currentColor = window.subjectColors[sub] || '#000000';
            const cleanColor = currentColor.replace(/[^0-9A-Fa-f]/g, '');
            document.getElementById('customHexInput').value = cleanColor;
            window.updateColorPreview(cleanColor);
            window.previewCustomColor(currentColor); 
            
            modal.style.display = 'flex';
        };

        window.previewCustomColor = function(color) {
            const cleanColor = color.replace(/[^0-9A-Fa-f]/g, '');
            document.getElementById('customHexInput').value = cleanColor;
            window.updateColorPreview(cleanColor);
            
            document.querySelectorAll('.custom-palette-color').forEach(el => {
                if (el.getAttribute('data-color') === color) {
                    el.style.transform = 'scale(1.15)';
                    el.style.border = '2px solid #333';
                    el.classList.add('selected');
                } else {
                    el.style.transform = 'scale(1)';
                    el.style.border = '2px solid transparent';
                    el.classList.remove('selected');
                }
            });
        };

        window.handleHexInput = function(inputEl) {
            let cleaned = inputEl.value.replace(/[^0-9A-Fa-f]/g, '');
            
            if (cleaned.length > 6) {
                cleaned = cleaned.substring(0, 6);
            }
            
            inputEl.value = cleaned;
            window.updateColorPreview(cleaned);
            
            document.querySelectorAll('.custom-palette-color').forEach(el => {
                el.style.transform = 'scale(1)';
                el.style.border = '2px solid transparent';
                el.classList.remove('selected');
            });
        };

        window.updateColorPreview = function(cleanColorValue) {
            const previewBox = document.getElementById('customColorPreview');
            if (cleanColorValue.length === 3 || cleanColorValue.length === 6) {
                previewBox.style.backgroundColor = '#' + cleanColorValue;
            } else {
                previewBox.style.backgroundColor = '#f1f3f5'; 
            }
        };

        window.applyCustomColor = function(colorWithoutHash) {
            if (!window.activeColorSubject || !colorWithoutHash) return;
            
            if (colorWithoutHash.length !== 3 && colorWithoutHash.length !== 6) {
                const alertModal = DOM.customAlertModal;
                if (alertModal) {
                    DOM.customAlertMessage.innerText = 'Lütfen geçerli bir renk kodu giriniz (Örn: 000000 veya ff0000).';
                    alertModal.style.display = 'flex';
                }
                return;
            }
            
            const finalColor = '#' + colorWithoutHash;
            window.selectSubjectColor(window.activeColorSubject, finalColor);
            document.getElementById('customColorPaletteModal').style.display = 'none';
        };

        // TYT / AYT değiştiğinde Alt menüyü göster/gizle
        if (colorExamRadios) {
            colorExamRadios.forEach(r => r.addEventListener('change', () => {
                if (colorAytContainer) {
                    colorAytContainer.style.display = (r.value === 'AYT') ? 'flex' : 'none';
                }
                renderColorSubjects();
            }));
        }

        // AYT Alanı değiştiğinde dersleri yenile
        if (colorAytRadios) {
            colorAytRadios.forEach(r => r.addEventListener('change', renderColorSubjects));
        }

        // Modalı Aç
        if (openPlannerSettingsBtn) {
            openPlannerSettingsBtn.addEventListener('click', () => {
                window.hasUnsavedColorChanges = false; 
                plannerSettingsModal.style.display = 'flex';
                
                const savedLayout = localStorage.getItem('plannerLayout') || 'column';
                if (savedLayout === 'row') {
                    document.getElementById('layoutRow').checked = true;
                } else {
                    document.getElementById('layoutCol').checked = true;
                }

                const examTypeInput = document.querySelector('input[name="colorExamType"]:checked');
                const isAytSelected = examTypeInput && examTypeInput.value === 'AYT';
                if (colorAytContainer) {
                    colorAytContainer.style.display = isAytSelected ? 'flex' : 'none';
                }
                
                renderColorSubjects();
            });
        }

        // YENİLENMİŞ: Modalı Kapat (Çarpıya Basıldığında)
        if (closePlannerSettingsBtn) {
            closePlannerSettingsBtn.addEventListener('click', () => {
                // Eğer değişiklik yapılmışsa uyarı penceresini çıkar, yapılmamışsa direkt kapat
                if (window.hasUnsavedColorChanges) {
                    createUnsavedChangesModal(); // Garantile
                    document.getElementById('unsavedColorChangesModal').style.display = 'flex';
                } else {
                    plannerSettingsModal.style.display = 'none';
                }
            });
        }

        // Ayarları Kalıcı Kaydet (Buluta Ekli)
        if (savePlannerSettingsBtn) {
            savePlannerSettingsBtn.addEventListener('click', async () => {
                const btn = savePlannerSettingsBtn;
                const origHTML = btn.innerHTML;
                btn.innerHTML = 'Kaydediliyor...';
                
                // Renk ayarlarını kaydet
                localStorage.setItem('subjectColors', JSON.stringify(window.subjectColors));
                
                // Görüntü (Sütun/Satır) ayarını kaydet
                const selectedLayout = document.querySelector('input[name="settingLayout"]:checked').value;
                localStorage.setItem('plannerLayout', selectedLayout);
                window.plannerLayout = selectedLayout; 
                
                window.hasUnsavedColorChanges = false;
                
                await window.saveGlobalSettings(); // BULUTA KAYDET
                
                plannerSettingsModal.style.display = 'none';
                btn.innerHTML = origHTML;
                
                window.updateWeeklyPlannerView?.();
                window.renderTodayTasks?.();
            });
        }


        // =======================================================
        // DERS FİLTRELEME SİSTEMİ
        // =======================================================

        // Global filtre listesi
        window.filteredSubjects = window.filteredSubjects || [];

        // Modal HTML'ini body'ye ekle (bir kez)
        (function insertFilterModal() {
            if (document.getElementById('plannerFilterModal')) return;
            document.body.insertAdjacentHTML('beforeend', `
                <div id="plannerFilterModal" class="custom-modal" style="z-index:3650; display:none;">
                    <div class="custom-modal-content" style="max-width:460px; width:90%; padding:0; display:flex; flex-direction:column; max-height:85vh;">
                        <div class="modal-header" style="padding:18px 20px;">
                            <h3 style="margin:0; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-filter" style="color:var(--color-primary);"></i> Dersleri Filtrele
                            </h3>
                            <span class="close-modal-btn" id="closePlannerFilterModalBtn">&times;</span>
                        </div>
                        <div class="modal-body" style="padding:16px 20px; overflow-y:auto; flex:1;">
                            <p style="font-size:12px; color:var(--color-text-muted); margin-bottom:14px;">
                                Seçtiğin dersler programda öne çıkar, diğerleri soluklaşır.
                            </p>
                            <div style="margin-bottom:14px;">
                                <div style="font-size:12px; font-weight:800; color:var(--color-primary); margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid var(--color-primary-border);">TYT Dersleri</div>
                                <div id="pf-tyt" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
                            </div>
                            <div>
                                <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid #ffeeba;">
                                    <span style="font-size:12px; font-weight:800; color:#b58900; white-space:nowrap;">AYT Dersleri</span>
                                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                                        <button class="pf-ayt-tab active" data-field="sayisal" onclick="window.pfSetAytTab(this,'sayisal')" style="padding:4px 10px; border-radius:6px; border:1px solid #ffeeba; background:#b58900; color:white; font-size:11px; font-weight:800; cursor:pointer;">Sayısal</button>
                                        <button class="pf-ayt-tab" data-field="ea" onclick="window.pfSetAytTab(this,'ea')" style="padding:4px 10px; border-radius:6px; border:1px solid #ffeeba; background:white; color:#b58900; font-size:11px; font-weight:800; cursor:pointer;">EA</button>
                                        <button class="pf-ayt-tab" data-field="sozel" onclick="window.pfSetAytTab(this,'sozel')" style="padding:4px 10px; border-radius:6px; border:1px solid #ffeeba; background:white; color:#b58900; font-size:11px; font-weight:800; cursor:pointer;">Sözel</button>
                                        <button class="pf-ayt-tab" data-field="dil" onclick="window.pfSetAytTab(this,'dil')" style="padding:4px 10px; border-radius:6px; border:1px solid #ffeeba; background:white; color:#b58900; font-size:11px; font-weight:800; cursor:pointer;">Dil</button>
                                    </div>
                                </div>
                                <div id="pf-ayt" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
                            </div>
                        </div>
                        <div style="padding:14px 20px; border-top:1px solid #eee; display:flex; gap:10px;">
                            <button onclick="window.pfClear()" style="flex:1; padding:10px; border:1px solid #ccc; background:#f8f9fa; border-radius:var(--radius-md); cursor:pointer; font-weight:bold; font-size:13px;">Temizle</button>
                            <button onclick="window.pfApply()" style="flex:1; padding:10px; border:none; background:var(--color-primary); color:white; border-radius:var(--radius-md); cursor:pointer; font-weight:bold; font-size:13px;">Uygula</button>
                        </div>
                    </div>
                </div>
            `);
            document.getElementById('closePlannerFilterModalBtn').addEventListener('click', () => {
                document.getElementById('plannerFilterModal').style.display = 'none';
            });
        })();

        // Mevcut AYT sekmesi
        window._pfAytField = 'sayisal';

        window.pfSetAytTab = function(btn, field) {
            window._pfAytField = field;
            document.querySelectorAll('.pf-ayt-tab').forEach(b => {
                b.style.background = 'white';
                b.style.color = '#b58900';
            });
            btn.style.background = '#b58900';
            btn.style.color = 'white';
            window.pfRender();
        };

        window.pfRender = function() {
            if (typeof lessonData === 'undefined') return;

            // TYT
            const tytEl = document.getElementById('pf-tyt');
            if (!tytEl) return;
            const tytSubjects = [...new Set(lessonData.tyt.map(l => l.name || l))];
            tytEl.innerHTML = tytSubjects.map(sub => {
                const active = window.filteredSubjects.includes(sub);
                return `<button onclick="window.pfToggle('${sub}')" style="padding:7px 14px; border-radius:var(--radius-md); border:1px solid ${active ? 'var(--color-primary)' : 'var(--color-primary-border)'}; background:${active ? 'var(--color-primary)' : 'var(--color-primary-lighter)'}; color:${active ? 'white' : 'var(--color-primary)'}; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s;">${sub}</button>`;
            }).join('');

            // AYT
            const aytEl = document.getElementById('pf-ayt');
            if (!aytEl) return;
            const aytSubjects = lessonData.ayt && lessonData.ayt[window._pfAytField]
                ? [...new Set(lessonData.ayt[window._pfAytField].map(l => l.name || l))]
                : [];
            aytEl.innerHTML = aytSubjects.map(sub => {
                const active = window.filteredSubjects.includes(sub);
                return `<button onclick="window.pfToggle('${sub}')" style="padding:7px 14px; border-radius:var(--radius-md); border:1px solid ${active ? '#b58900' : '#ffeeba'}; background:${active ? '#b58900' : '#fff'}; color:${active ? 'white' : '#b58900'}; font-size:12px; font-weight:700; cursor:pointer; transition:all 0.15s;">${sub}</button>`;
            }).join('');
        };

        window.pfToggle = function(sub) {
            if (window.filteredSubjects.includes(sub)) {
                window.filteredSubjects = window.filteredSubjects.filter(s => s !== sub);
            } else {
                window.filteredSubjects.push(sub);
            }
            window.pfRender();
        };

        window.pfApply = async function() {
            document.getElementById('plannerFilterModal').style.display = 'none';

            // Filtre butonu görünümünü güncelle
            const btn = document.getElementById('openPlannerFilterBtn');
            const clearBtn = document.getElementById('clearPlannerFilterBtn');
            const active = window.filteredSubjects.length > 0;

            if (btn) {
                btn.style.backgroundColor = active ? 'var(--color-primary)' : '';
                btn.style.color = active ? '#fff' : '';
                btn.style.borderColor = active ? 'var(--color-primary)' : '';
                // KÖŞELERİ SIFIRLAYAN KODLAR BURADAN SİLİNDİ! Artık kavisli kalacak.
            }

            if (clearBtn) clearBtn.style.display = active ? 'flex' : 'none';

            // Kaydet ve görünümü güncelle
            if (typeof window.saveGlobalSettings === 'function') await window.saveGlobalSettings();
            window.updateWeeklyPlannerView?.();
            window.renderTodayTasks?.();
        };

        window.pfClear = async function() {
            window.filteredSubjects = [];
            window.pfRender();
            await window.pfApply();
        };

        // Geriye uyumluluk için eski isimleri yönlendir
        window.applyFilters = window.pfApply;
        window.clearFilters = window.pfClear;
        window.renderFilterModalSubjects = window.pfRender;

        // Filtre butonuna listener ekle
        document.getElementById('openPlannerFilterBtn').addEventListener('click', function() {
            window.pfRender();
            document.getElementById('plannerFilterModal').style.display = 'flex';
        });

        // =======================================================




        // ==============================================
        // VİDEO İZLEYİCİ SİSTEMİ
        // ==============================================
        (function() {
            const TR_DAYS   = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];
            const TR_MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];

            let vwWeek    = null;
            let vwDay     = null;
            let vwTask    = null;  // Seçili task objesi
            let vwVideos  = null;
            let vwTitle   = '';
            let vwIdx     = 0;
            let vwWatched = new Set(); // izlendi index'leri

            function dateKey(d) {
                return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            }
            function getMonday(d) {
                const x = new Date(d); const day = x.getDay();
                x.setDate(x.getDate() - day + (day===0?-6:1));
                x.setHours(0,0,0,0); return x;
            }
            function profileId() {
                return document.getElementById('currentPlannerProfile')?.value || 'main_profile';
            }
            function tasksWithVideos(dk) {
                return (userTasks[dk] || []).filter(t =>
                    (t.profileId||'main_profile') === profileId() &&
                    t.taskVideos && t.taskVideos.length > 0
                );
            }
            function getVideoId(v) {
                // Önce doğrudan videoId alanı
                if (v.videoId) return v.videoId;
                // Yoksa thumb'dan çıkar: https://i.ytimg.com/vi/VIDEO_ID/...
                if (v.thumb) {
                    const m = v.thumb.match(/\/vi\/([A-Za-z0-9_-]{11})\//);
                    if (m) return m[1];
                }
                return null;
            }

            // --- Hafta etiketi ---
            function updateWeekLabel() {
                const end = new Date(vwWeek); end.setDate(end.getDate()+6);
                document.getElementById('vwWeekLabel').textContent =
                    `${vwWeek.getDate()} ${TR_MONTHS[vwWeek.getMonth()]} – ${end.getDate()} ${TR_MONTHS[end.getMonth()]}`;
            }

            // --- Gün tabları ---
            function renderDayTabs() {
                const bar = document.getElementById('vwDayTabs');
                bar.innerHTML = '';
                for (let i = 0; i < 7; i++) {
                    const d = new Date(vwWeek);
                    d.setDate(d.getDate()+i);
                    const dk = dateKey(d);
                    const count = tasksWithVideos(dk).length;
                    const isSelected = dk === vwDay;
                    const tab = document.createElement('button');
                    
                    tab.style.cssText = `flex:1; min-width:100px; padding:12px 6px; border:none; border-bottom:3px solid ${isSelected?'#ff3333':'transparent'}; background:${isSelected?'#1a1a24':'transparent'}; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; transition:all 0.2s;`;
                    
                    tab.onmouseover = () => { if(!isSelected) tab.style.background = '#1a1a24'; };
                    tab.onmouseout = () => { if(!isSelected) tab.style.background = 'transparent'; };

                    let badgeBg = isSelected ? (count > 0 ? '#ff3333' : '#2a2a35') : (count > 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)');
                    let badgeColor = isSelected ? (count > 0 ? '#fff' : '#888') : (count > 0 ? '#aaa' : '#555');
                    let badgeShadow = (isSelected && count > 0) ? '0 0 8px rgba(255,51,51,0.4)' : 'none';

                    tab.innerHTML = `
                        <span style="font-size:13px;font-weight:800;color:${isSelected?'#fff':'#888'}; letter-spacing:0.5px;">${TR_DAYS[i]}</span>
                        <span style="font-size:11px;color:${isSelected?'#aaa':'#666'}; font-weight:600;">${d.getDate()} ${TR_MONTHS[d.getMonth()]}</span>
                        <span style="font-size:10px;font-weight:800;background:${badgeBg};color:${badgeColor};border-radius:12px;padding:2px 8px; box-shadow: ${badgeShadow}; transition: 0.2s;">${count} Playlist</span>
                    `;
                    
                    tab.onclick = () => {
                        // YENİ UX: Eğer tıklanan gün zaten seçiliyse, seçimi iptal et ve haftalık görünüme dön
                        if (vwDay === dk) {
                            vwDay = null; // Günü boşa düşür
                            
                            // Arkada video açıksa kapat (önceki düzeltmemizi koruyoruz)
                            const iframe = document.getElementById('vwIframe');
                            if (iframe) iframe.src = '';
                            
                            showPlaylistPane();
                            renderDayTabs();
                            renderPlaylistGrid();
                        } else {
                            selectDay(dk); // Normal gün seçme işlemi
                        }
                    };
                    bar.appendChild(tab);
                }
            }

            // --- Gün seç → playlistler ---
            function selectDay(dk) {
                vwDay = dk;
                vwTask = null;
                vwVideos = null;
                
                // YENİ EKLENEN: Başka bir güne geçildiğinde arkada çalan videoyu tamamen kapatır (sesi keser)
                const iframe = document.getElementById('vwIframe');
                if (iframe) {
                    iframe.src = '';
                }
                
                showPlaylistPane();
                renderDayTabs();
                renderPlaylistGrid();
            }

            function showPlaylistPane() {
                document.getElementById('vwPlaylistPane').style.display = '';
                document.getElementById('vwPlayerPane').style.display = 'none';
                document.getElementById('vwRightPane').style.display = 'none';
            }
            function showPlayerPane() {
                document.getElementById('vwPlaylistPane').style.display = 'none';
                const pp = document.getElementById('vwPlayerPane');
                pp.style.display = 'flex'; pp.style.flexDirection = 'column';
                document.getElementById('vwRightPane').style.display = 'flex';
            }

            // --- Gün seç → playlistler ---
            function renderPlaylistGrid() {
                const grid = document.getElementById('vwPlaylistGrid');
                grid.innerHTML = '';
                
                // GÜN SEÇİLMEMİŞSE "HAFTALIK GENEL BAKIŞ" (7 KOLON) GÖRÜNÜMÜ
                if (!vwDay) {
                    grid.style.display = 'grid';
                    grid.style.gridTemplateColumns = 'repeat(7, 1fr)';
                    grid.style.gap = '15px';
                    grid.style.alignItems = 'start'; 
                    grid.style.minWidth = '900px'; 
                    
                    for (let i = 0; i < 7; i++) {
                        const d = new Date(vwWeek);
                        d.setDate(d.getDate() + i);
                        const dk = dateKey(d);
                        const tasks = tasksWithVideos(dk);
                        
                        const col = document.createElement('div');
                        col.style.display = 'flex';
                        col.style.flexDirection = 'column';
                        col.style.gap = '12px';
                        col.style.background = 'rgba(255,255,255,0.02)';
                        col.style.padding = '12px';
                        col.style.borderRadius = '16px';
                        col.style.border = '1px solid #1f1f27';

                        // KOLON BAŞLIKLARI KALDIRILDI (Üstteki sekmelerle aynı hizada olduğu için gerek yok)

                        if (tasks.length === 0) {
                            // O gün boşsa şık bir ikon göster
                            col.innerHTML = `<div style="text-align:center; color:#444; font-size:12px; font-weight:600; padding: 20px 0;"><i class="fa-solid fa-mug-hot" style="font-size:24px; display:block; margin-bottom:8px; opacity:0.3;"></i>Boş</div>`;
                        } else {
                            // O günün playlistlerini küçük bloklar halinde sırala
                            tasks.forEach(task => {
                                const isCompleted = task.isCompleted === true;
                                const block = document.createElement('div');
                                
                                block.style.cssText = `background: ${isCompleted ? '#101512' : '#1a1a24'}; border: 1px solid ${isCompleted ? '#1f8a3d' : '#2a2a35'}; padding: 8px; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.2); display:flex; flex-direction:column;`;
                                
                                block.onmouseover = () => { block.style.borderColor = isCompleted ? '#28a745' : '#ff3333'; block.style.transform = 'translateY(-3px)'; block.style.boxShadow = '0 6px 15px rgba(0,0,0,0.4)'; };
                                block.onmouseout = () => { block.style.borderColor = isCompleted ? '#1f8a3d' : '#2a2a35'; block.style.transform = 'translateY(0)'; block.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)'; };
                                
                                // Bloğa tıklanınca o günü seç ve kartlı görünüme geç
                                block.onclick = () => selectDay(dk);

                                const thumb = (task.taskVideos[0]?.thumb || '').replace('default.jpg', 'hqdefault.jpg');

                                block.innerHTML = `
                                    <div style="position:relative; margin-bottom:8px; border-radius:6px; overflow:hidden;">
                                        <img src="${thumb}" style="width:100%; aspect-ratio:16/9; object-fit:cover; display:block; ${isCompleted?'filter:brightness(0.4) grayscale(0.5)':'filter:brightness(0.85)'}; transition:0.3s;">
                                        ${isCompleted ? `<div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-circle-check" style="color:#28a745; font-size:24px; filter:drop-shadow(0 0 5px rgba(0,0,0,0.8));"></i></div>` : ''}
                                    </div>
                                    <div style="font-size:12px; font-weight:800; color:${isCompleted?'#888':'#ccc'}; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${task.desc || task.subject || 'Görev'}</div>
                                    <div style="font-size:10px; color:${isCompleted?'#1f8a3d':'#a0a0b0'}; margin-top:6px; font-weight:700; display:flex; align-items:center; gap:4px;">
                                        <i class="fa-solid fa-film" style="color:${isCompleted?'#1f8a3d':'#ff3333'};"></i> ${task.taskVideos.length} video
                                    </div>
                                `;
                                col.appendChild(block);
                            });
                        }
                        grid.appendChild(col);
                    }
                    return; // İşlemi bitir, aşağıya inme
                }

                // GÜN SEÇİLMİŞSE (Mevcut Standart Kart Görünümü)
                grid.style.display = 'grid';
                grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(260px,1fr))';
                grid.style.gap = '25px';
                grid.style.alignItems = 'stretch';
                grid.style.minWidth = 'auto'; // Genişlik limitini kaldır
                
                const tasks = tasksWithVideos(vwDay);
                if (!tasks.length) {
                    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:#555;font-size:15px; font-weight:600;"><i class="fa-solid fa-film" style="font-size:40px; margin-bottom:15px; display:block; opacity:0.5;"></i>Bu günde video içeren görev yok.</div>';
                    return;
                }
                
                tasks.forEach(task => {
                    const thumb = (task.taskVideos[0]?.thumb||'').replace('default.jpg', 'hqdefault.jpg');
                    const card = document.createElement('div');
                    const isCompleted = task.isCompleted === true;
                    
                    card.style.cssText = `border:1px solid ${isCompleted ? '#1f8a3d' : '#2a2a35'}; border-radius:16px; overflow:hidden; cursor:pointer; transition:all 0.3s; background:#141419; display:flex; flex-direction:column; box-shadow: 0 4px 15px rgba(0,0,0,0.3);`;
                    
                    card.innerHTML = `
                        <div style="position:relative;">
                            <img src="${thumb}" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;${isCompleted?'filter:brightness(0.4) grayscale(0.5)':'filter:brightness(0.85)'}; transition: 0.3s;">
                            <div style="position:absolute; inset:0; background: linear-gradient(0deg, #141419 0%, transparent 50%); pointer-events:none;"></div>
                            ${isCompleted ? `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px; z-index:2;">
                                <i class="fa-solid fa-circle-check" style="font-size:42px;color:#28a745;filter:drop-shadow(0 0 10px rgba(40,167,69,0.6));"></i>
                                <span style="font-size:12px;font-weight:800;color:white;background:rgba(40,167,69,0.9);padding:4px 12px;border-radius:20px; letter-spacing:0.5px;">Tamamlandı</span>
                            </div>` : ''}
                        </div>
                        <div style="padding:15px 18px; flex:1; display:flex; flex-direction:column; justify-content:space-between; ${isCompleted?'background:#101512;':''}">
                            <div style="font-size:14px;font-weight:800;color:${isCompleted?'#888':'#fff'};margin-bottom:8px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical; line-height:1.4; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${task.desc||task.subject||'Görev'}</div>
                            <div style="font-size:12px;color:${isCompleted?'#1f8a3d':'#a0a0b0'};font-weight:700; display:flex; align-items:center; gap:8px;">
                                <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px;"><i class="fa-solid fa-film" style="color:#ff3333;"></i> ${task.taskVideos.length} video</span> 
                                <span style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 6px;"><i class="fa-solid fa-book" style="color:#4da3ff;"></i> ${(task.subLesson && task.subLesson !== "Genel") ? task.subLesson : (task.subject||"")}</span>
                            </div>
                        </div>
                    `;
                    
                    if (isCompleted) {
                        card.onmouseover = () => { card.style.boxShadow='0 8px 25px rgba(40,167,69,0.2)'; card.style.transform='translateY(-4px)'; };
                        card.onmouseout = () => { card.style.boxShadow='0 4px 15px rgba(0,0,0,0.3)'; card.style.transform='translateY(0)'; };
                    } else {
                        card.onmouseover = () => { card.style.borderColor='#444'; card.style.boxShadow='0 8px 25px rgba(0,0,0,0.5)'; card.style.transform='translateY(-4px)'; card.querySelector('img').style.filter='brightness(1)'; };
                        card.onmouseout = () => { card.style.borderColor='#2a2a35'; card.style.boxShadow='0 4px 15px rgba(0,0,0,0.3)'; card.style.transform='translateY(0)'; card.querySelector('img').style.filter='brightness(0.85)'; };
                    }
                    card.onclick = () => openPlaylist(task);
                    grid.appendChild(card);
                });
            }

            // --- Playlist aç ---
            function openPlaylist(task) {
                vwTask   = task;
                vwVideos = task.taskVideos;
                vwTitle  = task.desc || task.subject || 'Görev';
                vwIdx    = 0;
                
                // vwWatched'ı SADECE savedPlaylists'ten kur — tek kalıcı kaynak budur.
                // task.taskVideos[i].isWatched'a ASLA yazma; sadece oku (o alan güncel olmayabilir).
                vwWatched = new Set();
                vwVideos.forEach((v, i) => {
                    let watched = false;
                    if (v.plId !== undefined) {
                        const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                        if (pl && pl.videos && v.index !== undefined && pl.videos[v.index] !== undefined) {
                            watched = pl.videos[v.index].isWatched === true;
                        }
                    }
                    if (watched) vwWatched.add(i);
                });

                document.getElementById('vwVideoListTitle').textContent = vwTitle;
                showPlayerPane();
                renderVideoList();
                playVideo(0);
            }

            // --- Tamamla butonu durumunu güncelle ---
            function updateCompleteBtn() {
                const btn = document.getElementById('vwCompleteTaskBtn');
                if (!btn || !vwVideos) return;
                const allWatched = vwVideos.every((_,i) => vwWatched.has(i));
                btn.disabled = !allWatched;
                btn.style.opacity = allWatched ? '1' : '0.4';
                btn.style.cursor = allWatched ? 'pointer' : 'not-allowed';
            }

            // --- Video listesi (sağ panel) ---
            function renderVideoList() {
                const el = document.getElementById('vwVideoList');
                el.innerHTML = '';
                if (!vwVideos) return;
                vwVideos.forEach((v, i) => {
                    const active = i === vwIdx;
                    const watched = vwWatched.has(i);
                    const row = document.createElement('div');
                    
                    // Yeni Koyu Tema Liste Satırı
                    row.style.cssText = `display:flex;gap:12px;align-items:center;padding:12px 15px;cursor:pointer;border-bottom:1px solid #1f1f27;border-left:3px solid ${active?'#ff3333':'transparent'};background:${active?'#1a1a24':'transparent'};transition:all 0.2s;`;
                    
                    row.onmouseover = () => { if(!active) row.style.background = '#181820'; };
                    row.onmouseout = () => { if(!active) row.style.background = 'transparent'; };

                    row.innerHTML = `
                        <div style="width:20px;text-align:center;flex-shrink:0;font-size:13px;font-weight:900;color:${active?'#ff3333':'#666'};">
                            ${active?'<i class="fa-solid fa-play" style="filter: drop-shadow(0 0 5px rgba(255,51,51,0.5));"></i>':i+1}
                        </div>
                        <div style="position:relative; flex-shrink:0;">
                            <img src="${(v.thumb || '').replace('default.jpg', 'hqdefault.jpg')}" style="width:64px;height:36px;object-fit:cover;border-radius:4px;${watched?'opacity:0.4':'opacity:0.9'}; transition: 0.2s;">
                            ${watched ? '<div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center;"><i class="fa-solid fa-check" style="color:white; font-size:16px; filter: drop-shadow(0 0 3px black);"></i></div>' : ''}
                        </div>
                        <div style="min-width:0;flex:1;">
                            <div style="font-size:12px;font-weight:${active?'800':'600'};color:${active?'#fff':'#ccc'};overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;${watched?'text-decoration:line-through;color:#777':''} line-height: 1.4;">${v.title}</div>
                            <div style="font-size:11px;color:#666;margin-top:4px; font-weight: 700;"><i class="fa-solid fa-clock"></i> ${v.duration}</div>
                        </div>
                        <button onclick="event.stopPropagation(); window.vwToggleWatched(${i});" title="${watched?'İzlendi işaretini kaldır':'İzlendi olarak işaretle'}" style="flex-shrink:0;width:28px;height:28px;border-radius:50%;border:2px solid ${watched?'#1f8a3d':'#333'};background:${watched?'#1f8a3d':'transparent'};cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">
                            ${watched?'<i class="fa-solid fa-check" style="font-size:12px;color:white;"></i>':''}
                        </button>
                    `;
                    row.onclick = () => {
                        vwIdx = i;
                        renderVideoList();
                        playVideo(i);
                    };
                    el.appendChild(row);
                });
                updateCompleteBtn();
            }

            // --- ÖZEL ONAY PENCERESİ MOTORU ---
            function showCustomConfirm(message) {
                return new Promise((resolve) => {
                    const overlay = document.getElementById('customConfirmOverlay');
                    const box = document.getElementById('customConfirmBox');
                    const msgEl = document.getElementById('customConfirmMessage');
                    const okBtn = document.getElementById('customConfirmOkBtn');
                    const cancelBtn = document.getElementById('customConfirmCancelBtn');

                    msgEl.textContent = message;
                    overlay.style.display = 'flex';
                    
                    // Ekrana yumuşak giriş animasyonu
                    setTimeout(() => {
                        box.style.transform = 'scale(1)';
                        box.style.opacity = '1';
                    }, 10);

                    // Pencereyi kapatma ve sonucu gönderme
                    const closeAndResolve = (result) => {
                        box.style.transform = 'scale(0.9)';
                        box.style.opacity = '0';
                        setTimeout(() => {
                            overlay.style.display = 'none';
                            resolve(result);
                        }, 200); // 0.2s bekle (animasyon bitsin)
                        
                        okBtn.onclick = null;
                        cancelBtn.onclick = null;
                    };

                    // Buton tıklamalarını dinle
                    okBtn.onclick = () => closeAndResolve(true);
                    cancelBtn.onclick = () => closeAndResolve(false);
                });
            }

            // --- İZLENDİ TOGGLE ---
            window.vwToggleWatched = async function(idx) {
                if (!vwTask || !vwVideos) return;
                const isWatched = vwWatched.has(idx);

                // Görev tamamlanmışsa ve tik kaldırılıyorsa onay sor
                if (isWatched && vwTask.isCompleted) {
                    const onay = await showCustomConfirm("Bu videonun 'İzlendi' işaretini kaldırırsanız, ana programdaki bu görev de 'Tamamlanmadı' durumuna geri dönecektir. Onaylıyor musunuz?");
                    if (!onay) return;
                    vwTask.isCompleted = false;
                    // Görevi Firebase'e kaydet
                    if (currentUserUid) {
                        try {
                            await setDoc(doc(db, "users", currentUserUid, "userTasks", vwTask.id.toString()), vwTask, { merge: true });
                        } catch(e) {}
                    }
                    if (typeof renderWeeklyPlanner === 'function') renderWeeklyPlanner();
                    if (typeof renderDashboard === 'function') renderDashboard();
                }

                // vwWatched Set'ini güncelle
                if (isWatched) vwWatched.delete(idx);
                else vwWatched.add(idx);

                const newStatus = vwWatched.has(idx);
                const v = vwVideos[idx]; // vwVideos = task.taskVideos referansı

                // savedPlaylists'teki ilgili videoyu güncelle (TEK YAZMA NOKTASI)
                const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                if (pl && pl.videos && v.index !== undefined && pl.videos[v.index] !== undefined) {
                    pl.videos[v.index].isWatched = newStatus;
                    try {
                        if (currentUserUid) {
                            await setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true });
                        }
                    } catch(e) { console.error('Playlist kaydetme hatası:', e); }
                }

                // Arayüzü yenile — takvim/haftalık planlayıcı da savedPlaylists'i okuyacağı için doğru gösterir
                renderVideoList();
                renderPlaylistGrid();
                if (typeof window.renderPlaylists === 'function') window.renderPlaylists();
            };

            // --- Video oynat ---
            function playVideo(idx) {
                const v = vwVideos[idx];
                if (!v) return;
                const vid = getVideoId(v);
                const wrapper = document.getElementById('vwPlayerWrapper');
                document.getElementById('vwNowTitle').textContent = v.title;
                const old = document.getElementById('vwIframe');
                if (old) old.remove();
                if (vid) {
                    const iframe = document.createElement('iframe');
                    iframe.id = 'vwIframe';
                    iframe.style.cssText = 'flex:1; border:none; width:100%; height:100%; display:block;';
                    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
                    iframe.setAttribute('allowfullscreen', '');
                    iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
                    iframe.src = `https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&rel=0&modestbranding=1`;
                    wrapper.appendChild(iframe);
                } else {
                    wrapper.innerHTML = '<div style="color:#888;text-align:center;padding:40px;font-size:13px;width:100%;"><i class=\"fa-solid fa-triangle-exclamation\" style=\"font-size:32px;margin-bottom:10px;display:block;\"></i>Video ID bulunamadı.</div>';
                }
            }

            
            // --- Görev tamamla ---
            document.getElementById('vwCompleteTaskBtn').addEventListener('click', async () => {
                if (!vwTask) return;
                const btn = document.getElementById('vwCompleteTaskBtn');
                if (btn.disabled) return;

                // YENİ TASARIM: Özel Koyu Temalı Onay Modalı
                const confirmed = await new Promise(res => {
                    const overlay = document.createElement('div');
                    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.8); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px); opacity:0; transition: opacity 0.2s ease-out;';
                    
                    overlay.innerHTML = `
                        <div id="vwSuccessBox" style="background:#141419; width:400px; max-width:90%; border-radius:16px; border:1px solid #2a2a35; box-shadow:0 20px 40px rgba(0,0,0,0.6); padding:30px; text-align:center; transform: scale(0.9); transition: all 0.2s ease-out;">
                            
                            <div style="width: 70px; height: 70px; background: rgba(40, 167, 69, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto;">
                                <i class="fa-solid fa-circle-check" style="color:#28a745; font-size:32px; filter:drop-shadow(0 0 10px rgba(40,167,69,0.4));"></i>
                            </div>
                            
                            <h3 style="color:#fff; font-size:20px; margin:0 0 12px 0; font-weight:800; letter-spacing: 0.5px;">Görevi Tamamla</h3>
                            <p style="color:#a0a0b0; font-size:14px; line-height:1.6; margin:0 0 25px 0; font-weight:600;">Tüm videolar izlendi. "<b style="color:#fff;">${vwTitle}</b>" görevini tamamlandı olarak işaretlemek istiyor musun?</p>
                            
                            <div style="display:flex; gap:12px; justify-content:center;">
                                <button id="vwConfirmNo" style="flex:1; padding:12px; border-radius:10px; border:1px solid #333; background:#222; color:#ccc; font-weight:700; cursor:pointer; transition:0.2s; font-size: 14px;" onmouseover="this.style.background='#333'; this.style.color='#fff';" onmouseout="this.style.background='#222'; this.style.color='#ccc';">İptal</button>
                                <button id="vwConfirmYes" style="flex:1; padding:12px; border-radius:10px; border:none; background:linear-gradient(135deg, #1f8a3d 0%, #155724 100%); color:white; font-weight:700; cursor:pointer; transition:0.2s; box-shadow:0 4px 15px rgba(31, 138, 61, 0.3); font-size: 14px;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(31, 138, 61, 0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(31, 138, 61, 0.3)';">Evet, Tamamla</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(overlay);
                    
                    // Ekrandan yumuşak giriş animasyonunu tetikleme
                    setTimeout(() => {
                        overlay.style.opacity = '1';
                        overlay.querySelector('#vwSuccessBox').style.transform = 'scale(1)';
                    }, 10);

                    // Kapatma ve cevap gönderme fonksiyonu
                    const closeAndRes = (val) => {
                        overlay.style.opacity = '0';
                        overlay.querySelector('#vwSuccessBox').style.transform = 'scale(0.9)';
                        setTimeout(() => {
                            document.body.removeChild(overlay);
                            res(val);
                        }, 200); // Animasyonun bitmesini bekle
                    };

                    overlay.querySelector('#vwConfirmYes').onclick = () => closeAndRes(true);
                    overlay.querySelector('#vwConfirmNo').onclick = () => closeAndRes(false);
                });

                if (!confirmed) return;

                // Görevi tamamlandı işaretle (Orijinal Kod)
                const dk = vwDay;
                if (userTasks[dk]) {
                    const ti = userTasks[dk].findIndex(t => t.id === vwTask.id);
                    if (ti !== -1) {
                        userTasks[dk][ti] = {...userTasks[dk][ti], isCompleted: true};
                        try {
                            if (currentUserUid) await setDoc(doc(db,"users",currentUserUid,"userTasks",vwTask.id.toString()), userTasks[dk][ti], {merge:true});
                        } catch(e){}
                    }
                }
                
                if (typeof renderWeeklyPlanner === 'function') renderWeeklyPlanner();
                if (typeof renderDashboard === 'function') renderDashboard();

                // YENİ TASARIM: Başarı bildirimi (Toast)
                const toast = document.createElement('div');
                toast.style.cssText = 'position:fixed; bottom:-50px; left:50%; transform:translateX(-50%); background:#141419; color:#fff; border:1px solid #1f8a3d; padding:12px 24px; border-radius:30px; font-size:14px; font-weight:800; z-index:9999; box-shadow:0 10px 30px rgba(0,0,0,0.5); display:flex; align-items:center; gap:10px; opacity:0; transition:all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);';
                toast.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#28a745; font-size:18px; filter:drop-shadow(0 0 5px rgba(40,167,69,0.5));"></i> Görev tamamlandı olarak işaretlendi!';
                document.body.appendChild(toast);
                
                // Toast zıplama animasyonu
                setTimeout(() => {
                    toast.style.bottom = '40px';
                    toast.style.opacity = '1';
                }, 10);
                setTimeout(() => {
                    toast.style.bottom = '-50px';
                    toast.style.opacity = '0';
                }, 2500);
                setTimeout(() => document.body.removeChild(toast), 3000);

                // Playlistlere geri dön (Orijinal Kod)
                showPlaylistPane();
                renderPlaylistGrid();
            });

            // --- Geri butonu ---
            document.getElementById('vwBackBtn').addEventListener('click', () => {
                const _f=document.getElementById('vwIframe'); if(_f) _f.src='';
                showPlaylistPane(); renderPlaylistGrid();
            });

            // --- Hafta nav ---
            function changeWeek(d) {
                vwWeek.setDate(vwWeek.getDate()+d*7);
                vwDay=null; vwVideos=null; vwTask=null;
                document.getElementById('vwIframe').src='';
                showPlaylistPane();
                updateWeekLabel();
                renderDayTabs();
                
                // YENİ: Ekranı zorla silmek yerine 7 kolonlu haftalık panoyu çizdiriyoruz
                renderPlaylistGrid(); 
            }
            document.getElementById('vwPrevWeek').addEventListener('click', ()=>changeWeek(-1));
            document.getElementById('vwNextWeek').addEventListener('click', ()=>changeWeek(1));

            // --- Aç/Kapat ---
            document.getElementById('openVideoWatcherBtn').addEventListener('click', () => {
                vwWeek = getMonday(typeof currentWeekStart!=='undefined' ? new Date(currentWeekStart) : new Date());
                vwDay=null; vwVideos=null; vwTask=null;
                document.getElementById('vwIframe').src='';
                showPlaylistPane(); 
                updateWeekLabel(); 
                renderDayTabs();
                
                // YENİ: Modal ilk açıldığında boş siyah ekran yerine haftalık panoyu çizdiriyoruz
                renderPlaylistGrid(); 
                
                document.getElementById('videoWatcherModal').style.display='flex';
            });

            // Günlük Planlayıcıdaki "Playlistler" Butonu (Aynı kalıyor ama bütünlük için tam veriyorum)
            document.getElementById('openDashPlaylistBtn')?.addEventListener('click', () => {
                const targetDate = new Date(currentDashboardDate);
                vwWeek = getMonday(targetDate);
                vwDay = dateKey(targetDate);
                vwVideos = null; 
                vwTask = null;
                document.getElementById('vwIframe').src='';
                showPlaylistPane(); 
                updateWeekLabel(); 
                renderDayTabs();
                
                if (typeof selectDay === 'function') {
                    selectDay(vwDay);
                }
                document.getElementById('videoWatcherModal').style.display='flex';
            });

            document.getElementById('vwCloseBtn').addEventListener('click', () => {
                document.getElementById('vwIframe').src='';
                document.getElementById('videoWatcherModal').style.display='none';
            });
            document.getElementById('vwCloseBtn').addEventListener('click', () => {
                document.getElementById('vwIframe').src='';
                document.getElementById('videoWatcherModal').style.display='none';
            });
        })();
        
        // ==============================================

        // --- YENİ: AYARLAR MENÜSÜ SEKME GEÇİŞİ ---
        window.switchSettingsTab = function() {
            const selectedTab = document.querySelector('input[name="settingsTab"]:checked').value;
            if (selectedTab === 'color') {
                document.getElementById('settingsColorContent').style.display = 'block';
                document.getElementById('settingsViewContent').style.display = 'none';
            } else {
                document.getElementById('settingsColorContent').style.display = 'none';
                document.getElementById('settingsViewContent').style.display = 'block';
            }
        };

