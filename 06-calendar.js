        // [TAKVIM] 3. TAKVİM MOTORU (İNTERAKTİF)
        const monthYearText = document.getElementById("month-year");
        const calendarDays = document.getElementById("calendar-days");
        let currentDate = new Date(); 

        const CAL_MONTH_NAMES = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
        const CAL_DAY_NAMES   = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"];

        function calDateKey(d) {
            return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        }

        function renderCalendar() {
            if(!monthYearText || !calendarDays) return;
            const year  = currentDate.getFullYear();
            const month = currentDate.getMonth();
            monthYearText.innerText = `${CAL_MONTH_NAMES[month]} ${year}`;

            let firstDay = new Date(year, month, 1).getDay();
            firstDay = firstDay === 0 ? 6 : firstDay - 1;

            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            let daysHtml = "";

            for (let i = 0; i < firstDay; i++) daysHtml += `<div class="day-box empty"></div>`;

            for (let i = 1; i <= daysInMonth; i++) {
                const d = new Date(year, month, i);
                const dk = calDateKey(d);
                const tasks = (typeof userTasks !== 'undefined' && userTasks[dk]) ? userTasks[dk] : [];
                const hasTasks = tasks.length > 0;
                
                const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
                const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isPast = d < todayMidnight;
                const isFuture = d > todayMidnight;
                
                let cls = "day-box";
                if(isToday) cls += " today";
                
                let customStyle = "border-radius: 12px; transition: all 0.2s ease; box-sizing: border-box;";
                let innerHtml = `<span style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:12px; font-weight:800;">${i}</span>`;
                const rightIconStyle = "position:absolute; right:4px; top:50%; transform:translateY(-50%);";

                // --- RENK VE GRADYAN MATEMATİĞİ ---
                const hexToRgba = (hex, alpha) => {
                    if (!hex || !hex.startsWith('#')) return hex;
                    let r = parseInt(hex.slice(1, 3), 16),
                        g = parseInt(hex.slice(3, 5), 16),
                        b = parseInt(hex.slice(5, 7), 16);
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                };

                // Renkleri aydınlatan akıllı fonksiyon (Gradyan geçişi için)
                const adjustHex = (hex, amount) => {
                    let color = hex.replace('#', '');
                    if (color.length === 3) color = color.split('').map(c => c + c).join('');
                    let r = Math.max(Math.min(255, parseInt(color.substring(0, 2), 16) + amount), 0).toString(16);
                    let g = Math.max(Math.min(255, parseInt(color.substring(2, 4), 16) + amount), 0).toString(16);
                    let b = Math.max(Math.min(255, parseInt(color.substring(4, 6), 16) + amount), 0).toString(16);
                    return `#${r.padStart(2, '0')}${g.padStart(2, '0')}${b.padStart(2, '0')}`;
                };

                const getBgStr = (style, colorHex, opacity) => {
                    if (style === 'gradient') {
                        // Seçilen rengin 45 birim daha parlak tonunu bul ve ikisini şeffaflıkla birleştir!
                        const color1 = hexToRgba(adjustHex(colorHex, 45), opacity);
                        const color2 = hexToRgba(colorHex, opacity);
                        return `linear-gradient(135deg, ${color1}, ${color2})`;
                    }
                    return hexToRgba(colorHex, opacity);
                };

                // --- Şeffaflık Destekli Arka Planlar (Düz veya Gradyan) ---
                const bgCompleted = getBgStr(window.calColors?.bgStyleCompleted || 'solid', window.calColors?.completed || '#20c997', window.calColors?.bgOpacityCompleted ?? 1);
                const bgUncompleted = getBgStr(window.calColors?.bgStyleUncompleted || 'solid', window.calColors?.uncompleted || '#f87171', window.calColors?.bgOpacityUncompleted ?? 1);
                const bgEmpty = getBgStr(window.calColors?.bgStyleEmpty || 'solid', window.calColors?.empty || '#f8f9fa', window.calColors?.bgOpacityEmpty ?? 1);
                const bgPlanned = getBgStr(window.calColors?.bgStylePlanned || 'solid', window.calColors?.planned || '#e6f2ff', window.calColors?.bgOpacityPlanned ?? 1);
                const bgToday = getBgStr(window.calColors?.bgStyleToday || 'gradient', window.calColors?.today || '#6f42c1', window.calColors?.bgOpacityToday ?? 1);

                // --- Şeffaflık Destekli Yazı Renkleri ---
                const txtCompleted = hexToRgba(window.calColors?.textCompleted || '#ffffff', window.calColors?.textOpacityCompleted ?? 1);
                const txtUncompleted = hexToRgba(window.calColors?.textUncompleted || '#ffffff', window.calColors?.textOpacityUncompleted ?? 1);
                const txtEmpty = hexToRgba(window.calColors?.textEmpty || '#6c757d', window.calColors?.textOpacityEmpty ?? 1);
                const txtPlanned = hexToRgba(window.calColors?.textPlanned || '#007bff', window.calColors?.textOpacityPlanned ?? 1);
                const txtToday = hexToRgba(window.calColors?.textToday || '#ffffff', window.calColors?.textOpacityToday ?? 1);

                // --- Şeffaflık Destekli Çerçeve (Border) ---
                const getBorderStr = (style, colorHex, opacity) => style === 'none' ? 'none' : `2px ${style} ${hexToRgba(colorHex, opacity)}`;
                
                const brdCompleted = getBorderStr(window.calColors?.borderStyleCompleted || 'none', window.calColors?.borderColorCompleted || '#20c997', window.calColors?.borderOpacityCompleted ?? 1);
                const brdUncompleted = getBorderStr(window.calColors?.borderStyleUncompleted || 'none', window.calColors?.borderColorUncompleted || '#f87171', window.calColors?.borderOpacityUncompleted ?? 1);
                const brdPlanned = getBorderStr(window.calColors?.borderStylePlanned || 'solid', window.calColors?.borderColorPlanned || '#007bff', window.calColors?.borderOpacityPlanned ?? 1);
                const brdEmpty = getBorderStr(window.calColors?.borderStyleEmpty || 'dashed', window.calColors?.borderColorEmpty || '#6c757d', window.calColors?.borderOpacityEmpty ?? 1);
                const brdToday = getBorderStr(window.calColors?.borderStyleToday || 'none', window.calColors?.borderColorToday || '#6f42c1', window.calColors?.borderOpacityToday ?? 1);

                if (isToday) {
                    customStyle += ` background: ${bgToday}; color: ${txtToday}; border: ${brdToday}; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-weight: 900;`;
                    innerHtml += `<i class="fa-solid fa-book-open" style="${rightIconStyle} font-size:8px; background:rgba(0,0,0,0.15); border-radius:50%; padding:4px;"></i>`;
                } 
                else if (isPast) {
                    if (hasTasks) {
                        const allCompleted = window.checkDayCompletion(tasks);
                        if (allCompleted) {
                            customStyle += ` background: ${bgCompleted}; color: ${txtCompleted}; border: ${brdCompleted}; box-shadow: 0 4px 10px rgba(0,0,0,0.15);`;
                            innerHtml += `<i class="fa-solid fa-check" style="${rightIconStyle} font-size:9px; background:rgba(0,0,0,0.15); border-radius:50%; padding:3px;"></i>`;
                        } else {
                            customStyle += ` background: ${bgUncompleted}; color: ${txtUncompleted}; border: ${brdUncompleted}; box-shadow: 0 4px 10px rgba(0,0,0,0.15);`;
                            innerHtml += `<i class="fa-solid fa-xmark" style="${rightIconStyle} font-size:9px; background:rgba(0,0,0,0.15); border-radius:50%; padding:3px 4px;"></i>`;
                        }
                    } else {
                        customStyle += ` background: ${bgEmpty}; color: ${txtEmpty}; border: ${brdEmpty}; opacity: 0.6;`;
                        innerHtml += `<i class="fa-solid fa-mug-hot" style="${rightIconStyle} font-size:10px; opacity:0.4;"></i>`;
                    }
                } 
                else if (isFuture) {
                    if (hasTasks) {
                        customStyle += ` background: ${bgPlanned}; color: ${txtPlanned}; border: ${brdPlanned}; font-weight: 800; box-shadow: 0 4px 8px rgba(0,123,255,0.1);`;
                        innerHtml += `<i class="fa-regular fa-calendar-check" style="${rightIconStyle} font-size:10px; opacity:0.8;"></i>`; 
                    } else {
                        customStyle += ` background: ${bgEmpty}; color: ${txtEmpty}; border: ${brdEmpty}; opacity: 0.6;`;
                        innerHtml += `<i class="fa-solid fa-mug-hot" style="${rightIconStyle} font-size:10px; opacity:0.4;"></i>`;
                    }
                }
                
                daysHtml += `<div class="${cls}" style="position:relative; cursor:pointer; ${customStyle}" data-datekey="${dk}" data-day="${i}">${innerHtml}</div>`;
            }
            calendarDays.innerHTML = daysHtml;

            // Tıklama dinleyicisi
            calendarDays.querySelectorAll('.day-box:not(.empty)').forEach(box => {
                box.addEventListener('click', () => {
                    const dk = box.getAttribute('data-datekey');
                    showCalDaySummary(dk);
                });
            });
        }

        // Global Tab Değiştirme Fonksiyonu (Modal içindeki TYT/AYT geçişleri için)
        window.switchCalModalTab = function(prefix, targetTab) {
            const tabs = ['all', 'tyt', 'ayt'];
            tabs.forEach(t => {
                const btn = document.getElementById(prefix + '_btn_' + t);
                const content = document.getElementById(prefix + '_content_' + t);
                if (btn && content) {
                    if (t === targetTab) {
                        btn.style.background = 'var(--color-primary)';
                        btn.style.color = '#fff';
                        content.style.display = 'flex';
                    } else {
                        btn.style.background = 'transparent';
                        btn.style.color = 'var(--color-text-muted)';
                        content.style.display = 'none';
                    }
                }
            });
        };

        function showCalDaySummary(dk) {
            const [y, m, d] = dk.split('-').map(Number);
            const dateObj = new Date(y, m-1, d);
            const dayName = CAL_DAY_NAMES[(dateObj.getDay()+6)%7];
            const dateText = d + ' ' + CAL_MONTH_NAMES[m-1] + ' ' + y + ', ' + dayName;

            const tasks = (typeof userTasks !== 'undefined' && userTasks[dk]) ? userTasks[dk] : [];

            // --- YENİ: GÜNÜN DURUM ROZETİNİ (BADGE) HESAPLAMA ---
            let statusText = "Boş gün";
            let statusColor = window.calColors?.empty ? "#495057" : "var(--color-text-muted)";
            let statusBg = window.calColors?.empty || "var(--color-bg-input)";
            let statusIcon = "fa-solid fa-mug-hot";
            let hasCustomColor = false;

            if (tasks.length > 0) {
                const allCompleted = window.checkDayCompletion(tasks);
                if (allCompleted) {
                    statusText = "Tamamlandı";
                    statusColor = window.calColors?.completed ? "#fff" : "var(--color-success)";
                    statusBg = window.calColors?.completed || "var(--color-success-light)";
                    statusIcon = "fa-solid fa-check";
                    hasCustomColor = !!window.calColors?.completed;
                } else {
                    statusText = "Tamamlanmadı";
                    statusColor = window.calColors?.uncompleted ? "#fff" : "var(--color-danger)"; 
                    statusBg = window.calColors?.uncompleted || "var(--color-danger-light)";
                    statusIcon = "fa-solid fa-xmark";
                    hasCustomColor = !!window.calColors?.uncompleted;
                }
            }

            let textShadowStyle = hasCustomColor ? 'text-shadow: 0 1px 3px rgba(0,0,0,0.4);' : '';
            const statusBadgeHtml = '<div style="display:flex; align-items:center; gap:6px; font-size:10px; font-weight:900; color:' + statusColor + '; background:' + statusBg + '; padding:4px 10px; border-radius:6px; letter-spacing:0.5px; text-transform:uppercase; ' + textShadowStyle + '"><i class="' + statusIcon + '"></i> ' + statusText + '</div>';

            // Üst UI Ayarlamaları
            document.getElementById('calCalendarView').style.display = 'none';
            document.getElementById('calMainHeader').style.display = 'none';
            
            const summaryHeader = document.getElementById('calSummaryHeader');
            summaryHeader.style.display = 'flex';
            summaryHeader.style.width = '100%'; 
            
            const summaryDateEl = document.getElementById('calSummaryDate');
            summaryDateEl.style.flex = '1';
            
            // Detaylı butonunun yanına rozeti (statusBadgeHtml) ekledik
            summaryDateEl.innerHTML = 
                '<div style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:10px;">' +
                    '<span style="font-weight:800;">' + dateText + '</span>' +
                    '<div style="display:flex; align-items:center; gap:8px;">' +
                        statusBadgeHtml + 
                        '<button onclick="window.openCalDetailModal()" id="calDetailedViewBtn" style="background:var(--color-primary-light); color:var(--color-primary); border:1px solid var(--color-primary-border); padding:6px 14px; border-radius:8px; font-size:11px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px; transition:0.2s; box-shadow:0 2px 4px rgba(0,123,255,0.1);">' +
                            'Detaylı <i class="fa-solid fa-arrow-right"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>';
            
            const summaryContainer = document.getElementById('calDaySummary');
            summaryContainer.style.display = 'flex';
            summaryContainer.style.flexDirection = 'column';
            summaryContainer.style.flex = '1';
            summaryContainer.style.height = '100%'; 
            summaryContainer.style.overflow = 'hidden'; 

            if (tasks.length === 0) {
                // --- YENİ: BOŞ GÜN TASARIMI ---
                const emptyBg = window.calColors?.empty || "var(--color-bg-input)";
                summaryContainer.innerHTML = '<div style="font-size:18px; font-weight:800; color:var(--color-text-muted); background:' + emptyBg + '; border-radius:12px; border:2px dashed var(--color-border-strong); height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:15px; opacity:0.8; margin-top:10px;">' +
                    '<i class="fa-solid fa-mug-hot" style="font-size:42px; opacity:0.5; filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1));"></i>' +
                    '<span style="letter-spacing:1px; text-transform:uppercase;">Boş Gün</span>' +
                '</div>';
                return;
            }

            // --- VERİ HESAPLAMALARI ---
            let totalMins = 0, completedMins = 0;
            let totalQ = 0, completedQ = 0;
            let totalTasksCount = tasks.length, completedTasksCount = 0;
            let totalVideos = 0, watchedVideos = 0;
            
            let stats = {
                time: { all: {}, tyt: {}, ayt: {} },
                q: { all: {}, tyt: {}, ayt: {} }
            };
            let playlistMap = {};

            tasks.forEach(task => {
                const dur = parseInt(task.duration) || 0;
                const q = parseInt(task.questionCount) || 0;
                const subj = task.subject || 'Diğer';
                const exType = (task.examType || task.exam || 'tyt').toLowerCase();
                const tKey = exType === 'ayt' ? 'ayt' : 'tyt';
                
                totalMins += dur;
                totalQ += q;
                
                stats.time.all[subj] = (stats.time.all[subj] || 0) + dur;
                stats.time[tKey][subj] = (stats.time[tKey][subj] || 0) + dur;
                
                if (q > 0) {
                    stats.q.all[subj] = (stats.q.all[subj] || 0) + q;
                    stats.q[tKey][subj] = (stats.q[tKey][subj] || 0) + q;
                }
                
                if (task.isCompleted) {
                    completedTasksCount++;
                    completedMins += dur;
                    completedQ += q;
                }

                if (task.taskVideos && task.taskVideos.length > 0) {
                    
                    // İŞTE ÇÖZÜM BURADA: Görevdeki video sayısını toplama ekliyoruz!
                    totalVideos += task.taskVideos.length;

                    task.taskVideos.forEach(v => {
                        let isW = false;
                        if (v.plId !== undefined) {
                            const globalPl = savedPlaylists.find(p => p.id.toString() === v.plId.toString());
                            if (globalPl && globalPl.videos && v.index !== undefined && globalPl.videos[v.index] !== undefined) {
                                isW = globalPl.videos[v.index].isWatched === true;
                            }
                        }
                        if (isW) watchedVideos++;

                        if (v.plId !== undefined) {
                            const pid = v.plId.toString();
                            if (!playlistMap[pid]) playlistMap[pid] = { videos: [] };
                            playlistMap[pid].videos.push({ ...v, _calcWatched: isW });
                        }
                    });
                }
            });

            const formatTime = (m) => {
                if (m === 0) return '0d';
                const h = Math.floor(m / 60);
                const mn = m % 60;
                return h > 0 ? (mn > 0 ? h + 's ' + mn + 'd' : h + 's') : mn + 'd';
            };

            const totalTimeStr = formatTime(totalMins);
            const completedTimeStr = formatTime(completedMins);

            const getColor = (subj) => {
                if (window.subjectColors && window.subjectColors[subj]) return window.subjectColors[subj];
                const palette = ['#007bff','#28a745','#fd7e14','#dc3545','#6f42c1','#20c997','#d63384','#17a2b8'];
                const idx = Array.from(subj).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                return palette[idx % palette.length];
            };

            const makeCard = (icon, title, val1, val2, color, isSmall) => {
                const pad = isSmall ? '10px 4px' : '5px';
                const iSize = isSmall ? '18px' : '26px';
                const valSize = isSmall ? '14px' : '18px';
                const titleSize = isSmall ? '9px' : '10px';
                return '<div style="flex:1; min-width:0; min-height:0; background:' + color + '10; border:2px solid ' + color + '30; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:' + pad + '; box-sizing:border-box; overflow:hidden;">' +
                    '<i class="' + icon + '" style="color:' + color + '; font-size:' + iSize + '; margin-bottom:8px; filter:drop-shadow(0 2px 4px ' + color + '40);"></i>' +
                    '<div style="font-size:' + valSize + '; font-weight:900; color:' + color + '; display:flex; align-items:baseline; justify-content:center; flex-wrap:wrap; gap:3px;">' + val1 + '<span style="font-size:10px; opacity:0.6;">/' + val2 + '</span></div>' +
                    '<div style="font-size:' + titleSize + '; font-weight:800; color:' + color + '; margin-top:6px; text-transform:uppercase; letter-spacing:1px; opacity:0.9;">' + title + '</div>' +
                    '</div>';
            };

            const cardTasksMain = makeCard('fa-solid fa-list-check', 'Görev', completedTasksCount, totalTasksCount, '#007bff', false);
            const cardTimeMain = makeCard('fa-solid fa-stopwatch', 'Süre', completedTimeStr, totalTimeStr, '#28a745', false);
            const cardQMain = makeCard('fa-solid fa-clipboard-question', 'Soru', completedQ, totalQ, '#fd7e14', false);
            const cardVidMain = makeCard('fa-brands fa-youtube', 'Video', watchedVideos, totalVideos, '#dc3545', false);

            const cardTasksModal = makeCard('fa-solid fa-list-check', 'Görev', completedTasksCount, totalTasksCount, '#007bff', true);
            const cardTimeModal = makeCard('fa-solid fa-stopwatch', 'Süre', completedTimeStr, totalTimeStr, '#28a745', true);
            const cardQModal = makeCard('fa-solid fa-clipboard-question', 'Soru', completedQ, totalQ, '#fd7e14', true);
            const cardVidModal = makeCard('fa-brands fa-youtube', 'Video', watchedVideos, totalVideos, '#dc3545', true);

            summaryContainer.innerHTML = '' +
                '<div style="display:flex; gap:10px; width:100%; justify-content:space-between; align-items:stretch; margin-top:12px; margin-bottom:0; flex:1; min-height:0; overflow:hidden;">' +
                    cardTasksMain + cardTimeMain + cardQMain + cardVidMain +
                '</div>';

            const buildDistHtml = (prefix, statsData, isTime, iconClass, titleText, iconColor) => {
                let html = '<div style="background:var(--color-bg-card, #ffffff); padding:15px; border-radius:12px; border:1px solid var(--color-border); box-shadow:0 2px 5px rgba(0,0,0,0.02); margin-bottom:20px;">';
                
                html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">';
                html += '<h4 style="margin:0; font-size:12px; font-weight:800; color:var(--color-text-secondary); text-transform:uppercase;"><i class="' + iconClass + '" style="color:' + iconColor + '; margin-right:6px;"></i> ' + titleText + '</h4>';
                
                html += '<div style="display:flex; gap:4px; background:var(--color-bg-input); border-radius:8px; padding:4px;">';
                ['all', 'tyt', 'ayt'].forEach((tab, i) => {
                    const label = tab === 'all' ? 'TÜMÜ' : tab.toUpperCase();
                    html += '<button onclick="window.switchCalModalTab(\'' + prefix + '\', \'' + tab + '\')" id="' + prefix + '_btn_' + tab + '" style="background:' + (i===0 ? 'var(--color-primary)' : 'transparent') + '; color:' + (i===0 ? '#fff' : 'var(--color-text-muted)') + '; border:none; padding:4px 12px; border-radius:6px; font-size:9px; font-weight:800; cursor:pointer; transition:0.2s;">' + label + '</button>';
                });
                html += '</div></div>';

                ['all', 'tyt', 'ayt'].forEach((tab, i) => {
                    const data = statsData[tab];
                    const maxVal = Math.max(...Object.values(data), 1);
                    const totalVal = Object.values(data).reduce((a,b)=>a+b, 0);

                    let bars = Object.keys(data).sort((a,b)=>data[b]-data[a]).map(subj => {
                        const val = data[subj];
                        const w = (val / maxVal) * 100;
                        const c = getColor(subj);
                        const valStr = isTime ? formatTime(val) : val + ' Soru';
                        return '<div style="margin-bottom:10px;">' +
                                '<div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:var(--color-text-main); margin-bottom:4px;">' +
                                    '<span>' + subj + '</span><span style="color:' + c + ';">' + valStr + '</span>' +
                                '</div>' +
                                '<div style="background:var(--color-bg-input); border-radius:6px; height:8px; overflow:hidden;">' +
                                    '<div style="width:' + w + '%; background:' + c + '; height:100%; border-radius:6px;"></div>' +
                                '</div>' +
                            '</div>';
                    }).join('');

                    if (!bars) bars = '<div style="font-size:11px; color:var(--color-text-muted); font-style:italic;">Bu alan için veri bulunmuyor.</div>';

                    let pieHtml = '';
                    if (totalVal > 0) {
                        let conicArgs = [];
                        let currentPct = 0;
                        Object.keys(data).sort((a,b)=>data[b]-data[a]).forEach(subj => {
                            const pct = (data[subj] / totalVal) * 100;
                            const c = getColor(subj);
                            conicArgs.push(c + ' ' + currentPct + '% ' + (currentPct+pct) + '%');
                            currentPct += pct;
                        });
                        pieHtml = '<div style="width:85px; height:85px; border-radius:50%; background:conic-gradient(' + conicArgs.join(', ') + '); flex-shrink:0; box-shadow:0 2px 5px rgba(0,0,0,0.1);"></div>';
                    } else {
                        pieHtml = '<div style="width:85px; height:85px; border-radius:50%; background:var(--color-bg-input); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:20px; color:var(--color-text-muted); opacity:0.5;"><i class="fa-solid fa-chart-pie"></i></div>';
                    }

                    html += '<div id="' + prefix + '_content_' + tab + '" style="display:' + (i===0?'flex':'none') + '; gap:25px; align-items:center;">' +
                                '<div style="flex:1; display:flex; flex-direction:column; justify-content:center; min-width:0;">' + bars + '</div>' +
                                '<div>' + pieHtml + '</div>' +
                            '</div>';
                });
                html += '</div>';
                return html;
            };

            const timeDistHtml = buildDistHtml('calTimeDist', stats.time, true, 'fa-solid fa-clock', 'Süre Dağılımı', 'var(--color-success)');
            const qDistHtml = buildDistHtml('calQDist', stats.q, false, 'fa-solid fa-clipboard-question', 'Soru Dağılımı', 'var(--color-warning)');

            const plIds = Object.keys(playlistMap);
            let plHtml = '';
            if (plIds.length > 0) {
                plHtml = plIds.map(pid => {
                    const originalPl = (typeof savedPlaylists !== 'undefined') ? savedPlaylists.find(p => p.id.toString() === pid) : null;
                    if (!originalPl) return '';
                    
                    const dayVideos = playlistMap[pid].videos;
                    let totalSecs = 0;
                    let watchedCount = 0;
                    
                    dayVideos.forEach(vid => {
                        if(vid._calcWatched) watchedCount++; 
                        if (vid.duration) {
                            const parts = vid.duration.split(':').map(Number).reverse();
                            if (parts[0]) totalSecs += parts[0];
                            if (parts[1]) totalSecs += parts[1] * 60;
                            if (parts[2]) totalSecs += parts[2] * 3600;
                        }
                    });
                    
                    const h = Math.floor(totalSecs / 3600);
                    const m = Math.floor((totalSecs % 3600) / 60);
                    const durStr = h > 0 ? h + 'sa ' + m + 'dk' : m + 'dk';
                    
                    const thumb = originalPl.firstVideoThumb || '';
                    const title = originalPl.customTitle || originalPl.subject || 'Playlist';
                    const exType = (originalPl.examType || '').toUpperCase() || 'TYT';
                    const subj = originalPl.subject || 'Ders Seçilmemiş';
                    
                    const badgeColor = exType === 'TYT' ? '#007bff' : '#6f42c1';
                    const watchColor = watchedCount === dayVideos.length ? 'var(--color-success)' : 'var(--color-warning)';
                    
                    return '<div style="display:flex; align-items:center; gap:12px; background:var(--color-bg-input); border:1px solid var(--color-border); border-radius:10px; padding:10px; margin-bottom:10px;">' +
                            '<img src="' + thumb + '" style="width:70px; height:45px; object-fit:cover; border-radius:6px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">' +
                            '<div style="flex:1;">' +
                                '<div style="font-size:12px; font-weight:900; color:var(--color-text-main); margin-bottom:6px; display:flex; align-items:center; flex-wrap:wrap; gap:6px;">' + 
                                    '<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">' + title + '</span>' +
                                    '<span style="font-size:9px; font-weight:800; background:' + badgeColor + '20; color:' + badgeColor + '; padding:3px 6px; border-radius:4px;">' + exType + '</span>' +
                                    '<span style="font-size:9px; font-weight:800; background:var(--color-bg-card); border:1px solid var(--color-border); color:var(--color-text-muted); padding:2px 6px; border-radius:4px;">' + subj + '</span>' +
                                '</div>' +
                                '<div style="font-size:10px; color:var(--color-text-muted); display:flex; gap:12px; align-items:center;">' +
                                    '<span style="color:' + watchColor + '; font-weight:800;"><i class="fa-solid fa-circle-check"></i> ' + watchedCount + ' / ' + dayVideos.length + ' İzlendi</span>' +
                                    '<span style="color:var(--color-danger); font-weight:700;"><i class="fa-regular fa-clock"></i> ' + durStr + '</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>';
                }).join('');
            } else {
                plHtml = '<div style="font-size:11px; color:var(--color-text-muted); font-style:italic;">Video verisi bulunmuyor.</div>';
            }

            window.openCalDetailModal = function() {
                const existing = document.getElementById('calDetailModalOverlay');
                if(existing) existing.remove();

                const modalStr = '' +
                '<div id="calDetailModalOverlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; box-sizing:border-box; backdrop-filter:blur(5px);">' +
                    '<div style="background:var(--color-bg-card, #ffffff); width:100%; max-width:550px; max-height:85vh; border-radius:16px; display:flex; flex-direction:column; box-shadow:0 10px 40px rgba(0,0,0,0.4); overflow:hidden; animation: fadeIn 0.2s ease-out; border:1px solid var(--color-border);">' +
                        
                        '<div style="padding:16px 20px; background:var(--color-bg-input); border-bottom:1px solid var(--color-border); display:flex; justify-content:space-between; align-items:center;">' +
                            '<h3 style="margin:0; font-size:14px; font-weight:800; color:var(--color-text-main);"><i class="fa-solid fa-chart-pie" style="color:var(--color-primary); margin-right:6px;"></i> Detaylı Analiz</h3>' +
                            '<button onclick="document.getElementById(\'calDetailModalOverlay\').remove()" style="background:none; border:none; color:var(--color-text-muted); font-size:20px; cursor:pointer; padding:0; line-height:1;"><i class="fa-solid fa-xmark"></i></button>' +
                        '</div>' +

                        '<div style="padding:20px; overflow-y:auto; display:flex; flex-direction:column;">' +
                            '<div style="display:flex; gap:8px; margin-bottom:20px;">' + cardTasksModal + cardTimeModal + cardQModal + cardVidModal + '</div>' +
                            
                            timeDistHtml +
                            qDistHtml +

                            '<div style="background:var(--color-bg-card, #ffffff); padding:15px; border-radius:12px; border:1px solid var(--color-border); box-shadow:0 2px 5px rgba(0,0,0,0.02);">' +
                                '<h4 style="margin:0 0 12px 0; font-size:12px; font-weight:800; color:var(--color-text-secondary); text-transform:uppercase;"><i class="fa-brands fa-youtube" style="color:var(--color-danger); margin-right:6px;"></i> Playlist Özeti</h4>' +
                                plHtml +
                            '</div>' +

                        '</div>' +
                    '</div>' +
                '</div>';

                document.body.insertAdjacentHTML('beforeend', modalStr);
            };
        }

        function showCalCalendarView() {
            document.getElementById('calCalendarView').style.display = 'flex';
            document.getElementById('calMainHeader').style.display = 'flex';
            document.getElementById('calSummaryHeader').style.display = 'none';
            document.getElementById('calDaySummary').style.display = 'none';
        }
        document.getElementById('calBackBtn')?.addEventListener('click', showCalCalendarView);

        // --- YENİ: TAKVİM DIŞINA TIKLANDIĞINDA ANA TAKVİME DÖNME MOTORU ---
        document.addEventListener('click', function(e) {
            const summaryHeader = document.getElementById('calSummaryHeader');
            const calendarWidget = document.querySelector('.calendar-widget');
            
            // Sadece takvimin "Gün Özeti" ekranı açıksa kontrolü başlat
            if (summaryHeader && summaryHeader.style.display === 'flex') {
                
                // 1. Tıklanan yer takvim kutusunun (widget) içi mi?
                const isInsideCalendar = calendarWidget && calendarWidget.contains(e.target);
                
                // 2. Tıklanan yer "Detaylı" butonunun açtığı o büyük analiz baloncuğu mu?
                const isInsideDetailModal = e.target.closest('#calDetailModalOverlay');
                
                // Eğer takvime VEYA takvimin kendi analiz baloncuğuna tıklanmamışsa 
                // (Yani Denemelerim, Playlist Merkezi gibi ekranın başka bir yerine tıklandıysa)
                if (!isInsideCalendar && !isInsideDetailModal) {
                    showCalCalendarView(); // Takvimi anında sıfırla ve ana takvime dön
                }
            }
        });

        // İleri - Geri Buton Dinleyicileri
        document.getElementById('calPrevMonthBtn')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        document.getElementById('calNextMonthBtn')?.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        // Sayfa ilk yüklendiğinde takvimi çiz
        renderCalendar();
        // Görevler yüklendikten sonra takvimi yenile (görev noktaları için)
        window.refreshCalendar = renderCalendar;

