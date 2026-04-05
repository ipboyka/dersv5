        // [PLANLAYICI] --- HAFTALIK PLANLAYICI VE GÖREV MOTORU ---
        const weeklyPlannerModal = document.getElementById('weeklyPlannerModal');
        const openWeeklyPlannerBtn = document.getElementById('openWeeklyPlannerBtn');
        const closeWeeklyPlannerBtn = document.getElementById('closeWeeklyPlannerBtn');
        const prevWeekBtn = document.getElementById('prevWeekBtn');
        const nextWeekBtn = document.getElementById('nextWeekBtn');
        const weekDateRangeDisplay = document.getElementById('weekDateRangeDisplay');
        const weeklyGrid = document.getElementById('weeklyGrid');

        let currentWeekStart = new Date(); 
        var userTasks = window.userTasks = window.userTasks || {}; 

        // --- YENİ: ÇOĞALTMA VE SİLME MODU DEĞİŞKENLERİ ---
        let appMode = 'NORMAL'; // NORMAL, DUP_SELECT_TASK, DUP_SELECT_DAYS, DELETE_SELECT_TASKS
        let taskToDuplicate = null;
        let selectedDatesForDuplicate = new Set();
        let tasksToDelete = new Set(); 
        let tasksToComplete = new Set(); // YENİ
        let taskToCompleteFromDrag = null; // YENİ

        // Bütün modları sıfırlayıp butonları eski haline döndüren zeki fonksiyon
        window.resetAppModes = function() {
            appMode = 'NORMAL';
            taskToDuplicate = null;
            selectedDatesForDuplicate.clear();
            tasksToDelete.clear();
            tasksToComplete.clear();
            
            const dupBtn = document.getElementById('duplicateDropZone');
            if(dupBtn) {
                dupBtn.classList.remove('duplicate-mode');
                DOM.duplicateZoneText.innerText = "Çoğalt";
            }
            
            const rmvBtn = document.getElementById('removeDropZone');
            if(rmvBtn) {
                rmvBtn.classList.remove('delete-mode');
                document.getElementById('removeZoneText').innerText = "Kaldır";
            }

            const cmpBtn = document.getElementById('completeDropZone');
            if(cmpBtn) {
                cmpBtn.classList.remove('complete-mode');
                document.getElementById('completeZoneText').innerText = "Tamamla";
            }
            
            window.updateWeeklyPlannerView?.();
        };

        function getMonday(d) {
            d = new Date(d);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
            return new Date(d.setDate(diff));
        }

        const trMonthsNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
        const trDaysNames = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

        function formatMinutesToHours(totalMinutes) {
            if (!totalMinutes || totalMinutes === 0) return "0 Dk";
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            if (hours > 0 && minutes > 0) return `${hours} Saat ${minutes} Dk`;
            if (hours > 0) return `${hours} Saat`;
            return `${minutes} Dk`;
        }

        // [BUGUN] --- ANA EKRAN: BUGÜNÜN GÖREVLERİ SEKME MOTORU VE ZAMAN YOLCULUĞU ---
        let currentTodayTab = 'kalanlar';
        let currentDashboardDate = new Date();
        document.querySelectorAll('.today-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.today-tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentTodayTab = e.target.getAttribute('data-tab');
                window.renderTodayTasks();
            });
        });

        // İleri - Geri Buton Dinleyicileri (Gün Değiştirme)
        document.getElementById('prevDashDayBtn')?.addEventListener('click', () => {
            currentDashboardDate.setDate(currentDashboardDate.getDate() - 1);
            window.renderTodayTasks();
        });

        document.getElementById('nextDashDayBtn')?.addEventListener('click', () => {
            currentDashboardDate.setDate(currentDashboardDate.getDate() + 1);
            window.renderTodayTasks();
        });

        document.getElementById('resetDashDayBtn')?.addEventListener('click', () => {
            currentDashboardDate = new Date();
            window.renderTodayTasks();
        });

        // --- MİNİ TAKVİM BALONU ---
        (function() {
            const popup    = document.getElementById('dashMiniCalPopup');
            const iconBtn  = document.getElementById('dashCalIconBtn');
            const grid     = document.getElementById('dashMiniCalGrid');
            const title    = document.getElementById('dashMiniCalTitle');
            const prevBtn  = document.getElementById('dashMiniCalPrev');
            const nextBtn  = document.getElementById('dashMiniCalNext');
            const todayBtn = document.getElementById('dashMiniCalTodayBtn');
            if (!popup || !iconBtn) return;

            let miniCalDate = new Date(); // balonun gösterdiği ay

            function renderMiniCal() {
                const year  = miniCalDate.getFullYear();
                const month = miniCalDate.getMonth();
                const trM   = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
                title.innerText = `${trM[month]} ${year}`;

                const firstDay = new Date(year, month, 1).getDay(); // 0=Pazar
                const offset   = (firstDay === 0) ? 6 : firstDay - 1; // Pazartesi başlangıç
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                const today = new Date();
                const selD  = currentDashboardDate;

                let html = '';
                for (let i = 0; i < offset; i++) html += '<div></div>';
                for (let d = 1; d <= daysInMonth; d++) {
                    const isToday   = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const isSelected = d === selD.getDate() && month === selD.getMonth() && year === selD.getFullYear();
                    const bg = isSelected ? 'background:var(--color-primary);color:#fff;'
                             : isToday    ? 'background:var(--color-primary-light);color:var(--color-primary);font-weight:800;'
                             : '';
                    html += `<div onclick="window._dashMiniCalSelect(${year},${month},${d})" style="display:flex;justify-content:center;align-items:center;height:26px;border-radius:var(--radius-sm);font-size:11px;font-weight:600;cursor:pointer;${bg}" onmouseover="if(!this.style.background||this.style.background==='')this.style.background='var(--color-bg-hover)'" onmouseout="if(this.style.background==='var(--color-bg-hover)')this.style.background=''">${d}</div>`;
                }
                grid.innerHTML = html;
            }

            window._dashMiniCalSelect = function(y, m, d) {
                currentDashboardDate = new Date(y, m, d);
                miniCalDate = new Date(y, m, d);
                renderMiniCal();
                window.renderTodayTasks();
                popup.style.display = 'none';
            };

            iconBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = popup.style.display !== 'none';
                popup.style.display = isOpen ? 'none' : 'block';
                if (!isOpen) {
                    miniCalDate = new Date(currentDashboardDate);
                    renderMiniCal();
                }
            });

            prevBtn.addEventListener('click', (e) => { e.stopPropagation(); miniCalDate.setMonth(miniCalDate.getMonth() - 1); renderMiniCal(); });
            nextBtn.addEventListener('click', (e) => { e.stopPropagation(); miniCalDate.setMonth(miniCalDate.getMonth() + 1); renderMiniCal(); });
            todayBtn.addEventListener('click', (e) => { e.stopPropagation(); window._dashMiniCalSelect(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()); });

            // Dışarı tıklayınca kapat
            document.addEventListener('click', (e) => {
                if (!popup.contains(e.target) && e.target !== iconBtn) {
                    popup.style.display = 'none';
                }
            });
        })();

        // --- ANA EKRAN: GÖREVLERİ ÇİZME MOTORU ---
        // Asıl render fonksiyonu - doğrudan çağrılmaz
        function _renderTodayTasksNow() {
            const todayList = document.getElementById('todayTasksList');
            const totalTimeDiv = document.getElementById('todayTotalTime');
            if (!todayList || !totalTimeDiv) return;

            const targetDate = currentDashboardDate;
            const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
            
            // Başlığı Dinamik Güncelle (Bugün mü yoksa başka bir gün mü?)
            const dashTitle = document.getElementById('dashboardScheduleTitle');
            if (dashTitle) {
                const realToday = new Date();
                if (targetDate.getDate() === realToday.getDate() && targetDate.getMonth() === realToday.getMonth() && targetDate.getFullYear() === realToday.getFullYear()) {
                    dashTitle.innerText = "Bugünün Programı";
                } else {
                    dashTitle.innerText = `${targetDate.getDate()} ${trMonthsNames[targetDate.getMonth()]}`;
                }
            }

            const allRawTasks = userTasks[dateKey] || [];
            
            let mainProfileId = 'main_profile';
            if (window.plannerProfiles) {
                const mainP = window.plannerProfiles.find(p => p.isMain);
                if (mainP) mainProfileId = mainP.id;
            }
            
            const allTasks = allRawTasks.filter(t => {
                const taskProfileId = t.profileId || 'main_profile';
                return taskProfileId === mainProfileId;
            });
            
            // Tüm günün toplam hedeflenen süresini hesapla
            let totalMins = 0;
            allTasks.forEach(task => totalMins += parseInt(task.duration));
            const hours = Math.floor(totalMins / 60);
            const mins = totalMins % 60;
            let timeStr = hours > 0 ? (mins > 0 ? `${hours} Saat ${mins} Dk` : `${hours} Saat`) : `${mins} Dk`;
            
            if (allTasks.length === 0) {
                totalTimeDiv.innerHTML = `<i class="fa-solid fa-mug-hot" style="color:#aaa;"></i> Boş Gün`;
                totalTimeDiv.style.color = "#aaa";
                totalTimeDiv.style.backgroundColor = "#fdfdfd";
            } else {
                totalTimeDiv.innerHTML = `<i class="fa-solid fa-stopwatch" class="icon-primary"></i> Toplam: ${timeStr}`;
                totalTimeDiv.style.color = "";
                totalTimeDiv.style.backgroundColor = "";
            }

            // Seçili sekmeye göre görevleri filtrele
            let filteredTasks = allTasks.filter(t => currentTodayTab === 'tamamlananlar' ? t.isCompleted : !t.isCompleted);
            
            todayList.innerHTML = '';
            
            // Sekme boşsa özel mesaj göster
            if (filteredTasks.length === 0) {
                let emptyMsg = currentTodayTab === 'kalanlar' ? "Harika! Bugün için kalan görevin yok." : "Henüz tamamlanan görev yok. Hadi başlayalım!";
                let emptyIcon = currentTodayTab === 'kalanlar' ? "fa-face-smile-beam" : "fa-rocket";
                
                todayList.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--color-text-light); text-align: center; gap: 10px; margin-top: 20px;">
                        <i class="fa-solid ${emptyIcon}" style="font-size: 35px; color: var(--color-primary-border);"></i>
                        <span style="font-size: 13px; font-weight: 700;">${emptyMsg}</span>
                    </div>
                `;
                return;
            }

            if (window.filteredSubjects && window.filteredSubjects.length > 0) {
                // YENİ AKILLI SIRALAMA: Önce tamamlananları alta atar, sonra filtreyi uygular
                filteredTasks.sort((a, b) => {
                    // 1. Kural: Tamamlanan görevler her zaman en alta gider
                    if (a.isCompleted && !b.isCompleted) return 1;
                    if (!a.isCompleted && b.isCompleted) return -1;
                    
                    // 2. Kural: Tamamlanma durumları aynıysa ve ders filtresi aktifse, seçili dersleri üste al
                    if (window.filteredSubjects && window.filteredSubjects.length > 0) {
                        const aActive = window.filteredSubjects.includes(a.subject);
                        const bActive = window.filteredSubjects.includes(b.subject);
                        if (aActive && !bActive) return -1;
                        if (!aActive && bActive) return 1;
                    }
                    return 0;
                });
            }

            // Filtrelenmiş ve Sıralanmış görevleri ekrana bas
            // DocumentFragment: tüm kartlar önce bellekte oluşturulur,
            // sonra tek seferde DOM'a eklenir — innerHTML += döngüsünden ~5x hızlı
            const fragment = document.createDocumentFragment();
            const tempDiv = document.createElement('div');

            filteredTasks.forEach(task => {
                let badgeClass = task.examType === 'tyt' ? 'badge-tyt' : (task.examType === 'ayt' ? 'badge-ayt' : 'badge-genel');
                let displayExamType = task.examType.toUpperCase();
                if(task.examType === 'genel') displayExamType = "GENEL";
                
                let extraClass = task.isCompleted ? " task-completed" : "";
                let completedTickHtml = task.isCompleted ? '<div class="task-completed-badge"><i class="fa-solid fa-check"></i></div>' : '';
                
                const sColor = window.subjectColors ? (window.subjectColors[task.subject] || 'var(--color-primary)') : getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
                
                const isFilteredOut = window.filteredSubjects && window.filteredSubjects.length > 0 && !window.filteredSubjects.includes(task.subject);
                const filterOpacityStyle = isFilteredOut ? 'opacity: 0.20; filter: grayscale(80%);' : 'opacity: 1; filter: grayscale(0%);';

                const taskHtml = `
                    <div class="planner-task-card${extraClass}" onclick="window.viewTaskDetails('${dateKey}', ${task.id})" style="cursor: pointer; position: relative; border-left-color: ${sColor}; ${filterOpacityStyle}">
                        ${completedTickHtml}
                        <div class="task-card-header" style="align-items: center; flex-wrap: wrap; gap: 5px;">
                            <span class="task-card-subject">${(task.subLesson && task.subLesson !== "Genel") ? task.subLesson : task.subject}</span>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800;">
                                <span class="task-card-type" class="icon-primary"><i class="fa-solid fa-layer-group" style="font-size: 12px;"></i> ${task.taskType}</span>
                                ${task.questionCount ? `<span style="color: #fd7e14;"><i class="fa-solid fa-clipboard-question" style="font-size: 12px;"></i> ${task.questionCount} Soru</span>` : ''}
                                ${(task.taskVideos && task.taskVideos.length > 0) ? `<span style="color: #dc3545; font-weight: 800; font-size: 11px;"><i class="fa-brands fa-youtube" style="font-size: 12px;"></i> ${task.taskVideos.length}</span>` : ''}
                                <span style="color: var(--color-text-muted);"><i class="fa-solid fa-clock" style="font-size: 12px;"></i> ${task.duration} dk</span>
                                <span class="task-card-badge ${badgeClass}">${displayExamType}</span>
                            </div>
                        </div>
                        <div class="task-card-desc" style="margin-top: 2px;">${task.desc}</div>
                    </div>
                `;
                tempDiv.innerHTML = taskHtml;
                const taskNode = tempDiv.firstElementChild;
                if (taskNode) fragment.appendChild(taskNode);
            });
            todayList.appendChild(fragment);
        };

        // Throttled public API — tüm kod buraya çağırmalı
        window.renderTodayTasks = function() {
            scheduleRender('todayTasks', _renderTodayTasksNow);
            // Saat widget'ının görev listesine erişebilmesi için window'a aç
            window._clkUserTasksLive = userTasks;
            window._clkDashDateLive  = currentDashboardDate;
        };

        // userTasks ilk yüklendiğinde de expose et
        const _origClkExposeInterval = setInterval(() => {
            window._clkUserTasksLive = userTasks;
            window._clkDashDateLive  = currentDashboardDate;
        }, 500);
        setTimeout(() => clearInterval(_origClkExposeInterval), 30000);

        // --- TAKVİMİ VE GÖREVLERİ ÇİZME (AKILLI MODLAR VE DÜZENLER İLE UYUMLU) ---
        function updateWeeklyPlannerView() {
            if (!document.getElementById('rowLayoutStyles')) {
                document.head.insertAdjacentHTML('beforeend', `
                    <style id="rowLayoutStyles">
                        .weekly-grid.row-layout {
                            display: flex !important;
                            flex-direction: column !important;
                            min-width: 100% !important;
                            height: auto !important;
                            overflow-y: auto !important;
                            overflow-x: hidden !important;
                            gap: 8px !important;
                            padding-right: 5px;
                        }
                        .weekly-grid.row-layout .weekly-row {
                            height: 125px !important;
                            min-height: 125px !important;
                            max-height: 125px !important;
                        }
                        .weekly-grid.row-layout .weekly-row-content {
                            scroll-behavior: smooth;
                            align-items: center !important;
                        }
                        .weekly-grid.row-layout .weekly-row-content::-webkit-scrollbar { height: 6px; }
                        .weekly-grid.row-layout .weekly-row-content::-webkit-scrollbar-track { background: transparent; }
                        .weekly-grid.row-layout .weekly-row-content::-webkit-scrollbar-thumb { background: rgba(0,123,255,0.2); border-radius: 10px; }
                        .weekly-grid.row-layout .weekly-row-content::-webkit-scrollbar-thumb:hover { background: rgba(0,123,255,0.4); }
                                
                        .weekly-grid.row-layout .weekly-row-content .planner-task-card {
                            flex: 0 0 250px !important;
                            max-width: 250px !important;
                            overflow: hidden !important;
                            height: 95px !important;
                            margin-bottom: 0 !important;
                            padding: 10px 12px !important;
                            display: flex;
                            flex-direction: column;
                            justify-content: space-between;
                        }
                        .weekly-grid.row-layout .weekly-row-content .task-card-desc {
                            white-space: nowrap !important;
                            overflow: hidden !important;
                            text-overflow: ellipsis !important;
                            display: block !important;
                            width: 100% !important;
                            margin: 4px 0 !important;
                            font-size: 11px !important;
                            color: #666 !important;
                            line-height: 1.2 !important;
                        }
                        .weekly-grid.row-layout .weekly-row-content .task-card-header {
                            margin-bottom: 0 !important;
                        }
                        .weekly-grid.row-layout .weekly-row-content .planner-task-card > div:last-child {
                            padding-top: 6px !important;
                            border-top: 1px dashed #eef2f5 !important;
                            margin-top: auto !important;
                        }
                        .weekly-grid.row-layout .weekly-row-content .add-task-btn-ghost {
                            flex: 0 0 120px !important;
                            margin: 0 !important;
                            height: 95px !important;
                            align-self: center !important;
                        }
                    </style>
                `);
            }

            const weekEnd = new Date(currentWeekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            let startText = `${currentWeekStart.getDate()} ${trMonthsNames[currentWeekStart.getMonth()]}`;
            let endText = `${weekEnd.getDate()} ${trMonthsNames[weekEnd.getMonth()]}`;
            
            if (currentWeekStart.getMonth() === weekEnd.getMonth()) startText = `${currentWeekStart.getDate()}`;
            if (currentWeekStart.getFullYear() !== weekEnd.getFullYear()) startText += ` ${currentWeekStart.getFullYear()}`;
            
            weekDateRangeDisplay.innerText = `${startText} - ${endText}`;
            
            const currentLayout = localStorage.getItem('plannerLayout') || 'column';
            
            // Rebuild öncesi her gün sütununun scroll pozisyonunu kaydet
            const savedScrollPositions = {};
            weeklyGrid.querySelectorAll('.weekly-day-content[data-date]').forEach(el => {
                savedScrollPositions[el.dataset.date] = el.scrollTop;
            });
            weeklyGrid.querySelectorAll('.weekly-row-content[data-date]').forEach(el => {
                savedScrollPositions['row_' + el.dataset.date] = el.scrollLeft;
            });

            weeklyGrid.innerHTML = '';
            
            if (currentLayout === 'row') {
                weeklyGrid.classList.add('row-layout');
            } else {
                weeklyGrid.classList.remove('row-layout');
            }

            for(let i = 0; i < 7; i++) {
                const currentDay = new Date(currentWeekStart);
                currentDay.setDate(currentDay.getDate() + i);
                const dateKey = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
                
                const currentProfileId = document.getElementById('currentPlannerProfile') ? document.getElementById('currentPlannerProfile').value : 'main_profile';
                
                let dayTasks = [...(userTasks[dateKey] || [])].filter(t => {
                    const taskProfileId = t.profileId || 'main_profile'; 
                    return taskProfileId === currentProfileId;
                });
                
                // YENİ AKILLI SIRALAMA: Önce tamamlananları alta atar, sonra filtreyi uygular
                dayTasks.sort((a, b) => {
                    // 1. Kural: Tamamlanan görevler her zaman en alta gider
                    if (a.isCompleted && !b.isCompleted) return 1;
                    if (!a.isCompleted && b.isCompleted) return -1;
                    
                    // 2. Kural: Tamamlanma durumları aynıysa ve ders filtresi aktifse, seçili dersleri üste al
                    if (window.filteredSubjects && window.filteredSubjects.length > 0) {
                        const aActive = window.filteredSubjects.includes(a.subject);
                        const bActive = window.filteredSubjects.includes(b.subject);
                        if (aActive && !bActive) return -1;
                        if (!aActive && bActive) return 1;
                    }
                    return 0;
                });

                let totalDayMinutes = 0;
                let tasksHtml = '';
                
                dayTasks.forEach(task => {
                    totalDayMinutes += parseInt(task.duration);
                    
                    let badgeClass = task.examType === 'tyt' ? 'badge-tyt' : (task.examType === 'ayt' ? 'badge-ayt' : 'badge-genel');
                    let displayExamType = task.examType.toUpperCase();
                    if(task.examType === 'genel') displayExamType = "GENEL";
                    
                    let shortTaskType = task.taskType;
                    if (task.taskType === 'Konu Anlatımı') shortTaskType = 'Konu';
                    else if (task.taskType === 'Test Çözümü') shortTaskType = 'Test';
                    else if (task.taskType === 'Deneme Çözümü') shortTaskType = 'Deneme';
                    else if (task.taskType === 'Genel Tekrar') shortTaskType = 'Tekrar';

                    // YENİ: weekly-task-card eklendi!
                    let taskCardExtraClass = " weekly-task-card";
                    if (task.isCompleted) taskCardExtraClass += " task-completed";
                    
                    if (appMode === 'DELETE_SELECT_TASKS' && tasksToDelete.has(`${dateKey}||${task.id}`)) {
                        taskCardExtraClass += " task-card-selected-delete";
                    } else if (appMode === 'COMPLETE_SELECT_TASKS' && tasksToComplete.has(`${dateKey}||${task.id}`)) {
                        taskCardExtraClass += " task-card-selected-complete";
                    } else if ((appMode === 'DUP_SELECT_TASK' || appMode === 'DUP_SELECT_DAYS') && taskToDuplicate && taskToDuplicate.taskId === task.id) {
                        taskCardExtraClass += " task-card-selected-duplicate";
                    }

                    const draggableAttr = appMode === 'NORMAL' ? 'draggable="true"' : '';
                    const dragEvents = appMode === 'NORMAL' ? `ondragstart="window.startTaskDrag(event, '${dateKey}', ${task.id})" ondragend="window.endTaskDrag(event)"` : '';
                    
                    const sColor = window.subjectColors ? (window.subjectColors[task.subject] || 'var(--color-primary)') : getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
                    
                    const isFilteredOut = window.filteredSubjects && window.filteredSubjects.length > 0 && !window.filteredSubjects.includes(task.subject);
                    const filterOpacityStyle = isFilteredOut ? 'opacity: 0.20; filter: grayscale(80%);' : 'opacity: 1; filter: grayscale(0%);';

                    tasksHtml += `
                            <div class="planner-task-card${taskCardExtraClass}" ${draggableAttr} ${dragEvents} onclick="window.handleTaskClick(event, '${dateKey}', ${task.id})" style="position: relative; cursor: ${appMode === 'NORMAL' ? 'grab' : 'pointer'}; border-left-color: ${sColor}; ${filterOpacityStyle}" data-custom-title="Görev">
                                <div class="task-card-header" style="align-items: flex-start;">
                                    <span class="task-card-subject" class="flex-1">${(task.subLesson && task.subLesson !== "Genel") ? task.subLesson : task.subject}</span>
                                    <span class="task-card-badge ${badgeClass}" style="margin-left: 5px;">${displayExamType}</span>
                                </div>
                                <div class="task-card-desc">${task.desc || ''}</div>
                                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; font-weight: 800; flex-wrap: wrap; gap: 5px;">
                                    <div style="display: flex; gap: 8px;">
                                        <span class="task-card-type" class="icon-primary"><i class="fa-solid fa-layer-group"></i> ${shortTaskType}</span>
                                        ${task.questionCount ? `<span style="color: #fd7e14;"><i class="fa-solid fa-clipboard-question"></i> ${task.questionCount} Soru</span>` : ''}
                                        ${(task.taskVideos && task.taskVideos.length > 0) ? `<span style="color: #dc3545; font-weight: 800; font-size: 11px;"><i class="fa-brands fa-youtube"></i> ${task.taskVideos.length}</span>` : ''}
                                    </div>
                                    <span style="color: var(--color-text-muted);"><i class="fa-solid fa-clock"></i> ${task.duration} dk</span>
                                </div>
                            </div>
                        `;
                });

                const isToday = currentDay.toDateString() === new Date().toDateString();
                const dateColor = isToday ? 'color: #e6f2ff;' : 'color: #888;';
                
                let colExtraClass = "";
                let colOnClick = "";
                if (appMode === 'DUP_SELECT_DAYS') {
                    colExtraClass = " selectable";
                    if (selectedDatesForDuplicate.has(dateKey)) {
                        colExtraClass += " selected-for-dup";
                    }
                    colOnClick = `onclick="window.toggleDateForDuplicate('${dateKey}')"`;
                }

                if (currentLayout === 'row') {
                    const headerBgRow = isToday ? 'background-color: var(--color-primary); color: white;' : 'background-color: #f8f9fa;';
                    const nameColorRow = isToday ? 'color: white;' : 'color: #333;';
                    
                    let rowTotalTimeHtml = totalDayMinutes > 0 
                        ? `<div style="margin-top: 5px; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: var(--radius-sm); background: ${isToday ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-hover)'}; color: ${isToday ? 'white' : 'var(--color-primary)'};"><i class="fa-solid fa-stopwatch"></i> ${formatMinutesToHours(totalDayMinutes)}</div>` 
                        : `<div style="margin-top: 5px; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: var(--radius-sm); background: ${isToday ? 'rgba(255,255,255,0.2)' : '#f1f3f5'}; color: ${isToday ? 'var(--color-bg-hover)' : '#aaa'};"><i class="fa-solid fa-mug-hot"></i> Boş Gün</div>`;

                    weeklyGrid.innerHTML += `
                        <div class="weekly-row${colExtraClass}" data-date="${dateKey}" ${colOnClick} style="display: flex; background: var(--color-bg-card); border-radius: var(--radius-lg); box-shadow: 0 4px 12px rgba(0,0,0,0.03); overflow: hidden; border: 1px solid #eef2f5; flex-shrink: 0; width: 100%;">
                            <div class="weekly-row-header" style="${headerBgRow} width: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; border-right: 1px solid #eef2f5; flex-shrink: 0; transition: var(--transition-fast);">
                                <span class="weekly-day-name" style="font-size: 14px; font-weight: 800; ${nameColorRow}">${trDaysNames[i]}</span>
                                <span class="weekly-day-date" style="font-size: 11px; font-weight: bold; margin-top: 3px; ${dateColor}">${currentDay.getDate()} ${trMonthsNames[currentDay.getMonth()]}</span>
                                ${rowTotalTimeHtml}
                            </div>
                            <div class="weekly-row-content" data-date="${dateKey}" style="flex: 1; display: flex; align-items: stretch; padding: 10px; gap: 10px; overflow-x: auto;" ondragover="window.handleTaskDragOver(event)" ondragleave="window.handleTaskDragLeave(event)" ondrop="window.dropTask(event, '${dateKey}')">
                                <div class="add-task-btn-ghost" onclick="window.openTaskModalForDate('${dateKey}')" style="display: flex; flex-direction: column; justify-content: center;">
                                    <i class="fa-solid fa-plus" style="margin-bottom: 5px;"></i> Görev Ekle
                                </div>
                                ${tasksHtml}
                            </div>
                        </div>
                    `;
                } else {
                    const headerBgCol = isToday ? 'background-color: var(--color-primary); color: white;' : '';
                    
                    let totalTimeHtml = '';
                    if(totalDayMinutes > 0) {
                        totalTimeHtml = `<div class="daily-total-time"><i class="fa-solid fa-stopwatch" class="icon-primary"></i> Toplam: ${formatMinutesToHours(totalDayMinutes)}</div>`;
                    } else {
                        totalTimeHtml = `<div class="daily-total-time" style="color:#aaa; background:#fdfdfd;"><i class="fa-solid fa-mug-hot"></i> Boş Gün</div>`;
                    }

                    weeklyGrid.innerHTML += `
                        <div class="weekly-column${colExtraClass}" data-date="${dateKey}" ${colOnClick}>
                            <div style="display: flex; flex-direction: column; height: 100%;">
                                <div class="weekly-day-header" style="${headerBgCol}">
                                    <span class="weekly-day-name">${trDaysNames[i]}</span>
                                    <span class="weekly-day-date" style="${dateColor}">${currentDay.getDate()} ${trMonthsNames[currentDay.getMonth()]}</span>
                                </div>
                                <div style="padding: 10px 12px 0 12px;">
                                    <div class="add-task-btn-ghost" onclick="window.openTaskModalForDate('${dateKey}')">
                                        <i class="fa-solid fa-plus"></i> Görev Ekle
                                    </div>
                                </div>
                                <div class="weekly-day-content" data-date="${dateKey}" style="padding-top: 10px; min-height: 100px; transition: background-color 0.2s;" ondragover="window.handleTaskDragOver(event)" ondragleave="window.handleTaskDragLeave(event)" ondrop="window.dropTask(event, '${dateKey}')">
                                    ${tasksHtml}
                                </div>
                                ${totalTimeHtml}
                            </div>
                        </div>
                    `;
                }
            }

            // Rebuild sonrası scroll pozisyonlarını geri yükle
            requestAnimationFrame(() => {
                weeklyGrid.querySelectorAll('.weekly-day-content[data-date]').forEach(el => {
                    const saved = savedScrollPositions[el.dataset.date];
                    if (saved) el.scrollTop = saved;
                });
                weeklyGrid.querySelectorAll('.weekly-row-content[data-date]').forEach(el => {
                    const saved = savedScrollPositions['row_' + el.dataset.date];
                    if (saved) el.scrollLeft = saved;
                });
            });

            window.renderTodayTasks?.();
        }

        // updateWeeklyPlannerView — throttled wrapper
        // Birden fazla art arda çağrıyı tek frame'e sıkıştırır
        window.updateWeeklyPlannerView = (function(originalFn) {
            return function() {
                scheduleRender('weeklyPlanner', originalFn);
            };
        })(updateWeeklyPlannerView);

        if (openWeeklyPlannerBtn) {
            openWeeklyPlannerBtn.addEventListener('click', () => {
                currentWeekStart = getMonday(new Date()); 
                updateWeeklyPlannerView();
                weeklyPlannerModal.style.display = 'flex';
            });
        }
        if (closeWeeklyPlannerBtn) closeWeeklyPlannerBtn.addEventListener('click', () => weeklyPlannerModal.style.display = 'none');
        if (prevWeekBtn) prevWeekBtn.addEventListener('click', () => { currentWeekStart.setDate(currentWeekStart.getDate() - 7); updateWeeklyPlannerView(); });
        if (nextWeekBtn) nextWeekBtn.addEventListener('click', () => { currentWeekStart.setDate(currentWeekStart.getDate() + 7); updateWeeklyPlannerView(); });

