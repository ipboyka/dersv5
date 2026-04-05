        // [GOREV-MODAL] --- GÖREV GÖRÜNTÜLEME, EKLEME VE DÜZENLEME MOTORU (ZEKİ UI) ---
        const addTaskModal = document.getElementById('addTaskModal');
        const viewTaskModal = document.getElementById('viewTaskModal');
        const taskExamTypeInput = document.getElementById('taskExamType'); 
        const taskTrackInput = document.getElementById('taskTrack'); 
        const taskSubjectInput = document.getElementById('taskSubject'); 
        const taskTypeInput = document.getElementById('taskType'); 
        const taskDesc = document.getElementById('taskDesc');
        const taskDuration = document.getElementById('taskDuration');
        const taskErrorMsg = document.getElementById('taskErrorMsg');
        

        // ÖZEL AÇILIR MENÜ (CUSTOM SELECT) ÇALIŞMA MANTIĞI
        document.querySelectorAll('.task-custom-select').forEach(select => {
            const trigger = select.querySelector('.tcs-trigger');
            const optionsContainer = select.querySelector('.tcs-options');
            const hiddenInput = select.querySelector('input[type="hidden"]');
            const textDisplay = select.querySelector('.tcs-text');

            trigger.addEventListener('click', function(e) {
                if(select.classList.contains('disabled')) return;
                e.stopPropagation(); 
                
                document.querySelectorAll('.task-custom-select').forEach(s => {
                    if(s !== select) s.classList.remove('open');
                });
                
                select.classList.toggle('open');
            });

            optionsContainer.addEventListener('click', function(e) {
                const option = e.target.closest('.tcs-option');
                if(!option) return;
                e.stopPropagation();

                const value = option.getAttribute('data-value');
                const text = option.innerText;

                optionsContainer.querySelectorAll('.tcs-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                textDisplay.innerText = text;
                hiddenInput.value = value;
                select.classList.remove('open');

                if (value === "Genel Deneme" && hiddenInput.id === "taskSubject") {
                    textDisplay.style.color = "#800000";
                } else if (hiddenInput.id === "taskSubject") {
                    textDisplay.style.color = ""; // Diğer derslerde normal renge dön
                }

                if(hiddenInput.id === 'taskExamType') {
                    const trackGroup = document.getElementById('taskTrackGroup');
                    if(value === 'ayt') {
                        trackGroup.style.display = 'flex'; 
                    } else {
                        trackGroup.style.display = 'none';
                    }
                    updateTaskSubjectDropdown();
                    // Panel açıksa playlist listesini güncelle (subject dropdown güncellendikten sonra)
                    setTimeout(() => {
                        const tvPanelEl = document.getElementById('taskVideoPanel');
                        const tvFooterEl = document.getElementById('taskVideoPanelFooter');
                        if (tvPanelEl?.style.display === 'flex' && tvFooterEl?.style.display !== 'flex') {
                            const currentSubject = document.getElementById('taskSubject')?.value;
                            window.renderPlaylistCardsForSelection(false, currentSubject);
                        }
                    }, 50);
                }
                if(hiddenInput.id === 'taskTrack') {
                    updateTaskSubjectDropdown();
                    setTimeout(() => {
                        const tvPanelEl = document.getElementById('taskVideoPanel');
                        const tvFooterEl = document.getElementById('taskVideoPanelFooter');
                        if (tvPanelEl?.style.display === 'flex' && tvFooterEl?.style.display !== 'flex') {
                            const currentSubject = document.getElementById('taskSubject')?.value;
                            window.renderPlaylistCardsForSelection(false, currentSubject);
                        }
                    }, 50);
                }

                if (hiddenInput.id === 'taskType') {
                    const qcGroup = document.getElementById('taskQuestionCountGroup');
                    if (value === 'Test Çözümü' || value === 'Deneme Çözümü' || value === 'Genel Deneme') {
                        if (qcGroup) qcGroup.style.display = 'flex';
                        const durGroup = document.getElementById('taskDurationGroup');
                        if (durGroup) { durGroup.style.cssText = durGroup.style.cssText.replace(/flex:[^;]+/, ''); durGroup.style.flex = '1 1 0'; }
                    } else {
                        if (qcGroup) {
                            qcGroup.style.display = 'none';
                            DOM.taskQuestionCount.value = '';
                        }
                        // Soru sayısı yoksa süre alanı tüm satırı kaplasın
                        const durGroup = document.getElementById('taskDurationGroup');
                        if (durGroup) durGroup.style.flex = '1 1 100%';
                    }
                    const playlistBtn = DOM.selectFromPlaylistBtn;
                    if (playlistBtn) {
                        playlistBtn.style.display = (value === 'Konu Anlatımı' || value === 'Genel Tekrar') ? 'flex' : 'none';
                    }
                            
                    if (typeof window.checkVideoWarningOverlay === 'function') {
                        window.checkVideoWarningOverlay();
                    }
                }

                if(hiddenInput.id === 'taskSubject') {
                    checkGenelDenemeLock();
                    updateTaskSubLessonDropdown(value);
                    // Panel açıksa ve playlist listesi görünüyorsa güncelle
                    const tvPanelEl = document.getElementById('taskVideoPanel');
                    const tvFooterEl = document.getElementById('taskVideoPanelFooter');
                    if (tvPanelEl?.style.display === 'flex' && tvFooterEl?.style.display !== 'flex') {
                        window.renderPlaylistCardsForSelection(false, value);
                    }
                    // Ders değişince video listesini yeniden çiz (uyumsuz videoları işaretle)
                    window.renderTaskVideoSummary(false);
                }

                // (Senin mevcut taskExamType kodlarının hemen altına eklenecek)
                if(hiddenInput.id === 'playlistExamType') {
                    const pTrackGroup = document.getElementById('playlistTrackGroup');
                    if(value === 'ayt') {
                        pTrackGroup.style.display = 'flex'; 
                    } else {
                        pTrackGroup.style.display = 'none';
                    }
                    updatePlaylistSubjectDropdown();
                }
                if(hiddenInput.id === 'playlistTrack') {
                    updatePlaylistSubjectDropdown();
                }
                if(hiddenInput.id === 'playlistSubject') {
                    updatePlaylistSubLessonDropdown(value);
                }
            });
        });

        function updatePlaylistSubjectDropdown() {
            const type = document.getElementById('playlistExamType').value;
            const track = document.getElementById('playlistTrack').value;
            const subjectContainer = document.getElementById('p-dynamicSubjectOptions');
            const subjectSelect = document.getElementById('p-tcs-subject');
            const subjectTextDisplay = subjectSelect.querySelector('.tcs-text');
            const hiddenInput = document.getElementById('playlistSubject');
            
            subjectContainer.innerHTML = '';
            let subjects = [];

            if (type === 'tyt') subjects = ["Türkçe", "Sosyal Bilimler", "Temel Matematik", "Fen Bilimleri"];
            else if (type === 'ayt') {
                if(track === 'sayisal') subjects = ["Matematik", "Fizik", "Kimya", "Biyoloji"];
                else if(track === 'ea') subjects = ["Matematik", "Türk Dili ve Edebiyatı", "Tarih-1", "Coğrafya-1"];
                else if(track === 'sozel') subjects = ["Türk Dili ve Edebiyatı", "Tarih-1", "Coğrafya-1", "Tarih-2", "Coğrafya-2", "Felsefe Grubu", "Din Kültürü ve Ahlak Bilgisi"];
                else if(track === 'dil') subjects = ["Yabancı Dil"];
            }

            subjects.forEach((s, index) => {
                const isSelected = index === 0 ? 'selected' : '';
                subjectContainer.innerHTML += `<div class="tcs-option ${isSelected}" data-value="${s}">${s}</div>`;
            });

            hiddenInput.value = subjects[0];
            subjectTextDisplay.innerText = subjects[0];
            updatePlaylistSubLessonDropdown(subjects[0]);
        }

        document.addEventListener('click', function(e) {
            document.querySelectorAll('.task-custom-select').forEach(select => {
                // Tıklama bu select'in içindeyse kapatma
                if (!select.contains(e.target)) {
                    select.classList.remove('open');
                    const tr = select.querySelector('.tcs-trigger');
                    if (tr) tr.classList.remove('active');
                }
            });
        });

        // DERSLERİ SEÇİME GÖRE DOLDURAN ZEKİ FONKSİYON
        // ── ALT DERS VERİ TABLOSU ──
        const subLessonData = {
            "Sosyal Bilimler": ["Genel", "Tarih", "Coğrafya", "Felsefe", "Din Kültürü ve Ahlak Bilgisi"],
            "Fen Bilimleri":   ["Genel", "Fizik", "Kimya", "Biyoloji"]
        };

        // Custom select (tcs) tabanlı alt ders builder
        function _buildSubLessonDropdown(groupId, containerId, inputId, selectId, subject) {
            const group  = document.getElementById(groupId);
            const hiddenInput = document.getElementById(inputId);
            // tcs wrapper'ın id'sini inputId'den türet: taskSubLesson -> tcs-taskSubLesson
            const tcsId = 'tcs-' + inputId;
            const tcsWrapper = document.getElementById(tcsId);
            const tcsOptions = document.getElementById(tcsId + 'Options');
            const tcsTrigger = document.getElementById(tcsId + 'Trigger');
            if (!group || !hiddenInput || !tcsWrapper || !tcsOptions || !tcsTrigger) return;

            const opts = subLessonData[subject];
            if (!opts) {
                group.style.display = 'none';
                tcsOptions.innerHTML = '';
                hiddenInput.value = '';
                return;
            }

            group.style.display = 'block';
            
            // Seçenekleri oluştur
            tcsOptions.innerHTML = opts.map((o, i) => 
                `<div class="tcs-option${i === 0 ? ' selected' : ''}" data-value="${o}">${o}</div>`
            ).join('');
            
            // İlk değeri ayarla
            hiddenInput.value = opts[0];
            const triggerText = tcsTrigger.querySelector('.tcs-text');
            if (triggerText) triggerText.textContent = opts[0];

            // Tıklama: açma/kapama
            const newTrigger = tcsTrigger.cloneNode(true);
            tcsTrigger.parentNode.replaceChild(newTrigger, tcsTrigger);
            newTrigger.addEventListener('click', () => {
                // Diğer tüm açık tcs'leri kapat
                document.querySelectorAll('.task-custom-select.open').forEach(el => {
                    if (el !== tcsWrapper) el.classList.remove('open');
                });
                tcsWrapper.classList.toggle('open');
            });

            // Seçenek tıklama
            tcsOptions.querySelectorAll('.tcs-option').forEach(opt => {
                opt.addEventListener('click', () => {
                    const val = opt.dataset.value;
                    hiddenInput.value = val;
                    const txt = newTrigger.querySelector('.tcs-text');
                    if (txt) txt.textContent = val;
                    tcsOptions.querySelectorAll('.tcs-option').forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                    tcsWrapper.classList.remove('open');

                    // Playlist panelini güncelle (zaten açıksa)
                    const tvPanel = document.getElementById('taskVideoPanel');
                    const tvFooter = document.getElementById('taskVideoPanelFooter');
                    if (tvPanel && tvPanel.style.display === 'flex' && tvFooter && tvFooter.style.display !== 'flex') {
                        const subj = document.getElementById('taskSubject') ? document.getElementById('taskSubject').value : '';
                        window.renderPlaylistCardsForSelection && window.renderPlaylistCardsForSelection(false, subj);
                    }
                    // Video özet listesini de güncelle
                    window.renderTaskVideoSummary && window.renderTaskVideoSummary(false);
                });
            });
        }

        function updateTaskSubLessonDropdown(subject) {
            _buildSubLessonDropdown('taskSubLessonGroup', null, 'taskSubLesson', null, subject);
        }

        function updatePlaylistSubLessonDropdown(subject) {
            _buildSubLessonDropdown('playlistSubLessonGroup', null, 'playlistSubLesson', null, subject);
        }

        function updateTaskSubjectDropdown() {
            const type = taskExamTypeInput.value;
            const track = taskTrackInput.value;
            const subjectContainer = document.getElementById('dynamicSubjectOptions');
            const subjectSelect = document.getElementById('tcs-subject');
            const subjectTextDisplay = subjectSelect.querySelector('.tcs-text');
            
            subjectContainer.innerHTML = '';
            let subjects = [];

            if (type === 'tyt') {
                subjects = ["Türkçe", "Sosyal Bilimler", "Temel Matematik", "Fen Bilimleri"];
            } else if (type === 'ayt') {
                if(track === 'sayisal') {
                    subjects = ["Matematik", "Fizik", "Kimya", "Biyoloji"];
                } else if(track === 'ea') {
                    subjects = ["Matematik", "Türk Dili ve Edebiyatı", "Tarih-1", "Coğrafya-1"];
                } else if(track === 'sozel') {
                    subjects = ["Türk Dili ve Edebiyatı", "Tarih-1", "Coğrafya-1", "Tarih-2", "Coğrafya-2", "Felsefe Grubu", "Din Kültürü ve Ahlak Bilgisi"];
                } else if(track === 'dil') {
                    subjects = ["Yabancı Dil"];
                }
            }

            // Genel Deneme her zaman en sona eklenir
            if (type !== 'genel') {
                subjects.push("Genel Deneme");
            } else {
                subjects = ["Genel Deneme"];
            }

            subjects.forEach((s, index) => {
                // İlk ders seçili (Genel Deneme değil), Genel Deneme en sonda
                const isSelected = (index === 0 && s !== "Genel Deneme") || (subjects.length === 1 && s === "Genel Deneme") ? 'selected' : '';
                const specialClass = s === "Genel Deneme" ? "genel-deneme-opt" : "";
                subjectContainer.innerHTML += `<div class="tcs-option ${isSelected} ${specialClass}" data-value="${s}">${s}</div>`;
            });

            // İlk dersi (Genel Deneme değil) varsayılan olarak seç
            const defaultSubject = subjects[0];
            taskSubjectInput.value = defaultSubject;
            subjectTextDisplay.innerText = defaultSubject;
            subjectTextDisplay.style.color = defaultSubject === "Genel Deneme" ? "#800000" : "";
            
            checkGenelDenemeLock();
            updateTaskSubLessonDropdown(defaultSubject);
        }

        function checkGenelDenemeLock() {
            const subject = taskSubjectInput.value;
            const taskTypeSelect = document.getElementById('tcs-taskType');
            const taskTypeText = taskTypeSelect.querySelector('.tcs-text');
            const taskTypeOptions = document.getElementById('taskTypeOptions');
            const qcGroup = document.getElementById('taskQuestionCountGroup');
            const playlistBtn = DOM.selectFromPlaylistBtn;

            if(subject === 'Genel Deneme') {
                taskTypeInput.value = 'Genel Deneme';
                taskTypeText.innerText = 'Genel Deneme';
                taskTypeSelect.classList.add('disabled');
                if (qcGroup) qcGroup.style.display = 'flex';
                const _dg1 = document.getElementById('taskDurationGroup');
                if (_dg1) { _dg1.style.flex = '1 1 0'; }
                if (playlistBtn) playlistBtn.style.display = 'none';
            } else {
                taskTypeSelect.classList.remove('disabled');
                if(taskTypeInput.value === 'Genel Deneme') {
                    taskTypeInput.value = 'Konu Anlatımı';
                    taskTypeText.innerText = 'Konu Anlatımı';
                    taskTypeOptions.querySelectorAll('.tcs-option').forEach(opt => {
                        if(opt.getAttribute('data-value') === 'Konu Anlatımı') opt.classList.add('selected');
                        else opt.classList.remove('selected');
                    });
                    if (qcGroup) { 
                        qcGroup.style.display = 'none';
                        DOM.taskQuestionCount.value = '';
                    }
                    const _dg3 = document.getElementById('taskDurationGroup');
                    if (_dg3) { _dg3.style.flex = '1 1 100%'; }
                    if (playlistBtn) playlistBtn.style.display = 'flex';
                }
            }
        }

        function setTaskCustomSelectValue(selectId, value) {
            const select = document.getElementById(selectId);
            if(!select) return;
            const hiddenInput = select.querySelector('input[type="hidden"]');
            const textDisplay = select.querySelector('.tcs-text');
            const options = select.querySelectorAll('.tcs-option');
            
            let foundText = value;
            options.forEach(opt => {
                if(opt.getAttribute('data-value') === value) {
                    opt.classList.add('selected');
                    foundText = opt.innerText;
                } else {
                    opt.classList.remove('selected');
                }
            });
            
            hiddenInput.value = value;
            textDisplay.innerText = foundText;

            // Düzenleme modunda açıldığında "Genel Deneme" bordoluğu
            if (value === "Genel Deneme" && selectId === "tcs-subject") {
                textDisplay.style.color = "#800000";
            } else if (selectId === "tcs-subject") {
                textDisplay.style.color = "";
            }

            // Düzenleme modunda kutuyu göster ve playlist butonunu ayarla
            if (selectId === 'tcs-taskType') {
                const qcGroup = document.getElementById('taskQuestionCountGroup');
                const _dg2 = document.getElementById('taskDurationGroup');
                if (value === 'Test Çözümü' || value === 'Deneme Çözümü' || value === 'Genel Deneme') {
                    if (qcGroup) qcGroup.style.display = 'flex';
                    if (_dg2) { _dg2.style.flex = '1 1 0'; }
                } else {
                    if (qcGroup) qcGroup.style.display = 'none';
                    if (_dg2) { _dg2.style.flex = '1 1 100%'; }
                }
                
                const playlistBtn = DOM.selectFromPlaylistBtn;
                if (playlistBtn) {
                    playlistBtn.style.display = (value === 'Konu Anlatımı' || value === 'Genel Tekrar') ? 'flex' : 'none';
                }

                if (typeof window.checkVideoWarningOverlay === 'function') {
                    window.checkVideoWarningOverlay();
                }
            }
        }

        window.viewTaskDetails = function(dateKey, taskId) {
            const dayTasks = userTasks[dateKey] || [];
            const task = dayTasks.find(t => t.id === taskId);
            if (!task) return;

            currentViewingTask = task;
            selectedDateForTask = dateKey; 

            document.getElementById('viewTaskSubject').innerText =
                (task.subLesson) ? task.subject + ' · ' + task.subLesson : task.subject;
            
            const badge = document.getElementById('viewTaskBadge');
            badge.className = 'task-card-badge ' + (task.examType === 'tyt' ? 'badge-tyt' : (task.examType === 'ayt' ? 'badge-ayt' : 'badge-genel'));
            badge.innerText = task.examType === 'genel' ? 'GENEL' : task.examType.toUpperCase();

            document.getElementById('viewTaskType').innerHTML = `<i class="fa-solid fa-layer-group"></i> ${task.taskType}`;
            document.getElementById('viewTaskDuration').innerHTML = `<i class="fa-solid fa-clock"></i> ${task.duration} dk`;
            document.getElementById('viewTaskDesc').innerText = task.desc;

            const qcSpan = document.getElementById('viewTaskQuestionCount');
            if (task.questionCount) {
                qcSpan.innerHTML = `<i class="fa-solid fa-clipboard-question"></i> ${task.questionCount} Soru`;
                qcSpan.style.display = 'inline-block';
            } else {
                qcSpan.style.display = 'none';
            }
            
                const videoListContainer = document.getElementById('viewTaskVideoList');
                const vtvList = document.getElementById('vtv-list');
                
                if (task.taskVideos && task.taskVideos.length > 0) {
                    videoListContainer.style.display = 'block';
                    vtvList.innerHTML = '';
                    
                    const vtvTitle = videoListContainer.querySelector('h4');
                    if (vtvTitle) {
                        vtvTitle.innerHTML = `<i class="fa-solid fa-list-ul"></i> Plana Eklenen Videolar (${task.taskVideos.length})`;
                    }

                    task.taskVideos.forEach((v, index) => {
                    vtvList.innerHTML += `
                        <div style="display:flex; gap:10px; align-items:center; background:var(--color-bg-card); border:1px solid #eef2f5; padding:8px 12px; border-radius:8px;">
                            <div style="font-weight: 900; color: var(--color-primary); width: 20px; font-size: 13px; text-align: center;">${index + 1}</div>
                            <img src="${v.thumb}" style="width: 50px; border-radius: var(--radius-xs);">
                            <div style="flex:1; overflow:hidden;">
                                <div style="font-size: 12px; font-weight: 700; color: var(--color-text-main); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" data-custom-title="${v.title}">${v.title}</div>
                                <div style="font-size: 10px; color: var(--color-text-muted); font-weight: 800; margin-top:3px;"><i class="fa-solid fa-clock"></i> ${v.duration}</div>
                            </div>
                        </div>
                    `;
                });
            } else {
                videoListContainer.style.display = 'none';
                vtvList.innerHTML = '';
            }

            // --- EKLENECEK YENİ KISIM: Tamamla Butonu Kontrolü ---
            const completeBtn = document.getElementById('completeTaskBtn');
            if (completeBtn) {
                if (task.isCompleted) {
                    // Görev tamamlanmışsa tik ve Tamamlandı yazsın, rengi yeşil olsun
                    completeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Tamamlandı';
                    completeBtn.style.backgroundColor = '#28a745'; 
                    completeBtn.style.color = 'white';
                } else {
                    // Görev tamamlanmamışsa sadece Tamamla yazsın, orijinal rengine dönsün
                    completeBtn.innerHTML = 'Tamamla';
                    completeBtn.style.backgroundColor = ''; 
                    completeBtn.style.color = '';
                }
            }

            viewTaskModal.style.display = 'flex';
        };

        document.getElementById('closeViewTaskModalBtn').addEventListener('click', () => viewTaskModal.style.display = 'none');
        document.getElementById('closeViewTaskBtn').addEventListener('click', () => viewTaskModal.style.display = 'none');

        document.getElementById('editTaskBtn').addEventListener('click', () => {
            if (!currentViewingTask) return;
            editingTaskId = currentViewingTask.id;
            viewTaskModal.style.display = 'none';
            document.querySelector('#addTaskModal h3').innerHTML = `<i class="fa-solid fa-pen" class="icon-btn-primary"></i> Görevi Düzenle`;
            document.getElementById('deleteTaskBtn').style.display = 'block';

            setTaskCustomSelectValue('tcs-examType', currentViewingTask.examType);
            if(currentViewingTask.examType === 'ayt') {
                document.getElementById('taskTrackGroup').style.display = 'flex';
                if(currentViewingTask.track) setTaskCustomSelectValue('tcs-track', currentViewingTask.track);
            } else {
                document.getElementById('taskTrackGroup').style.display = 'none';
            }
            updateTaskSubjectDropdown();
            taskDesc.value = currentViewingTask.desc;
            taskDuration.value = currentViewingTask.duration;
            
            currentTaskSpeed = currentViewingTask.taskSpeed || 1;
            document.querySelectorAll('.speed-opt').forEach(btn => btn.classList.remove('active'));
            const customInput    = DOM.customSpeedInput;
            const tvpCustomInput = document.getElementById('tvp-customSpeedInput');
            const defaultBtn = document.querySelector(`.speed-opt[data-val="${currentTaskSpeed}"]`);
            if(defaultBtn) {
                defaultBtn.classList.add('active');
                [customInput, tvpCustomInput].forEach(inp => {
                    if (!inp) return;
                    inp.value = '';
                    inp.style.background = '#f8fbff';
                    inp.style.color = 'var(--color-primary)';
                });
            } else {
                [customInput, tvpCustomInput].forEach(inp => {
                    if (!inp) return;
                    inp.value = currentTaskSpeed + 'x';
                    inp.style.background = 'var(--color-primary)';
                    inp.style.color = '#fff';
                });
            }
            window.renderTaskVideoSummary(); // Görseli hemen güncelle
            
            setTimeout(() => {
                setTaskCustomSelectValue('tcs-subject', currentViewingTask.subject);
                checkGenelDenemeLock();
                updateTaskSubLessonDropdown(currentViewingTask.subject);
                if (currentViewingTask.subLesson) {
                    const _slI = document.getElementById('taskSubLesson');
                    if (_slI) _slI.value = currentViewingTask.subLesson;
                    // Custom select trigger ve seçili öğeyi güncelle
                    const _slTrigger = document.getElementById('tcs-taskSubLessonTrigger');
                    if (_slTrigger) {
                        const txt = _slTrigger.querySelector('.tcs-text');
                        if (txt) txt.textContent = currentViewingTask.subLesson;
                    }
                    const _slOpts = document.getElementById('tcs-taskSubLessonOptions');
                    if (_slOpts) {
                        _slOpts.querySelectorAll('.tcs-option').forEach(o => {
                            o.classList.toggle('selected', o.dataset.value === currentViewingTask.subLesson);
                        });
                    }
                }
                if(currentViewingTask.subject !== 'Genel Deneme') {
                    setTaskCustomSelectValue('tcs-taskType', currentViewingTask.taskType);
                }
                
                // Soru sayısını kutuya aktar (İçeri alındı çünkü taskType güncellemesi kutuyu gizleyebiliyordu)
                const qcGroup = document.getElementById('taskQuestionCountGroup');
                const _dgView = document.getElementById('taskDurationGroup');
                if (currentViewingTask.taskType === 'Test Çözümü' || currentViewingTask.taskType === 'Deneme Çözümü' || currentViewingTask.taskType === 'Genel Deneme') {
                    qcGroup.style.display = 'flex';
                    DOM.taskQuestionCount.value = currentViewingTask.questionCount || '';
                    if (_dgView) { _dgView.style.flex = '1 1 0'; }
                } else {
                    qcGroup.style.display = 'none';
                    DOM.taskQuestionCount.value = '';
                    if (_dgView) { _dgView.style.flex = '1 1 100%'; }
                }

                // ÇÖZÜM: Modal'ı her şey yerli yerine oturduktan ve fazlalıklar gizlendikten SONRA açıyoruz!
                addTaskModal.style.display = 'flex';

                // AKILLI DÜZENLEME: Görevde video varsa direkt O DERSİN playlistlerini listele!
                // Sadece Konu Anlatımı/Genel Tekrar olması yetmez, eklenen video da olmalı.
                const hasExistingVideos = (currentTaskVideos && currentTaskVideos.length > 0);
                
                if (hasExistingVideos) {
                    openTaskVideoPanel();
                    // O dersin ana playlistlerini anında listeler:
                    if (typeof window.renderPlaylistCardsForSelection === 'function') {
                        window.renderPlaylistCardsForSelection(false, currentViewingTask.subject);
                    }
                    window.renderTaskVideoSummary(false);
                } else {
                    // Video yoksa paneli gizli tutar
                    if (typeof closeTaskVideoPanel === 'function') closeTaskVideoPanel();
                }
            }, 10);
            
            originalTaskEditState = { 
                examType: currentViewingTask.examType,
                track: currentViewingTask.track || 'sayisal',
                subject: currentViewingTask.subject,
                subLesson: currentViewingTask.subLesson || '',
                taskType: currentViewingTask.taskType,
                desc: currentViewingTask.desc,
                duration: currentViewingTask.duration.toString(),
                questionCount: currentViewingTask.questionCount ? currentViewingTask.questionCount.toString() : '',
                taskSpeed: currentViewingTask.taskSpeed || 1,
                taskVideoCount: (currentViewingTask.taskVideos && currentViewingTask.taskVideos.length) || 0
            };
        });

        window.openTaskModalForDate = function(dateStr) {
            selectedDateForTask = dateStr;
            editingTaskId = null;
            originalTaskEditState = null;
            
            document.querySelector('#addTaskModal h3').innerHTML = `<i class="fa-solid fa-list-check" class="icon-btn-primary"></i> Yeni Görev Ekle`;
            document.getElementById('deleteTaskBtn').style.display = 'none';

            setTaskCustomSelectValue('tcs-examType', 'tyt');
            document.getElementById('taskTrackGroup').style.display = 'none';
            
            // ÇÖZÜM: Önce varsayılan türü seçiyoruz, SONRA dersleri güncelliyoruz 
            // ki "Genel Deneme" kilidi çalışıp bunu tekrar ezebilsin!
            setTaskCustomSelectValue('tcs-taskType', 'Konu Anlatımı');
            updateTaskSubjectDropdown();
            updateTaskSubLessonDropdown(document.getElementById('taskSubject').value);
            
            taskDesc.value = '';
            taskDuration.value = '';
            taskErrorMsg.style.display = 'none';
            // Konu Anlatımı default - soru sayısı yok, süre full width
            const durGroupInit = document.getElementById('taskDurationGroup');
            if (durGroupInit) durGroupInit.style.flex = '1 1 100%';
            closeTaskVideoPanel();
            addTaskModal.style.display = 'flex';
        };

        function hasTaskFormChanged() {
            if (!editingTaskId || !originalTaskEditState) return false;
            if (taskExamTypeInput.value !== originalTaskEditState.examType) return true;
            if (taskTrackInput.value !== (originalTaskEditState.track || 'sayisal')) return true;
            if (taskSubjectInput.value !== originalTaskEditState.subject) return true;
            if (taskTypeInput.value !== originalTaskEditState.taskType) return true;
            if (taskDesc.value.trim() !== originalTaskEditState.desc) return true;
            if (taskDuration.value !== originalTaskEditState.duration) return true;
            
            // Soru sayısındaki değişimi yakala!
            const currentQc = DOM.taskQuestionCount ? DOM.taskQuestionCount.value : '';
            if (currentQc !== originalTaskEditState.questionCount) return true;
            
            if (currentTaskSpeed !== originalTaskEditState.taskSpeed) return true;

            // Alt ders değişimini yakala
            const slEl = document.getElementById('taskSubLesson');
            const currentSl = (slEl && slEl.value) ? slEl.value : '';
            if (currentSl !== (originalTaskEditState.subLesson || '')) return true;

            // Video listesindeki değişimi yakala
            const origVideoCount = originalTaskEditState.taskVideoCount || 0;
            const currentVideoCount = (typeof currentTaskVideos !== 'undefined' && currentTaskVideos) ? currentTaskVideos.length : 0;
            if (currentVideoCount !== origVideoCount) return true;
            
            return false;
        }

        function closeTaskModalAndClear() {
            // YENİ: Sağ panel açıksa, görev menüsü tamamen kapanırken onu da kapat!
            if (typeof closeTaskVideoPanel === 'function') closeTaskVideoPanel();
            // YENİ EKLENEN KISIM: Eğer yeni bir görev eklemekten VAZGEÇİLİRSE (İptal vs)
            // İçine video eklendiyse, o videoları sahipsiz bırakmamak için etiketleri geri alıyoruz!
            // DÜZELTME: "!window.isTaskSaving" eklendi! Eğer görev başarıyla kaydediliyorsa bu temizlik ÇALIŞMAZ.
            if (!window.isTaskSaving && !editingTaskId && typeof currentTaskVideos !== 'undefined' && currentTaskVideos.length > 0) {
                let playlistsToUpdate = new Set();
                currentTaskVideos.forEach(v => {
                    const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                    if (pl && pl.videos && pl.videos[v.index]) {
                        pl.videos[v.index].isPlanned = false;
                        playlistsToUpdate.add(pl);
                    }
                });
                if (currentUserUid) {
                    playlistsToUpdate.forEach(pl => {
                        setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true }).catch(e=>{});
                    });
                }
            }

            addTaskModal.style.display = 'none';
            const savedEditId = editingTaskId;
            const savedDate = selectedDateForTask;
            editingTaskId = null;
            originalTaskEditState = null;

            if (savedEditId && savedDate) {
                window.viewTaskDetails(savedDate, savedEditId);
            }
        }

        function attemptCloseTaskModal() {
            if (editingTaskId && hasTaskFormChanged()) {
                document.getElementById('taskCancelConfirmModal').style.display = 'flex';
            } else {
                closeTaskModalAndClear();
            }
        }

        document.getElementById('closeAddTaskModalBtn').addEventListener('click', () => {
            attemptCloseTaskModal();
        });

        document.getElementById('cancelTaskBtn').addEventListener('click', () => {
            attemptCloseTaskModal();
        });

        // --- ÖZEL SÜRE BUTONLARI MANTIĞI ---
        const durUpBtn = document.getElementById('durUpBtn');
        const durDownBtn = document.getElementById('durDownBtn');
        
        if (durUpBtn && durDownBtn) {
            durUpBtn.addEventListener('click', () => {
                let currentVal = parseInt(taskDuration.value) || 0;
                taskDuration.value = currentVal + 1;
            });
            
            durDownBtn.addEventListener('click', () => {
                let currentVal = parseInt(taskDuration.value) || 0;
                if (currentVal > 1) {
                    taskDuration.value = currentVal - 1;
                } else {
                    taskDuration.value = 1; // Süre 1'in altına inemez
                }
            });
        }

        const qcUpBtn = document.getElementById('qcUpBtn');
        const qcDownBtn = document.getElementById('qcDownBtn');
        const taskQuestionCount = DOM.taskQuestionCount;
        
        if (qcUpBtn && qcDownBtn) {
            qcUpBtn.addEventListener('click', () => {
                let currentVal = parseInt(taskQuestionCount.value) || 0;
                taskQuestionCount.value = currentVal + 1;
            });
            qcDownBtn.addEventListener('click', () => {
                let currentVal = parseInt(taskQuestionCount.value) || 0;
                if (currentVal > 0) taskQuestionCount.value = currentVal - 1;
            });
        }

        document.getElementById('saveTaskBtn').addEventListener('click', () => {
            const descVal = taskDesc.value.trim();
            const durVal = taskDuration.value;

            if (descVal.length === 0 || !durVal || durVal <= 0) {
                taskErrorMsg.style.display = 'block';
                setTimeout(() => taskErrorMsg.style.display = 'none', 3000);
                return;
            }

            if (editingTaskId && !hasTaskFormChanged()) {
                closeTaskModalAndClear();
                return;
            }

            if (editingTaskId && hasTaskFormChanged()) {
                document.getElementById('taskSaveConfirmModal').style.display = 'flex';
            } else {
                executeSaveTask();
            }
        });

        document.getElementById('yesTaskSaveBtn').addEventListener('click', () => {
            document.getElementById('taskSaveConfirmModal').style.display = 'none';
            executeSaveTask();
        });

        document.getElementById('yesTaskCancelBtn').addEventListener('click', () => {
            document.getElementById('taskCancelConfirmModal').style.display = 'none';
            closeTaskModalAndClear();
        });

        // --- YENİ: VİDEO UYARI PERDESİ KONTROLCÜSÜ ---
        window.checkVideoWarningOverlay = function() {
            const overlay    = document.getElementById('videoWarningOverlay');
            const tvpOverlay = document.getElementById('tvpWarningOverlay');
            const summaryDiv = document.getElementById('playlistSelectionSummary');
            const tvpSummary = document.getElementById('taskVideoPanelSummary');
            const taskType   = document.getElementById('taskType').value;
            const isWarning  = taskType !== 'Konu Anlatımı' && taskType !== 'Genel Tekrar';

            // Sol panel overlay (orijinal)
            if (summaryDiv && summaryDiv.style.display !== 'none') {
                if (overlay) overlay.style.display = isWarning ? 'flex' : 'none';
            } else {
                if (overlay) overlay.style.display = 'none';
            }

            // Sağ panel overlay
            if (tvpSummary && tvpSummary.style.display !== 'none') {
                if (tvpOverlay) tvpOverlay.style.display = isWarning ? 'flex' : 'none';
            } else {
                if (tvpOverlay) tvpOverlay.style.display = 'none';
            }
        };

        async function executeSaveTask() {
            if (!currentUserUid) {
                alert("Lütfen giriş yapın!");
                return;
            }

            const saveBtn = document.getElementById('saveTaskBtn');
            const originalText = saveBtn.innerText;
            saveBtn.innerText = "Kaydediliyor...";
            saveBtn.disabled = true;

            // YENİ EKLENEN KISIM: Kayıt işlemi başladı, pencere kapanırken etiketleri silmemesi için sistemi uyarıyoruz!
            window.isTaskSaving = true;

            const taskTypeVal = taskTypeInput.value;
            const isQcVisible = taskTypeVal === 'Test Çözümü' || taskTypeVal === 'Deneme Çözümü' || taskTypeVal === 'Genel Deneme';
            const finalQuestionCount = isQcVisible ? (parseInt(DOM.taskQuestionCount.value) || null) : null;

            // --- VİDEO TEMİZLİK MOTORU ---
            let finalTaskVideos = typeof currentTaskVideos !== 'undefined' ? [...currentTaskVideos] : [];
            const currentSubjectVal = taskSubjectInput.value;
            let playlistsToUpdate = new Set();

            if (taskTypeVal !== 'Konu Anlatımı' && taskTypeVal !== 'Genel Tekrar') {
                finalTaskVideos.forEach(v => {
                    const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                    if (pl && pl.videos && pl.videos[v.index]) {
                        pl.videos[v.index].isPlanned = false;
                        playlistsToUpdate.add(pl);
                    }
                });
                finalTaskVideos = [];
                currentTaskVideos = [];
            } else {
                const incompatible = finalTaskVideos.filter(v => {
                    const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                    const _sl = document.getElementById('taskSubLesson') ? document.getElementById('taskSubLesson').value : '';
                    const _eff = (_sl && _sl !== 'Genel') ? _sl : currentSubjectVal;
                    return pl && pl.subject !== _eff && pl.subject !== currentSubjectVal;
                });
                if (incompatible.length > 0) {
                    incompatible.forEach(v => {
                        const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                        if (pl && pl.videos && pl.videos[v.index]) {
                            pl.videos[v.index].isPlanned = false;
                            playlistsToUpdate.add(pl);
                        }
                    });
                    finalTaskVideos = finalTaskVideos.filter(v => {
                        const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                        const _sl2 = document.getElementById('taskSubLesson') ? document.getElementById('taskSubLesson').value : '';
                    const _eff2 = (_sl2 && _sl2 !== 'Genel') ? _sl2 : currentSubjectVal;
                    return !(pl && pl.subject !== _eff2 && pl.subject !== currentSubjectVal);
                    });
                    currentTaskVideos = [...finalTaskVideos];
                }
            }

            // Değişen playlistleri buluta eşitle
            if (currentUserUid && playlistsToUpdate.size > 0) {
                playlistsToUpdate.forEach(pl => {
                    setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true }).catch(e=>{});
                });
            }

            const _slEl = document.getElementById('taskSubLesson');
            const newTask = {
                id: editingTaskId ? editingTaskId : Date.now(),
                profileId: document.getElementById('currentPlannerProfile') ? document.getElementById('currentPlannerProfile').value : 'main_profile',
                examType: taskExamTypeInput.value,
                track: taskExamTypeInput.value === 'ayt' ? taskTrackInput.value : null,
                subject: taskSubjectInput.value,
                subLesson: (_slEl && _slEl.value) ? _slEl.value : null,
                taskType: taskTypeVal,
                questionCount: finalQuestionCount,
                desc: taskDesc.value.trim(),
                duration: parseInt(taskDuration.value),
                dateKey: selectedDateForTask,
                taskVideos: finalTaskVideos, 
                taskSpeed: typeof currentTaskSpeed !== 'undefined' ? currentTaskSpeed : 1,
                isCompleted: (editingTaskId && currentViewingTask) ? (currentViewingTask.isCompleted || false) : false
            };

            try {
                const taskDocRef = doc(db, "users", currentUserUid, "userTasks", newTask.id.toString());
                await setDoc(taskDocRef, newTask);

                if (!window.userTasks) window.userTasks = {};
                if (!window.userTasks[selectedDateForTask]) window.userTasks[selectedDateForTask] = [];
                
                if (editingTaskId) {
                    const index = window.userTasks[selectedDateForTask].findIndex(t => t.id === editingTaskId);
                    if (index !== -1) {
                        window.userTasks[selectedDateForTask][index] = newTask;
                    } else {
                        window.userTasks[selectedDateForTask].push(newTask);
                    }
                } else {
                    window.userTasks[selectedDateForTask].push(newTask);
                }

                closeTaskModalAndClear();
                updateWeeklyPlannerView();
                window.renderTodayTasks?.();
                window.refreshCalendar?.();
                window.renderPlaylists?.();
            } catch (error) {
                console.error('Görev kaydetme hatası:', error);
                alert("Sistem Hatası: Görev kaydedilemedi.");
            } finally {
                saveBtn.innerText = originalText;
                saveBtn.disabled = false;
                window.isTaskSaving = false;
            }
        }

        // [GOREV-AKSYON] --- 6. GÖREV AKSİYON (ÇOĞALT/SİL/TAMAMLA) MOTORU ---

        // --- GÖREV SÜRÜKLEME EVENTLERİ ---
        window.startTaskDrag = function(e, dateKey, taskId) {
            if(appMode !== 'NORMAL') { e.preventDefault(); return; } 
            e.stopPropagation(); 
            draggedTaskInfo = { dateKey, taskId };
            e.dataTransfer.effectAllowed = 'all'; 
            // KRİTİK DÜZELTME: taskId sayı olduğu için toString() yapılmazsa tüm sürükleme çöker!
            e.dataTransfer.setData('text/plain', taskId.toString()); 
            setTimeout(() => { if(e.target.style) e.target.style.opacity = '0.5'; }, 0);
        };

        window.endTaskDrag = function(e) {
            if(e.target && e.target.style) e.target.style.opacity = '1';
        };

        window.handleTaskDragOver = function(e) {
            if(appMode !== 'NORMAL') return;
            e.preventDefault(); 
            e.dataTransfer.dropEffect = 'copy'; 
            e.currentTarget.style.backgroundColor = '#e6f2ff'; 
            e.currentTarget.style.borderRadius = '10px';
        };

        window.handleTaskDragLeave = function(e) {
            if(appMode !== 'NORMAL') return;
            e.currentTarget.style.backgroundColor = '';
        };

        // --- GÜNLER ARASI KOPYALAMA (SÜRÜKLE-BIRAK) ---
        window.dropTask = async function(e, targetDateKey) {
            if(appMode !== 'NORMAL') return;
            e.preventDefault();
            e.currentTarget.style.backgroundColor = '';
            if (!draggedTaskInfo || !currentUserUid) return;

            const { dateKey: sourceDateKey, taskId } = draggedTaskInfo;
            draggedTaskInfo = null;
            if (sourceDateKey === targetDateKey) { window.updateWeeklyPlannerView?.(); return; }

            const sourceTasks = userTasks[sourceDateKey];
            if (!sourceTasks) return;
            const taskToCopy = sourceTasks.find(t => t.id === taskId);
            if (!taskToCopy) return;

            const newTaskClone = { ...taskToCopy, id: Date.now(), dateKey: targetDateKey, isCompleted: false };

            try {
                const taskDocRef = doc(db, "users", currentUserUid, "userTasks", newTaskClone.id.toString());
                await setDoc(taskDocRef, newTaskClone);
                if (!userTasks[targetDateKey]) userTasks[targetDateKey] = [];
                userTasks[targetDateKey].push(newTaskClone); 
                window.updateWeeklyPlannerView?.();
            } catch (error) {
            }
        };

        // --- BUTON (DROP ZONES) ALANLARI MANTIĞI ---
        const duplicateDropZone = document.getElementById('duplicateDropZone');
        const removeDropZone = document.getElementById('removeDropZone');
        const completeDropZone = document.getElementById('completeDropZone');
        const cancelActionModeBtn = document.getElementById('cancelActionModeBtn'); // YENİ EKLENDİ

        // GÜNCEL MOD SIFIRLAMA FONKSİYONU (Her şeyi temize çeker ve İptal'i gizler)
        function resetAppModes() {
            appMode = 'NORMAL';
            taskToDuplicate = null;
            if(typeof selectedDatesForDuplicate !== 'undefined') selectedDatesForDuplicate.clear();
            if(typeof tasksToDelete !== 'undefined') tasksToDelete.clear();
            if(typeof tasksToComplete !== 'undefined') tasksToComplete.clear();

            if(duplicateDropZone) {
                duplicateDropZone.classList.remove('duplicate-mode');
                if(typeof DOM !== 'undefined' && DOM.duplicateZoneText) DOM.duplicateZoneText.innerText = "Çoğalt";
            }
            if(removeDropZone) {
                removeDropZone.classList.remove('delete-mode');
                const rText = document.getElementById('removeZoneText');
                if(rText) rText.innerText = "Kaldır";
            }
            if(completeDropZone) {
                completeDropZone.classList.remove('complete-mode');
                const cText = document.getElementById('completeZoneText');
                if(cText) cText.innerText = "Tamamla";
            }
            
            // İptal butonunu sıfırlanınca geri gizle
            if(cancelActionModeBtn) cancelActionModeBtn.style.display = 'none';

            // Seçim class'larını ve cursor'ları DOM'da direkt temizle (scroll sıfırlanmaz)
            document.querySelectorAll('.task-card-selected-delete, .task-card-selected-duplicate, .task-card-selected-complete').forEach(el => {
                el.classList.remove('task-card-selected-delete', 'task-card-selected-duplicate', 'task-card-selected-complete');
                el.style.borderLeftWidth = '4px';
            });
            document.querySelectorAll('.weekly-task-card').forEach(c => c.style.cursor = 'grab');
            document.querySelectorAll('.weekly-column.selectable, .weekly-row.selectable').forEach(col => {
                col.classList.remove('selectable', 'selected-for-dup');
            });
        }

        // İPTAL BUTONU DİNLEYİCİSİ
        if (cancelActionModeBtn) {
            cancelActionModeBtn.addEventListener('click', () => {
                resetAppModes();
            });
        }

        [duplicateDropZone, removeDropZone, completeDropZone].forEach(zone => {
            if(!zone) return;
            zone.addEventListener('dragover', (e) => {
                if(appMode !== 'NORMAL') return;
                e.preventDefault();
                zone.classList.add('drag-over');
                e.dataTransfer.dropEffect = zone.id === 'duplicateDropZone' ? 'copy' : 'move';
            });
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
        });

        // "TAMAMLA" BUTONUNA TIKLANINCA / BIRAKILINCA
        if(completeDropZone) {
            completeDropZone.addEventListener('click', () => {
                if (appMode === 'NORMAL') {
                    appMode = 'COMPLETE_SELECT_TASKS';
                    completeDropZone.classList.add('complete-mode');
                    document.getElementById('completeZoneText').innerText = "Tamamla (0)";
                    
                    // İptal butonunu Tamamla'nın yanına taşı ve göster
                    if (cancelActionModeBtn) {
                        completeDropZone.insertAdjacentElement('beforebegin', cancelActionModeBtn);
                        cancelActionModeBtn.style.display = 'flex';
                    }
                    
                    // Tüm kart cursor'larını DOM'da direkt güncelle (scroll sıfırlanmaz)
                    document.querySelectorAll('.weekly-task-card').forEach(c => c.style.cursor = 'pointer');
                } else if (appMode === 'COMPLETE_SELECT_TASKS') {
                    if (tasksToComplete.size === 0) {
                        resetAppModes(); 
                    } else {
                        let completedCount = 0, uncompletedCount = 0;
                        tasksToComplete.forEach(taskKey => {
                            const [dKey, tIdStr] = taskKey.split('||');
                            const tObj = userTasks[dKey].find(t => t.id === parseInt(tIdStr));
                            if (tObj) tObj.isCompleted ? completedCount++ : uncompletedCount++;
                        });

                        const allCompleted = uncompletedCount === 0;
                        const allUncompleted = completedCount === 0;

                        let titleText, msgText, btnText, btnColor, iconClass, iconColor, actionAttr;

                        if (allCompleted) {
                            titleText  = "Tamamlanmayı İptal Et";
                            msgText    = `Seçilen ${tasksToComplete.size} görevin tamamlandı durumunu kaldırmak istediğinize emin misiniz?`;
                            btnText    = "Evet, Kaldır";
                            btnColor   = "#ffc107";
                            iconClass  = "fa-solid fa-arrow-rotate-left";
                            iconColor  = "#ffc107";
                            actionAttr = "uncomplete";
                        } else if (allUncompleted) {
                            titleText  = "Seçili Görevleri Tamamla";
                            msgText    = `Seçilen ${tasksToComplete.size} görevi tamamlandı olarak işaretlemek istediğinize emin misiniz?`;
                            btnText    = "Evet, Tamamla";
                            btnColor   = "#28a745";
                            iconClass  = "fa-solid fa-check-double";
                            iconColor  = "#28a745";
                            actionAttr = "complete";
                        } else {
                            titleText  = "Karma Seçim";
                            msgText    = `Seçilen ${uncompletedCount} görevi tamamlandı olarak işaretlemek, ${completedCount} görevin tamamlandı durumunu kaldırmak istediğinize emin misiniz?`;
                            btnText    = "Evet, Uygula";
                            btnColor   = "#007bff";
                            iconClass  = "fa-solid fa-shuffle";
                            iconColor  = "#007bff";
                            actionAttr = "toggle";
                        }

                        document.getElementById('multiCompleteTitle').innerText = titleText;
                        document.getElementById('multiCompleteConfirmMsg').innerText = msgText;
                        DOM.yesTaskMultiCompleteBtn.innerText = btnText;
                        DOM.yesTaskMultiCompleteBtn.style.backgroundColor = btnColor;
                        document.getElementById('multiCompleteIcon').className = iconClass;
                        document.getElementById('multiCompleteIcon').style.color = iconColor;
                        DOM.yesTaskMultiCompleteBtn.setAttribute('data-action', actionAttr);
                        document.getElementById('taskMultiCompleteConfirmModal').style.display = 'flex';
                    }
                } else {
                    resetAppModes();
                    completeDropZone.click();
                }
            });

            completeDropZone.addEventListener('drop', (e) => {
                e.preventDefault(); e.stopPropagation();
                completeDropZone.classList.remove('drag-over');
                if (!draggedTaskInfo) return;
                
                const taskObj = userTasks[draggedTaskInfo.dateKey].find(t => t.id === draggedTaskInfo.taskId);
                if(taskObj) {
                    const isComp = taskObj.isCompleted;
                    document.getElementById('singleCompleteTitle').innerText = isComp ? "Tamamlanmayı İptal Et" : "Görevi Tamamla";
                    document.getElementById('singleCompleteMsg').innerText = isComp ? "Bu görevin tamamlandı durumunu kaldırmak istediğinize emin misiniz?" : "Bu görevi tamamlandı olarak işaretlemek istediğinize emin misiniz?";
                    DOM.yesTaskCompleteBtn.innerText = isComp ? "Evet, Kaldır" : "Evet, Tamamlandı";
                    DOM.yesTaskCompleteBtn.style.backgroundColor = isComp ? "#ffc107" : "#28a745";
                    document.getElementById('singleCompleteIcon').className = isComp ? "fa-solid fa-arrow-rotate-left" : "fa-solid fa-check-circle";
                    document.getElementById('singleCompleteIcon').style.color = isComp ? "#ffc107" : "#28a745";
                    taskToCompleteFromDrag = draggedTaskInfo;
                    _completeTriggeredFromDetail = false; // Drag-drop'tan geldi, iptal edilirse detay açılmasın
                    // Süre alanını hazırla
                    const _dRc2 = document.getElementById('completeUpdateDurRow');
                    const _dRi2 = document.getElementById('completeNewDuration');
                    const _dRb2 = document.getElementById('yesTaskCompleteUpdateBtn');
                    const _isC2 = taskObj.isCompleted;
                    if (_dRc2) _dRc2.style.display = !_isC2 ? 'flex' : 'none';
                    if (_dRi2 && !_isC2) _dRi2.value = taskObj.duration || '';
                    if (_dRb2) _dRb2.style.display = !_isC2 ? 'block' : 'none';
                    document.getElementById('taskCompleteConfirmModal').style.display = 'flex';
                }
                draggedTaskInfo = null; 
            });
        }

        // "ÇOĞALT" BUTONUNA TIKLANINCA / BIRAKILINCA
        if(duplicateDropZone) {
            duplicateDropZone.addEventListener('click', () => {
                if (appMode === 'NORMAL') {
                    appMode = 'DUP_SELECT_TASK';
                    duplicateDropZone.classList.add('duplicate-mode');
                    DOM.duplicateZoneText.innerText = "Görev Seç...";
                    
                    // İptal butonunu Çoğalt'ın yanına taşı ve göster
                    if (cancelActionModeBtn) {
                        duplicateDropZone.insertAdjacentElement('beforebegin', cancelActionModeBtn);
                        cancelActionModeBtn.style.display = 'flex';
                    }
                    
                    // Tüm kart cursor'larını DOM'da direkt güncelle (scroll sıfırlanmaz)
                    document.querySelectorAll('.weekly-task-card').forEach(c => c.style.cursor = 'pointer');
                } else if (appMode === 'DUP_SELECT_TASK') {
                    resetAppModes(); 
                } else if (appMode === 'DUP_SELECT_DAYS') {
                    if (selectedDatesForDuplicate.size === 0) {
                        resetAppModes(); 
                    } else {
                        document.getElementById('duplicateConfirmMsg').innerText = `Görevi seçtiğiniz ${selectedDatesForDuplicate.size} farklı güne çoğaltmak istediğinize emin misiniz?`;
                        document.getElementById('taskMultiDuplicateConfirmModal').style.display = 'flex';
                    }
                } else {
                    resetAppModes();
                    duplicateDropZone.click();
                }
            });

            duplicateDropZone.addEventListener('drop', (e) => {
                e.preventDefault(); e.stopPropagation();
                duplicateDropZone.classList.remove('drag-over');
                if (!draggedTaskInfo) return;

                resetAppModes(); 
                taskToDuplicate = draggedTaskInfo;
                appMode = 'DUP_SELECT_DAYS';
                duplicateDropZone.classList.add('duplicate-mode');
                DOM.duplicateZoneText.innerText = "Çoğalt (0)";
                
                // İptal butonunu sürükle/bırak sonrası da Çoğalt'ın yanına taşı ve göster
                if (cancelActionModeBtn) {
                    duplicateDropZone.insertAdjacentElement('beforebegin', cancelActionModeBtn);
                    cancelActionModeBtn.style.display = 'flex';
                }

                draggedTaskInfo = null;
                // Tüm kart cursor'larını DOM'da direkt güncelle (scroll sıfırlanmaz)
                document.querySelectorAll('.weekly-task-card').forEach(c => c.style.cursor = 'pointer');
                // Gün sütunlarını seçilebilir yap
                document.querySelectorAll('.weekly-column, .weekly-row').forEach(col => col.classList.add('selectable'));
            });
        }

        // "KALDIR" BUTONUNA TIKLANINCA / BIRAKILINCA
        if(removeDropZone) {
            removeDropZone.addEventListener('click', () => {
                if (appMode === 'NORMAL') {
                    appMode = 'DELETE_SELECT_TASKS';
                    removeDropZone.classList.add('delete-mode');
                    document.getElementById('removeZoneText').innerText = "Sil (0)";
                    
                    // İptal butonunu Kaldır'ın yanına taşı ve göster
                    if (cancelActionModeBtn) {
                        removeDropZone.insertAdjacentElement('beforebegin', cancelActionModeBtn);
                        cancelActionModeBtn.style.display = 'flex';
                    }
                    
                    // Tüm kart cursor'larını DOM'da direkt güncelle (scroll sıfırlanmaz)
                    document.querySelectorAll('.weekly-task-card').forEach(c => c.style.cursor = 'pointer');
                } else if (appMode === 'DELETE_SELECT_TASKS') {
                    if (tasksToDelete.size === 0) {
                        resetAppModes(); 
                    } else {
                        document.getElementById('multiDeleteConfirmMsg').innerText = `Seçilen ${tasksToDelete.size} görevi kalıcı olarak silmek istediğinize emin misiniz?`;
                        document.getElementById('taskMultiDeleteConfirmModal').style.display = 'flex';
                    }
                } else {
                    resetAppModes();
                    removeDropZone.click();
                }
            });

            removeDropZone.addEventListener('drop', (e) => {
                e.preventDefault(); e.stopPropagation();
                removeDropZone.classList.remove('drag-over');
                if (!draggedTaskInfo) return;
                taskToDeleteFromDrag = draggedTaskInfo;
                document.getElementById('taskDeleteConfirmModal').style.display = 'flex';
                draggedTaskInfo = null; 
            });
        }

        window.handleTaskClick = function(e, dateKey, taskId) {
            e.stopPropagation(); 
            
            if (appMode === 'NORMAL') {
                if(typeof window.viewTaskDetails === 'function') window.viewTaskDetails(dateKey, taskId);
                return;
            }

            // Seçim modlarında: tüm grid'i yeniden render etmek yerine
            // sadece tıklanan kartın class'ını DOM'da direkt değiştir (scroll sıfırlanmaz)
            const clickedCard = e.currentTarget;

            if (appMode === 'DUP_SELECT_TASK' || appMode === 'DUP_SELECT_DAYS') {
                // Önceden seçili varsa onu temizle
                document.querySelectorAll('.task-card-selected-duplicate').forEach(el => {
                    el.classList.remove('task-card-selected-duplicate');
                    el.style.borderLeftWidth = '4px';
                });
                taskToDuplicate = { dateKey, taskId };
                appMode = 'DUP_SELECT_DAYS';
                clickedCard.classList.add('task-card-selected-duplicate');
                clickedCard.style.borderLeftWidth = '6px';
                DOM.duplicateZoneText.innerText = `Çoğalt (${selectedDatesForDuplicate.size})`;
                // Gün sütunlarını seçilebilir hale getir
                document.querySelectorAll('.weekly-column, .weekly-row').forEach(col => col.classList.add('selectable'));

            } else if (appMode === 'DELETE_SELECT_TASKS') {
                const taskKey = `${dateKey}||${taskId}`;
                if (tasksToDelete.has(taskKey)) {
                    tasksToDelete.delete(taskKey);
                    clickedCard.classList.remove('task-card-selected-delete');
                    clickedCard.style.borderLeftWidth = '4px';
                } else {
                    tasksToDelete.add(taskKey);
                    clickedCard.classList.add('task-card-selected-delete');
                    clickedCard.style.borderLeftWidth = '6px';
                }
                document.getElementById('removeZoneText').innerText = `Sil (${tasksToDelete.size})`;

            } else if (appMode === 'COMPLETE_SELECT_TASKS') {
                const taskKey = `${dateKey}||${taskId}`;
                if (tasksToComplete.has(taskKey)) {
                    tasksToComplete.delete(taskKey);
                    clickedCard.classList.remove('task-card-selected-complete');
                    clickedCard.style.borderLeftWidth = '4px';
                } else {
                    tasksToComplete.add(taskKey);
                    clickedCard.classList.add('task-card-selected-complete');
                    clickedCard.style.borderLeftWidth = '6px';
                }
                document.getElementById('completeZoneText').innerText = `Tamamla (${tasksToComplete.size})`;
            }
        };

        window.toggleDateForDuplicate = function(dateKey) {
            if (appMode === 'DUP_SELECT_DAYS') {
                if (selectedDatesForDuplicate.has(dateKey)) selectedDatesForDuplicate.delete(dateKey);
                else selectedDatesForDuplicate.add(dateKey);
                DOM.duplicateZoneText.innerText = `Çoğalt (${selectedDatesForDuplicate.size})`;
                // Sadece ilgili sütunun class'ını toggle et, grid'i yeniden render etme
                document.querySelectorAll('.weekly-column.selectable, .weekly-row.selectable').forEach(col => {
                    const colDate = col.dataset.date;
                    if (!colDate) return;
                    if (selectedDatesForDuplicate.has(colDate)) {
                        col.classList.add('selected-for-dup');
                    } else {
                        col.classList.remove('selected-for-dup');
                    }
                });
            }
        };

        // --- DETAY PENCERESİNDEN (MODAL) TEKLİ TAMAMLAMA ---
        let _completeTriggeredFromDetail = false; // İptal edilirse görev detayını geri açmak için
        const completeTaskBtn = document.getElementById('completeTaskBtn');
        if(completeTaskBtn) {
            completeTaskBtn.addEventListener('click', () => {
                if(typeof currentViewingTask === 'undefined' || !currentViewingTask) return;
                const isComp = currentViewingTask.isCompleted;
                document.getElementById('singleCompleteTitle').innerText = isComp ? "Tamamlanmayı İptal Et" : "Görevi Tamamla";
                document.getElementById('singleCompleteMsg').innerText = isComp ? "Bu görevin tamamlandı durumunu kaldırmak istediğinize emin misiniz?" : "Bu görevi tamamlandı olarak işaretlemek istediğinize emin misiniz?";
                DOM.yesTaskCompleteBtn.innerText = isComp ? "Evet, Kaldır" : "Evet, Tamamlandı";
                DOM.yesTaskCompleteBtn.style.backgroundColor = isComp ? "#ffc107" : "#28a745";
                document.getElementById('singleCompleteIcon').className = isComp ? "fa-solid fa-arrow-rotate-left" : "fa-solid fa-check-circle";
                document.getElementById('singleCompleteIcon').style.color = isComp ? "#ffc107" : "#28a745";
                taskToCompleteFromDrag = { dateKey: selectedDateForTask, taskId: currentViewingTask.id };
                _completeTriggeredFromDetail = true;
                document.getElementById('viewTaskModal').style.display = 'none';
                // Süre alanını hazırla (sadece tamamlama işleminde göster)
                const isAlreadyComp = currentViewingTask.isCompleted;
                const durRow = document.getElementById('completeUpdateDurRow');
                const durInput = document.getElementById('completeNewDuration');
                const updateBtn = document.getElementById('yesTaskCompleteUpdateBtn');
                if (durRow) durRow.style.display = !isAlreadyComp ? 'flex' : 'none';
                if (durInput && !isAlreadyComp) durInput.value = currentViewingTask.duration || '';
                if (updateBtn) updateBtn.style.display = !isAlreadyComp ? 'block' : 'none';
                document.getElementById('taskCompleteConfirmModal').style.display = 'flex';
            });
        }

        // --- TAMAMLA İPTAL BUTONU: Görev detayından tetiklendiyse detayı geri aç ---
        const cancelTaskCompleteBtn = document.getElementById('cancelTaskCompleteBtn');
        if (cancelTaskCompleteBtn) {
            cancelTaskCompleteBtn.addEventListener('click', () => {
                document.getElementById('taskCompleteConfirmModal').style.display = 'none';
                if (_completeTriggeredFromDetail) {
                    document.getElementById('viewTaskModal').style.display = 'flex';
                }
                _completeTriggeredFromDetail = false;
            });
        }

        // --- FIREBASE İŞLEMLERİ (ÇOĞALTMA, SİLME, TAMAMLAMA) ---
        
        // 1. TEKLİ TAMAMLAMA — yardımcı fonksiyon
        async function _execSingleComplete(newDurationOverride) {
            if (!taskToCompleteFromDrag || !currentUserUid) return;
            const { dateKey, taskId } = taskToCompleteFromDrag;
            const btnYC = DOM.yesTaskCompleteBtn;
            const btnYCU = document.getElementById('yesTaskCompleteUpdateBtn');
            const origTextYC  = btnYC  ? btnYC.innerHTML  : '';
            const origTextYCU = btnYCU ? btnYCU.innerHTML : '';
            if (btnYC)  btnYC.innerHTML  = "İşleniyor...";
            if (btnYCU) btnYCU.innerHTML = "İşleniyor...";
            document.getElementById('taskCompleteConfirmModal').style.display = 'none';
            try {
                const taskIndex = userTasks[dateKey].findIndex(t => t.id === taskId);
                if(taskIndex !== -1) {
                    const currentStatus = userTasks[dateKey][taskIndex].isCompleted || false;
                    const newStatus = !currentStatus;
                    const updatedTask = { ...userTasks[dateKey][taskIndex], isCompleted: newStatus };
                    // Süre güncelleme
                    if (newDurationOverride && newStatus === true) {
                        updatedTask.duration = newDurationOverride;
                    }
                    let playlistsToUpdate = new Set();
                    if (updatedTask.taskVideos && updatedTask.taskVideos.length > 0) {
                        updatedTask.taskVideos.forEach(v => {
                            const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                            if (pl && pl.videos && pl.videos[v.index]) {
                                pl.videos[v.index].isWatched = newStatus;
                                playlistsToUpdate.add(pl);
                            }
                        });
                    }
                    await setDoc(doc(db, "users", currentUserUid, "userTasks", taskId.toString()), updatedTask);
                    userTasks[dateKey][taskIndex] = updatedTask;
                    for (let pl of playlistsToUpdate) {
                        await setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true });
                    }
                    window.updateWeeklyPlannerView?.();
                    window.renderPlaylists?.();
                    window.renderTodayTasks?.();
                }
            } catch (error) { console.error(error); } finally {
                if (btnYC)  btnYC.innerHTML  = origTextYC;
                if (btnYCU) btnYCU.innerHTML = origTextYCU;
                taskToCompleteFromDrag = null;
                _completeTriggeredFromDetail = false;
            }
        }

        // 1. TEKLİ TAMAMLAMA — buton dinleyicileri
        const btnYesComplete = DOM.yesTaskCompleteBtn;
        if(btnYesComplete) {
            btnYesComplete.addEventListener('click', () => _execSingleComplete(null));
        }
        // "Süreyi Güncelle ve Tamamla" butonu
        const btnYesCompleteUpdate = document.getElementById('yesTaskCompleteUpdateBtn');
        if(btnYesCompleteUpdate) {
            btnYesCompleteUpdate.addEventListener('click', () => {
                const val = parseInt(document.getElementById('completeNewDuration')?.value);
                _execSingleComplete(val > 0 ? val : null);
            });
        }

        // 2. TOPLU TAMAMLAMA
        const btnMultiComplete = DOM.yesTaskMultiCompleteBtn;
        if(btnMultiComplete) {
            btnMultiComplete.addEventListener('click', async () => {
                document.getElementById('taskMultiCompleteConfirmModal').style.display = 'none';
                if (tasksToComplete.size === 0 || !currentUserUid) return;
                
                const cmpBtn = document.getElementById('completeDropZone');
                if(cmpBtn) cmpBtn.style.pointerEvents = 'none';
                const action = btnMultiComplete.getAttribute('data-action');
                // 'toggle' modunda her görev kendi durumunun tersine döner
                // 'complete'/'uncomplete' modunda hepsi sabit bir duruma gider
                const fixedStatus = action === 'uncomplete' ? false : action === 'complete' ? true : null;
                
                try {
                    let playlistsToUpdate = new Set();

                    for (const taskKey of tasksToComplete) {
                        const [dKey, tIdStr] = taskKey.split('||');
                        const tId = parseInt(tIdStr);
                        const idx = userTasks[dKey].findIndex(t => t.id === tId);
                        
                        if(idx !== -1) {
                            const targetStatus = fixedStatus !== null ? fixedStatus : !userTasks[dKey][idx].isCompleted;
                            const updated = { ...userTasks[dKey][idx], isCompleted: targetStatus };
                            
                            if (updated.taskVideos && updated.taskVideos.length > 0) {
                                updated.taskVideos.forEach(v => {
                                    const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                                    if (pl && pl.videos && pl.videos[v.index]) {
                                        pl.videos[v.index].isWatched = targetStatus;
                                        playlistsToUpdate.add(pl);
                                    }
                                });
                            }

                            await setDoc(doc(db, "users", currentUserUid, "userTasks", tId.toString()), updated);
                            userTasks[dKey][idx] = updated;
                        }
                    }
                    
                    // Toplu Playlist Firebase Güncellemesi
                    for (let pl of playlistsToUpdate) {
                        await setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true });
                    }

                    window.renderPlaylists?.();
                    resetAppModes();
                    window.updateWeeklyPlannerView?.();
                } catch (error) { console.error(error); resetAppModes(); window.updateWeeklyPlannerView?.(); } finally { if(cmpBtn) cmpBtn.style.pointerEvents = 'auto'; }
            });
        }

        // 3. ÇOĞALTMA 
        const btnMultiDup = document.getElementById('yesTaskMultiDuplicateBtn');
        if(btnMultiDup) {
            btnMultiDup.addEventListener('click', async () => {
                document.getElementById('taskMultiDuplicateConfirmModal').style.display = 'none';
                if (!taskToDuplicate || selectedDatesForDuplicate.size === 0 || !currentUserUid) return;
                
                const sourceTasks = userTasks[taskToDuplicate.dateKey];
                const taskObj = sourceTasks.find(t => t.id === taskToDuplicate.taskId);
                const dupBtn = document.getElementById('duplicateDropZone');
                if(dupBtn) dupBtn.style.pointerEvents = 'none';
                
                try {
                    for (const targetDate of selectedDatesForDuplicate) {
                        const newTaskClone = { ...taskObj, id: Date.now() + Math.floor(Math.random() * 10000), dateKey: targetDate, isCompleted: false };
                        await setDoc(doc(db, "users", currentUserUid, "userTasks", newTaskClone.id.toString()), newTaskClone);
                        if (!userTasks[targetDate]) userTasks[targetDate] = [];
                        userTasks[targetDate].push(newTaskClone);
                    }
                    resetAppModes();
                    window.updateWeeklyPlannerView?.();
                } catch(error) { console.error(error); resetAppModes(); window.updateWeeklyPlannerView?.(); } finally { if(dupBtn) dupBtn.style.pointerEvents = 'auto'; }
            });
        }

        // 4. TOPLU SİLME
        const btnMultiDel = document.getElementById('yesTaskMultiDeleteBtn');
        if(btnMultiDel) {
            btnMultiDel.addEventListener('click', async () => {
                document.getElementById('taskMultiDeleteConfirmModal').style.display = 'none';
                if (tasksToDelete.size === 0 || !currentUserUid) return;
                
                const rmvBtn = document.getElementById('removeDropZone');
                if(rmvBtn) rmvBtn.style.pointerEvents = 'none';
                
                try {
                    let playlistsToUpdate = new Set();
                    for (const taskKey of tasksToDelete) {
                        const [dKey, tIdStr] = taskKey.split('||');
                        const tId = parseInt(tIdStr);
                        
                        const taskObj = userTasks[dKey].find(t => t.id === tId);
                        if (taskObj && taskObj.taskVideos) {
                            taskObj.taskVideos.forEach(v => {
                                const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                                if (pl && pl.videos && pl.videos[v.index]) {
                                    pl.videos[v.index].isPlanned = false;
                                    playlistsToUpdate.add(pl);
                                }
                            });
                        }

                        // Görevi sil
                        await deleteDoc(doc(db, "users", currentUserUid, "userTasks", tIdStr));
                        userTasks[dKey] = userTasks[dKey].filter(t => t.id !== tId);
                    }

                    for (let pl of playlistsToUpdate) {
                        await setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true });
                    }

                    resetAppModes();
                    window.updateWeeklyPlannerView?.();
                } catch (error) { console.error(error); resetAppModes(); window.updateWeeklyPlannerView?.(); } finally { if(rmvBtn) rmvBtn.style.pointerEvents = 'auto'; }
            });
        }

        // --- DÜZENLEME MODUNDAKİ SİL BUTONUNU DİNLE ---
        const deleteTaskBtn = document.getElementById('deleteTaskBtn');
        if (deleteTaskBtn) {
            deleteTaskBtn.addEventListener('click', () => {
                // Silme onay penceresini aç
                document.getElementById('taskDeleteConfirmModal').style.display = 'flex';
            });
        }

        // 5. TEKLİ SİLME
        const btnYesDel = document.getElementById('yesTaskDeleteBtn');
        if(btnYesDel) {
            btnYesDel.addEventListener('click', async () => {
                document.getElementById('taskDeleteConfirmModal').style.display = 'none';
                const tId = taskToDeleteFromDrag ? taskToDeleteFromDrag.taskId : (typeof editingTaskId !== 'undefined' ? editingTaskId : null);
                const dKey = taskToDeleteFromDrag ? taskToDeleteFromDrag.dateKey : (typeof selectedDateForTask !== 'undefined' ? selectedDateForTask : null);
                
                if (tId && dKey && currentUserUid) {
                    const delBtn = document.getElementById('yesTaskDeleteBtn');
                    const origText = delBtn.innerHTML; 
                    delBtn.innerHTML = "Siliniyor...";
                    try {
                        const taskObj = userTasks[dKey].find(t => t.id === tId);
                        if (taskObj && taskObj.taskVideos) {
                            let playlistsToUpdate = new Set();
                            taskObj.taskVideos.forEach(v => {
                                const pl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                                if (pl && pl.videos && pl.videos[v.index]) {
                                    pl.videos[v.index].isPlanned = false;
                                    playlistsToUpdate.add(pl);
                                }
                            });
                            // Güncellenen playlistleri Firebase'e kaydet
                            for (let pl of playlistsToUpdate) {
                                await setDoc(doc(db, "users", currentUserUid, "userPlaylists", pl.id.toString()), pl, { merge: true });
                            }
                        }

                        // Görevi asıl silme işlemi
                        await deleteDoc(doc(db, "users", currentUserUid, "userTasks", tId.toString()));
                        userTasks[dKey] = userTasks[dKey].filter(t => t.id !== tId);
                        
                        if (typeof editingTaskId !== 'undefined' && editingTaskId) {
                            const addTaskModal = document.getElementById('addTaskModal');
                            if(addTaskModal) addTaskModal.style.display = 'none';
                            editingTaskId = null;
                            if(typeof originalTaskEditState !== 'undefined') originalTaskEditState = null;
                        }
                        taskToDeleteFromDrag = null; 
                        window.updateWeeklyPlannerView?.();
                    } catch (error) { 
                        console.error(error); 
                    } finally { 
                        delBtn.innerHTML = origText; 
                    }
                }
            });
        }

