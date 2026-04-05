       // [DISA-AKTAR] --- YENİ: PROGRAM İNDİRME, CANLI ÖNİZLEME VE DIŞA AKTARMA MOTORU (GİZLİ SAHNE ARKASI YÖNTEMİ) ---
        window.originalWeekStartForExport = null;

        window.createAndOpenExportModal = function() {
            if (!document.getElementById('exportPlannerModal')) {
                document.head.insertAdjacentHTML('beforeend', `
                    <style id="exportStyles">
                        div.weekly-grid.export-mode {
                            display: flex !important; 
                            height: auto !important;
                            min-height: auto !important;
                            overflow: visible !important;
                            background: #f4f7f6 !important;
                            padding: 20px !important;
                            border-radius: 12px;
                            width: 1200px !important; 
                        }
                        div.weekly-grid.export-mode.row-layout {
                            flex-direction: column !important;
                            gap: 10px !important;
                        }
                        div.weekly-grid.export-mode:not(.row-layout) {
                            flex-direction: row !important;
                            gap: 15px !important;
                        }
                        
                        div.weekly-grid.export-mode.row-layout .weekly-row {
                            height: auto !important;
                            min-height: 115px !important; 
                            max-height: none !important; 
                        }
                        
                        div.weekly-grid.export-mode .weekly-column {
                            height: auto !important;
                            flex: 1 !important;
                            min-width: 0 !important;
                        }
                        
                        div.weekly-grid.export-mode .weekly-row-content {
                            overflow: visible !important;
                            flex-wrap: wrap !important; 
                            align-items: stretch !important; 
                            height: auto !important;
                        }
                        
                        div.weekly-grid.export-mode .weekly-row-content .planner-task-card {
                            height: auto !important;
                            min-height: 85px !important; 
                            max-height: none !important; 
                            overflow: visible !important; 
                            padding-bottom: 10px !important; 
                            display: flex !important;
                            flex-direction: column !important;
                            justify-content: space-between !important;
                        }
                        
                        div.weekly-grid.export-mode.row-layout .weekly-row-content .planner-task-card {
                            width: 230px !important;
                            flex: 0 0 230px !important;
                        }
                        
                        div.weekly-grid.export-mode:not(.row-layout) .weekly-row-content .planner-task-card {
                            width: 100% !important; 
                            box-sizing: border-box !important;
                        }
                        
                        div.weekly-grid.export-mode .weekly-row-content .planner-task-card .task-card-desc {
                            white-space: pre-wrap !important; 
                            word-wrap: break-word !important; 
                            word-break: break-word !important; 
                            overflow: visible !important;
                            text-overflow: clip !important;
                            display: block !important;
                            height: auto !important;
                            max-height: none !important; 
                            margin-bottom: 10px !important;
                            line-height: 1.3 !important;
                            -webkit-line-clamp: unset !important;
                        }
                        
                        div.weekly-grid.export-mode .add-task-btn-ghost {
                            display: none !important;
                        }
                        
                        div.weekly-grid.export-mode .daily-total-time {
                            white-space: nowrap !important;
                            overflow: hidden !important;
                            text-overflow: ellipsis !important;
                            text-align: center !important;
                        }
                        
                        .export-segment { display: flex; gap: 5px; background: #f8f9fa; border: 1px solid #e2e6ea; border-radius: 8px; padding: 4px; }
                        .export-segment input[type="radio"] { display: none; }
                        .export-segment label { flex: 1; text-align: center; font-size: 11px; font-weight: bold; padding: 8px 4px; border-radius: 6px; cursor: pointer; color: #6c757d; transition: all 0.2s; margin: 0; }
                        .export-segment input[type="radio"]:checked + label { background: #28a745; color: white; box-shadow: 0 2px 4px rgba(40,167,69,0.2); }
                        
                        #exportPreviewImg { width: 100%; height: auto; border-radius: 6px; border: 1px solid #ddd; cursor: zoom-in; transition: transform 0.2s; }
                        #exportPreviewImg:hover { transform: scale(1.02); }
                    </style>
                `);

                const modalHtml = `
                    <div id="exportPlannerModal" class="custom-modal" style="z-index: 4000; display: none; background: rgba(0,0,0,0.6);">
                        <div class="custom-modal-content" style="max-width: 900px; width: 95%; padding: 25px; border-radius: var(--radius-lg); background: var(--color-bg-card); box-shadow: var(--shadow-modal); text-align: center;">
                            
                            <h4 style="margin: 0 0 15px 0; color: var(--color-success); font-size: 18px; font-weight: 800;"><i class="fa-solid fa-file-export"></i> Programı İndir</h4>
                            <p style="font-size: 12px; color: var(--color-text-muted); margin-bottom: 20px;">İndirilen dosyada tüm görevlerin açıklamaları <b>tamamen okunabilir</b> şekilde otomatik olarak genişletilecektir.</p>
                            
                            <div style="display: flex; gap: 25px; text-align: left; margin-bottom: 20px; align-items: stretch; flex-wrap: wrap;">
                                
                                <div style="flex: 1; min-width: 300px; display: flex; flex-direction: column; gap: 15px;">
                                    
                                    <div class="flex-gap-15">
                                        <div class="flex-1">
                                            <style>
                                                /* Kutu açıldığında alt köşeleri jilet gibi düzleştiren özel CSS */
                                                #tcs-exportProfile.open #exportProfileTrigger {
                                                    border-bottom-left-radius: 0 !important;
                                                    border-bottom-right-radius: 0 !important;
                                                }
                                            </style>
                                            <label class="form-label-sm">Program Seçimi</label>
                                            <div class="task-custom-select" id="tcs-exportProfile" style="width: 100%;">
                                                <div class="tcs-trigger" id="exportProfileTrigger" onclick="window.toggleExportMenu(event)" style="padding: 10px; border-radius: var(--radius-md); border: 1px solid #e2e6ea; font-size: 13px; outline: none; box-sizing: border-box; background: var(--color-bg-card); min-height: auto; transition: var(--transition-fast);">
                                                    <span class="tcs-text" id="exportProfileText"><i class="fa-solid fa-star" class="icon-star"></i> Ana Program</span> 
                                                    <i class="fa-solid fa-chevron-down"></i>
                                                </div>
                                                <div class="tcs-options" id="exportProfileOptions">
                                                    </div>
                                                <input type="hidden" id="exportProfileInput" value="main_profile">
                                            </div>
                                        </div>
                                        
                                        <div style="flex: 1.5;">
                                            <label class="form-label-sm">Program Başlığı</label>
                                            <input type="text" id="exportCustomTitle" placeholder="Örn: YKS Son Tekrar Kampı" oninput="window.updateExportPreview()" style="width: 100%; padding: 10px; border-radius: var(--radius-md); border: 1px solid #e2e6ea; font-size: 13px; outline: none; box-sizing: border-box; transition: var(--transition-fast);">
                                        </div>
                                    </div>

                                    <div>
                                        <label class="form-label-sm">Hangi Hafta İndirilsin?</label>
                                        <div class="export-segment">
                                            <input type="radio" name="expWeek" id="expWeekPrev" value="-1" onchange="window.updateExportPreview()">
                                            <label for="expWeekPrev">Geçen Hafta</label>
                                            
                                            <input type="radio" name="expWeek" id="expWeekCurr" value="0" checked onchange="window.updateExportPreview()">
                                            <label for="expWeekCurr">Bu Hafta</label>
                                            
                                            <input type="radio" name="expWeek" id="expWeekNext" value="1" onchange="window.updateExportPreview()">
                                            <label for="expWeekNext">Gelecek Hafta</label>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="form-label-sm">Planlayıcı Düzeni</label>
                                        <div class="export-segment">
                                            <input type="radio" name="expLayout" id="expLayoutCol" value="column" onchange="window.updateExportPreview()">
                                            <label for="expLayoutCol">Sütun (Dikey)</label>
                                            
                                            <input type="radio" name="expLayout" id="expLayoutRow" value="row" onchange="window.updateExportPreview()">
                                            <label for="expLayoutRow">Satır (Yatay)</label>
                                        </div>
                                    </div>

                                    <div>
                                        <label class="form-label-sm">Dosya Formatı</label>
                                        <div class="export-segment">
                                            <input type="radio" name="expFormat" id="expFmtPng" value="png" checked>
                                            <label for="expFmtPng">PNG</label>
                                            
                                            <input type="radio" name="expFormat" id="expFmtJpg" value="jpg">
                                            <label for="expFmtJpg">JPG</label>
                                            
                                            <input type="radio" name="expFormat" id="expFmtPdf" value="pdf">
                                            <label for="expFmtPdf">PDF</label>
                                        </div>
                                    </div>
                                </div>

                                <div style="flex: 1.2; min-width: 300px; display: flex; flex-direction: column;">
                                    <label style="font-size: 12px; font-weight: bold; color: var(--color-text-secondary); margin-bottom: 5px; display: flex; justify-content: space-between;"><span>Önizleme</span> <span style="color:#aaa; font-size:10px;">(Büyütmek için tıkla)</span></label>
                                    <div id="exportPreviewContainer" style="flex: 1; min-height: 250px; max-height: 350px; position: relative; background: var(--color-bg-input); border: 1px dashed #ccc; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 5px;">
                                        <span id="exportPreviewLoader" style="color: var(--color-primary); font-size: 12px; font-weight: bold;"><i class="fa-solid fa-circle-notch fa-spin"></i> Önizleme Hazırlanıyor...</span>
                                        <img id="exportPreviewImg" style="display: none; max-width: 100%; max-height: 100%; object-fit: contain; cursor: zoom-in;" onclick="window.openPreviewZoom()">
                                    </div>
                                </div>

                            </div>

                            <div class="flex-gap-10">
                                <button onclick="window.closeExportModal()" style="flex: 1; padding: 12px; border: 1px solid #ccc; background: var(--color-bg-input); border-radius: var(--radius-md); cursor: pointer; color: var(--color-text-main); font-weight: bold; transition: 0.2s;" onmouseover="this.style.background='#e2e6ea'" onmouseout="this.style.background='#f8f9fa'">İptal</button>
                                <button onclick="window.startExportProcess()" style="flex: 1; padding: 12px; border: none; background: var(--color-success); border-radius: var(--radius-md); cursor: pointer; color: white; font-weight: bold; display: flex; justify-content: center; align-items: center; gap: 8px; transition: 0.2s;" onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'" id="exportConfirmBtn">
                                    <i class="fa-solid fa-download"></i> İndir
                                </button>
                            </div>
                        </div>
                    </div>

                    <div id="previewZoomModal" onclick="this.style.display='none'" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index: 5000; align-items:center; justify-content:center; cursor:zoom-out;">
                        <img id="previewZoomImg" style="max-width:95%; max-height:95%; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', modalHtml);
            }

            document.getElementById('exportPlannerModal').style.display = 'flex';
            
            // Seçimleri ve Başlığı sıfırla
            document.getElementById('expWeekCurr').checked = true;
            document.getElementById('expFmtPng').checked = true;
            document.getElementById('exportCustomTitle').value = ''; // Modalı açınca temizle

            // Modalı açınca temizle
            const currentLayout = localStorage.getItem('plannerLayout') || 'column';
            if (currentLayout === 'row') {
                document.getElementById('expLayoutRow').checked = true;
            } else {
                document.getElementById('expLayoutCol').checked = true;
            }
            
            window.renderProfileOptionsUI?.();
            
            window.updateExportPreview();
        };

        window.closeExportModal = function() {
            document.getElementById('exportPlannerModal').style.display = 'none';
        };

        window.openPreviewZoom = function() {
            const imgSrc = document.getElementById('exportPreviewImg').src;
            if (imgSrc) {
                document.getElementById('previewZoomImg').src = imgSrc;
                document.getElementById('previewZoomModal').style.display = 'flex';
            }
        };

        window.getExportCanvas = function(offset, layoutType, qualityScale, callback) {
            window.loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', () => {
                
                const exportWrapper = document.createElement('div');
                exportWrapper.id = 'exportWrapperOffscreen';
                exportWrapper.style.position = 'absolute';
                exportWrapper.style.top = '-9999px';
                exportWrapper.style.left = '-9999px';
                exportWrapper.style.zIndex = '-1';
                exportWrapper.style.width = '1200px';
                exportWrapper.style.backgroundColor = '#f4f7f6';
                exportWrapper.style.padding = '30px';
                exportWrapper.style.boxSizing = 'border-box';
                exportWrapper.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
                
                const targetWeekStart = new Date(currentWeekStart);
                targetWeekStart.setDate(targetWeekStart.getDate() + (offset * 7));

                const weekEnd = new Date(targetWeekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                
                let startText = `${targetWeekStart.getDate()} ${trMonthsNames[targetWeekStart.getMonth()]}`;
                let endText = `${weekEnd.getDate()} ${trMonthsNames[weekEnd.getMonth()]}`;
                
                if (targetWeekStart.getMonth() === weekEnd.getMonth()) startText = `${targetWeekStart.getDate()}`;
                if (targetWeekStart.getFullYear() !== weekEnd.getFullYear()) startText += ` ${targetWeekStart.getFullYear()}`;
                
                const dateRangeText = `${startText} - ${endText}`;

                const titleInput = document.getElementById('exportCustomTitle');
                const finalTitle = (titleInput && titleInput.value.trim() !== '') ? titleInput.value.trim() : 'Haftalık Ders Programı';

                const headerDiv = document.createElement('div');
                headerDiv.style.textAlign = 'center';
                headerDiv.style.marginBottom = '25px';
                headerDiv.innerHTML = `
                    <h2 style="margin: 0; font-size: 26px; font-weight: 800; color: var(--color-text-main);"><i class="fa-solid fa-calendar-check" class="icon-primary"></i> ${finalTitle}</h2>
                    <p style="margin: 8px 0 0 0; font-size: 14px; font-weight: bold; color: var(--color-primary); background: var(--color-bg-hover); display: inline-block; padding: 6px 15px; border-radius: 20px; border: 1px solid var(--color-primary-border);">${dateRangeText}</p>
                `;
                exportWrapper.appendChild(headerDiv);

                const clonedGrid = document.createElement('div');
                clonedGrid.id = 'weeklyGridExportClone';
                clonedGrid.className = 'weekly-grid export-mode';
                
                clonedGrid.style.setProperty('width', '100%', 'important');
                clonedGrid.style.setProperty('padding', '0', 'important');
                clonedGrid.style.setProperty('background', 'transparent', 'important');
                
                if (layoutType === 'row') clonedGrid.classList.add('row-layout');

                let cloneHtml = '';
                for(let i = 0; i < 7; i++) {
                    const currentDay = new Date(targetWeekStart);
                    currentDay.setDate(currentDay.getDate() + i);
                    const dateKey = `${currentDay.getFullYear()}-${String(currentDay.getMonth() + 1).padStart(2, '0')}-${String(currentDay.getDate()).padStart(2, '0')}`;
                    
                    const exportInputEl = document.getElementById('exportProfileInput');
                    const exportProfileId = exportInputEl ? exportInputEl.value : 'main_profile';
                    
                    let dayTasks = [...(userTasks[dateKey] || [])].filter(t => {
                        const taskProfileId = t.profileId || 'main_profile';
                        return taskProfileId === exportProfileId;
                    });
                    
                    // SENİN KENDİ DERS FİLTRESİ (Silikleştirme) MANTIĞIN AYNEN KORUNDU
                    if (window.filteredSubjects && window.filteredSubjects.length > 0) {
                        // YENİ AKILLI SIRALAMA (İndirme Ekranı İçin)
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
                    }

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

                        let taskCardExtraClass = "";
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

                        // Haftalık planlayıcıda yeşil yuvarlak iptal edildi, HTML çok daha temiz bırakıldı.
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
                    
                    const safeFormatTime = typeof formatMinutesToHours === 'function' ? formatMinutesToHours(totalDayMinutes) : `${Math.floor(totalDayMinutes/60)}s ${totalDayMinutes%60}d`;

                    if (layoutType === 'row') {
                        const headerBgRow = isToday ? 'background-color: var(--color-primary); color: white;' : 'background-color: #f8f9fa;';
                        const nameColorRow = isToday ? 'color: white;' : 'color: #333;';
                        
                        let rowTotalTimeHtml = totalDayMinutes > 0 
                            ? `<div style="margin-top: 5px; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: var(--radius-sm); background: ${isToday ? 'rgba(255,255,255,0.2)' : 'var(--color-bg-hover)'}; color: ${isToday ? 'white' : 'var(--color-primary)'}; white-space: nowrap;"><i class="fa-solid fa-stopwatch"></i> ${safeFormatTime}</div>` 
                            : `<div style="margin-top: 5px; font-size: 10px; font-weight: bold; padding: 4px 8px; border-radius: var(--radius-sm); background: ${isToday ? 'rgba(255,255,255,0.2)' : '#f1f3f5'}; color: ${isToday ? 'var(--color-bg-hover)' : '#aaa'}; white-space: nowrap;"><i class="fa-solid fa-mug-hot"></i> Boş Gün</div>`;

                        cloneHtml += `
                            <div class="weekly-row" style="display: flex; background: var(--color-bg-card); border-radius: var(--radius-lg); overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #eef2f5; flex-shrink: 0; width: 100%;">
                                <div class="weekly-row-header" style="${headerBgRow} width: 120px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px; border-right: 1px solid #eef2f5; flex-shrink: 0;">
                                    <span class="weekly-day-name" style="font-size: 14px; font-weight: 800; ${nameColorRow}">${trDaysNames[i]}</span>
                                    <span class="weekly-day-date" style="font-size: 11px; font-weight: bold; margin-top: 3px; ${dateColor}">${currentDay.getDate()} ${trMonthsNames[currentDay.getMonth()]}</span>
                                    ${rowTotalTimeHtml}
                                </div>
                                <div class="weekly-row-content" style="flex: 1; display: flex; align-items: stretch; padding: 10px; gap: 10px;">
                                    ${tasksHtml}
                                </div>
                            </div>
                        `;
                    } else {
                        const headerBgCol = isToday ? 'background-color: var(--color-primary); color: white;' : '';
                        
                        let totalTimeHtml = totalDayMinutes > 0 ? `<div class="daily-total-time" style="white-space: nowrap; font-size: 11px; padding: 12px 5px;"><i class="fa-solid fa-stopwatch" class="icon-primary"></i> Toplam: ${safeFormatTime}</div>` : `<div class="daily-total-time" style="color:#aaa; background:#fdfdfd; white-space: nowrap; font-size: 11px; padding: 12px 5px;"><i class="fa-solid fa-mug-hot"></i> Boş Gün</div>`;

                        cloneHtml += `
                            <div class="weekly-column" style="background: var(--color-bg-card); border-radius: var(--radius-lg); border: 1px solid #eef2f5; overflow: hidden; display: flex; flex-direction: column;">
                                <div class="weekly-day-header" style="${headerBgCol} padding: 15px; text-align: center; border-bottom: 1px solid #eef2f5;">
                                    <span class="weekly-day-name" style="display: block; font-weight: bold;">${trDaysNames[i]}</span>
                                    <span class="weekly-day-date" style="${dateColor} font-size: 12px;">${currentDay.getDate()} ${trMonthsNames[currentDay.getMonth()]}</span>
                                </div>
                                <div class="weekly-day-content" style="padding: 15px; display: flex; flex-direction: column; gap: 10px; flex: 1;">
                                    ${tasksHtml}
                                </div>
                                ${totalTimeHtml}
                            </div>
                        `;
                    }
                }
                clonedGrid.innerHTML = cloneHtml;
                
                exportWrapper.appendChild(clonedGrid);
                document.body.appendChild(exportWrapper);

                setTimeout(() => {
                    html2canvas(exportWrapper, { 
                        scale: qualityScale, 
                        backgroundColor: '#f4f7f6',
                        windowWidth: 1200, 
                        windowHeight: exportWrapper.scrollHeight + 50,
                        useCORS: true,
                        logging: false,
                        scrollX: 0,
                        scrollY: 0
                    }).then(canvas => {
                        if(document.body.contains(exportWrapper)) document.body.removeChild(exportWrapper);
                        callback(canvas);
                    }).catch(err => {
                        if(document.body.contains(exportWrapper)) document.body.removeChild(exportWrapper);
                        callback(null);
                    });
                }, 600); 
            });
        };

        window.exportPreviewTimeout = null;

        window.updateExportPreview = function() {
            const loader = document.getElementById('exportPreviewLoader');
            const img = document.getElementById('exportPreviewImg');
            
            loader.style.display = 'block';
            img.style.display = 'none';

            const offset = parseInt(document.querySelector('input[name="expWeek"]:checked').value);
            const layoutType = document.querySelector('input[name="expLayout"]:checked').value; 
            
            clearTimeout(window.exportPreviewTimeout);
            
            window.exportPreviewTimeout = setTimeout(() => {
                window.getExportCanvas(offset, layoutType, 1, (canvas) => {
                    if (canvas) {
                        img.src = canvas.toDataURL('image/png');
                        loader.style.display = 'none';
                        img.style.display = 'block';
                    } else {
                        loader.innerHTML = "Önizleme Yüklenemedi";
                    }
                });
            }, 500); // Kullanıcı yazı yazarken çok hızlı tetiklenmesin diye 500ms'ye çıkardık
        };

        window.loadExternalScript = function(src, callback) {
            if (document.querySelector(`script[src="${src}"]`)) {
                callback();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = callback;
            document.head.appendChild(script);
        };

        window.startExportProcess = function() {
            const btn = document.getElementById('exportConfirmBtn');
            btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Hazırlanıyor...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            const offset = parseInt(document.querySelector('input[name="expWeek"]:checked').value);
            const format = document.querySelector('input[name="expFormat"]:checked').value;
            const layoutType = document.querySelector('input[name="expLayout"]:checked').value; 

            window.getExportCanvas(offset, layoutType, 2, (canvas) => {
                if (canvas) {
                    const fileName = `Haftalik_Program_${new Date().getTime()}`;
                    
                    if (format === 'pdf') {
                        const imgData = canvas.toDataURL('image/png');
                        window.loadExternalScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', () => {
                            const { jsPDF } = window.jspdf;
                            
                            const pdf = new jsPDF({ 
                                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                                unit: 'px', 
                                format: [canvas.width, canvas.height] 
                            });
                            
                            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
                            pdf.save(fileName + '.pdf');
                            window.finishExport(btn);
                        });
                    } else {
                        let link = document.createElement('a');
                        link.download = fileName + '.' + format;
                        link.href = canvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 1.0);
                        link.click();
                        window.finishExport(btn);
                    }
                } else {
                    alert("İndirme sırasında bir hata oluştu.");
                    window.finishExport(btn);
                }
            });
        };

        window.finishExport = function(btn) {
            window.closeExportModal(); 
            btn.innerHTML = '<i class="fa-solid fa-download"></i> İndir';
            btn.disabled = false;
            btn.style.opacity = '1';
        };

