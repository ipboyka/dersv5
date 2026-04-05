        // [ISTATISTIK] --- İSTATİSTİKLER MODALI VE HESAPLAMA MOTORU (FİNAL TEMİZ SÜRÜM) ---

        // 1. Temel Modal Elementleri
        const statsModal = document.getElementById('statsModal');
        const openStatsMenuBtn = document.getElementById('openStatsMenuBtn'); 
        const closeStatsModalBtn = document.getElementById('closeStatsModalBtn');

        // 2. Modalı Açma ve Kapatma İşlemleri
        if (openStatsMenuBtn) {
            openStatsMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const sideMenu = DOM.sideMenu;
                const menuOverlay = DOM.menuOverlay;
                if(sideMenu) sideMenu.classList.remove('open');
                if(menuOverlay) menuOverlay.classList.remove('show');
                
                if (statsModal) statsModal.style.display = 'flex';
                calculateAndRenderStats();
            });
        }

        if (closeStatsModalBtn) {
            closeStatsModalBtn.addEventListener('click', () => {
                if (statsModal) statsModal.style.display = 'none';
            });
        }

        // 3. Değişkenleri window objesine sabitliyoruz (Çakışmaları önlemek için)
        window.currentStatsType = window.currentStatsType || 'tyt'; 
        window.currentStatsAytTrack = window.currentStatsAytTrack || 'sayisal'; 

        // 4. TYT / AYT Butonlarını Yöneten Fonksiyon
        const statsBtnTyt = document.getElementById('statsBtnTyt');
        const statsBtnAyt = document.getElementById('statsBtnAyt');
        const statsTrackWrapper = DOM.statsTrackWrapper;

        function updateStatsButtons() {
            if (!statsBtnTyt || !statsBtnAyt) return;
            if (window.currentStatsType === 'tyt') {
                statsBtnTyt.style.background = 'var(--color-primary)';
                statsBtnTyt.style.color = 'white';
                statsBtnAyt.style.background = 'transparent';
                statsBtnAyt.style.color = '#666';
                if(statsTrackWrapper) statsTrackWrapper.style.display = 'none'; 
            } else {
                statsBtnAyt.style.background = '#b58900';
                statsBtnAyt.style.color = 'white';
                statsBtnTyt.style.background = 'transparent';
                statsBtnTyt.style.color = '#666';
                if(statsTrackWrapper) statsTrackWrapper.style.display = 'block'; 
            }
        }

        if (statsBtnTyt) {
            statsBtnTyt.addEventListener('click', (e) => {
                e.preventDefault();
                window.currentStatsType = 'tyt';
                updateStatsButtons();
                calculateAndRenderStats(); 
            });
        }

        if (statsBtnAyt) {
            statsBtnAyt.addEventListener('click', (e) => {
                e.preventDefault();
                window.currentStatsType = 'ayt';
                updateStatsButtons();
                calculateAndRenderStats(); 
            });
        }

        // 5. ÖZEL MENÜLER (Zaman ve Alan Seçici) TIKLAMA MOTORU (KESİN ÇÖZÜM)
        document.addEventListener('click', function(e) {
            // a. Zaman Seçiciye Tıklama (Aç/Kapat)
            const timeTrigger = e.target.closest('#statsTimeTrigger');
            if (timeTrigger) {
                e.preventDefault();
                const wrapper = document.getElementById('statsTimeWrapper');
                const options = document.getElementById('statsTimeOptions');
                if (wrapper && options) {
                    const isOpen = wrapper.classList.contains('open');
                    DOM.statsTrackWrapper?.classList.remove('open'); // Diğerini kapat
                    
                    if (isOpen) {
                        wrapper.classList.remove('open');
                        setTimeout(() => options.style.display = 'none', 200);
                    } else {
                        options.style.display = 'block';
                        // Display block uygulandıktan hemen sonra CSS animasyonunun devreye girmesi için
                        setTimeout(() => wrapper.classList.add('open'), 10);
                    }
                }
                return;
            }

            // b. Zaman Seçeneğine Tıklama (Örn: Bu Hafta, Bu Ay)
            const timeOption = e.target.closest('#statsTimeOptions .custom-option');
            if (timeOption) {
                const val = timeOption.getAttribute('data-value');
                const text = timeOption.innerText;
                
                const timeTextEl = document.getElementById('statsTimeText');
                const timeFilterEl = document.getElementById('statsTimeFilter');
                const timeOptionsEl = document.getElementById('statsTimeOptions');
                const statsCustomDate = document.getElementById('statsCustomDate');
                
                if (timeTextEl) timeTextEl.innerText = text;
                if (timeFilterEl) timeFilterEl.value = val;
                
                if (timeOptionsEl) {
                    document.getElementById('statsTimeWrapper')?.classList.remove('open');
                    setTimeout(() => timeOptionsEl.style.display = 'none', 200);
                }
                
                if (val === 'custom') {
                    if (statsCustomDate) statsCustomDate.style.display = 'flex';
                } else {
                    if (statsCustomDate) statsCustomDate.style.display = 'none';
                    calculateAndRenderStats();
                }
                return;
            }

            // "Uygula" Butonuna Tıklama (Özel Tarih İçin)
            const applyBtn = e.target.closest('#applyStatsFilterBtn');
            if (applyBtn) {
                e.preventDefault();
                calculateAndRenderStats();
                return;
            }

            // c. Alan Seçiciye Tıklama (Sayısal, EA vb. Aç/Kapat)
            const trackTrigger = e.target.closest('#statsTrackTrigger');
            if (trackTrigger) {
                e.preventDefault();
                const wrapper = DOM.statsTrackWrapper;
                const options = document.getElementById('statsTrackOptions');
                if (wrapper && options) {
                    const isOpen = wrapper.classList.contains('open');
                    document.getElementById('statsTimeWrapper')?.classList.remove('open'); // Diğerini kapat
                    
                    if (isOpen) {
                        wrapper.classList.remove('open');
                        setTimeout(() => options.style.display = 'none', 200);
                    } else {
                        options.style.display = 'block';
                        setTimeout(() => wrapper.classList.add('open'), 10);
                    }
                }
                return;
            }

            // d. Alan Seçeneğine Tıklama (Örn: Sözel, Dil)
            const trackOption = e.target.closest('#statsTrackOptions .custom-option');
            if (trackOption) {
                const val = trackOption.getAttribute('data-value');
                const text = trackOption.innerText;
                
                const trackTextEl = document.getElementById('statsTrackText');
                const trackFilterEl = document.getElementById('statsAytTrackSelect');
                const trackOptionsEl = document.getElementById('statsTrackOptions');
                
                if (trackTextEl) trackTextEl.innerText = text;
                if (trackFilterEl) trackFilterEl.value = val;
                
                if (trackOptionsEl) {
                    DOM.statsTrackWrapper?.classList.remove('open');
                    setTimeout(() => trackOptionsEl.style.display = 'none', 200);
                }
                
                window.currentStatsAytTrack = val;
                calculateAndRenderStats();
                return;
            }

            // e. Boşluğa tıklayınca açık olan menüleri kapatma
            const isClickInsideTime = e.target.closest('#statsTimeWrapper');
            const isClickInsideTrack = e.target.closest('#statsTrackWrapper');
            
            if (!isClickInsideTime && !isClickInsideTrack) {
                document.getElementById('statsTimeWrapper')?.classList.remove('open');
                DOM.statsTrackWrapper?.classList.remove('open');
                setTimeout(() => {
                    document.querySelectorAll('#statsTimeOptions, #statsTrackOptions').forEach(opt => {
                        if (opt) opt.style.display = 'none';
                    });
                }, 200); // Animasyon süresi kadar bekle ve tamamen gizle
            }
        });

        // 6. ANA HESAPLAMA FONKSİYONU
        function calculateAndRenderStats() {
            const filterInput = document.getElementById('statsTimeFilter');
            const filterVal = filterInput ? filterInput.value : 'all';
            
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            
            let startDate = new Date(0); 
            let endDate = new Date(now);
            
            if (filterVal === 'weekly') {
                startDate.setDate(now.getDate() - 7);
                startDate.setHours(0, 0, 0, 0);
            } else if (filterVal === 'monthly') {
                startDate.setMonth(now.getMonth() - 1);
                startDate.setHours(0, 0, 0, 0);
            } else if (filterVal === 'custom') {
                const customStart = document.getElementById('statsStartDate').value;
                const customEnd = document.getElementById('statsEndDate').value;
                if (customStart) startDate = new Date(customStart);
                if (customEnd) {
                    endDate = new Date(customEnd);
                    endDate.setHours(23, 59, 59, 999);
                }
            }
            
            let totalTime = 0, totalQuestions = 0, totalVideos = 0, totalVideoMins = 0, totalExams = 0;
            const subjectStats = {};
            
            // GÖREVLER
            if (typeof userTasks !== 'undefined' && typeof userTasks === 'object') {
                Object.keys(userTasks).forEach(dateKey => {
                    const taskDate = new Date(dateKey); 
                    if (taskDate >= startDate && taskDate <= endDate) {
                        userTasks[dateKey].forEach(task => {
                            if (task.isCompleted) {
                                const time = parseInt(task.duration) || 0;
                                const questions = parseInt(task.questionCount) || 0;
                                const subj = task.subject || 'Diğer';
                                
                                totalTime += time;
                                totalQuestions += questions;
                                
                                if (!subjectStats[subj]) subjectStats[subj] = { time: 0, questions: 0, examNetTotal: 0, examCount: 0 };
                                subjectStats[subj].time += time;
                                subjectStats[subj].questions += questions;
                            }
                        });
                    }
                });
            }
            
            // DENEMELER (Genel sayaç)
            if (typeof savedExams !== 'undefined' && Array.isArray(savedExams)) {
                savedExams.forEach(exam => {
                    const examDate = new Date(exam.date);
                    if (examDate >= startDate && examDate <= endDate) {
                        totalExams++;
                    }
                });
            }
            
            // PLAYLIST VİDEOLARI
            if (typeof savedPlaylists !== 'undefined' && Array.isArray(savedPlaylists)) {
                savedPlaylists.forEach(playlist => {
                    if (playlist.videos && Array.isArray(playlist.videos)) {
                        playlist.videos.forEach(video => {
                            if (video.isWatched) {
                                totalVideos++;
                                if (video.duration) {
                                    if (typeof timeStringToSeconds === 'function') {
                                        totalVideoMins += timeStringToSeconds(video.duration) / 60;
                                    } else {
                                        const parts = video.duration.split(':');
                                        if (parts.length === 2) totalVideoMins += parseInt(parts[0]) + (parseInt(parts[1]) / 60);
                                        else if (parts.length === 3) totalVideoMins += (parseInt(parts[0]) * 60) + parseInt(parts[1]);
                                    }
                                }
                            }
                        });
                    }
                });
            }
            
            // HTML KARTLARI GÜNCELLEME
            const hours = Math.floor(totalTime / 60);
            const mins = totalTime % 60;
            
            const elTime = document.getElementById('statTotalTime');
            if(elTime) elTime.innerText = `${hours} Saat ${mins} Dk`;
            
            const elQ = document.getElementById('statTotalQuestions');
            if(elQ) elQ.innerText = totalQuestions;
            
            const elV = document.getElementById('statTotalVideos');
            if(elV) elV.innerText = `${totalVideos} Video (${Math.round(totalVideoMins)} Dk)`;
            
            // Girilen Denemeyi TYT veya Seçili AYT Alanına Göre Say
            let typeCount = 0;
            if (typeof savedExams !== 'undefined' && Array.isArray(savedExams)) {
                typeCount = savedExams.filter(e => {
                    const eDate = new Date(e.date);
                    const isInRange = eDate >= startDate && eDate <= endDate;
                    if (!isInRange || e.type !== window.currentStatsType) return false;
                    
                    if (window.currentStatsType === 'ayt') {
                        const track = e.track || 'sayisal';
                        if (track !== window.currentStatsAytTrack) return false;
                    }
                    return true;
                }).length;
            }
            
            const trackTextEl = document.getElementById('statsTrackText');
            let displayTypeText = window.currentStatsType === 'tyt' ? 'TYT' : (trackTextEl ? trackTextEl.innerText.toUpperCase() : 'AYT');
            
            const elEx = document.getElementById('statTotalExams');
            if(elEx) elEx.innerText = `${typeCount} ${displayTypeText}`;
            
            // DENEME LİSTESİNİ DOLDURMA
            const statsExamListContainer = document.getElementById('statsExamList');
            if (statsExamListContainer) {
                statsExamListContainer.innerHTML = '';
                let _statsHtml = '';

                if (typeof savedExams !== 'undefined' && Array.isArray(savedExams)) {
                    let filteredExams = savedExams.filter(exam => {
                        const examDate = new Date(exam.date);
                        const isInRange = examDate >= startDate && examDate <= endDate;
                        if (!isInRange || exam.type !== window.currentStatsType) return false;
                        
                        if (window.currentStatsType === 'ayt') {
                            const track = exam.track || 'sayisal';
                            if (track !== window.currentStatsAytTrack) return false;
                        }
                        return true;
                    });

                    filteredExams.sort((a, b) => new Date(b.date) - new Date(a.date));

                    if (filteredExams.length === 0) {
                        statsExamListContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#aaa; font-size:12px;">Bu alanda/aralıkta deneme bulunamadı.</div>';
                    } else {
                        filteredExams.forEach(exam => {
                            const dateObj = new Date(exam.date);
                            const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth() + 1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;
                            const net = parseFloat(exam.net || 0).toFixed(2);
                            
                            const netColor = window.currentStatsType === 'tyt' ? 'var(--color-primary)' : '#b58900';
                            _statsHtml += `
                                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid var(--color-bg-input); transition:0.2s;" onmouseover="this.style.background='#fcfcfc'" onmouseout="this.style.background='transparent'">
                                    <div style="display:flex; flex-direction:column; gap:4px;">
                                        <span style="font-weight:700; color:#333; font-size:13px;">${exam.title}</span>
                                        <span style="font-size:11px; color:#999;"><i class="fa-regular fa-calendar"></i> ${dateStr}</span>
                                    </div>
                                    <span style="font-weight:800; color:${netColor}; font-size:14px; background:#f0f7ff; padding:4px 10px; border-radius:8px;">
                                        ${net} Net
                                    </span>
                                </div>
                            `;
                        });
                        statsExamListContainer.innerHTML = _statsHtml;
                    }
                }
            }

            // CHART.JS GRAFİĞİNİ ÇİZME
            const ctx = document.getElementById('statsSubjectDistributionChart');
            if (!ctx) return;
            
            if (window.statsDistributionChart) window.statsDistributionChart.destroy();
            
            const chartLabels = [];
            const chartTimeData = [];
            const chartQuestionData = [];
            
            Object.keys(subjectStats).sort().forEach(subj => {
                if (subjectStats[subj].time > 0 || subjectStats[subj].questions > 0) {
                    chartLabels.push(subj);
                    chartTimeData.push(subjectStats[subj].time);
                    chartQuestionData.push(subjectStats[subj].questions);
                }
            });
            
            if (chartLabels.length === 0) {
                chartLabels.push('Veri Yok');
                chartTimeData.push(0);
                chartQuestionData.push(0);
            }
            
            window.statsDistributionChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Çalışma Süresi (Dk)',
                            data: chartTimeData,
                            backgroundColor: 'rgba(0, 123, 255, 0.7)',
                            borderColor: 'rgba(0, 123, 255, 1)',
                            borderWidth: 1,
                            borderRadius: 4,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Çözülen Soru',
                            data: chartQuestionData,
                            backgroundColor: 'rgba(255, 193, 7, 0.9)',
                            borderColor: 'rgba(255, 193, 7, 1)',
                            borderWidth: 2,
                            type: 'line',
                            tension: 0.3,
                            pointRadius: 4,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Süre (Dk)', color: 'var(--color-primary)', font: {weight: 'bold'} } },
                        y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Soru', color: '#b58900', font: {weight: 'bold'} }, grid: { drawOnChartArea: false } }
                    }
                }
            });
        }

        // --- YENİ: KÜRESEL GÜN TAMAMLANMA DENETLEYİCİSİ (Akıllı Koşul Motoru) ---
        window.checkDayCompletion = function(tasks) {
            if (!tasks || tasks.length === 0) return false;
            
            let dayTotalMins = 0;
            let dayTotalQ = 0;
            tasks.forEach(t => {
                dayTotalMins += (parseInt(t.duration) || 0);
                dayTotalQ += (parseInt(t.questionCount) || 0);
            });

            const conf = window.calColors || {};
            const cAll = conf.condAllTasks !== undefined ? conf.condAllTasks : true; // Varsayılan: Açık
            const cTimeAct = conf.condTimeActive || false;
            const cTimeMins = conf.condTimeMins !== undefined ? parseInt(conf.condTimeMins) : 360;
            const cQAct = conf.condQActive || false;
            const cQCount = conf.condQCount !== undefined ? parseInt(conf.condQCount) : 100;

            // Eğer HİÇBİR koşul seçilmemişse, güvenlik için varsayılanı (tüm görevler bitsin) baz al
            if (!cAll && !cTimeAct && !cQAct) {
                return tasks.every(t => t.isCompleted);
            }

            // Seçili olan BÜTÜN koşullar sağlanmalı (AND Mantığı)
            let isCompleted = true;
            if (cAll) isCompleted = isCompleted && tasks.every(t => t.isCompleted);
            if (cTimeAct) isCompleted = isCompleted && (dayTotalMins >= cTimeMins);
            if (cQAct) isCompleted = isCompleted && (dayTotalQ >= cQCount);

            return isCompleted;
        };

        // --- TAKVİM AYARLARI SEKME DEĞİŞTİRİCİSİ ---
        window.switchCalSettingsTab = function(tabId) {
            const tabs = ['Color', 'General'];
            tabs.forEach(t => {
                const btn = document.getElementById('tabBtn' + t);
                const content = document.getElementById('tabContent' + t);
                if (t === tabId) {
                    if (btn) { btn.style.background = 'var(--color-primary)'; btn.style.color = '#fff'; }
                    if (content) content.style.display = 'flex';
                } else {
                    if (btn) { btn.style.background = 'transparent'; btn.style.color = 'var(--color-text-muted)'; }
                    if (content) content.style.display = 'none';
                }
            });
        };

        // --- PLANLAYICI AYARLARI SEKME DEĞİŞTİRİCİSİ (Çakışma Düzeltildi) ---
        window.switchSettingsTab = function() {
            const selectedTab = document.querySelector('input[name="settingsTab"]:checked')?.value;
            if (selectedTab === 'color') {
                document.getElementById('settingsColorContent').style.display = 'block';
                document.getElementById('settingsViewContent').style.display = 'none';
            } else {
                document.getElementById('settingsColorContent').style.display = 'none';
                document.getElementById('settingsViewContent').style.display = 'block';
            }
        };

        window.switchColorSubTab = function(subTabId) {
            const subTabs = ['Bg', 'Text', 'Border', 'Condition'];
            subTabs.forEach(st => {
                const btn = document.getElementById('subTabBtn' + st);
                const content = document.getElementById('subTabContent' + st);
                if (st === subTabId) {
                    if (btn) { btn.style.background = 'var(--color-primary-light)'; btn.style.color = 'var(--color-primary)'; }
                    if (content) content.style.display = 'flex';
                } else {
                    if (btn) { btn.style.background = 'transparent'; btn.style.color = 'var(--color-text-muted)'; }
                    if (content) content.style.display = 'none';
                }
            });
        };

        window.setCalBStyle = function(type, style) {
            document.getElementById('calBorderStyle' + type).value = style;
            ['none', 'solid', 'dashed'].forEach(opt => {
                const btn = document.getElementById('btnStyle' + type + '_' + opt);
                if(btn) {
                    if(opt === style) { btn.style.background = 'var(--color-primary)'; btn.style.color = '#fff'; } 
                    else { btn.style.background = 'transparent'; btn.style.color = 'var(--color-text-muted)'; }
                }
            });
        };

        window.setCalBgStyle = function(type, style) {
            document.getElementById('calBgStyle' + type).value = style;
            ['solid', 'gradient'].forEach(opt => {
                const btn = document.getElementById('btnBgStyle' + type + '_' + opt);
                if(btn) {
                    if(opt === style) { btn.style.background = 'var(--color-primary)'; btn.style.color = '#fff'; } 
                    else { btn.style.background = 'transparent'; btn.style.color = 'var(--color-text-muted)'; }
                }
            });
        };

        window.resetBorderRow = function(type, defStyle, defColor, defOpac) {
            setCalBStyle(type, defStyle);
            document.getElementById('calBorderColor' + type).value = defColor;
            const opacInput = document.getElementById('calBorderOpacity' + type);
            if(opacInput) { opacInput.value = defOpac; document.getElementById('lblOpac' + type).innerText = Math.round(defOpac * 100) + '%'; }
        };

        window.resetBgRow = function(type, defStyle, defColor, defOpac) {
            setCalBgStyle(type, defStyle);
            document.getElementById('calColor' + type).value = defColor;
            const opacInput = document.getElementById('calBgOpacity' + type);
            if(opacInput) { opacInput.value = defOpac; document.getElementById('lblBgOpac' + type).innerText = Math.round(defOpac * 100) + '%'; }
        };

