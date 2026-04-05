        // [YAN-PANEL] === YAN PANEL SİSTEMİ ===
        // Panel elementleri
        const tvPanel      = document.getElementById('taskVideoPanel');
        const tvPanelTitle = document.getElementById('taskVideoPanelTitle').querySelector('span');
        const tvPanelBody  = document.getElementById('taskVideoPanelBody');
        const tvPanelActions = document.getElementById('taskVideoPanelActions');
        const tvPanelFooter  = document.getElementById('taskVideoPanelFooter');
        const tvPanelBack    = document.getElementById('taskVideoPanelBackBtn');
        const tvPanelConfirm = document.getElementById('taskVideoPanelConfirmBtn');
        const modalContent   = document.getElementById('addTaskModalContent');

        function openTaskVideoPanel() {
            tvPanel.style.display = 'flex';
            tvPanel.style.flexDirection = 'column';
            modalContent.style.maxWidth = '1000px'; // <-- BURAYI 1000px'e GERİ ALDIK
            
            // Panel yüksekliğini sol panelle eşitle - summary alta sabit yapışır
            requestAnimationFrame(() => {
                const mainPanel = document.getElementById('addTaskMainPanel');
                if (mainPanel && mainPanel.offsetHeight > 0) {
                    tvPanel.style.height = mainPanel.offsetHeight + 'px';
                }
            });
        }

        function closeTaskVideoPanel() {
            tvPanel.style.display = 'none';
            tvPanel.style.height = '';
            modalContent.style.maxWidth = '520px';
        }

        window.openAddNewPlaylistAndReturn = function() {
            window.isReturningToTaskPlaylistSelector = true;
            // Panel açık kalır, arkada bekler

            const currentSubject = document.getElementById('taskSubject')?.value;
            const currentExamType = document.getElementById('taskExamType')?.value;
            const currentTrack    = document.getElementById('taskTrack')?.value;

            document.getElementById('addNewPlaylistBtn').click();

            const updateCustomSelectUI = (inputId, val) => {
                const hiddenInput = document.getElementById(inputId);
                if (!hiddenInput) return;
                hiddenInput.value = val;
                const wrapper = hiddenInput.closest('.task-custom-select');
                if (!wrapper) return;
                const options = wrapper.querySelectorAll('.tcs-option');
                let foundText = val;
                options.forEach(opt => {
                    if (opt.getAttribute('data-value') === val) { opt.classList.add('selected'); foundText = opt.innerText; }
                    else opt.classList.remove('selected');
                });
                const textSpan = wrapper.querySelector('.tcs-text');
                if (textSpan) textSpan.innerText = foundText;
            };

            setTimeout(() => {
                if (currentExamType) {
                    updateCustomSelectUI('playlistExamType', currentExamType);
                    const pTrackGroup = document.getElementById('playlistTrackGroup');
                    if (currentExamType === 'ayt' && pTrackGroup) {
                        pTrackGroup.style.display = 'flex';
                        if (currentTrack) updateCustomSelectUI('playlistTrack', currentTrack);
                    } else if (pTrackGroup) {
                        pTrackGroup.style.display = 'none';
                    }
                }
                if (currentSubject) updateCustomSelectUI('playlistSubject', currentSubject);
            }, 150);

            const checkClose = setInterval(() => {
                const modal = document.getElementById('addPlaylistModal');
                if (modal && modal.style.display === 'none') {
                    clearInterval(checkClose);
                    if (window.isReturningToTaskPlaylistSelector) {
                        window.isReturningToTaskPlaylistSelector = false;
                        const sub = document.getElementById('taskSubject').value;
                        window.renderPlaylistCardsForSelection(true, sub);
                        if (document.getElementById('taskVideoPanel').style.display !== 'flex') {
                            openTaskVideoPanel();
                        }
                    }
                }
            }, 500);
        };

        window.renderPlaylistCardsForSelection = function(showAll = false, subjectOverride) {
            const subject = subjectOverride || document.getElementById('taskSubject').value;

            // Panel başlık
            const _slLabel = document.getElementById('taskSubLesson') ? document.getElementById('taskSubLesson').value : '';
            const _displayLabel = (_slLabel && _slLabel !== 'Genel') ? _slLabel : subject;
            tvPanelTitle.textContent = (showAll ? 'Tüm Playlistler' : 'Ana Playlistler') + ' (' + _displayLabel + ')';

            // Panel aksiyon butonları
            if (showAll) {
                tvPanelActions.innerHTML = `
                    <button onclick="window.renderPlaylistCardsForSelection(false)" style="padding:5px 10px; border:1px solid var(--color-primary); background:var(--color-bg-hover); color:var(--color-primary); border-radius:var(--radius-md); cursor:pointer; font-weight:bold; font-size:11px;">
                        <i class="fa-solid fa-arrow-left"></i> Ana'ya Dön
                    </button>
                    <button onclick="window.openAddNewPlaylistAndReturn()" style="padding:5px 10px; border:none; background:var(--color-success); color:white; border-radius:var(--radius-md); cursor:pointer; font-weight:bold; font-size:11px;">
                        <i class="fa-solid fa-plus"></i> Yeni Ekle
                    </button>`;
            } else {
                tvPanelActions.innerHTML = `
                    <button onclick="window.renderPlaylistCardsForSelection(true)" style="padding:5px 10px; border:1px dashed var(--color-primary); background:rgba(0,123,255,0.05); color:var(--color-primary); border-radius:var(--radius-md); cursor:pointer; font-weight:bold; font-size:11px;">
                        <i class="fa-solid fa-layer-group"></i> Tümünü Göster
                    </button>
`;
            }

            tvPanelFooter.style.display = 'none';
            tvPanelBody.innerHTML = '';

            const _subLesson    = document.getElementById('taskSubLesson')  ? document.getElementById('taskSubLesson').value  : '';
            const _taskExamType = document.getElementById('taskExamType')  ? document.getElementById('taskExamType').value  : 'tyt';
            const _taskTrack    = document.getElementById('taskTrack')     ? document.getElementById('taskTrack').value     : '';
            const _effectiveSubject = (_subLesson && _subLesson !== 'Genel') ? _subLesson : subject;

            const _plMatches = (p) => {
                if (p.examType && p.examType !== _taskExamType) return false;
                if (_taskExamType === 'ayt' && p.track && _taskTrack && p.track !== _taskTrack) return false;
                if (_subLesson && _subLesson !== 'Genel') {
                    return p.subject === _effectiveSubject && (p.parentSubject === subject || !p.parentSubject);
                }
                return p.subject === subject || p.parentSubject === subject;
            };

            let listToShow = showAll
                ? savedPlaylists.filter(p => _plMatches(p))
                : savedPlaylists.filter(p => p.isMain && _plMatches(p));

            if (listToShow.length === 0 && !showAll) {
                tvPanelBody.innerHTML = `<div style="text-align:center; padding:30px 15px; color:#888;">
                    <i class="fa-solid fa-star" style="font-size:35px; color:var(--color-primary-border); margin-bottom:12px; display:block;"></i>
                    <b>${_effectiveSubject !== subject ? _effectiveSubject : subject}</b> için "Ana" playlist bulunamadı.<br>
                    <span style="font-size:11px;">Sağ üstteki butondan tüm playlistlere ulaşabilirsin.</span></div>`;
                return;
            }
            if (listToShow.length === 0 && showAll) {
                tvPanelBody.innerHTML = `<div style="text-align:center; padding:30px 15px; color:#888;">
                    <i class="fa-solid fa-video-slash" style="font-size:35px; color:var(--color-primary-border); margin-bottom:12px; display:block;"></i>
                    <b>${subject}</b> için henüz playlist eklenmemiş.</div>`;
                return;
            }

            listToShow.forEach(pl => {
                let badgeHtml = '';
                if (showAll) {
                    badgeHtml = pl.isMain
                        ? `<span style="font-size:9px; background:#fff3cd; color:#856404; border:1px solid #ffeeba; padding:2px 5px; border-radius:4px; font-weight:800; margin-left:8px;"><i class="fa-solid fa-star-half-stroke"></i> ÇIKAR</span>`
                        : `<span style="font-size:9px; background:var(--color-bg-hover); color:var(--color-primary); border:1px solid var(--color-primary-border); padding:2px 5px; border-radius:4px; font-weight:800; margin-left:8px;"><i class="fa-solid fa-plus"></i> ANA YAP</span>`;
                }
                const card = document.createElement('div');
                card.style.cssText = 'display:flex; gap:10px; align-items:center; padding:10px; border:1px solid #eef2f5; border-radius:10px; cursor:pointer; transition:all 0.2s; background:var(--color-bg-card); margin-bottom:8px;';
                card.innerHTML = `
                    <div style="position:relative; flex-shrink:0;">
                        <img src="${pl.firstVideoThumb}" style="width:80px; height:45px; object-fit:cover; border-radius:6px;">
                        <div style="position:absolute; bottom:3px; right:3px; background:rgba(0,0,0,0.8); color:white; padding:1px 4px; border-radius:3px; font-size:9px; font-weight:bold;">${pl.videoCount} Video</div>
                    </div>
                    <div style="flex:1; min-width:0;">
                        <div style="font-weight:800; color:var(--color-text-main); font-size:12px; line-height:1.3; margin-bottom:3px; display:flex; align-items:center; flex-wrap:wrap;">${pl.customTitle || pl.subject} ${badgeHtml}</div>
                        <div style="font-size:11px; color:var(--color-primary); font-weight:700;"><i class="fa-solid fa-stopwatch"></i> ${pl.totalDuration || '?'}</div>
                    </div>
                    <i class="fa-solid fa-chevron-right" style="color:var(--color-primary); font-size:14px;"></i>`;
                card.onmouseover = () => { card.style.borderColor = '#cce5ff'; card.style.transform = 'translateY(-1px)'; };
                card.onmouseout  = () => { card.style.borderColor = '#eef2f5'; card.style.transform = 'translateY(0)'; };
                card.onclick = () => window.handlePlaylistSelectionFromModal(pl.id.toString(), showAll);
                tvPanelBody.appendChild(card);
            });
        };

        // Seç Butonu Tıklanması
        const selectFromPlaylistBtn = DOM.selectFromPlaylistBtn;
        if (selectFromPlaylistBtn) {
            selectFromPlaylistBtn.addEventListener('click', () => {
                const subject = document.getElementById('taskSubject').value;
                // Panel zaten açıksa kapat (toggle)
                if (tvPanel.style.display === 'flex') {
                    closeTaskVideoPanel();
                    return;
                }
                window.renderPlaylistCardsForSelection(false, subject);
                openTaskVideoPanel();
            });
        }

        // Tıklanan playlisti Ana yap / Çıkar veya video seçimine geç
        window.handlePlaylistSelectionFromModal = function(plId, isShowAll) {
            const pl = savedPlaylists.find(p => p.id.toString() === plId.toString());
            if (!pl) return;

            if (isShowAll) {
                pl.isMain = !pl.isMain;
                if (typeof currentUserUid !== 'undefined' && currentUserUid && typeof setDoc === 'function' && typeof db !== 'undefined' && typeof doc === 'function') {
                    try { setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true }); } catch(e) {}
                }
                window.renderPlaylistCardsForSelection(true);
                return;
            }

            window.openVideoSelectionForTask(plId);
        };

        // Seçilen playlistin içindeki videoları aç
        window.openVideoSelectionForTask = function(plId) {
            const pl = savedPlaylists.find(p => p.id.toString() === plId.toString());
            if(!pl || !pl.videos) return;
            
            currentSelectingPlaylistId = plId;
            selectedVideosForTaskIndices.clear();
            
            // Önceden seçilmişleri hazırla
            currentTaskVideos.forEach(v => {
                if(v.plId.toString() === plId.toString()) selectedVideosForTaskIndices.add(v.index);
            });
            
            const tvBody = document.getElementById('taskVideoPanelBody');
            if (tvBody) tvBody.innerHTML = '';

            pl.videos.forEach((v, index) => {
                const isSelected = selectedVideosForTaskIndices.has(index);

                let badgeHtml = '';
                if (v.isPlanned) badgeHtml += '<span style="color:#17a2b8; font-size:10px; font-weight:bold; background:#e0f7fa; padding:2px 6px; border-radius:4px; margin-right:5px;"><i class="fa-solid fa-calendar-plus"></i> Plana Eklendi</span>';
                if (v.isWatched)  badgeHtml += '<span style="color:var(--color-success); font-size:10px; font-weight:bold; background:#e6f9ed; padding:2px 6px; border-radius:4px;"><i class="fa-solid fa-check-double"></i> İzlendi</span>';

                const opacity  = v.isWatched ? '0.5' : '1';
                const textDeco = v.isWatched ? 'text-decoration:line-through;' : '';
                const bg       = isSelected ? '#e6f2ff' : 'transparent';
                const checked  = isSelected ? 'checked' : '';

                const row = document.createElement('div');
                row.className = 'video-select-row';
                row.dataset.vidindex = index;
                row.style.cssText = `display:flex; gap:10px; align-items:center; padding:10px; border-bottom:1px solid #eef2f5; cursor:pointer; opacity:${opacity}; background:${bg}; transition:background 0.2s;`;
                row.innerHTML = `
                    <div style="width:24px; text-align:center; flex-shrink:0;">
                        <label class="premium-check-label" onclick="event.preventDefault();">
                            <input type="checkbox" class="video-cb" style="pointer-events:none; width:15px; height:15px; accent-color:var(--color-primary);" ${checked}>
                            <span class="premium-check-mark"></span>
                        </label>
                    </div>
                    <div style="font-weight:900; color:var(--color-primary); width:22px; text-align:center; font-size:13px; flex-shrink:0;">${index + 1}</div>
                    <img src="${v.thumb}" style="width:60px; height:34px; object-fit:cover; border-radius:5px; flex-shrink:0;">
                    <div style="flex:1; min-width:0; line-height:1.3;">
                        <div style="font-size:12px; font-weight:700; color:var(--color-text-main); margin-bottom:3px; ${textDeco}">${v.title}</div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-size:11px; font-weight:800; color:var(--color-text-muted);"><i class="fa-solid fa-clock"></i> ${v.duration}</span>
                            <div>${badgeHtml}</div>
                        </div>
                    </div>`;
                row.onclick = () => window.toggleVideoSelection(index, row);
                if (tvBody) tvBody.appendChild(row);
            });
            
            // Panel'e video seçim görünümüne geç
            const tvPanelTitle2 = document.getElementById('taskVideoPanelTitle')?.querySelector('span');
            const tvPanelBody2  = document.getElementById('taskVideoPanelBody');
            const tvPanelActions2 = document.getElementById('taskVideoPanelActions');
            const tvPanelFooter2  = document.getElementById('taskVideoPanelFooter');
            const tvPanelConfirm2 = document.getElementById('taskVideoPanelConfirmBtn');

            if (tvPanelTitle2) tvPanelTitle2.textContent = pl.customTitle || pl.subject;
            if (tvPanelActions2) tvPanelActions2.innerHTML = `
                <button onclick="window.renderPlaylistCardsForSelection(false)" style="padding:5px 10px; border:1px solid var(--color-primary); background:var(--color-bg-hover); color:var(--color-primary); border-radius:var(--radius-md); cursor:pointer; font-weight:bold; font-size:11px;">
                    <i class="fa-solid fa-arrow-left"></i> Playlistler
                </button>`;

            if (tvPanelFooter2) {
                tvPanelFooter2.style.display = 'flex';
            }
            // Video seçim ekranında summary'yi gizle
            const tvpSum = document.getElementById('taskVideoPanelSummary');
            if (tvpSum) tvpSum.style.display = 'none';
            if (tvPanelConfirm2) tvPanelConfirm2.innerText = `Seçilenleri Ekle (${selectedVideosForTaskIndices.size})`;

            // Video listesi zaten tvBody'ye yazıldı.
            // SCROLL MANTIĞI:
            // - Düzenleme modunda ve bu playlistten video eklenmişse → o görevin ilk videosuna git
            // - Yeni ekleme modunda → tüm görevlerdeki son eklenen videonun bir sonrakine git
            requestAnimationFrame(() => {
                if (!tvBody) return;

                const isEditingThisPlaylist = editingTaskId !== null &&
                    currentTaskVideos.some(v => v.plId && v.plId.toString() === plId.toString());

                if (isEditingThisPlaylist) {
                    // Düzenleme: bu görevdeki en küçük index → kullanıcı kendi eklediği videoları görsün
                    const ownIndices = currentTaskVideos
                        .filter(v => v.plId && v.plId.toString() === plId.toString())
                        .map(v => v.index);
                    const firstOwn = Math.min(...ownIndices);
                    const targetRow = tvBody.querySelector(`[data-vidindex="${firstOwn}"]`);
                    if (targetRow) targetRow.scrollIntoView({ block: 'start' });
                } else {
                    // Yeni ekleme: tüm görevlerdeki bu playlistten eklenen en yüksek index + 1'e git
                    let lastPlannedIndex = -1;
                    Object.values(userTasks).forEach(dayTasks => {
                        dayTasks.forEach(task => {
                            if (!task.taskVideos) return;
                            task.taskVideos.forEach(v => {
                                if (v.plId && v.plId.toString() === plId.toString()) {
                                    if (v.index > lastPlannedIndex) lastPlannedIndex = v.index;
                                }
                            });
                        });
                    });

                    if (lastPlannedIndex >= 0) {
                        const targetRow = tvBody.querySelector(`[data-vidindex="${lastPlannedIndex}"]`);
                        if (targetRow) targetRow.scrollIntoView({ block: 'start' });
                    }
                }
            });
        };

        window.toggleVideoSelection = function(index, element) {
            const cb = element.querySelector('.video-cb');
            if (selectedVideosForTaskIndices.has(index)) {
                selectedVideosForTaskIndices.delete(index);
                if (cb) cb.checked = false;
                element.style.backgroundColor = 'transparent';
            } else {
                selectedVideosForTaskIndices.add(index);
                if (cb) cb.checked = true;
                element.style.backgroundColor = '#e6f2ff';
            }
            const count = selectedVideosForTaskIndices.size;
            const countText = `Seçilenleri Ekle (${count})`;
            const oldBtn = document.getElementById('confirmSelectedVideosBtn');
            const newBtn = document.getElementById('taskVideoPanelConfirmBtn');
            if (oldBtn) oldBtn.innerText = countText;
            if (newBtn) newBtn.innerText = countText;
        };

        // Seçilenleri Göreve Aktar (hem eski modal butonu hem yeni panel butonu)
        async function confirmVideoSelection() {
            const pl = savedPlaylists.find(p => p.id.toString() === currentSelectingPlaylistId.toString());
            if(!pl) return;

            // Önce bu playlistten daha önce eklenenleri temizle, sonra güncel seçilenleri bas (Çoklu birikme)
            const oldVideos = currentTaskVideos.filter(v => v.plId.toString() === currentSelectingPlaylistId.toString());
            currentTaskVideos = currentTaskVideos.filter(v => v.plId.toString() !== currentSelectingPlaylistId.toString());

            selectedVideosForTaskIndices.forEach(idx => {
                const v = pl.videos[idx];
                
                let seconds = 0;
                if (v.duration) {
                    const parts = v.duration.split(':').map(Number).reverse();
                    if (parts[0]) seconds += parts[0];
                    if (parts[1]) seconds += parts[1] * 60;
                    if (parts[2]) seconds += parts[2] * 3600;
                }

                currentTaskVideos.push({
                    plId: currentSelectingPlaylistId.toString(),
                    index: idx,
                    title: v.title,
                    duration: v.duration,
                    thumb: v.thumb,
                    videoId: v.videoId || null,
                    durationSec: seconds,
                    plTitle: pl.customTitle || pl.subject
                });
                pl.videos[idx].isPlanned = true; // "Plana Eklendi" Damgası
            });

            // Tik'i kaldırılan videolar varsa onların isPlanned durumunu false yap
            oldVideos.forEach(ov => {
                if (!selectedVideosForTaskIndices.has(ov.index)) {
                    if(pl.videos[ov.index]) pl.videos[ov.index].isPlanned = false;
                }
            });

            // Firebase'i arkada sessizce güncelle
            try {
                if(currentUserUid) await setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true });
            } catch(e) {}

            window.renderTaskVideoSummary(true);
            document.getElementById('selectVideoModal').style.display = 'none';
            // Yan panel kapatılmaz, playlist listesine geri döner
            const tvpFoot = document.getElementById('taskVideoPanelFooter');
            if (tvpFoot) tvpFoot.style.display = 'none';
            window.renderPlaylistCardsForSelection(false);
            window.renderTaskVideoSummary(false);
        }
        document.getElementById('confirmSelectedVideosBtn')?.addEventListener('click', confirmVideoSelection);
        document.getElementById('taskVideoPanelConfirmBtn')?.addEventListener('click', confirmVideoSelection);

        // Geri butonu - video seçiminden playlist listesine dön
        if (tvPanelBack) {
            tvPanelBack.addEventListener('click', () => {
                const footer = document.getElementById('taskVideoPanelFooter');
                if (footer) footer.style.display = 'none';
                window.renderPlaylistCardsForSelection(false);
                window.renderTaskVideoSummary(false);
            });
        }

        // Ekrana Çizme ve Hız Matematiği (Slim/İnce Versiyon)
        window.renderTaskVideoSummary = function(isUserAction = false) {
            const summaryBox = document.getElementById('playlistSelectionSummary');
            const videoListDiv = document.getElementById('pss-video-list');
            const descInput = document.getElementById('taskDesc');
            const durInput = document.getElementById('taskDuration');

            // Sağ panel özet elementleri
            const tvpSummary = document.getElementById('taskVideoPanelSummary');
            const tvpText = document.getElementById('tvp-text');
            const tvpDuration = document.getElementById('tvp-duration');
            const panelOpen = document.getElementById('taskVideoPanel')?.style.display === 'flex';

            if (currentTaskVideos.length === 0) {
                if (summaryBox) summaryBox.style.display = 'none';
                if (tvpSummary) tvpSummary.style.display = 'none';
                return;
            }

            // Sol panel summary (İnceltildi)
            if (summaryBox) {
                if (panelOpen) {
                    summaryBox.style.display = 'none';
                } else {
                    summaryBox.style.display = 'block';
                    document.getElementById('pss-text').innerHTML = `<i class="fa-solid fa-list-check"></i> Toplam <b>${currentTaskVideos.length}</b> Video`;
                    if (videoListDiv) {
                        videoListDiv.innerHTML = '';
                        const currentSubjectLeft = document.getElementById('taskSubject')?.value;
                        currentTaskVideos.forEach((v) => {
                            const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                            const mismatch = pl && pl.subject !== currentSubjectLeft;
                            const overlayHtml = mismatch ? `
                                <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(217,83,79,0.85);z-index:5;display:flex;align-items:center;justify-content:center;border-radius:6px;">
                                    <span style="font-size:9px;font-weight:800;color:white;text-align:center;padding:0 6px;">Kaldırılacak</span>
                                </div>` : '';
                            
                            // YENİ: Padding 5px'e, resim 48x27'ye düşürüldü
                            videoListDiv.innerHTML += `
                                <div style="display:flex; justify-content:space-between; align-items:center; padding:5px 8px; background:var(--color-bg-card); border-radius:6px; border:1px solid ${mismatch ? '#f5c6cb' : '#eef2f5'}; position:relative; overflow:hidden; flex-shrink: 0;">
                                    ${overlayHtml}
                                    <div style="display:flex; align-items:center; gap:8px; overflow:hidden; flex:1;">
                                        <img src="${v.thumb}" style="width:48px; height:27px; min-width:48px; min-height:27px; object-fit:cover; border-radius:3px; flex-shrink:0;">
                                        <span style="font-size:11px; font-weight:700; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; max-width:200px;">${v.title}</span>
                                    </div>
                                    <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                                        <span style="font-size:10px; font-weight:800; color:#888;">${v.duration}</span>
                                        <i class="fa-solid fa-xmark" style="color:var(--color-danger); cursor:pointer; font-size:13px; position:relative; z-index:10;" onclick="window.removeVideoFromTask('${v.plId}', ${v.index})"></i>
                                    </div>
                                </div>`;
                        });
                    }
                }
            }

            // Sağ panel summary (Hız Kısmı - Daha da inceltildi 2/3 oranında)
            if (tvpSummary) {
                const footerVisible = document.getElementById('taskVideoPanelFooter')?.style.display === 'flex';
                if (panelOpen && !footerVisible) {
                    tvpSummary.style.display = 'block';
                    window.checkVideoWarningOverlay?.();
                    if (tvpText) tvpText.innerHTML = `<i class="fa-solid fa-list-check"></i> Toplam <b>${currentTaskVideos.length}</b> Video`;
                    
                    const tvpList = document.getElementById('tvp-video-list');
                    if (tvpList) {
                        tvpList.style.maxHeight = '110px';
                        tvpList.innerHTML = '';
                        const currentSubjectRight = document.getElementById('taskSubject')?.value;
                        currentTaskVideos.forEach((v) => {
                            const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                            const mismatch = pl && pl.subject !== currentSubjectRight;
                            const item = document.createElement('div');
                            
                            // YENİ: Padding 4px 8px'e düşürüldü (Çok daha ince bir satır)
                            item.style.cssText = `display:flex; justify-content:space-between; align-items:center; padding:4px 8px; background:var(--color-bg-card); border-radius:6px; border:1px solid ${mismatch ? '#f5c6cb' : '#eef2f5'}; position:relative; overflow:hidden; flex-shrink:0;`;
                            item.innerHTML = `
                                ${mismatch ? `<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(217,83,79,0.85);z-index:5;display:flex;align-items:center;justify-content:center;border-radius:6px;"><span style="font-size:9px;font-weight:800;color:white;text-align:center;padding:0 6px;">Kaldırılacak</span></div>` : ''}
                                <div style="display:flex; align-items:center; gap:8px; overflow:hidden; flex:1; min-width:0;">
                                    <img src="${v.thumb}" style="width:42px; height:24px; min-width:42px; min-height:24px; object-fit:cover; border-radius:3px; flex-shrink:0;">
                                    <span style="font-size:11px; font-weight:700; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${v.title}</span>
                                </div>
                                <div style="display:flex; align-items:center; gap:8px; flex-shrink:0; margin-left:6px;">
                                    <span style="font-size:10px; font-weight:800; color:#888;">${v.duration}</span>
                                    <i class="fa-solid fa-xmark" style="color:var(--color-danger); cursor:pointer; font-size:13px; position:relative; z-index:10;" onclick="window.removeVideoFromTask('${v.plId}', ${v.index})"></i>
                                </div>`;
                            tvpList.appendChild(item);
                        });
                    }
                } else {
                    tvpSummary.style.display = 'none';
                }
            }

            // Hız Matematiği
            let totalRawSec = 0;
            currentTaskVideos.forEach(v => {
                if (v.duration) {
                    const parts = v.duration.split(':').map(Number).reverse();
                    if (parts[0]) totalRawSec += parts[0];
                    if (parts[1]) totalRawSec += parts[1] * 60;
                    if (parts[2]) totalRawSec += parts[2] * 3600;
                }
            });

            const adjustedSec = Math.round(totalRawSec / currentTaskSpeed);
            const formatSec = (sec) => {
                const h = Math.floor(sec / 3600);
                const m = Math.floor((sec % 3600) / 60);
                if (h > 0) return `${h}s ${m}dk`;
                return `${m} Dk`;
            };

            const totalMins = Math.ceil(adjustedSec / 60);
            if (document.getElementById('pss-duration')) document.getElementById('pss-duration').textContent = formatSec(adjustedSec);
            if (tvpDuration) tvpDuration.textContent = formatSec(adjustedSec);

            if (isUserAction && durInput) {
                durInput.value = totalMins;
                if (descInput && !descInput.value.trim()) {
                    descInput.value = `${currentTaskVideos.length} Video İzlenecek`;
                }
            }
        };

        // Kutu içindeki minik 'X'e basıldığında
        window.removeVideoFromTask = async function(plId, idx) {
            currentTaskVideos = currentTaskVideos.filter(v => !(v.plId.toString() === plId.toString() && v.index === idx));
            
            // Firebase'den plandan düşür ("Plana Eklendi" yazısı kalksın diye)
            const pl = savedPlaylists.find(p => p.id.toString() === plId.toString());
            if(pl && pl.videos && pl.videos[idx]) {
                pl.videos[idx].isPlanned = false;
                try {
                    if(currentUserUid) await setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true });
                } catch(e) {}
            }
            window.renderTaskVideoSummary(true);
        };

        // Kapatma ve Geri Dönme İşlevleri
        document.getElementById('closeSelectPlaylistModalBtn')?.addEventListener('click', () => { DOM.selectPlaylistModal.style.display = 'none'; });
        document.getElementById('closeSelectVideoModalBtn')?.addEventListener('click', () => { document.getElementById('selectVideoModal').style.display = 'none'; });
        document.getElementById('backToPlaylistsBtn')?.addEventListener('click', () => { 
            document.getElementById('selectVideoModal').style.display = 'none';
            DOM.selectPlaylistModal.style.display = 'flex';
        });

