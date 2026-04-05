        // [ANALIZ] --- BÜYÜK EKRAN DENEME ANALİZ MERKEZİ (GENEL + DERS GRAFİKLERİ) ---
        const expandedExamsModal = document.getElementById('expandedExamsModal');
        const openExpandedExamsBtn = document.getElementById('openExpandedExamsBtn');
        const closeExpandedExamsBtn = document.getElementById('closeExpandedExamsBtn');
        const expandedTabTyt = document.getElementById('expandedTabTyt');
        const expandedTabAyt = document.getElementById('expandedTabAyt');

        let expandedMainChartInstance = null;
        let expandedSubjectChartInstances = {};
        let currentExpandedTab = 'tyt';

        // Modalı Aç/Kapat Dinleyicileri
        if(openExpandedExamsBtn) {
            openExpandedExamsBtn.addEventListener('click', () => {
                expandedExamsModal.style.display = 'flex';
                renderExpandedExamsView();
            });
        }
        if(closeExpandedExamsBtn) {
            closeExpandedExamsBtn.addEventListener('click', () => {
                expandedExamsModal.style.display = 'none';
            });
        }

        // Sekme Değiştirme (TYT / AYT)
        if(expandedTabTyt && expandedTabAyt) {
            expandedTabTyt.addEventListener('click', () => {
                expandedTabTyt.classList.add('active');
                expandedTabAyt.classList.remove('active');
                currentExpandedTab = 'tyt';
                renderExpandedExamsView();
            });
            expandedTabAyt.addEventListener('click', () => {
                expandedTabAyt.classList.add('active');
                expandedTabTyt.classList.remove('active');
                currentExpandedTab = 'ayt';
                renderExpandedExamsView();
            });
        }

        let isExpandedExamDeleteMode = false;
        let expandedExamsToDelete = new Set();
        
        let advExamFilter = { preset: 'all', start: '', end: '', subject: 'total', min: '', max: '' };
        let advExamSort = { criteria: 'date-desc', subject: 'total' };

        // TYT / AYT Sekme Değişimi ve AYT Alan Gösterimi
        if(expandedTabTyt && expandedTabAyt) {
            expandedTabTyt.addEventListener('click', () => {
                expandedTabTyt.classList.add('active'); expandedTabAyt.classList.remove('active');
                currentExpandedTab = 'tyt';
                document.getElementById('expandedAytTrackSelector').style.display = 'none';
                window.renderExpandedExamsView();
            });
            expandedTabAyt.addEventListener('click', () => {
                expandedTabAyt.classList.add('active'); expandedTabTyt.classList.remove('active');
                currentExpandedTab = 'ayt';
                document.getElementById('expandedAytTrackSelector').style.display = 'block';
                window.renderExpandedExamsView();
            });
        }

        // ÖZEL MENÜ DİNLEYİCİSİ (AÇILIR MENÜ DEĞİŞİMLERİNDE TETİKLENİR)
        document.addEventListener('click', function(e) {
            const option = e.target.closest('.tcs-option');
            if(option) {
                const hiddenInput = option.closest('.task-custom-select').querySelector('input[type="hidden"]');
                if(!hiddenInput) return;
                
                // Sistemin değer atamasını beklemeden direkt kullanıcının tıkladığı değeri yakalıyoruz
                const selectedVal = option.getAttribute('data-value'); 
                
                if(hiddenInput.id === 'ef-datePreset') {
                    document.getElementById('ef-customDateGroup').style.display = selectedVal === 'custom' ? 'flex' : 'none';
                }
                if(hiddenInput.id === 'es-criteria') {
                    document.getElementById('es-subjectGroup').style.display = selectedVal.includes('net') ? 'block' : 'none';
                }
                if(hiddenInput.id === 'ef-subject') {
                    window.updateMaxNetLimits(selectedVal);
                }
                if(hiddenInput.id === 'expandedAytTrack') {
                    setTimeout(() => window.renderExpandedExamsView(), 50);
                }
            }
        }, true); // <--- İŞTE BU "true" KELİMESİ BÜTÜN TIKLAMA SORUNLARINI ÇÖZER! (Yakalama Evresi)

        window.showCustomToast = function(title, message, type = 'error') {
            const toast = document.getElementById('customToast');
            const icon = document.getElementById('toastIcon');
            if(!toast) return;
            
            if(type === 'error') {
                toast.style.borderLeftColor = '#d9534f';
                icon.className = 'fa-solid fa-circle-exclamation';
                icon.style.color = '#d9534f';
            }
            
            document.getElementById('toastTitle').innerText = title;
            document.getElementById('toastMessage').innerText = message;
            
            // Yukarı doğru kayarak belirme animasyonu
            toast.style.transform = 'translate(-50%, 0)';
            toast.style.opacity = '1';
            toast.style.visibility = 'visible';
            
            // 3.5 saniye sonra tekrar aşağı kayarak gizlenme animasyonu
            setTimeout(() => { 
                toast.style.transform = 'translate(-50%, 20px)';
                toast.style.opacity = '0';
                toast.style.visibility = 'hidden';
            }, 3500); 
        };

        const handleNetSpin = (inputId, isUp) => {
            const input = document.getElementById(inputId);
            if(!input) return;
            
            let val = parseFloat(input.value);
            if (isNaN(val)) val = 0;
            
            // 0.25 Net ekler veya çıkarır
            val += isUp ? 0.25 : -0.25;
            
            // Net eksiye düşmesin diye güvenlik kilidi
            if (val < 0) val = 0; 
            
            input.value = val;
            window.validateNetsRealtime(); // Rakam değiştiği an kırmızı kutu kalkanını çalıştır
        };

        document.getElementById('ef-minUp')?.addEventListener('click', () => handleNetSpin('ef-minNet', true));
        document.getElementById('ef-minDown')?.addEventListener('click', () => handleNetSpin('ef-minNet', false));
        document.getElementById('ef-maxUp')?.addEventListener('click', () => handleNetSpin('ef-maxNet', true));
        document.getElementById('ef-maxDown')?.addEventListener('click', () => handleNetSpin('ef-maxNet', false));

        window.validateNetsRealtime = function() {
            const minInput = DOM.efMinNet;
            const maxInput = DOM.efMaxNet;
            const errBox = document.getElementById('ef-netErrorText');
            if(!minInput || !maxInput || !errBox) return;

            const currentSubj = document.getElementById('ef-subject').value;
            const examMaxNets = {
                'tyt': { 'total': 120, 'Türkçe': 40, 'Sosyal Bilimler': 20, 'Temel Matematik': 40, 'Fen Bilimleri': 20 },
                'ayt': { 'total': 80, 'Matematik': 40, 'Fizik': 14, 'Kimya': 13, 'Biyoloji': 13, 'Türk Dili ve Edebiyatı': 24, 'Tarih-1': 10, 'Coğrafya-1': 6, 'Tarih-2': 11, 'Coğrafya-2': 11, 'Felsefe Grubu': 12, 'Din Kültürü': 6, 'Yabancı Dil': 80 }
            };
            const currentLimit = examMaxNets[currentExpandedTab][currentSubj] || 120;
            const subjName = currentSubj === 'total' ? (currentExpandedTab === 'tyt' ? 'Genel TYT' : 'Genel AYT') : currentSubj;

            let hasError = false;
            const minV = parseFloat(minInput.value);
            const maxV = parseFloat(maxInput.value);

            minInput.style.borderColor = '#cce5ff'; minInput.style.backgroundColor = '#fff';
            maxInput.style.borderColor = '#cce5ff'; maxInput.style.backgroundColor = '#fff';

            if (!isNaN(minV) && minV > currentLimit) {
                hasError = true;
                minInput.style.borderColor = '#d9534f'; minInput.style.backgroundColor = '#ffeaea';
            }
            if (!isNaN(maxV) && maxV > currentLimit) {
                hasError = true;
                maxInput.style.borderColor = '#d9534f'; maxInput.style.backgroundColor = '#ffeaea';
            }

            if (hasError) {
                errBox.style.display = 'block';
                errBox.querySelector('span').innerText = `${subjName} dersinin toplam soru sayısı ${currentLimit}'dir.`;
            } else {
                errBox.style.display = 'none';
            }
        };

        DOM.efMinNet?.addEventListener('input', window.validateNetsRealtime);
        DOM.efMaxNet?.addEventListener('input', window.validateNetsRealtime);

        // AKILLI NET LİMİTİ BELİRLEYİCİ (MAX SINIRLAR VE DİNAMİK ÖRNEKLER)
        window.updateMaxNetLimits = function(subject) {
            const maxInput = DOM.efMaxNet;
            const minInput = DOM.efMinNet;
            
            const examMaxNets = {
                'tyt': { 'total': 120, 'Türkçe': 40, 'Sosyal Bilimler': 20, 'Temel Matematik': 40, 'Fen Bilimleri': 20 },
                'ayt': { 'total': 80, 'Matematik': 40, 'Fizik': 14, 'Kimya': 13, 'Biyoloji': 13, 'Türk Dili ve Edebiyatı': 24, 'Tarih-1': 10, 'Coğrafya-1': 6, 'Tarih-2': 11, 'Coğrafya-2': 11, 'Felsefe Grubu': 12, 'Din Kültürü': 6, 'Yabancı Dil': 80 }
            };
            
            const maxVal = examMaxNets[currentExpandedTab][subject] || 120;
            const exampleMin = Math.max(1, Math.floor(maxVal * 0.3));
            const exampleMax = Math.max(1, Math.floor(maxVal * 0.85));

            minInput.placeholder = `Min Net (Örn: ${exampleMin})`;
            maxInput.placeholder = `Max Net (Örn: ${exampleMax})`;
            
            window.validateNetsRealtime();
        };

        // --- FİLTRE VE SIRALAMA MODALLARINI YÖNETME ---
        window.populateExamDynamicSelects = function() {
            let allSubs = new Set();
            let trackExams = savedExams.filter(e => e.type === currentExpandedTab);
            if(currentExpandedTab === 'ayt') {
                const trk = document.getElementById('expandedAytTrack').value;
                trackExams = trackExams.filter(e => e.track === trk);
            }
            trackExams.forEach(ex => { if(ex.subjects) ex.subjects.forEach(s => allSubs.add(s.name)); });
            
            let html = `<div class="tcs-option" data-value="total">Genel (Toplam Net)</div>`;
            allSubs.forEach(sub => html += `<div class="tcs-option" data-value="${sub}">${sub}</div>`);
            
            document.getElementById('ef-subject-options').innerHTML = html;
            document.getElementById('es-subject-options').innerHTML = html;
        };

        window.syncExamModalsWithState = function() {
            const updateCustomSelect = (inputId, val) => {
                const hiddenInput = document.getElementById(inputId);
                if (!hiddenInput) return;
                hiddenInput.value = val;
                
                const wrapper = hiddenInput.closest('.task-custom-select');
                if(!wrapper) return;
                
                const options = wrapper.querySelectorAll('.tcs-option');
                let foundText = "";
                options.forEach(opt => {
                    if(opt.getAttribute('data-value') === val) {
                        opt.classList.add('selected');
                        foundText = opt.innerText;
                    } else {
                        opt.classList.remove('selected');
                    }
                });
                
                // Eğer filtrelenen bir ders silinmişse (Artık yoksa) otomatik olarak Genel'e dön (Hata önleyici kalkan)
                if (!foundText && val !== 'total') {
                    updateCustomSelect(inputId, 'total');
                    return;
                }
                
                const textSpan = wrapper.querySelector('.tcs-text');
                if(textSpan && foundText) textSpan.innerText = foundText;
            };

            // 1. Filtre Modalı Senkronizasyonu
            updateCustomSelect('ef-datePreset', advExamFilter.preset);
            document.getElementById('ef-customDateGroup').style.display = advExamFilter.preset === 'custom' ? 'flex' : 'none';
            document.getElementById('ef-startDate').value = advExamFilter.start;
            document.getElementById('ef-endDate').value = advExamFilter.end;
            
            updateCustomSelect('ef-subject', advExamFilter.subject);
            DOM.efMinNet.value = advExamFilter.min;
            DOM.efMaxNet.value = advExamFilter.max;
            window.updateMaxNetLimits(advExamFilter.subject);

            // 2. Sıralama Modalı Senkronizasyonu
            updateCustomSelect('es-criteria', advExamSort.criteria);
            document.getElementById('es-subjectGroup').style.display = advExamSort.criteria.includes('net') ? 'block' : 'none';
            updateCustomSelect('es-subject', advExamSort.subject);
        };

        // Modal Açılışları (Açılırken artık hafızadaki durumlarıyla gelecekler!)
        document.getElementById('openExamFilterBtn')?.addEventListener('click', () => {
            window.populateExamDynamicSelects();
            window.syncExamModalsWithState(); 
            DOM.examFilterModal.style.display = 'flex';
        });
        document.getElementById('openExamSortBtn')?.addEventListener('click', () => {
            window.populateExamDynamicSelects();
            window.syncExamModalsWithState(); 
            document.getElementById('examSortModal').style.display = 'flex';
        });
        
        // Kapanışlar
        document.getElementById('closeExamFilterModalBtn')?.addEventListener('click', () => DOM.examFilterModal.style.display = 'none');
        document.getElementById('closeExamSortModalBtn')?.addEventListener('click', () => document.getElementById('examSortModal').style.display = 'none');
        document.getElementById('cancelExamSortBtn')?.addEventListener('click', () => document.getElementById('examSortModal').style.display = 'none');

        // SIFIRLAMA BUTONLARI (X)
        document.getElementById('resetExamFilterBtn')?.addEventListener('click', () => {
            advExamFilter = { preset: 'all', start: '', end: '', subject: 'total', min: '', max: '' };
            window.renderExpandedExamsView();
        });
        document.getElementById('resetExamSortBtn')?.addEventListener('click', () => {
            advExamSort = { criteria: 'date-desc', subject: 'total' };
            window.renderExpandedExamsView();
        });

        document.getElementById('expandedAddNewExamBtn')?.addEventListener('click', () => {
            // Ana ekrandaki ekleme butonunu tetikleyerek aynı modalın açılmasını sağlarız
            document.getElementById('openExamModalBtn').click(); 
        });

        document.getElementById('clearExamFilterBtn')?.addEventListener('click', () => {
            // 1. Filtre değişkenlerini tamamen sıfırla
            advExamFilter = { preset: 'all', start: '', end: '', subject: 'total', min: '', max: '' };
            
            // 2. Modalın içindeki inputları ve menüleri sıfırlanan değerlere eşitle
            window.syncExamModalsWithState(); 
            
            // 3. Arka plandaki çizimi (grafik ve liste) sıfırlanmış filtrelerle tekrar çiz
            window.renderExpandedExamsView();
            
            // 4. Modalı kapat
            DOM.examFilterModal.style.display = 'none';
        });

        // FİLTRE UYGULAMA (GELİŞMİŞ GÜVENLİK VE MAX NET KONTROLÜ)
        document.getElementById('applyExamFilterBtn')?.addEventListener('click', () => {
            const startD = document.getElementById('ef-startDate').value;
            const endD = document.getElementById('ef-endDate').value;
            
            if(document.getElementById('ef-datePreset').value === 'custom' && startD && endD) {
                if(new Date(startD) > new Date(endD)) {
                    window.showCustomToast("Hatalı Tarih Yazımı", "Başlangıç tarihi bitiş tarihinden sonra olamaz.", "error");
                    return;
                }
            }
            
            const minV = parseFloat(DOM.efMinNet.value);
            const maxV = parseFloat(DOM.efMaxNet.value);
            const currentSubj = document.getElementById('ef-subject').value;
            
            const examMaxNets = {
                'tyt': { 'total': 120, 'Türkçe': 40, 'Sosyal Bilimler': 20, 'Temel Matematik': 40, 'Fen Bilimleri': 20 },
                'ayt': { 'total': 80, 'Matematik': 40, 'Fizik': 14, 'Kimya': 13, 'Biyoloji': 13, 'Türk Dili ve Edebiyatı': 24, 'Tarih-1': 10, 'Coğrafya-1': 6, 'Tarih-2': 11, 'Coğrafya-2': 11, 'Felsefe Grubu': 12, 'Din Kültürü': 6, 'Yabancı Dil': 80 }
            };
            const currentLimit = examMaxNets[currentExpandedTab][currentSubj] || 120;

            if(!isNaN(minV) && minV > currentLimit) {
                window.showCustomToast("Hatalı Net Yazımı", `Seçtiğin alan için en fazla ${currentLimit} net girebilirsin.`, "error");
                return;
            }
            if(!isNaN(maxV) && maxV > currentLimit) {
                window.showCustomToast("Hatalı Net Yazımı", `Seçtiğin alan için en fazla ${currentLimit} net girebilirsin.`, "error");
                return;
            }
            if(!isNaN(minV) && !isNaN(maxV) && minV > maxV) {
                window.showCustomToast("Hatalı Net Yazımı", "Minimum net, maksimum netten büyük olamaz.", "error");
                return;
            }
            
            advExamFilter.preset = document.getElementById('ef-datePreset').value;
            advExamFilter.start = startD;
            advExamFilter.end = endD;
            advExamFilter.subject = currentSubj;
            advExamFilter.min = DOM.efMinNet.value;
            advExamFilter.max = DOM.efMaxNet.value;
            
            window.renderExpandedExamsView();
            DOM.examFilterModal.style.display = 'none';
        });

        // SIRALAMA UYGULAMA
        document.getElementById('applyExamSortBtn')?.addEventListener('click', () => {
            advExamSort.criteria = document.getElementById('es-criteria').value;
            advExamSort.subject = document.getElementById('es-subject').value;
            window.renderExpandedExamsView();
            document.getElementById('examSortModal').style.display = 'none';
        });

        // --- LİNEER FİT (TREND) HESAPLAYICI VE ZAMAN EKSENİ (X/Y) UYUMLU ---
        function calculateLinearFitWithNulls(dataWithDatesAndNets) {
            const validPoints = dataWithDatesAndNets.filter(e => e.net !== null && e.net !== undefined && !isNaN(e.net));
            if (validPoints.length < 2) return { points: [], slopePerMonth: 0 };

            const t0 = new Date(validPoints[0].date).getTime();
            let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
            const n = validPoints.length;

            validPoints.forEach(e => {
                const x = (new Date(e.date).getTime() - t0) / (1000 * 60 * 60 * 24);
                const y = parseFloat(e.net);
                sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
            });

            const denominator = (n * sumX2 - sumX * sumX);
            let m = 0, b = sumY / n;
            if (denominator !== 0) {
                m = (n * sumXY - sumX * sumY) / denominator;
                b = (sumY - m * sumX) / n;
            }

            // Trend çizgisinin noktalarını X (Tarih damgası) ve Y (Beklenen net) olarak veriyoruz
            const fitPoints = dataWithDatesAndNets.map(e => {
                const timestamp = new Date(e.date).getTime();
                const xDays = (timestamp - t0) / (1000 * 60 * 60 * 24);
                return { x: timestamp, y: m * xDays + b, isTrend: true };
            });

            return { points: fitPoints, slopePerMonth: m * 30, slopePerWeek: m * 7 };
        }

        // --- ANA ÇİZİM VE FİLTRELEME MOTORU ---
        window.renderExpandedExamsView = function() {
            const listContainer = document.getElementById('expandedExamsList');
            const mainChartCanvas = document.getElementById('expandedMainChart');
            const subjectsContainer = document.getElementById('expandedSubjectChartsContainer');
            const countDisplay = document.getElementById('expandedExamCount');

            if(!listContainer || !mainChartCanvas || !subjectsContainer) return;

            // 0. TEMEL FİLTRE (TYT / AYT + Alan)
            let filtered = savedExams.filter(e => e.type === currentExpandedTab);
            if(currentExpandedTab === 'ayt') {
                const trk = document.getElementById('expandedAytTrack').value;
                filtered = filtered.filter(e => e.track === trk);
            }

            // 1. ZAMAN FİLTRESİ
            if(advExamFilter.preset === 'last30') {
                const limitDate = new Date(); limitDate.setDate(limitDate.getDate() - 30);
                filtered = filtered.filter(e => new Date(e.date) >= limitDate);
            } else if(advExamFilter.preset === 'last90') {
                const limitDate = new Date(); limitDate.setDate(limitDate.getDate() - 90);
                filtered = filtered.filter(e => new Date(e.date) >= limitDate);
            } else if(advExamFilter.preset === 'custom' && advExamFilter.start && advExamFilter.end) {
                const sD = new Date(advExamFilter.start); 
                const eD = new Date(advExamFilter.end);
                eD.setHours(23, 59, 59, 999);
                filtered = filtered.filter(e => { const d = new Date(e.date); return d >= sD && d <= eD; });
            }

            // 2. NET FİLTRESİ
            if(advExamFilter.min !== '' || advExamFilter.max !== '') {
                filtered = filtered.filter(e => {
                    let targetNet = 0;
                    if(advExamFilter.subject === 'total') targetNet = parseFloat(e.net);
                    else {
                        const s = e.subjects?.find(sub => sub.name === advExamFilter.subject);
                        targetNet = s ? parseFloat(s.net) : 0;
                    }
                    let meetsMin = advExamFilter.min === '' || targetNet >= parseFloat(advExamFilter.min);
                    let meetsMax = advExamFilter.max === '' || targetNet <= parseFloat(advExamFilter.max);
                    return meetsMin && meetsMax;
                });
            }

            let sortedForCharts = [...filtered].sort((a,b) => new Date(a.date) - new Date(b.date));

            // 3. GELİŞMİŞ SIRALAMA
            let sortedForList = [...filtered];
            if(advExamSort.criteria === 'date-desc') sortedForList.sort((a,b) => new Date(b.date) - new Date(a.date));
            if(advExamSort.criteria === 'date-asc') sortedForList.sort((a,b) => new Date(a.date) - new Date(b.date));
            if(advExamSort.criteria === 'net-desc' || advExamSort.criteria === 'net-asc') {
                sortedForList.sort((a,b) => {
                    let netA = 0, netB = 0;
                    if(advExamSort.subject === 'total') {
                        netA = parseFloat(a.net); netB = parseFloat(b.net);
                    } else {
                        const sA = a.subjects?.find(sub => sub.name === advExamSort.subject);
                        const sB = b.subjects?.find(sub => sub.name === advExamSort.subject);
                        netA = sA ? parseFloat(sA.net) : -1;
                        netB = sB ? parseFloat(sB.net) : -1;
                    }
                    return advExamSort.criteria === 'net-desc' ? netB - netA : netA - netB;
                });
            }

            countDisplay.innerText = sortedForList.length;

            // =================================================================
            // X BUTONLARININ GÖRÜNÜRLÜĞÜ VE AKILLI KÖŞE YUVARLATMASI
            // =================================================================
            const btnSortReset = document.getElementById('resetExamSortBtn');
            const btnFilterReset = document.getElementById('resetExamFilterBtn');
            const btnSortMain = document.getElementById('openExamSortBtn');
            const btnFilterMain = document.getElementById('openExamFilterBtn');

            if(btnSortReset) {
                const isSortActive = advExamSort.criteria !== 'date-desc' || advExamSort.subject !== 'total';
                btnSortReset.style.display = isSortActive ? 'flex' : 'none';
                // Çarpı butonu yoksa sağ köşeleri tam yuvarlat, varsa sağ tarafı düz (flat) yap
                if(btnSortMain) btnSortMain.style.borderRadius = isSortActive ? 'var(--radius-md) 0 0 var(--radius-md)' : 'var(--radius-md)';
            }

            if(btnFilterReset) {
                const isFilterActive = advExamFilter.preset !== 'all' || advExamFilter.min !== '' || advExamFilter.max !== '';
                btnFilterReset.style.display = isFilterActive ? 'flex' : 'none';
                // Çarpı butonu yoksa sağ köşeleri tam yuvarlat, varsa sağ tarafı düz (flat) yap
                if(btnFilterMain) btnFilterMain.style.borderRadius = isFilterActive ? 'var(--radius-md) 0 0 var(--radius-md)' : 'var(--radius-md)';
            } 

            // =================================================================
            // 4. LİSTEYİ EKRANA ÇİZME (Yanlışlıkla silinen motor geri eklendi)
            // =================================================================
            listContainer.innerHTML = '';
            if(sortedForList.length === 0) {
                listContainer.innerHTML = `
                    <div style="text-align:center; padding: 40px 20px; color:#aaa;">
                        <i class="fa-solid fa-chart-line" style="font-size:40px; color:var(--color-primary-border); margin-bottom:15px; display:block;"></i>
                        <span style="font-weight:700; font-size:13px;">Kriterlere uygun deneme bulunamadı.</span>
                    </div>`;
            }
            
            else {
                sortedForList.forEach(ex => {
                    const isTargeted = isExpandedExamDeleteMode && expandedExamsToDelete.has(ex.id);
                    const bgStyle = isTargeted ? 'background:#ffeaea; border: 2px solid #d9534f;' : 'background:#fff; border: 1px solid #e1e9f0;';
                    const clickAction = isExpandedExamDeleteMode ? `window.toggleExpandedExamSelection(${ex.id})` : `window.viewExamDetails(${ex.id})`;

                    listContainer.innerHTML += `
                        <div style="${bgStyle} padding:12px 15px; border-radius:12px; cursor:pointer; transition:all 0.1s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); display:flex; align-items:center;" 
                             onmouseover="if(!${isTargeted}){this.style.transform='translateY(-2px)'; this.style.borderColor='#cce5ff';}" 
                             onmouseout="if(!${isTargeted}){this.style.transform='translateY(0)'; this.style.borderColor='#e1e9f0';}" 
                             onclick="${clickAction}">
                            <div style="flex:1; overflow:hidden;">
                                <div style="font-weight:800; color:#333; font-size:13px; margin-bottom:6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${ex.title}</div>
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <span style="font-size:11px; font-weight:700; color:#888;"><i class="fa-regular fa-calendar"></i> ${formatDateToTurkish(ex.date)}</span>
                                    <span style="font-weight:900; color:#17a2b8; background:#e0f7fa; padding:2px 8px; border-radius:6px; font-size:12px;">${parseFloat(ex.net).toFixed(2)} Net</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }

            // 5. GRAFİKLER İÇİN ZAMAN (X Ekseni) DEĞERLERİ HAZIRLIĞI
            const mainData = sortedForCharts.map(e => ({
                x: new Date(e.date).getTime(),
                y: parseFloat(e.net),
                title: e.title,
                dateStr: formatDateToTurkish(e.date)
            }));

            const subjectMap = {}; 
            const allSubjects = new Set();
            sortedForCharts.forEach(ex => { if(ex.subjects) ex.subjects.forEach(s => allSubjects.add(s.name)); });
            allSubjects.forEach(sub => subjectMap[sub] = []);

            sortedForCharts.forEach(ex => {
                allSubjects.forEach(sub => {
                    if(ex.subjects) {
                        const subData = ex.subjects.find(s => s.name === sub);
                        if(subData) subjectMap[sub].push(parseFloat(subData.net));
                        else subjectMap[sub].push(null); 
                    } else subjectMap[sub].push(null); 
                });
            });

            // TREND (LİNEER FİT) AYARLARI
            const isTrendlineActive = document.getElementById('expandedTrendlineToggle')?.checked;
            const trendColor = 'rgba(255, 99, 132, 0.4)'; 

            // YENİ EKLENEN: Büyük grafiklerde de X Eksenini 2 gün esnetme
            let xAxisMin = undefined;
            let xAxisMax = undefined;
            if (sortedForCharts.length > 0) {
                const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
                xAxisMin = new Date(sortedForCharts[0].date).getTime() - twoDaysMs;
                xAxisMax = new Date(sortedForCharts[sortedForCharts.length - 1].date).getTime() + twoDaysMs;
            }

            // 6. ANA GRAFİĞİ ÇİZ
                if(expandedMainChartInstance) expandedMainChartInstance.destroy();
                const mainColor = currentExpandedTab === 'tyt' ? 'var(--color-primary)' : '#ffc107';
                const mainBgColor = currentExpandedTab === 'tyt' ? 'rgba(0, 123, 255, 0.15)' : 'rgba(255, 193, 7, 0.15)';

                const isTargetActive = document.getElementById('expandedTargetToggle')?.checked;
                const mainTarget = window.targetNets ? window.targetNets[currentExpandedTab === 'tyt' ? 'TYT' : 'AYT'] : null;
                const targetVal = mainTarget && !isNaN(parseFloat(mainTarget)) ? parseFloat(mainTarget) : null;

                const pointBgColors = mainData.map(point => {
                    return (isTargetActive && targetVal !== null && point.y >= targetVal) ? '#28a745' : '#fff';
                });
                
                const pointBorderColors = mainData.map(point => {
                    return (isTargetActive && targetVal !== null && point.y >= targetVal) ? '#28a745' : mainColor;
                });

                const mainDatasets = [{
                    label: 'Genel Net',
                    data: mainData,
                    borderColor: mainColor,
                    backgroundColor: mainBgColor,
                    borderWidth: 3,
                    pointBackgroundColor: pointBgColors,    // Dinamik iç renk
                    pointBorderColor: pointBorderColors,    // Dinamik sınır rengi
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    fill: true,
                    tension: 0.3,
                    order: 2
                }];

            const mainDataWithDates = sortedForCharts.map(e => ({date: e.date, net: parseFloat(e.net)}));
            const mainTrendData = calculateLinearFitWithNulls(mainDataWithDates);

            // ANA GRAFİK EĞİM YAZISI
            const slopeTextEl = document.getElementById('expandedTrendlineSlopeText');
            if (slopeTextEl) {
                if (sortedForCharts.length < 2) {
                    slopeTextEl.innerHTML = "Yetersiz Veri";
                    slopeTextEl.style.color = "#888";
                } else {
                    const periodToggle = document.getElementById('customTrendPeriodToggle');
                    const period = periodToggle ? periodToggle.getAttribute('data-period') : 'week';
                    const val = period === 'week' ? mainTrendData.slopePerWeek : mainTrendData.slopePerMonth;
                    const periodText = period === 'week' ? 'hf' : 'ay';
                    
                    const sign = val > 0 ? "+" : "";
                    const icon = val > 0 ? '<i class="fa-solid fa-arrow-trend-up"></i>' : (val < 0 ? '<i class="fa-solid fa-arrow-trend-down"></i>' : '<i class="fa-solid fa-minus"></i>');

                    slopeTextEl.innerHTML = `${icon} ${sign}${val.toFixed(2)} net/${periodText}`;
                    if (val > 0) slopeTextEl.style.color = "#28a745"; 
                    else if (val < 0) slopeTextEl.style.color = "#d9534f"; 
                    else slopeTextEl.style.color = "#888"; 
                }
            }

            if (isTrendlineActive && mainTrendData.points.length >= 2) {
                mainDatasets.push({
                    label: 'Eğilim (Trend)',
                    data: mainTrendData.points,
                    borderColor: trendColor,
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    type: 'line',
                    tension: 0
                });
            }
            
            if (isTargetActive && mainTarget && !isNaN(parseFloat(mainTarget))) {
                const targetVal = parseFloat(mainTarget);
                mainDatasets.push({
                    label: `Hedef (${currentExpandedTab === 'tyt' ? 'TYT' : 'AYT'})`,
                    data: [{x: xAxisMin, y: targetVal}, {x: xAxisMax, y: targetVal}],
                    borderColor: '#8854d0',
                    borderWidth: 2,
                    borderDash: [6, 4],
                    pointRadius: 0,
                    fill: false,
                    type: 'line',
                    tension: 0
                });
            }

            // ORTAK GRAFİK EKSEN VE TOOLTIP AYARLARI (Zaman Odaklı)
            const commonChartOptions = {
                responsive: true, maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false }, 
                    tooltip: { 
                        backgroundColor: 'rgba(0,0,0,0.8)', titleFont: { size: 13 }, bodyFont: { size: 14, weight: 'bold' }, 
                        callbacks: { 
                            title: (ctx) => {
                                const raw = ctx[0].raw;
                                if(raw && raw.isTrend) return 'Lineer Fit (Trend)';
                                if(raw && raw.title) return raw.title + '\n(' + raw.dateStr + ')';
                                return '';
                            }, 
                            label: (ctx) => {
                                if(ctx.datasetIndex === 1) return ' Beklenen: ' + ctx.parsed.y.toFixed(2) + ' Net';
                                return ' ' + ctx.parsed.y + ' Net'; 
                            }
                        } 
                    } 
                },
                scales: { 
                    x: { 
                        type: 'linear',                        min: xAxisMin,
                        max: xAxisMax,
                        grid: { display: false }, 
                        ticks: { 
                            font: { weight: 'bold' },
                            callback: function(value) {
                                const d = new Date(value);
                                return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
                            }
                        } 
                    }, 
                    y: { beginAtZero: true, border: { dash: [5, 5] }, grid: { color: '#f0f4f8' } } 
                }
            };

            expandedMainChartInstance = new Chart(mainChartCanvas, {
                type: 'line',
                data: { datasets: mainDatasets }, // "labels" dizisi silindi, direkt {x,y} okunuyor!
                options: commonChartOptions
            });

            // 7. ALT GRAFİKLERİ ÇİZ
            subjectsContainer.innerHTML = '';
            for(let key in expandedSubjectChartInstances) { if(expandedSubjectChartInstances[key]) expandedSubjectChartInstances[key].destroy(); }
            expandedSubjectChartInstances = {};

            const subjectColors = ['#28a745', '#17a2b8', '#6610f2', '#e83e8c', '#fd7e14', '#20c997', '#d63384', '#6c757d', '#007bff'];
            let colorIndex = 0;
            
            allSubjects.forEach(sub => {
                if(!subjectMap[sub].some(val => val !== null)) return;
                const id = 'subjChart_' + sub.replace(/[\s-]/g, ''); 

                const subDataWithDates = sortedForCharts.map((e, idx) => ({ date: e.date, net: subjectMap[sub][idx] }));
                const subTrendData = calculateLinearFitWithNulls(subDataWithDates);
                
                let trendHtml = '';
                if (isTrendlineActive && subTrendData.points.length >= 2) {
                    const periodToggle = document.getElementById('customTrendPeriodToggle');
                    const period = periodToggle ? periodToggle.getAttribute('data-period') : 'week';
                    const pVal = period === 'week' ? subTrendData.slopePerWeek : subTrendData.slopePerMonth;
                    const pText = period === 'week' ? 'hf' : 'ay';
                    
                    const pSign = pVal > 0 ? "+" : "";
                    const pColor = pVal > 0 ? "#28a745" : (pVal < 0 ? "#d9534f" : "#6c757d");
                    const pIcon = pVal > 0 ? '<i class="fa-solid fa-arrow-trend-up"></i>' : (pVal < 0 ? '<i class="fa-solid fa-arrow-trend-down"></i>' : '<i class="fa-solid fa-minus"></i>');
                    
                    trendHtml = `<span style="font-size: 0.75em; margin-left: 8px; color: ${pColor}; background: ${pColor}20; padding: 3px 8px; border-radius: var(--radius-lg); vertical-align: middle;">${pIcon} ${pSign}${pVal.toFixed(2)} net/${pText}</span>`;
                }

                subjectsContainer.innerHTML += `
                    <div style="background: var(--color-bg-card); border-radius: 14px; padding: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); border: 1px solid #eef2f5;">
                        <h5 style="margin-bottom: 10px; color: var(--color-text-secondary); font-size: 14px; text-align:center; font-weight: 800; display:flex; justify-content:center; align-items:center;">
                            ${sub} ${trendHtml}
                        </h5>
                        <div style="height: 170px; position: relative;"><canvas id="${id}"></canvas></div>
                    </div>`;
            });

            allSubjects.forEach(sub => {
                if(!subjectMap[sub].some(val => val !== null)) return;
                const canvas = document.getElementById('subjChart_' + sub.replace(/[\s-]/g, ''));
                if(!canvas) return;
                const color = subjectColors[colorIndex % subjectColors.length]; colorIndex++;

                // SADECE GİRİLEN NOKTALAR İÇİN VERİ (x ve y)
                const subData = [];
                sortedForCharts.forEach((e, idx) => {
                    const netVal = subjectMap[sub][idx];
                    if(netVal !== null) {
                        subData.push({
                            x: new Date(e.date).getTime(),
                            y: parseFloat(netVal),
                            title: e.title,
                            dateStr: formatDateToTurkish(e.date)
                        });
                    }
                });

                const subDatasets = [{
                    label: sub + ' Neti', data: subData, borderColor: color, backgroundColor: color + '20', 
                    borderWidth: 2, pointBackgroundColor: '#fff', pointBorderColor: color, pointBorderWidth: 2,
                    pointRadius: 4, pointHoverRadius: 6, spanGaps: true, fill: true, tension: 0.2, order: 2
                }];

                const subDataWithDates = sortedForCharts.map((e, idx) => ({ date: e.date, net: subjectMap[sub][idx] }));
                const subTrendData = calculateLinearFitWithNulls(subDataWithDates);

                if (isTrendlineActive && subTrendData.points.length >= 2) {
                    subDatasets.push({
                        label: 'Eğilim (Trend)',
                        data: subTrendData.points,
                        borderColor: trendColor,
                        borderWidth: 2,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        fill: false,
                        type: 'line',
                        tension: 0
                    });
                }

                const isTargetActive = document.getElementById('expandedTargetToggle')?.checked;
                const subTarget = window.targetNets ? window.targetNets[sub] : null;
                if (isTargetActive && subTarget && !isNaN(parseFloat(subTarget))) {
                    const stVal = parseFloat(subTarget);
                    subDatasets.push({
                        label: 'Hedef',
                        data: [{x: xAxisMin, y: stVal}, {x: xAxisMax, y: stVal}],
                        borderColor: '#ffc107',
                        borderWidth: 2,
                        borderDash: [4, 4],
                        pointRadius: 0,
                        fill: false,
                        type: 'line',
                        tension: 0
                    });
                }

                // Alt grafik ayarlarını klonla ve küçük değişiklikler yap
                const subjOptions = JSON.parse(JSON.stringify(commonChartOptions));
                subjOptions.scales.x.ticks.font = { size: 9 };
                subjOptions.scales.x.ticks.maxRotation = 45;
                subjOptions.scales.y.border = { dash: [3, 3] };
                subjOptions.scales.y.grid.color = '#f8f9fa';
                
                // Klonlanan objede fonksiyonlar kaybolduğu için geri ekliyoruz
                subjOptions.plugins.tooltip.callbacks.title = commonChartOptions.plugins.tooltip.callbacks.title;
                subjOptions.plugins.tooltip.callbacks.label = commonChartOptions.plugins.tooltip.callbacks.label;
                subjOptions.scales.x.ticks.callback = commonChartOptions.scales.x.ticks.callback;

                expandedSubjectChartInstances[sub] = new Chart(canvas, {
                    type: 'line',
                    data: { datasets: subDatasets },
                    options: subjOptions
                });
            });
        };

        // =====================================================================
        // --- HAFIZALI ŞALTER (SWITCH) VE PERİYOT MOTORLARI (ÇAKIŞMA KORUMALI) ---
        // =====================================================================
        
        // 1. Ortalama Değişim Miktarı (Trend/Lineer Fit) Şalteri
        (function() {
            var trendToggle = document.getElementById('expandedTrendlineToggle');
            if (trendToggle) {
                var savedTrend = localStorage.getItem('trendlineActive');
                if (savedTrend !== null) {
                    trendToggle.checked = (savedTrend === 'true');
                }
                
                trendToggle.addEventListener('change', function(e) {
                    localStorage.setItem('trendlineActive', e.target.checked);
                    if (window.renderExpandedExamsView) window.renderExpandedExamsView();
                });
            }
        })();

        // 2. Periyot Seçici Motoru (Haftalık / Aylık Butonları)
        window.toggleTrendPeriod = function() {
            var toggle = document.getElementById('customTrendPeriodToggle');
            if(!toggle) return;
            
            var current = toggle.getAttribute('data-period');
            var newPeriod = current === 'week' ? 'month' : 'week';
            toggle.setAttribute('data-period', newPeriod); 
            
            var weekBtn = document.getElementById('periodWeekBtn');
            var monthBtn = document.getElementById('periodMonthBtn');
            
            if(newPeriod === 'week') {
                weekBtn.style.background = 'var(--color-primary)'; weekBtn.style.color = '#fff'; weekBtn.style.boxShadow = 'var(--shadow-primary)';
                monthBtn.style.background = 'transparent'; monthBtn.style.color = '#6c757d'; monthBtn.style.boxShadow = 'none';
            } else {
                monthBtn.style.background = 'var(--color-primary)'; monthBtn.style.color = '#fff'; monthBtn.style.boxShadow = 'var(--shadow-primary)';
                weekBtn.style.background = 'transparent'; weekBtn.style.color = '#6c757d'; weekBtn.style.boxShadow = 'none';
            }
            
            if (window.renderExpandedExamsView) window.renderExpandedExamsView();
        };

        // 3. Hedef Çizgisi Şalteri
        (function() {
            var targetToggle = document.getElementById('expandedTargetToggle');
            if (targetToggle) {
                var savedTarget = localStorage.getItem('targetlineActive');
                if (savedTarget !== null) {
                    targetToggle.checked = (savedTarget === 'true');
                }
                
                targetToggle.addEventListener('change', function(e) {
                    localStorage.setItem('targetlineActive', e.target.checked);
                    if (window.renderExpandedExamsView) window.renderExpandedExamsView();
                });
            }
        })();

        // --- ÇOKLU DENEME SİLME MODU (GÜNCELLENDİ) ---
        window.toggleExpandedExamSelection = function(id) {
            if(expandedExamsToDelete.has(id)) expandedExamsToDelete.delete(id);
            else expandedExamsToDelete.add(id);
            document.getElementById('confirmExamDeleteBtn').innerText = `Sil (${expandedExamsToDelete.size})`;
            window.renderExpandedExamsView();
        };

        document.getElementById('toggleExamDeleteModeBtn')?.addEventListener('click', () => {
            isExpandedExamDeleteMode = true;
            expandedExamsToDelete.clear();
            document.getElementById('confirmExamDeleteBtn').innerText = `Sil (0)`;
            document.getElementById('examDefaultActionBtns').style.display = 'none';
            document.getElementById('examDeleteActionBtns').style.display = 'flex';
            window.renderExpandedExamsView();
        });

        document.getElementById('cancelExamDeleteBtn')?.addEventListener('click', () => {
            isExpandedExamDeleteMode = false;
            expandedExamsToDelete.clear();
            document.getElementById('examDeleteActionBtns').style.display = 'none';
            document.getElementById('examDefaultActionBtns').style.display = 'flex';
            window.renderExpandedExamsView();
        });

        // SİL BUTONUNA BASINCA (ARTIK ÖZEL PENCERE AÇAR)
        document.getElementById('confirmExamDeleteBtn')?.addEventListener('click', () => {
            if(expandedExamsToDelete.size === 0) {
                if (window.showCustomToast) {
                    window.showCustomToast("Eksik Seçim", "Lütfen silmek için en az bir deneme seçin.", "error");
                } else {
                    alert("Lütfen silmek için en az bir deneme seçin.");
                }
                return;
            }
            
            // Mesajı güncelle ve şık pencereyi aç
            document.getElementById('expandedMultiDeleteConfirmMsg').innerText = `Seçilen ${expandedExamsToDelete.size} denemeyi kalıcı olarak silmek istediğinize emin misiniz?`;
            document.getElementById('expandedExamMultiDeleteConfirmModal').style.display = 'flex';
        });

        // YENİ ŞIK PENCEREDEKİ "EVET, SİL" BUTONUNU DİNLE
        document.getElementById('yesExpandedExamMultiDeleteBtn')?.addEventListener('click', async () => {
            document.getElementById('expandedExamMultiDeleteConfirmModal').style.display = 'none';
            const btn = document.getElementById('confirmExamDeleteBtn');
            btn.innerText = "Siliniyor...";
            
            try {
                for(let id of expandedExamsToDelete) {
                    if(typeof currentUserUid !== 'undefined' && currentUserUid) {
                        await deleteDoc(doc(db, "users", currentUserUid, "userExams", id.toString()));
                    }
                    savedExams = savedExams.filter(e => e.id !== id);
                }
                isExpandedExamDeleteMode = false;
                expandedExamsToDelete.clear();
                document.getElementById('examDeleteActionBtns').style.display = 'none';
                document.getElementById('examDefaultActionBtns').style.display = 'flex';
                btn.innerText = "Sil (0)";
                
                window.renderExamsToScreen?.();
                window.renderExpandedExamsView?.(); // Tabloyu da yenilemek için eklendi
                
                if (window.showCustomToast) window.showCustomToast("Başarılı", "Denemeler kalıcı olarak silindi.", "success");
                
            } catch(e) {
                if (window.showCustomToast) window.showCustomToast("Hata", "Denemeler silinirken bir sorun oluştu.", "error");
                btn.innerText = `Sil (${expandedExamsToDelete.size})`;
            }
        });

        // --- ANA SAYFAYA DÖNÜŞ ANİMASYONU ---
        document.getElementById('goHomeBtn').addEventListener('click', function(e) {
            e.preventDefault(); 
            
            // Yan menüyü kapat
            DOM.sideMenu.classList.remove('open');
            DOM.menuOverlay.classList.remove('active');
            
            // index.html'e haber gönder! 
            sessionStorage.setItem('fromDers', 'true');

            // ARADAKİ SAHTE EKRANI KALDIRDIK! Hiç beklemeden anında index.html'e (2. Ekrana) geçiş yapıyoruz.
            window.location.href = 'index.html'; 
        });

        // --- AKILLI FİLTRE DEĞİŞİKLİK VE ONAY MOTORU ---

        // 1. Filtreleri Temizle Butonu (Sadece UI kutularını sıfırlar, arka planı beklemede bırakır)
        const oldClearBtn = document.getElementById('clearExamFilterBtn');
        if(oldClearBtn) {
            const newClearBtn = oldClearBtn.cloneNode(true);
            oldClearBtn.parentNode.replaceChild(newClearBtn, oldClearBtn);
            
            newClearBtn.addEventListener('click', () => {
                const updateCustomSelect = (inputId, val) => {
                    const hiddenInput = document.getElementById(inputId);
                    if (!hiddenInput) return;
                    hiddenInput.value = val;
                    const wrapper = hiddenInput.closest('.task-custom-select');
                    if(!wrapper) return;
                    const options = wrapper.querySelectorAll('.tcs-option');
                    let foundText = "";
                    options.forEach(opt => {
                        if(opt.getAttribute('data-value') === val) {
                            opt.classList.add('selected');
                            foundText = opt.innerText;
                        } else {
                            opt.classList.remove('selected');
                        }
                    });
                    const textSpan = wrapper.querySelector('.tcs-text');
                    if(textSpan && foundText) textSpan.innerText = foundText;
                };

                updateCustomSelect('ef-datePreset', 'all');
                document.getElementById('ef-customDateGroup').style.display = 'none';
                document.getElementById('ef-startDate').value = '';
                document.getElementById('ef-endDate').value = '';

                updateCustomSelect('ef-subject', 'total');
                DOM.efMinNet.value = '';
                DOM.efMaxNet.value = '';
                if(window.updateMaxNetLimits) window.updateMaxNetLimits('total');
            });
        }

        // 2. Çarpı (X) butonuna basıldığında DEĞİŞİKLİK KONTROLÜ
        const closeFilterBtnNode = document.getElementById('closeExamFilterModalBtn');
        if (closeFilterBtnNode) {
            const newCloseFilterBtn = closeFilterBtnNode.cloneNode(true);
            closeFilterBtnNode.parentNode.replaceChild(newCloseFilterBtn, closeFilterBtnNode);
            
            newCloseFilterBtn.addEventListener('click', () => {
                const currentPreset = document.getElementById('ef-datePreset').value;
                const currentStart = document.getElementById('ef-startDate').value;
                const currentEnd = document.getElementById('ef-endDate').value;
                const currentSubject = document.getElementById('ef-subject').value;
                const currentMin = DOM.efMinNet.value;
                const currentMax = DOM.efMaxNet.value;

                // DÜZELTİLEN KISIM: Sistemdeki aktif filtreyi DOĞRUDAN çağırıyoruz (window eklentisini sildik)
                const activeFilter = advExamFilter;
                const safeStr = (val) => (val === undefined || val === null) ? '' : String(val).trim();

                // Ekranda gözüken değerler ile arka planda uygulanan filtreler arasında fark var mı?
                const isValueChanged = (
                    safeStr(currentPreset) !== safeStr(activeFilter.preset) ||
                    safeStr(currentStart) !== safeStr(activeFilter.start) ||
                    safeStr(currentEnd) !== safeStr(activeFilter.end) ||
                    safeStr(currentSubject) !== safeStr(activeFilter.subject) ||
                    safeStr(currentMin) !== safeStr(activeFilter.min) ||
                    safeStr(currentMax) !== safeStr(activeFilter.max)
                );

                if (isValueChanged) {
                    // Değişiklik varsa (veya temizleye basılmışsa) uyarı ver
                    document.getElementById('filterClearConfirmModal').style.display = 'flex';
                } else {
                    // Hiçbir fark yoksa direkt kapat
                    DOM.examFilterModal.style.display = 'none';
                }
            });
        }

        // 3. Onay Modalındaki "Evet, Uygula" Butonu
        const yesFilterClearBtn = document.getElementById('yesFilterClearBtn');
        if(yesFilterClearBtn) {
            const newYesBtn = yesFilterClearBtn.cloneNode(true);
            yesFilterClearBtn.parentNode.replaceChild(newYesBtn, yesFilterClearBtn);
            
            newYesBtn.addEventListener('click', () => {
                // Kendi kodlamak yerine, senin yazdığın hata korumalı ANA UYGULA butonunu tetikliyoruz!
                const applyBtn = document.getElementById('applyExamFilterBtn');
                if(applyBtn) applyBtn.click();
                
                document.getElementById('filterClearConfirmModal').style.display = 'none';
            });
        }

        // 4. Onay Modalındaki "Vazgeç" Butonu
        const cancelFilterChangeBtn = document.getElementById('cancelFilterChangeBtn');
        if(cancelFilterChangeBtn) {
            const newCancelBtn = cancelFilterChangeBtn.cloneNode(true);
            cancelFilterChangeBtn.parentNode.replaceChild(newCancelBtn, cancelFilterChangeBtn);
            
            newCancelBtn.addEventListener('click', () => {
                document.getElementById('filterClearConfirmModal').style.display = 'none';
                
                // Uyarıdan vazgeçildiği için ekrandaki kutuları sistemdeki orijinal haline geri döndür
                if (typeof window.syncExamModalsWithState === 'function') {
                    window.syncExamModalsWithState();
                }
                
                DOM.examFilterModal.style.display = 'none';
            });
        }

        // [HEDEF-NET] --- HEDEF NET VE AYARLAR SİSTEMİ ---
        window.targetNets = JSON.parse(localStorage.getItem('targetNets')) || {};

        // --- GELİŞMİŞ AYARLAR: HEDEF NET BUTONLARI (+1 / -1) ---
        document.getElementById('targetTytUp')?.addEventListener('click', () => {
            const el = document.getElementById('targetTYT');
            el.value = Math.max(0, parseFloat(el.value || 0) + 1);
        });
        document.getElementById('targetTytDown')?.addEventListener('click', () => {
            const el = document.getElementById('targetTYT');
            el.value = Math.max(0, parseFloat(el.value || 0) - 1);
        });
        
        document.getElementById('targetAytUp')?.addEventListener('click', () => {
            const el = document.getElementById('targetAYT');
            el.value = Math.max(0, parseFloat(el.value || 0) + 1);
        });
        document.getElementById('targetAytDown')?.addEventListener('click', () => {
            const el = document.getElementById('targetAYT');
            el.value = Math.max(0, parseFloat(el.value || 0) - 1);
        });

        // Ayarlar Modalı Açılış
        document.getElementById('expandedSettingsBtn')?.addEventListener('click', () => {
            document.getElementById('advancedSettingsModal').style.display = 'flex';
            document.getElementById('targetTYT').value = window.targetNets['TYT'] || '';
            document.getElementById('targetAYT').value = window.targetNets['AYT'] || '';
        });

        // Modalı Kapat
        document.getElementById('closeSettingsModalBtn')?.addEventListener('click', () => {
            document.getElementById('advancedSettingsModal').style.display = 'none';
        });

        // Ayarları Kaydet
        document.getElementById('saveSettingsBtn')?.addEventListener('click', async () => {
            const btn = document.getElementById('saveSettingsBtn');
            const origHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Kaydediliyor...';
            
            window.targetNets['TYT'] = document.getElementById('targetTYT').value;
            window.targetNets['AYT'] = document.getElementById('targetAYT').value;
            localStorage.setItem('targetNets', JSON.stringify(window.targetNets));
            
            await window.saveGlobalSettings(); // BULUTA KAYDET
            
            document.getElementById('advancedSettingsModal').style.display = 'none';
            btn.innerHTML = origHTML;
            
            // Kaydettikten sonra grafikleri anında güncelle
            window.renderExpandedExamsView?.();
        });

        // Sayı giriş (number) kutularında mouse scroll ile değer değişmesini engelle ve sayfayı kaydır
        document.addEventListener('wheel', function(event) {
            if (document.activeElement.type === 'number') {
                document.activeElement.blur();
            }
        });

        // Tarayıcı hafızasından kayıtlı renkleri al
        window.subjectColors = JSON.parse(localStorage.getItem('subjectColors')) || {};
        window.hasUnsavedColorChanges = false;
