        // [PL-KART] --- ANA PLAYLIST (SWITCH) KAYDETME MOTORU ---
        window.toggleMainPlaylist = async function(plId, isChecked) {
            // Hafızadaki playlisti bul ve güncelle
            const plIndex = savedPlaylists.findIndex(p => p.id.toString() === plId.toString());
            if (plIndex !== -1) {
                savedPlaylists[plIndex].isMain = isChecked;
                window.renderPlaylists(); // Yıldızın hemen gelmesi için arayüzü güncelle
                
                // Firebase'e kaydet
                if (currentUserUid) {
                    try {
                        const playlistDocRef = doc(db, "users", currentUserUid, "userPlaylists", plId.toString());
                        await setDoc(playlistDocRef, savedPlaylists[plIndex]);
                    } catch (error) {
                    }
                }
            }
        };

        // --- PLAYLIST KAYDETME VE EKRANA ÇİZME MOTORU ---
        
        // --- PLAYLIST FİLTRELEME VE GRUPLAMA MOTORU ---
        const filterExam = document.getElementById('filterExam');
        const filterTrack = document.getElementById('filterTrack');
        const filterSubject = document.getElementById('filterSubject');

        const filterSubjectsData = {
            tyt: ["Türkçe", "Sosyal Bilimler", "Temel Matematik", "Fen Bilimleri", "Genel Deneme"],
            ayt: {
                sayisal: ["Matematik", "Fizik", "Kimya", "Biyoloji", "Genel Deneme"],
                ea: ["Matematik", "Türk Dili ve Edebiyatı", "Tarih-1", "Coğrafya-1", "Genel Deneme"],
                sozel: ["Türk Dili ve Edebiyatı", "Tarih-1", "Coğrafya-1", "Tarih-2", "Coğrafya-2", "Felsefe Grubu", "Din Kültürü ve Ahlak Bilgisi", "Genel Deneme"],
                dil: ["Yabancı Dil", "Genel Deneme"]
            }
        };

        function updateFilterSubjects() {
            if(!filterExam || !filterTrack || !filterSubject) return;
            const ex = filterExam.value;
            const tr = filterTrack.value;
            
            filterSubject.innerHTML = '<option value="all">Tüm Dersler</option>';
            
            let subs = [];
            if (ex === 'tyt') {
                subs = filterSubjectsData.tyt;
            } else if (ex === 'ayt') {
                if (tr !== 'all') {
                    subs = filterSubjectsData.ayt[tr];
                } else {
                    // AYT seçili ama Alan seçilmediyse tüm AYT derslerini getir
                    const allAyt = new Set([...filterSubjectsData.ayt.sayisal, ...filterSubjectsData.ayt.ea, ...filterSubjectsData.ayt.sozel, ...filterSubjectsData.ayt.dil]);
                    subs = Array.from(allAyt);
                }
            } else {
                return; // Tüm Alanlar seçiliyse sadece 'Tüm Dersler' kalsın
            }

            subs.forEach(s => {
                filterSubject.innerHTML += `<option value="${s}">${s}</option>`;
            });
        }

        if(filterExam && filterTrack && filterSubject) {
            filterExam.addEventListener('change', () => {
                if (filterExam.value === 'ayt') {
                    filterTrack.disabled = false;
                } else {
                    filterTrack.value = 'all';
                    filterTrack.disabled = true;
                }
                updateFilterSubjects();
                window.renderPlaylists();
            });

            filterTrack.addEventListener('change', () => {
                updateFilterSubjects();
                window.renderPlaylists();
            });

            filterSubject.addEventListener('change', () => {
                window.renderPlaylists();
            });
        }

        // --- PLAYLIST SİLME MODU VE GÖRÜNTÜLEME MOTORU ---
        let isPlaylistDeleteMode = false;
        let selectedPlaylists = new Set();
        
        const togglePlaylistDeleteModeBtn = document.getElementById('togglePlaylistDeleteModeBtn');
        if(togglePlaylistDeleteModeBtn) {
            togglePlaylistDeleteModeBtn.addEventListener('click', () => {
                if (!isPlaylistDeleteMode) {
                    isPlaylistDeleteMode = true;
                    togglePlaylistDeleteModeBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Sil (0)';
                    togglePlaylistDeleteModeBtn.style.backgroundColor = '#d9534f';
                    togglePlaylistDeleteModeBtn.style.color = '#fff';
                    window.renderPlaylists(); // Seçilebilir efekti eklemek için renderla
                } else {
                    if(selectedPlaylists.size > 0) {
                        document.getElementById('playlistDeleteConfirmMsg').innerText = `Seçilen ${selectedPlaylists.size} playlisti kalıcı olarak silmek istediğinize emin misiniz?`;
                        document.getElementById('playlistDeleteConfirmModal').style.display = 'flex';
                    } else {
                        cancelPlaylistDeleteMode();
                    }
                }
            });
        }

        function cancelPlaylistDeleteMode() {
            isPlaylistDeleteMode = false;
            selectedPlaylists.clear();
            if(togglePlaylistDeleteModeBtn) {
                togglePlaylistDeleteModeBtn.innerHTML = '<i class="fa-solid fa-trash"></i> Kaldır';
                togglePlaylistDeleteModeBtn.style.backgroundColor = '#ffeaea';
                togglePlaylistDeleteModeBtn.style.color = '#d9534f';
            }
            window.renderPlaylists();
        }

        document.getElementById('yesPlaylistDeleteBtn').addEventListener('click', async () => {
            document.getElementById('playlistDeleteConfirmModal').style.display = 'none';
            const btn = document.getElementById('yesPlaylistDeleteBtn');
            const orig = btn.innerText;
            btn.innerText = 'Siliniyor...';
            btn.disabled = true;
            try {
                for (let plId of selectedPlaylists) {
                    await deleteDoc(doc(db, "users", currentUserUid, "userPlaylists", plId.toString()));
                    savedPlaylists = savedPlaylists.filter(p => p.id.toString() !== plId.toString());
                }
                cancelPlaylistDeleteMode();
            } catch(e) {
                alert("Silinirken hata oluştu.");
            } finally {
                btn.innerText = orig;
                btn.disabled = false;
            }
        });

        // Tıklama Yöneticisi: Moda göre detay açar veya silmek için seçer
        window.handlePlaylistClick = function(plId) {
            if(isPlaylistDeleteMode) {
                const idStr = plId.toString();
                if(selectedPlaylists.has(idStr)) selectedPlaylists.delete(idStr);
                else selectedPlaylists.add(idStr);
                togglePlaylistDeleteModeBtn.innerHTML = `<i class="fa-solid fa-trash"></i> Sil (${selectedPlaylists.size})`;
                window.renderPlaylists();
            } else {
                window.viewPlaylistDetails(plId);
            }
        };

        // --- DETAY PENCERESİ VE İZLEME İLERLEMESİ MOTORU (GÜNCELLENDİ) ---
        let currentViewingPlaylistId = null;
        let originalPlaylistProgressState = []; // Değişiklik tespiti için hafıza (Dedektif)

        // Süre yazısını ("12:34" veya "1:05:20" vb.) saniyeye çeviren matematiksel yardımcı fonksiyon
        function timeStringToSeconds(timeStr) {
            if (!timeStr) return 0;
            const parts = timeStr.split(':').map(Number).reverse();
            let seconds = 0;
            if (parts[0]) seconds += parts[0];
            if (parts[1]) seconds += parts[1] * 60;
            if (parts[2]) seconds += parts[2] * 3600;
            return seconds;
        }

        // Değişiklik var mı kontrolü
        function hasPlaylistProgressChanged() {
            const checkboxes = document.querySelectorAll('.video-watched-cb');
            if (checkboxes.length !== originalPlaylistProgressState.length) return true;
            for (let i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked !== originalPlaylistProgressState[i]) return true;
            }
            return false;
        }

        window.viewPlaylistDetails = function(plId) {
            const pl = savedPlaylists.find(p => p.id.toString() === plId.toString());
            if(!pl) return;
            
            currentViewingPlaylistId = plId; 
            document.getElementById('vp-title').innerText = pl.customTitle || pl.subject;
            
            let watchedSeconds = 0;
            let totalSeconds = 0;
            
            const tbody = document.getElementById('vp-tbody');
            tbody.innerHTML = '';
            originalPlaylistProgressState = [];
            
            if(pl.videos && pl.videos.length > 0) {
                pl.videos.forEach((v, index) => {
                    originalPlaylistProgressState.push(!!v.isWatched); 
                    
                    const sec = timeStringToSeconds(v.duration);
                    totalSeconds += sec;
                    if(v.isWatched) watchedSeconds += sec;

                    const isChecked = v.isWatched ? 'checked' : '';
                    const rowOpacity = v.isWatched ? '0.5' : '1';
                    const textDeco = v.isWatched ? 'line-through' : 'none';
                    
                    // YENİ EKLENEN KISIM: Plana Eklendi Etiketi (Eğer videonun görevi silinmediyse burada gözükür)
                    const plannedBadge = v.isPlanned ? '<span style="color:#17a2b8; font-size:10px; font-weight:bold; background: #e0f7fa; padding: 2px 6px; border-radius:4px; margin-left: 8px; display: inline-block; transform: translateY(-2px);"><i class="fa-solid fa-calendar-plus"></i> Plana Eklendi</span>' : '';

                    tbody.innerHTML += `
                        <tr style="opacity: ${rowOpacity}; transition: var(--transition-base);">
                            <td style="font-weight: 800; color: var(--color-primary); text-align: center;">${index + 1}</td>
                            <td><img src="${v.thumb}" style="width: 70px; border-radius: var(--radius-sm); box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></td>
                            <td style="line-height: 1.4; color: var(--color-text-main); font-weight: 600;">
                                <span class="vid-title" style="text-decoration: ${textDeco};">${v.title}</span>
                                ${plannedBadge}
                            </td>
                            <td style="color: var(--color-text-muted); font-weight: 800;"><i class="fa-solid fa-clock"></i> ${v.duration}</td>
                            <td style="text-align: center;">
                                <label class="premium-check-label">
                                    <input type="checkbox" class="video-watched-cb" data-index="${index}" ${isChecked} onchange="
                                        this.closest('tr').style.opacity = this.checked ? '0.5' : '1';
                                        this.closest('tr').querySelector('.vid-title').style.textDecoration = this.checked ? 'line-through' : 'none';
                                    " style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--color-success);">
                                    <span class="premium-check-mark"></span>
                                </label>
                            </td>
                        </tr>
                    `;
                });
                
                // Yüzdelik (Progress) Matematiksel Hesaplama
                let percent = 0;
                if(totalSeconds > 0) {
                    percent = Math.round((watchedSeconds / totalSeconds) * 100);
                }
                
                const watchedCount = pl.videos.filter(v => v.isWatched).length;
                document.getElementById('vp-count').innerHTML = `<i class="fa-solid fa-video"></i> ${watchedCount} / ${pl.videoCount} İzlendi`;
                document.getElementById('vp-duration').innerHTML = `<i class="fa-solid fa-stopwatch"></i> ${pl.totalDuration || 'Bilinmiyor'}`;
                document.getElementById('vp-progress').innerHTML = `<i class="fa-solid fa-percent"></i> %${percent} Tamamlandı`;
                
            } else {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#888; font-weight: bold;">Bu playlist eski sürüm, iç detay videoları görüntülenemiyor.</td></tr>';
                document.getElementById('vp-count').innerHTML = `<i class="fa-solid fa-video"></i> 0 / ${pl.videoCount} İzlendi`;
                document.getElementById('vp-duration').innerHTML = `<i class="fa-solid fa-stopwatch"></i> ${pl.totalDuration || 'Bilinmiyor'}`;
                document.getElementById('vp-progress').innerHTML = `<i class="fa-solid fa-percent"></i> %0 Tamamlandı`;
            }
            
            document.getElementById('viewPlaylistModal').style.display = 'flex';
        };

        // Güvenli Kapatma İşlemi Motoru
        function attemptClosePlaylistModal() {
            if (hasPlaylistProgressChanged()) {
                document.getElementById('playlistCancelConfirmModal').style.display = 'flex';
            } else {
                document.getElementById('viewPlaylistModal').style.display = 'none';
            }
        }

        // Çarpı ve Kapat butonları
        document.getElementById('closeViewPlaylistModalBtn').onclick = attemptClosePlaylistModal;
        const cancelViewPlaylistBtn = document.getElementById('cancelViewPlaylistBtn');
        if(cancelViewPlaylistBtn) cancelViewPlaylistBtn.onclick = attemptClosePlaylistModal;

        // İptal (Çıkış) Onayı (Emin misin > Evet Çık)
        document.getElementById('yesPlaylistCancelBtn').onclick = () => {
            document.getElementById('playlistCancelConfirmModal').style.display = 'none';
            document.getElementById('viewPlaylistModal').style.display = 'none';
        };

        // Kaydet Butonu SADECE onay penceresini açar (Kendi değişmez)
        const savePlaylistProgressBtn = document.getElementById('savePlaylistProgressBtn');
        if(savePlaylistProgressBtn) {
            savePlaylistProgressBtn.onclick = () => {
                if (!hasPlaylistProgressChanged()) {
                    document.getElementById('viewPlaylistModal').style.display = 'none';
                    return;
                }
                // Sadece emin misin penceresini açar, işlemi başlatmaz!
                document.getElementById('playlistSaveConfirmModal').style.display = 'flex';
            };
        }

        // Asıl Kaydetme İşlemi (Emin misin > Evet Kaydet'e basılınca başlar)
        document.getElementById('yesPlaylistSaveBtn').onclick = async () => {
            // Onay penceresini hemen kapat
            document.getElementById('playlistSaveConfirmModal').style.display = 'none';

            if (!currentViewingPlaylistId || !currentUserUid) return;

            const plIndex = savedPlaylists.findIndex(p => p.id.toString() === currentViewingPlaylistId.toString());
            if (plIndex === -1) return;

            const pl = savedPlaylists[plIndex];
            const checkboxes = document.querySelectorAll('.video-watched-cb');

            let changedTasks = []; // YENİ: Değişen görevleri takip edeceğimiz liste

            // Yeni check durumlarını listeye kaydet ve görevlerle (userTasks) senkronize et
            checkboxes.forEach(cb => {
                const idx = parseInt(cb.getAttribute('data-index'));
                if(pl.videos && pl.videos[idx]) {
                    const newStatus = cb.checked;
                    
                    // Eğer durum değişmişse senkronizasyonu başlat
                    if (pl.videos[idx].isWatched !== newStatus) {
                        pl.videos[idx].isWatched = newStatus;

                        // Takvimdeki tüm görevleri tarayıp bu videoyu içerenleri de aynı duruma getir
                        if (typeof userTasks !== 'undefined') {
                            Object.keys(userTasks).forEach(dateKey => {
                                userTasks[dateKey].forEach(task => {
                                    if (task.taskVideos && task.taskVideos.length > 0) {
                                        task.taskVideos.forEach(tv => {
                                            if (tv.plId && tv.plId.toString() === pl.id.toString() && tv.videoId === pl.videos[idx].videoId) {
                                                tv.isWatched = newStatus;
                                                if (!changedTasks.includes(task)) changedTasks.push(task);
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    }
                }
            });

            // Tıpkı notlardaki gibi üstten inen Baloncuğu (Toast) göster
            const toast = document.getElementById('actionToast');
            const toastText = document.getElementById('toastText');
            toastText.innerText = "İlerleme Kaydediliyor...";
            toast.classList.add('show');
            toast.querySelector('.toast-spinner').style.display = 'block';

            try {
                // 1. Playlisti Firebase veritabanına yaz
                const playlistDocRef = doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString());
                await setDoc(playlistDocRef, pl);

                // 2. Etkilenen (içinde o video olan) tüm görevleri Firebase'e kaydet (SENKRONİZASYON)
                if (changedTasks.length > 0 && currentUserUid) {
                    for (const t of changedTasks) {
                        await setDoc(doc(db, "users", currentUserUid, "userTasks", t.id.toString()), t, { merge: true });
                    }
                }

                // 3. Modal içindeki sayacı ve ilerlemeyi yenile
                window.viewPlaylistDetails(currentViewingPlaylistId);
                
                // 4. Arka plandaki kartların yüzdelik dilimini anında güncelle!
                window.renderPlaylists();
                
                // Baloncuğu "Başarılı" durumuna çevir
                toastText.innerText = "İlerleme Kaydedildi!";
                toast.querySelector('.toast-spinner').style.display = 'none'; // Dönen ikonu gizle
                
                setTimeout(() => {
                    toast.classList.remove('show'); // Baloncuğu geri yukarı yolla
                    setTimeout(() => { toast.querySelector('.toast-spinner').style.display = 'block'; }, 500); // Sonraki kullanım için ikonu geri getir
                }, 2000);

            } catch (error) {
                toastText.innerText = "Hata Oluştu!";
                toast.querySelector('.toast-spinner').style.display = 'none';
                setTimeout(() => toast.classList.remove('show'), 3000);
                alert("Sistem Hatası: İlerleme kaydedilemedi.");
            }
        };

        // --- GÜNCEL KART ÇİZME FONKSİYONU ---
        window.renderPlaylists = function() {
            const grid = document.getElementById('playlistsGrid');
            if(!grid) return;
            
            const ex = document.getElementById('filterExam') ? document.getElementById('filterExam').value : 'all';
            const tr = document.getElementById('filterTrack') ? document.getElementById('filterTrack').value : 'all';
            const su = document.getElementById('filterSubject') ? document.getElementById('filterSubject').value : 'all';

            let filtered = savedPlaylists;
            
            if (ex !== 'all') {
                filtered = filtered.filter(p => p.examType === ex);
                if (ex === 'ayt' && tr !== 'all') {
                    filtered = filtered.filter(p => p.track === tr);
                }
            }
            if (su !== 'all') {
                filtered = filtered.filter(p => p.subject === su);
            }

            grid.innerHTML = '';
            
            if(filtered.length === 0) {
                grid.innerHTML = `
                    <div class="placeholder-text" style="text-align: center; padding: 40px; font-size: 14px;">
                        <i class="fa-brands fa-youtube" style="font-size: 40px; color: var(--color-primary-border); margin-bottom: 15px; display: block;"></i>
                        Bu filtrelere uygun bir playlist bulunamadı veya henüz eklemedin!
                    </div>
                `;
                return;
            }

            const groupedPlaylists = {};
            filtered.forEach(pl => {
                if(!groupedPlaylists[pl.subject]) groupedPlaylists[pl.subject] = [];
                groupedPlaylists[pl.subject].push(pl);
            });

            for (const [subjectName, lists] of Object.entries(groupedPlaylists)) {
                let sectionHtml = `
                    <div style="margin-bottom: 30px;">
                        <h3 style="font-size: 16px; font-weight: 800; color: var(--color-primary); border-bottom: 2px solid #eef2f5; padding-bottom: 8px; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-layer-group"></i> ${subjectName} Playlistleri
                        </h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
                `;

                lists.forEach(pl => {
                    const badgeClass = pl.examType === 'tyt' ? 'badge-tyt' : 'badge-ayt';
                    const examText = pl.examType.toUpperCase();
                    const isSelectedClass = selectedPlaylists.has(pl.id.toString()) ? 'selected-for-delete' : '';
                    
                    const isMainChecked = pl.isMain ? 'checked' : '';
                    const mainBadgeHtml = pl.isMain ? `<div class="main-badge"><i class="fa-solid fa-star"></i> Ana</div>` : '';
                    
                    let watchedSeconds = 0;
                    let totalSeconds = 0;
                    if (pl.videos && pl.videos.length > 0) {
                        pl.videos.forEach(v => {
                            // timeStringToSeconds fonksiyonunu bir önceki adımda eklemiştik, onu kullanıyoruz
                            const sec = timeStringToSeconds(v.duration);
                            totalSeconds += sec;
                            if (v.isWatched) watchedSeconds += sec;
                        });
                    }
                    let percent = 0;
                    if (totalSeconds > 0) {
                        percent = Math.round((watchedSeconds / totalSeconds) * 100);
                    }
                    
                    // İlerlemeye göre dinamik renk (0 ise gri, başladıysa yeşil, %100 bittiyse altın)
                    let percentColor = '#aaa'; 
                    if (percent > 0 && percent < 100) percentColor = '#20c997'; 
                    if (percent === 100) percentColor = '#ffc107'; 

                    sectionHtml += `
                        <div class="playlist-card ${isSelectedClass}" onclick="window.handlePlaylistClick('${pl.id}')">
                            <div style="position: relative; height: 150px; background: #111;">
                                ${mainBadgeHtml}
                                <img src="${pl.firstVideoThumb}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.85;">
                                
                                <div style="position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: var(--radius-sm); font-size: 11px; font-weight: bold; border: 1px solid rgba(255,255,255,0.2); display: flex; gap: 8px; align-items: center;">
                                    <span><i class="fa-solid fa-list-ul"></i> ${pl.videoCount}</span>
                                    <span style="color: #b3d7ff; font-weight: normal;">|</span>
                                    <span><i class="fa-regular fa-clock"></i> ${pl.totalDuration || '?'}</span>
                                    <span style="color: #b3d7ff; font-weight: normal;">|</span>
                                    <span style="color: ${percentColor};"><i class="fa-solid fa-chart-pie"></i> %${percent}</span>
                                </div>
                            </div>
                            <div style="padding: 15px;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                    <h4 style="margin: 0; font-size: 16px; color: var(--color-text-main); font-weight: 800; padding-right:10px;" data-custom-title="Ders: ${pl.subject}">${pl.customTitle || pl.subject}</h4>
                                    <span class="task-card-badge ${badgeClass}" style="font-size: 10px; padding: 3px 6px;">${examText}</span>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <a href="${pl.link}" target="_blank" onclick="event.stopPropagation();" style="font-size: 12px; color: #ff0000; text-decoration: none; font-weight: 800; display: inline-flex; align-items: center; gap: 5px;">
                                        <i class="fa-brands fa-youtube" style="font-size: 14px;"></i> YouTube'da Aç
                                    </a>
                                    
                                    <div style="display: flex; align-items: center; gap: 6px;" data-custom-title="Ana Playlist Olarak Belirle" onclick="event.stopPropagation();">
                                        <span style="font-size: 11px; font-weight: 800; color: var(--color-text-muted);">Ana</span>
                                        <label class="switch" style="margin: 0;">
                                            <input type="checkbox" ${isMainChecked} onchange="window.toggleMainPlaylist('${pl.id}', this.checked)">
                                            <span class="slider"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                });

                sectionHtml += `</div></div>`;
                grid.innerHTML += sectionHtml;
            }
        };

        // --- PLAYLIST KAYDETME VE EKRANA ÇİZME MOTORU (İSİM KONTROLLÜ) ---
        const theSavePlaylistBtn = document.getElementById('confirmSavePlaylistBtn');
        if(theSavePlaylistBtn) {
            theSavePlaylistBtn.addEventListener('click', async () => {
                if(!window.tempPlaylistData) return;
                if(!currentUserUid) {
                    DOM.customAlertMessage.innerText = "Playlist kaydetmek için giriş yapmalısınız.";
                    DOM.customAlertModal.style.display = 'flex';
                    return;
                }

                // KUTUYU YEPYENİ ID İLE ÇEKİYORUZ (ESKİ HAYALET KUTULARI ENGELLEMEK İÇİN)
                const titleInput = document.getElementById('yeniGercekIsimKutusu');
                const customTitleVal = titleInput.value.trim();
                
                if (!customTitleVal) {
                    titleInput.style.borderColor = '#d9534f'; // Boşsa kutuyu kırmızı yap
                    setTimeout(() => titleInput.style.borderColor = '#dce4ec', 2000);
                    
                    DOM.customAlertMessage.innerText = "Lütfen playliste isim veriniz.";
                    DOM.customAlertModal.style.display = 'flex';
                    return; // İsim yoksa kaydetmeyi durdur
                }
                
                // İsim girilmişse pakete dahil et
                window.tempPlaylistData.customTitle = customTitleVal;
                
                const origText = theSavePlaylistBtn.innerText;
                theSavePlaylistBtn.innerText = "Kaydediliyor...";
                theSavePlaylistBtn.disabled = true;

                try {
                    // Ekrandaki seçili ders ve alanları alır
                    window.tempPlaylistData.examType = document.getElementById('playlistExamType').value;
                    window.tempPlaylistData.track = document.getElementById('playlistExamType').value === 'ayt' ? document.getElementById('playlistTrack').value : null;
                    const _plSubject = document.getElementById('playlistSubject').value;
                    const _plSL = document.getElementById('playlistSubLesson');
                    const _plSLVal = (_plSL && _plSL.value) ? _plSL.value : '';
                    // Alt ders "Genel" veya boşsa parent subject kullan, değilse alt ders adı subject olur
                    window.tempPlaylistData.subject = (_plSLVal && _plSLVal !== 'Genel') ? _plSLVal : _plSubject;
                    window.tempPlaylistData.parentSubject = _plSubject;
                    window.tempPlaylistData.subLesson = _plSLVal || null;

                    // Firebase'e yaz
                    const playlistDocRef = doc(db, "users", currentUserUid, "userPlaylists", window.tempPlaylistData.id.toString());
                    await setDoc(playlistDocRef, window.tempPlaylistData);

                    // Hafızaya ekle ve ekrana çiz
                    savedPlaylists.push(window.tempPlaylistData);
                    window.renderPlaylists();
                    
                    document.getElementById('addPlaylistModal').style.display = 'none';
                    window.tempPlaylistData = null; // İşlem bitince sıfırla
                    titleInput.value = ''; // Kutuyu sonrakiler için temizle
                    
                } catch (error) {
                    DOM.customAlertMessage.innerText = "Sistem Hatası: Playlist kaydedilemedi.";
                    DOM.customAlertModal.style.display = 'flex';
                } finally {
                    theSavePlaylistBtn.innerText = origText;
                    theSavePlaylistBtn.disabled = false;
                }
            });
        }

        // YENİ PLAYLIST EKLERKEN KUTUYU SIFIRLAMA
        if(addNewPlaylistBtn) {
            addNewPlaylistBtn.addEventListener('click', () => {
                const titleInput = document.getElementById('yeniGercekIsimKutusu');
                if(titleInput) titleInput.value = '';
            });
        }

        // --- PLAYLIST BAŞLIĞI DÜZENLEME MOTORU ---
        const editPlaylistTitleIcon = document.getElementById('editPlaylistTitleIcon');
        const renamePlaylistModal = document.getElementById('renamePlaylistModal');
        const newPlaylistNameInput = document.getElementById('newPlaylistNameInput');

        if (editPlaylistTitleIcon) {
            editPlaylistTitleIcon.addEventListener('click', () => {
                if (!currentViewingPlaylistId) return;
                const pl = savedPlaylists.find(p => p.id.toString() === currentViewingPlaylistId.toString());
                if (pl) {
                    newPlaylistNameInput.value = pl.customTitle || pl.subject;
                    renamePlaylistModal.style.display = 'flex';
                    setTimeout(() => newPlaylistNameInput.focus(), 100);
                }
            });
        }

        function closeRenamePlaylistModal() {
            if(renamePlaylistModal) renamePlaylistModal.style.display = 'none';
        }

        document.getElementById('closeRenamePlaylistModalBtn')?.addEventListener('click', closeRenamePlaylistModal);
        document.getElementById('cancelRenamePlaylistBtn')?.addEventListener('click', closeRenamePlaylistModal);

        document.getElementById('saveRenamePlaylistBtn')?.addEventListener('click', async () => {
            const newTitle = newPlaylistNameInput.value.trim();
            if (!newTitle) {
                newPlaylistNameInput.style.borderColor = '#d9534f';
                setTimeout(() => newPlaylistNameInput.style.borderColor = '#dce4ec', 2000);
                return;
            }

            if (!currentViewingPlaylistId || !currentUserUid) return;
            const plIndex = savedPlaylists.findIndex(p => p.id.toString() === currentViewingPlaylistId.toString());
            if (plIndex === -1) return;

            const saveBtn = document.getElementById('saveRenamePlaylistBtn');
            const origBtnText = saveBtn.innerText;
            saveBtn.innerText = "Kaydediliyor...";
            saveBtn.disabled = true;

            try {
                // Hafızayı güncelle
                savedPlaylists[plIndex].customTitle = newTitle;
                
                // Firebase'e yaz
                const playlistDocRef = doc(db, "users", currentUserUid, "userPlaylists", savedPlaylists[plIndex].id.toString());
                await setDoc(playlistDocRef, savedPlaylists[plIndex], { merge: true });

                // Arayüzü güncelle
                document.getElementById('vp-title').innerText = newTitle;
                window.renderPlaylists();
                closeRenamePlaylistModal();
            } catch (error) {
                alert("Başlık güncellenirken sistem hatası oluştu.");
            } finally {
                saveBtn.innerText = origBtnText;
                saveBtn.disabled = false;
            }
        });

        // [PL-VIDEO] --- YOUTUBE PLAYLISTTEN GÖREV SEÇME MOTORU ---
        
        // --- ÇOKLU VİDEO SEÇİMİ, HIZ MATEMATİĞİ VE "PLANA EKLENDİ" MOTORU ---
        let currentTaskVideos = []; 
        let currentTaskSpeed = 1;
        let currentSelectingPlaylistId = null;
        let selectedVideosForTaskIndices = new Set();
        
        // Hazır Hız Butonları Dinleyicisi (hem sol hem sağ panel)
        document.addEventListener('click', (e) => {
            const opt = e.target.closest('.speed-opt');
            if (!opt) return;
            document.querySelectorAll('.speed-opt').forEach(btn => btn.classList.remove('active'));
            opt.classList.add('active');
            currentTaskSpeed = parseFloat(opt.getAttribute('data-val'));
            // Her iki paneldeki özel hız kutusunu sıfırla
            [DOM.customSpeedInput, document.getElementById('tvp-customSpeedInput')].forEach(inp => {
                if (!inp) return;
                inp.value = '';
                inp.style.background = '#f8fbff';
                inp.style.color = 'var(--color-primary)';
            });
            window.renderTaskVideoSummary(true);
        });

        // ÖZEL HIZ GİRİŞİ — merkezi fonksiyonlar, her iki input senkronize
        function applyCustomSpeed(rawValue) {
            let raw = (rawValue || '').replace('x', '').replace(',', '.');
            let val = parseFloat(raw);
            if (isNaN(val) || val <= 0) {
                // Geçersiz — her iki kutuyu sıfırla
                [DOM.customSpeedInput, document.getElementById('tvp-customSpeedInput')].forEach(inp => {
                    if (!inp) return;
                    inp.value = '';
                    inp.style.background = '#f8fbff';
                    inp.style.color = 'var(--color-primary)';
                });
                return;
            }
            let centVal = Math.round(val * 100);
            val = Math.ceil(centVal / 5) * 0.05;
            val = parseFloat(val.toFixed(2));
            currentTaskSpeed = val;
            // Her iki kutuya aynı değeri yaz
            [DOM.customSpeedInput, document.getElementById('tvp-customSpeedInput')].forEach(inp => {
                if (!inp) return;
                inp.value = val + 'x';
                inp.style.background = 'var(--color-primary)';
                inp.style.color = '#fff';
            });
            document.querySelectorAll('.speed-opt').forEach(btn => btn.classList.remove('active'));
            window.renderTaskVideoSummary(true);
        }

        function onCustomSpeedFocus(e) {
            e.target.value = e.target.value.replace('x', '');
            document.querySelectorAll('.speed-opt').forEach(btn => btn.classList.remove('active'));
            e.target.style.background = 'var(--color-primary)';
            e.target.style.color = '#fff';
        }

        // Her iki input'a aynı listener'ları bağla
        [DOM.customSpeedInput, document.getElementById('tvp-customSpeedInput')].forEach(inp => {
            if (!inp) return;
            inp.addEventListener('focus', onCustomSpeedFocus);
            inp.addEventListener('change', (e) => applyCustomSpeed(e.target.value));
        });

        window.updatePlaylistButtonVisibility = function() {
            const taskTypeVal = document.getElementById('taskType') ? document.getElementById('taskType').value : '';
            const btn = DOM.selectFromPlaylistBtn;
            if (btn) {
                if (taskTypeVal === 'Konu Anlatımı' || taskTypeVal === 'Genel Tekrar') {
                    btn.style.display = 'flex'; 
                } else {
                    btn.style.display = 'none';
                }
            }
        };

        // 1. Açılır menüleri dinle ve herhangi bir seçim yapıldığında motoru çalıştır
        document.addEventListener('click', function(e) {
            const option = e.target.closest('.tcs-option');
            if (option) {
                // Seçim yapıldıktan hemen sonra arka plandaki yazının güncellenmesi için çok kısa bekleyip kontrolü yapıyoruz (10ms)
                setTimeout(window.updatePlaylistButtonVisibility, 10);
            }
        });

        // Yeni Görev Ekleme Butonuna Basıldığında (Her Şeyi Sıfırla)
        const originalOpenTaskModal = window.openTaskModalForDate;
        window.openTaskModalForDate = function(dateStr) {
            if(originalOpenTaskModal) originalOpenTaskModal(dateStr);
            closeTaskVideoPanel();
            currentTaskVideos = [];
            currentTaskSpeed = 1;

            document.querySelectorAll('.speed-opt').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.speed-opt[data-val="1"]')?.classList.add('active');

            [DOM.customSpeedInput, document.getElementById('tvp-customSpeedInput')].forEach(inp => {
                if (!inp) return;
                inp.value = '';
                inp.style.background = '#f8fbff';
                inp.style.color = 'var(--color-primary)';
            });
            
            window.renderTaskVideoSummary(); 
            setTimeout(window.updatePlaylistButtonVisibility, 50);
        };

        // Var Olan Görevin Detayına / Düzenlemesine Girildiğinde (Hafızayı Getir)
        const originalViewTaskDetails = window.viewTaskDetails;
        window.viewTaskDetails = function(dateKey, taskId) {
            if(originalViewTaskDetails) originalViewTaskDetails(dateKey, taskId);
            
            if (currentViewingTask && currentViewingTask.taskVideos) {
                currentTaskVideos = [...currentViewingTask.taskVideos];
            } else {
                currentTaskVideos = [];
            }
            
            currentTaskSpeed = currentViewingTask.taskSpeed || 1;

            // Tüm aktiflikleri temizle
            document.querySelectorAll('.speed-opt').forEach(btn => btn.classList.remove('active'));
            const customInput    = DOM.customSpeedInput;
            const tvpCustomInput2 = document.getElementById('tvp-customSpeedInput');

            const defaultBtn = document.querySelector(`.speed-opt[data-val="${currentTaskSpeed}"]`);
            if(defaultBtn) {
                defaultBtn.classList.add('active');
                [customInput, tvpCustomInput2].forEach(inp => {
                    if (!inp) return;
                    inp.value = '';
                    inp.style.background = '#f8fbff';
                    inp.style.color = 'var(--color-primary)';
                });
            } else {
                // Hazır buton değilse (Örn: 2.7 veya 3) özel kutuyu mavi yap ve içine değeri "x" ile yaz
                [customInput, tvpCustomInput2].forEach(inp => {
                    if (!inp) return;
                    inp.value = currentTaskSpeed + 'x';
                    inp.style.background = 'var(--color-primary)';
                    inp.style.color = '#fff';
                });
            }
            
            window.renderTaskVideoSummary(); 
            setTimeout(window.updatePlaylistButtonVisibility, 50);
        };

