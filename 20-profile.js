        // [PROFIL] --- PROFİL EKRANI VE ZEKİ KAYIT MOTORU ---
        const profileModal = document.getElementById('profileModal');
        const profAlertOverlay = document.getElementById('profAlertOverlay');
        const profAlertBox = document.getElementById('profAlertBox');

        // --- BİLDİRİM BALONCUĞU KONTROLCÜSÜ ---
        window.showProfAlert = function(type, title, text, buttonsHTML) {
            let iconHTML = '';
            if(type === 'warning') iconHTML = '<i class="fa-solid fa-triangle-exclamation p-alert-icon warning"></i>';
            else if(type === 'success') iconHTML = '<i class="fa-solid fa-circle-check p-alert-icon success"></i>';
            else if(type === 'error') iconHTML = '<i class="fa-solid fa-circle-xmark p-alert-icon error"></i>';
            else if(type === 'loading') iconHTML = '<i class="fa-solid fa-circle-notch fa-spin p-alert-icon loading"></i>';

            profAlertBox.innerHTML = `
                ${iconHTML}
                <div class="p-alert-title">${title}</div>
                <div class="p-alert-text">${text}</div>
                <div class="p-alert-buttons">${buttonsHTML || ''}</div>
            `;
            profAlertOverlay.classList.add('show');
        };

        window.closeProfAlert = function() { profAlertOverlay.classList.remove('show'); };

        // --- DURUM İZLEYİCİ (STATE TRACKER) ---
        window.getProfileCurrentState = function() {
            return {
                username: document.getElementById('profEditUsername').value.trim(),
                password: DOM.profNewPassword.value,
                confirmPassword: DOM.profConfirmPassword.value,
                role: document.querySelector('input[name="profEditRole"]:checked')?.value || '',
                exam: document.querySelector('input[name="profEditExam"]:checked')?.value || '',
                field: DOM.profEditFieldSelect.value || ''
            };
        };

        window.hasProfileChanged = function() {
            if (!window.initialProfileState) return false;
            const current = window.getProfileCurrentState();
            const initial = window.initialProfileState;
            
            return current.username !== initial.username || current.password !== initial.password || 
                   current.confirmPassword !== initial.confirmPassword || current.role !== initial.role || 
                   current.exam !== initial.exam || current.field !== initial.field;
        };

        // --- PROFİLİ IŞIK HIZINDA AÇMA ---
        window.openProfileModal = function() { 
            if (!auth.currentUser) return;
            
            // Kutuları sıfırla
            document.getElementById('profCurrentPassword').value = '';
            DOM.profNewPassword.value = '';
            DOM.profConfirmPassword.value = '';
            DOM.profNewPassword.disabled = true;
            DOM.profNewPassword.style.background = '#f8f9fa';
            DOM.profConfirmPassword.disabled = true;
            DOM.profConfirmPassword.style.background = '#f8f9fa';
            
            const verifyBtn = document.getElementById('verifyCurrentPasswordBtn');
            verifyBtn.innerText = 'Onayla';
            verifyBtn.style.background = 'var(--color-primary)';
            verifyBtn.disabled = false;

            // Yan menüleri temizle
            const sideMenu = DOM.sideMenu || document.querySelector('.menu-content');
            const menuOverlay = DOM.menuOverlay || document.querySelector('.menu-overlay');
            if (sideMenu) sideMenu.classList.remove('open', 'active');
            if (menuOverlay) { menuOverlay.classList.remove('open', 'active'); menuOverlay.style.display = 'none'; menuOverlay.click(); }

            // Hafızadaki veriyi anında yerleştir
            if (window.currentUserProfileData) {
                const data = window.currentUserProfileData;
                document.getElementById('profEditUsername').value = data.username || auth.currentUser.displayName || '';
                document.getElementById('profEditEmail').value = data.email || auth.currentUser.email || '';
                
                if(data.role) document.querySelector(`input[name="profEditRole"][value="${data.role}"]`).checked = true;
                if(data.exam && data.role === 'ogrenci') document.querySelector(`input[name="profEditExam"][value="${data.exam}"]`).checked = true;
                
                if(data.field) {
                    DOM.profEditFieldSelect.value = data.field;
                    const option = document.querySelector(`.custom-option[data-value="${data.field}"]`);
                    if (option) {
                        document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                        option.classList.add('selected');
                        document.querySelector('#profFieldTrigger span').textContent = option.textContent;
                    }
                } else {
                    DOM.profEditFieldSelect.value = '';
                    document.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                    document.querySelector('#profFieldTrigger span').textContent = 'Seçiniz...';
                }
                updateProfileDynamicUI(); 
            }

            profileModal.style.display = 'flex';
            
            // EKRAN AÇILDIĞI AN DURUMU FOTOĞRAFLA
            window.initialProfileState = window.getProfileCurrentState();
        };

        // --- ÇIKIŞ KONTROLÜ (X BUTONU VEYA DIŞARI TIKLAMA) ---
        window.forceCloseProfile = function() {
            closeProfAlert();
            profileModal.style.display = 'none';
        };

        function handleProfileClose() {
            if (window.hasProfileChanged()) {
                showProfAlert('warning', 'Kaydedilmemiş Değişiklikler', 'Kapatmadan önce yaptığınız değişiklikleri kaydetmek ister misiniz?', `
                    <button class="p-alert-btn p-alert-btn-red" onclick="forceCloseProfile()">Hayır, Çık</button>
                    <button class="p-alert-btn p-alert-btn-blue" onclick="window.executeProfileSave()">Evet, Kaydet</button>
                `);
            } else {
                forceCloseProfile(); // Değişiklik yoksa bildirimsiz sessizce çık
            }
        }

        // Eski kapatma dinleyicilerini yenileriyle değiştiriyoruz
        const oldCloseBtn = document.getElementById('closeProfileBtn');
        const newCloseBtn = oldCloseBtn.cloneNode(true); // Önceki dinleyicileri silmek için klonladık
        oldCloseBtn.parentNode.replaceChild(newCloseBtn, oldCloseBtn);
        newCloseBtn.addEventListener('click', handleProfileClose);

        // --- KAYDET BUTONU YÖNLENDİRMESİ ---
        const oldSaveBtn = document.getElementById('saveProfileBtn');
        const newSaveBtn = oldSaveBtn.cloneNode(true);
        oldSaveBtn.parentNode.replaceChild(newSaveBtn, oldSaveBtn);
        newSaveBtn.addEventListener('click', () => {
            if (!window.hasProfileChanged()) {
                forceCloseProfile(); // Değişiklik yoksa bildirimsiz direkt çık
                return;
            }
            showProfAlert('warning', 'Emin misiniz?', 'Yaptığınız değişiklikleri kaydetmek istediğinize emin misiniz?', `
                <button class="p-alert-btn p-alert-btn-gray" onclick="closeProfAlert()">İptal</button>
                <button class="p-alert-btn p-alert-btn-blue" onclick="window.executeProfileSave()">Evet, Kaydet</button>
            `);
        });

        // --- ASIL KAYDETME MANTIĞI (Animasyonlu ve Güvenli) ---
        window.executeProfileSave = async function() {
            const newUsername = document.getElementById('profEditUsername').value.trim();
            const newPassword = DOM.profNewPassword.value;
            const confirmPassword = DOM.profConfirmPassword.value;
            const role = document.querySelector('input[name="profEditRole"]:checked')?.value;
            const exam = document.querySelector('input[name="profEditExam"]:checked')?.value;
            const field = DOM.profEditFieldSelect.value;

            // Hata Kontrolleri
            if(!newUsername) return showProfAlert('error', 'Hata!', 'Kullanıcı adı boş bırakılamaz!', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
            if(newUsername.includes(' ')) return showProfAlert('error', 'Hata!', 'Kullanıcı adı boşluk içeremez!', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
            if(role === 'ogrenci' && !exam) return showProfAlert('error', 'Eksik Bilgi', 'Lütfen hazırlandığınız sınavı seçin.', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
            if(role === 'ogrenci' && exam === 'yks' && !field) return showProfAlert('error', 'Eksik Bilgi', 'Lütfen alanınızı seçin.', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');

            if (newPassword || confirmPassword) {
                if (newPassword !== confirmPassword) return showProfAlert('error', 'Şifre Uyuşmazlığı', 'Girdiğiniz yeni şifreler birbirleriyle eşleşmiyor.', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
                if (newPassword.length < 6) return showProfAlert('error', 'Güvenlik Uyarısı', 'Yeni şifreniz en az 6 karakter olmalıdır!', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
            }

            // Animasyonu Başlat
            showProfAlert('loading', 'Kaydediliyor...', 'Değişiklikleriniz buluta işleniyor, lütfen bekleyin.', '');

            try {
                const userDocRef = doc(db, "users", auth.currentUser.uid);
                const currentData = (await getDoc(userDocRef)).data();

                // Kullanıcı Adı Benzersizlik Kontrolü
                if (newUsername !== currentData.username) {
                    const q = query(collection(db, "users"), where("username", "==", newUsername));
                    if (!(await getDocs(q)).empty) {
                        return showProfAlert('error', 'Alınmış!', 'Bu kullanıcı adı zaten başka biri tarafından kullanılıyor.', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
                    }
                    await updateProfile(auth.currentUser, { displayName: newUsername });
                }

                // Şifre Güncelleme
                if (newPassword) await updatePassword(auth.currentUser, newPassword);

                // Firestore Güncelleme
                const updateData = { username: newUsername, role: role, email: auth.currentUser.email };
                if (role === 'ogrenci') { updateData.exam = exam; updateData.field = (exam === 'yks') ? field : null; } 
                else { updateData.exam = null; updateData.field = null; }

                await setDoc(userDocRef, updateData, { merge: true });
                window.currentUserProfileData = { ...window.currentUserProfileData, ...updateData };
                
                const currentHeaderBtn = document.getElementById('headerProfileBtn');
                if(currentHeaderBtn) currentHeaderBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${newUsername}`;
                
                // Başarı Bildirimi
                showProfAlert('success', 'Harika!', 'Profiliniz başarıyla kaydedildi.', '<button class="p-alert-btn p-alert-btn-blue" onclick="forceCloseProfile()">Kapat</button>');
                
                // Yeni durumu fotoğraf olarak güncelle
                window.initialProfileState = window.getProfileCurrentState();

            } catch (error) {
                if (error.code === 'auth/requires-recent-login') showProfAlert('error', 'Güvenlik', 'Şifrenizi değiştirmek için çıkış yapıp tekrar giriş yapmalısınız.', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
                else showProfAlert('error', 'Sistem Hatası', error.message, '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
            }
        };

        // --- MEVCUT ŞİFREYİ ONAYLAMA MANTIĞI ---
        document.getElementById('verifyCurrentPasswordBtn').addEventListener('click', async () => {
            const currentPwd = document.getElementById('profCurrentPassword').value;
            const btn = document.getElementById('verifyCurrentPasswordBtn');
            if(!currentPwd) return showProfAlert('warning', 'Eksik Bilgi', 'Lütfen önce mevcut şifrenizi girin.', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');

            try {
                btn.innerText = '...';
                const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPwd);
                await reauthenticateWithCredential(auth.currentUser, credential);

                DOM.profNewPassword.disabled = false;
                DOM.profNewPassword.style.background = 'white';
                DOM.profConfirmPassword.disabled = false;
                DOM.profConfirmPassword.style.background = 'white';
                btn.innerText = 'Onaylandı'; btn.style.background = '#2ecc71'; btn.disabled = true;

            } catch(error) {
                btn.innerText = 'Onayla';
                showProfAlert('error', 'Hatalı Şifre', 'Mevcut şifrenizi yanlış girdiniz!', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
            }
        });

        // --- EKSİK OLAN PROFİL DİNAMİK GÖSTER/GİZLE MOTORU ---
        function updateProfileDynamicUI() {
            const role = document.querySelector('input[name="profEditRole"]:checked')?.value;
            const exam = document.querySelector('input[name="profEditExam"]:checked')?.value;

            const examGroup = document.getElementById('profEditExamGroup');
            const fieldGroup = document.getElementById('profEditFieldGroup');
            
            if(examGroup) examGroup.style.display = (role === 'ogrenci') ? 'block' : 'none';
            if(fieldGroup) fieldGroup.style.display = (role === 'ogrenci' && exam === 'yks') ? 'block' : 'none';
        }

        const profRoleRadios = document.querySelectorAll('input[name="profEditRole"]');
        const profExamRadios = document.querySelectorAll('input[name="profEditExam"]');
        if(profRoleRadios) profRoleRadios.forEach(radio => radio.addEventListener('change', updateProfileDynamicUI));
        if(profExamRadios) profExamRadios.forEach(radio => radio.addEventListener('change', updateProfileDynamicUI));

        // Profil Özel Açılır Menü (Alan Seçimi) İşleyişi
        const profFieldWrapper = document.getElementById('profFieldWrapper');
        if (profFieldWrapper) {
            const trigger = profFieldWrapper.querySelector('.custom-select-trigger');
            const options = profFieldWrapper.querySelectorAll('.custom-option');
            const hiddenInput = DOM.profEditFieldSelect;
            const triggerText = trigger.querySelector('span');

            trigger.addEventListener('click', function(e) {
                profFieldWrapper.classList.toggle('open');
                this.classList.toggle('active');
            });

            options.forEach(option => {
                option.addEventListener('click', function() {
                    options.forEach(opt => opt.classList.remove('selected'));
                    this.classList.add('selected');
                    triggerText.textContent = this.textContent;
                    hiddenInput.value = this.getAttribute('data-value');
                    profFieldWrapper.classList.remove('open');
                    trigger.classList.remove('active');
                });
            });

            window.addEventListener('click', function(e) {
                if (!profFieldWrapper.contains(e.target)) {
                    profFieldWrapper.classList.remove('open');
                    trigger.classList.remove('active');
                }
            });
        }

        // --- YOUTUBE OTOMATİK PLAYLIST OLUŞTURUCU MOTOR (V6.0 KUSURSUZ DOM) ---
        window.playTaskYoutubeVideos = function() {
            let videoIds = [];
            
            // 1. GÖREV AÇIKLAMASINA (DESC) BAK (Sadece Görev Detay penceresindeki kutuya)
            const descBox = document.getElementById('viewTaskDesc');
            if (descBox && descBox.innerText) {
                const ytRegex = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?.*v=|v\/|embed\/|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/gi;
                let match;
                while ((match = ytRegex.exec(descBox.innerText)) !== null) {
                    videoIds.push(match[1]);
                }
            }

            // 2. GÖREVE ÖZEL EKLENEN VİDEOLARA BAK (Sadece Görev Detayındaki vtv-list Kutusuna)
            const videoListBox = document.getElementById('vtv-list');
            if (videoListBox) {
                // Ekrandaki o listeye eklenmiş küçük kapak resimlerini bul
                const images = videoListBox.querySelectorAll('img');
                images.forEach(img => {
                    if (img.src) {
                        // Resim linkindeki o 11 haneli YouTube ID'sini jilet gibi cımbızla
                        const match = img.src.match(/(?:vi|vi_webp)\/([a-zA-Z0-9_-]{11})\//);
                        if (match && match[1]) {
                            videoIds.push(match[1]);
                        }
                    }
                });
            }

            // 3. Mükemmeliyetçi temizlik: Aynı videoyu iki kez eklemesin
            videoIds = [...new Set(videoIds)];

            // 4. Eğer gerçekten görevde video yoksa şık bildirimimizi göster
            if (videoIds.length === 0) {
                if (window.showProfAlert) {
                    showProfAlert('warning', 'Video Bulunamadı', 'Bu göreve eklenmiş hiçbir YouTube videosu bulunamadı.', '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
                } else {
                    alert("Bu görevde YouTube videosu bulunamadı.");
                }
                return;
            }

            // 5. Videolar hazır! Yeni sekmede tertemiz bir playlist olarak patlat!
            const playlistUrl = `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`;
            window.open(playlistUrl, '_blank');
        };

        // [COK-PROGRAM] --- ÇOKLU PROGRAM (PROFİL) YÖNETİMİ (KUSURSUZ TEK PARÇA MOTOR) ---
        
        // 1. GÜVENLİ KLONLAMA YARDIMCISI (Buton çakışmalarını önler)
        const replaceClone = (id) => {
            const oldEl = document.getElementById(id);
            if (oldEl) {
                const newEl = oldEl.cloneNode(true);
                oldEl.parentNode.replaceChild(newEl, oldEl);
                return newEl;
            }
            return null;
        };

        const oldProfileSelect = document.getElementById('tcs-plannerProfile');
        if (oldProfileSelect) {
            const tcsProfileSelect = oldProfileSelect.cloneNode(true);
            oldProfileSelect.parentNode.replaceChild(tcsProfileSelect, oldProfileSelect);
        }

        const tcsProfileSelect = document.getElementById('tcs-plannerProfile');
        const tcsProfileTrigger = tcsProfileSelect ? tcsProfileSelect.querySelector('.tcs-trigger') : null;
        const tcsProfileOptionsContainer = tcsProfileSelect ? tcsProfileSelect.querySelector('#plannerProfileOptions') : null;
        const currentProfileInput = tcsProfileSelect ? tcsProfileSelect.querySelector('#currentPlannerProfile') : null;
        const activeProfileText = tcsProfileSelect ? tcsProfileSelect.querySelector('#activeProfileText') : null;
        
        const addNewProfileBtn = replaceClone('addNewProfileBtn');
        const setAsMainBtn = replaceClone('setAsMainProfileBtn');
        const closeAddProfileModalBtn = replaceClone('closeAddProfileModalBtn');
        const saveNewProfileBtn = replaceClone('saveNewProfileBtn');
        const addProfileModal = document.getElementById('addProfileModal');

        window.plannerProfiles = [ { id: 'main_profile', name: 'Ana Program', isMain: true } ];

        // 2. VERİTABANI VE İLK YÜKLEME ZEKASI
        window.loadPlannerProfilesFromDB = async function() {
            if (!auth.currentUser) return;
            try {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists() && userDoc.data().plannerProfiles) {
                    window.plannerProfiles = userDoc.data().plannerProfiles;
                }
                
                // Sayfa ilk açıldığında Ana Programı otomatik seç (Zorunlu)
                const mainProfile = window.plannerProfiles.find(p => p.isMain);
                if (mainProfile && currentProfileInput) {
                    currentProfileInput.value = mainProfile.id;
                }
                
                window.renderProfileOptionsUI();
            } catch(e) { console.error("Programlar çekilemedi:", e); }
        };

        window.savePlannerProfilesToDB = async function() {
            if (!auth.currentUser) return;
            try {
                await setDoc(doc(db, "users", auth.currentUser.uid), { plannerProfiles: window.plannerProfiles }, { merge: true });
            } catch(e) { console.error("Programlar kaydedilemedi:", e); }
        };

        // 3. ARAYÜZ (UI) ÇİZİM MOTORU (İndirme ve Ana Menüyü Besler)
        window.renderProfileOptionsUI = function() {
            if (tcsProfileOptionsContainer) {
                tcsProfileOptionsContainer.innerHTML = '';
                
                // Sıralama: Ana Program hep en üstte (1. Sırada)
                window.plannerProfiles.sort((a, b) => {
                    if (a.isMain) return -1;
                    if (b.isMain) return 1;
                    return 0; 
                });

                const currentId = currentProfileInput.value;
                let currentExists = false;

                window.plannerProfiles.forEach(p => {
                    const icon = p.isMain ? '<i class="fa-solid fa-star" class="icon-star"></i>' : '<i class="fa-regular fa-folder" style="color: var(--color-text-muted); margin-right: 5px;"></i>';
                    const selectedClass = p.id === currentId ? 'selected' : '';
                    if (p.id === currentId) currentExists = true;
                    tcsProfileOptionsContainer.innerHTML += `<div class="tcs-option ${selectedClass}" data-value="${p.id}">${icon} ${p.name}</div>`;
                });

                if (!currentExists && window.plannerProfiles.length > 0) {
                    const safeProfile = window.plannerProfiles.find(p => p.isMain) || window.plannerProfiles[0];
                    currentProfileInput.value = safeProfile.id;
                }

                const activeProfile = window.plannerProfiles.find(p => p.id === currentProfileInput.value) || window.plannerProfiles[0];
                
                if (activeProfileText) {
                    if (activeProfile.isMain) {
                        activeProfileText.innerHTML = `<i class="fa-solid fa-star" class="icon-star"></i> ${activeProfile.name}`;
                        if(setAsMainBtn) setAsMainBtn.style.display = 'none';
                    } else {
                        activeProfileText.innerHTML = `<i class="fa-regular fa-folder" style="color: var(--color-primary); margin-right: 5px;"></i> ${activeProfile.name}`;
                        if(setAsMainBtn) setAsMainBtn.style.display = 'flex';
                    }
                }
                
                setupProfileOptionListeners();
                window.updateWeeklyPlannerView?.();
            }

            // DİNAMİK İNDİRME (EXPORT) MENÜSÜ GÜNCELLEMESİ
            const exportOptionsContainer = document.getElementById('exportProfileOptions');
            if (exportOptionsContainer) {
                exportOptionsContainer.innerHTML = '';
                const exportInput = document.getElementById('exportProfileInput');
                let exportExists = false;

                window.plannerProfiles.forEach(p => {
                    const icon = p.isMain ? '<i class="fa-solid fa-star" class="icon-star"></i>' : '<i class="fa-regular fa-folder" style="color: var(--color-text-muted); margin-right: 5px;"></i>';
                    if(!exportInput.value && currentProfileInput) exportInput.value = currentProfileInput.value; 
                    
                    const selectedClass = p.id === exportInput.value ? 'selected' : '';
                    if (p.id === exportInput.value) exportExists = true;
                    exportOptionsContainer.innerHTML += `<div class="tcs-option ${selectedClass}" data-value="${p.id}">${icon} ${p.name}</div>`;
                });

                if (!exportExists && currentProfileInput) exportInput.value = currentProfileInput.value;

                const activeExport = window.plannerProfiles.find(p => p.id === exportInput.value) || window.plannerProfiles[0];
                const expTextEl = document.getElementById('exportProfileText');
                if (expTextEl) {
                    expTextEl.innerHTML = (activeExport.isMain ? '<i class="fa-solid fa-star" class="icon-star"></i> ' : '<i class="fa-regular fa-folder" style="color: var(--color-text-muted); margin-right: 5px;"></i> ') + activeExport.name;
                }

                exportOptionsContainer.querySelectorAll('.tcs-option').forEach(opt => {
                    opt.addEventListener('click', function(e) {
                        e.stopPropagation();
                        exportInput.value = this.getAttribute('data-value');
                        const tcsExp = document.getElementById('tcs-exportProfile');
                        if(tcsExp) {
                            tcsExp.classList.remove('open');
                            const trg = tcsExp.querySelector('.tcs-trigger');
                            if(trg) trg.classList.remove('active');
                        }
                        window.renderProfileOptionsUI(); 
                        window.updateExportPreview?.(); 
                    });
                });
            }
        };

        // 4. AÇILIR KAPANIR MENÜ TETİKLEYİCİLERİ
        if(tcsProfileTrigger) {
            tcsProfileTrigger.addEventListener('click', (e) => {
                e.stopPropagation(); 
                tcsProfileSelect.classList.toggle('open'); 
                tcsProfileTrigger.classList.toggle('active');
            });
        }
        
        window.addEventListener('click', (e) => {
            if (tcsProfileSelect && !tcsProfileSelect.contains(e.target)) {
                tcsProfileSelect.classList.remove('open'); 
                if(tcsProfileTrigger) tcsProfileTrigger.classList.remove('active');
            }
            
            // İndirme Menüsü için tıklama kontrolü
            const tcsExportSelect = document.getElementById('tcs-exportProfile');
            if (tcsExportSelect && !tcsExportSelect.contains(e.target)) {
                tcsExportSelect.classList.remove('open');
                const expTrigger = tcsExportSelect.querySelector('.tcs-trigger');
                if(expTrigger) expTrigger.classList.remove('active');
            }
        });

        // İndirme Menüsü Özel Tetikleyicisi (Sonradan var olduğu için Event Delegation kullanılır)
        document.addEventListener('click', function(e) {
            const trigger = e.target.closest('#tcs-exportProfile .tcs-trigger');
            if (trigger) {
                e.stopPropagation();
                const wrapper = document.getElementById('tcs-exportProfile');
                wrapper.classList.toggle('open');
                trigger.classList.toggle('active');
            }
        });

        function setupProfileOptionListeners() {
            if(!tcsProfileOptionsContainer) return;
            const options = tcsProfileOptionsContainer.querySelectorAll('.tcs-option');
            options.forEach(opt => {
                opt.addEventListener('click', function(e) {
                    e.stopPropagation(); 
                    currentProfileInput.value = this.getAttribute('data-value');
                    tcsProfileSelect.classList.remove('open'); 
                    tcsProfileTrigger.classList.remove('active');
                    window.renderProfileOptionsUI(); 
                });
            });
        }

        // 5. BUTON GÖREVLERİ (EKLE, KAYDET, ANA YAP)
        if(addNewProfileBtn) {
            addNewProfileBtn.addEventListener('click', () => {
                document.getElementById('newProfileNameInput').value = ''; 
                if(addProfileModal) addProfileModal.style.display = 'flex'; 
                setTimeout(() => {
                    const inp = document.getElementById('newProfileNameInput');
                    if(inp) inp.focus();
                }, 100);
            });
        }
        
        if(closeAddProfileModalBtn) {
            closeAddProfileModalBtn.addEventListener('click', () => {
                if(addProfileModal) addProfileModal.style.display = 'none';
            });
        }

        if(saveNewProfileBtn) {
            saveNewProfileBtn.addEventListener('click', async () => {
                const nameInput = document.getElementById('newProfileNameInput');
                const name = nameInput.value.trim();
                if (!name) { 
                    nameInput.style.borderColor = '#d9534f'; 
                    setTimeout(() => nameInput.style.borderColor = '#dce4ec', 2000); 
                    return; 
                }

                const newId = 'profile_' + Date.now();
                window.plannerProfiles.push({ id: newId, name: name, isMain: false });
                
                await window.savePlannerProfilesToDB(); 
                if(currentProfileInput) currentProfileInput.value = newId; 
                window.renderProfileOptionsUI();
                
                if(addProfileModal) addProfileModal.style.display = 'none';
                if(window.showProfAlert) showProfAlert('success', 'Oluşturuldu!', `'${name}' programı başarıyla kaydedildi.`, '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
            });
        }

        // ANA YAP Motoru
        window.executeSetMainProfile = async function() {
            const currentId = currentProfileInput.value;
            window.plannerProfiles.forEach(p => p.isMain = false);
            const newMain = window.plannerProfiles.find(p => p.id === currentId);
            if(newMain) newMain.isMain = true;

            await window.savePlannerProfilesToDB(); 
            window.renderProfileOptionsUI();
            
            window.renderTodayTasks?.();
            
            if(window.showProfAlert) showProfAlert('success', 'Ana Program Değişti', `'${newMain.name}' artık varsayılan programınız oldu. Günlük ekranda bu program gösterilecek.`, '<button class="p-alert-btn p-alert-btn-blue" onclick="closeProfAlert()">Tamam</button>');
        };

        if(setAsMainBtn) {
            setAsMainBtn.addEventListener('click', () => {
                const currentId = currentProfileInput.value;
                const targetProfile = window.plannerProfiles.find(p => p.id === currentId);
                if(!targetProfile) return;

                if(window.showProfAlert) {
                    showProfAlert(
                        'warning', 
                        'Emin misiniz?', 
                        `'${targetProfile.name}' programını <b>Ana Program</b> yapmak istediğinize emin misiniz? Günlük program ekranınız tamamen buna göre değişecektir.`, 
                        `
                        <button class="p-alert-btn p-alert-btn-gray" onclick="closeProfAlert()">İptal</button>
                        <button class="p-alert-btn p-alert-btn-blue" onclick="window.executeSetMainProfile()">Evet, Ana Yap</button>
                        `
                    );
                } else {
                    if(confirm(`'${targetProfile.name}' programını Ana Program yapmak istediğinize emin misiniz?`)) {
                        window.executeSetMainProfile();
                    }
                }
            });
        }

        window.toggleExportMenu = function(e) {
            e.stopPropagation(); // Diğer tıklamalarla çakışmayı engeller
            const wrapper = document.getElementById('tcs-exportProfile');
            const trigger = document.getElementById('exportProfileTrigger');
            if(wrapper && trigger) {
                wrapper.classList.toggle('open');
                trigger.classList.toggle('active');
            }
        };

        window.addEventListener('click', function(e) {
            const wrapper = document.getElementById('tcs-exportProfile');
            const trigger = document.getElementById('exportProfileTrigger');
            if (wrapper && trigger && !wrapper.contains(e.target)) {
                wrapper.classList.remove('open');
                trigger.classList.remove('active');
            }
        });

