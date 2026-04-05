        // [DENEME] --- DENEME EKLEME MOTORU (CANLI NET VE SINIR KORUMASI) ---
        const examModal = document.getElementById('examModal');
        const openExamModalBtn = document.getElementById('openExamModalBtn');
        const closeExamModalBtn = document.getElementById('closeExamModalBtn');
        const cancelExamBtn = document.getElementById('cancelExamBtn');
        const aytTrackSelect = document.getElementById('aytTrackSelect');
        const totalNetValue = document.getElementById('totalNetValue');
        const examErrorMsg = document.getElementById('examErrorMsg');

        // Derslerin Soru Sınırları Veritabanı
        const subjectLimits = {
            "Türkçe": 40, "Sosyal Bilimler": 20, "Temel Matematik": 40, "Fen Bilimleri": 20,
            "Matematik": 40, "Fizik": 14, "Kimya": 13, "Biyoloji": 13,
            "Türk Dili ve Edebiyatı": 24, "Tarih-1": 10, "Coğrafya-1": 6,
            "Tarih-2": 11, "Coğrafya-2": 11, "Felsefe Grubu": 12, "Din Kültürü": 6,
            "Yabancı Dil": 80
        };

        const examSubjectsData = {
            tyt: ["Türkçe", "Sosyal Bilimler", "Temel Matematik", "Fen Bilimleri"],
            ayt: {
                sayisal: ["Matematik", "Fizik", "Kimya", "Biyoloji"],
                ea: ["Matematik", "Türk Dili ve Edebiyatı", "Tarih-1", "Coğrafya-1"],
                sozel: ["Türk Dili ve Edebiyatı", "Tarih-1", "Coğrafya-1", "Tarih-2", "Coğrafya-2", "Felsefe Grubu", "Din Kültürü"],
                dil: ["Yabancı Dil"]
            }
        };

        // Canlı Net Hesaplama Fonksiyonu
        function calculateTotalNet() {
            const activeTab = document.querySelector('.exam-tab-btn.active').getAttribute('data-target');
            const container = document.getElementById(activeTab === 'tyt-section' ? 'tyt-subjects-container' : 'ayt-subjects-container');
            
            let totalNet = 0;
            const rows = container.querySelectorAll('.subject-input-row');
            
            rows.forEach(row => {
                const d = parseInt(row.querySelector('.correct-input').value) || 0;
                const y = parseInt(row.querySelector('.incorrect-input').value) || 0;
                totalNet += (d - (y * 0.25)); // 1 Doğru = +1 Net, 1 Yanlış = -0.25 Net
            });

            totalNetValue.innerText = totalNet.toFixed(2); // Virgülden sonra 2 hane gösterir
        }

        // Derslerin HTML Satırlarını Üreten Fonksiyon (Limitlerle Birlikte)
        function generateSubjectInputs(subjects, containerId) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            
            subjects.forEach(subject => {
                const limit = subjectLimits[subject];
                container.innerHTML += `
                    <div class="subject-input-row" data-limit="${limit}" data-subject="${subject}">
                        <div style="display:flex; flex-direction:column; flex:1;">
                            <span class="subject-name">${subject}</span>
                            <span style="font-size:10px; color:#888; margin-top:2px;">(Max: ${limit} Soru)</span>
                        </div>
                        <div class="dyb-inputs">
                            <div class="dyb-box">
                                <label>D</label>
                                <input type="number" min="0" max="${limit}" placeholder="0" class="dyb-input correct-input">
                            </div>
                            <div class="dyb-box">
                                <label>Y</label>
                                <input type="number" min="0" max="${limit}" placeholder="0" class="dyb-input incorrect-input">
                            </div>
                            <div class="dyb-box">
                                <label>B</label>
                                <input type="number" min="0" max="${limit}" placeholder="0" class="dyb-input blank-input">
                            </div>
                        </div>
                    </div>
                `;
            });

            // Girdileri Dinleyen Matematik ve Koruma Kalkanı
            const inputs = container.querySelectorAll('.dyb-input');
            inputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    const row = e.target.closest('.subject-input-row');
                    const limit = parseInt(row.getAttribute('data-limit'));
                    const subjectName = row.getAttribute('data-subject');
                    
                    let d = parseInt(row.querySelector('.correct-input').value) || 0;
                    let y = parseInt(row.querySelector('.incorrect-input').value) || 0;
                    let b = parseInt(row.querySelector('.blank-input').value) || 0;
                    
                    // KORUMA KALKANI: Toplam sayı limiti aşarsa?
                    if ((d + y + b) > limit) {
                        e.target.value = ""; // Son girilen hatalı rakamı otomatik sil
                        examErrorMsg.innerText = `${subjectName} için en fazla ${limit} soru girebilirsiniz!`;
                        examErrorMsg.style.display = 'block';
                        setTimeout(() => examErrorMsg.style.display = 'none', 3000);
                    }
                    
                    calculateTotalNet(); // Rakam her değiştiğinde neti anında güncelle!
                });
            });
        }

        // Modal Açıldığında Çalışacaklar
        openExamModalBtn.addEventListener('click', () => {
            generateSubjectInputs(examSubjectsData.tyt, 'tyt-subjects-container');
            generateSubjectInputs(examSubjectsData.ayt.sayisal, 'ayt-subjects-container');
            aytTrackSelect.value = 'sayisal';
            
            DOM.examTitleInput.value = '';
            DOM.examDateInput.value = '';
            examErrorMsg.style.display = 'none';
            totalNetValue.innerText = "0.00"; // Neti sıfırla
            
            examModal.style.display = 'flex';
        });

        // Kapatma İşlemleri
        function closeExamModal() { examModal.style.display = 'none'; }
        closeExamModalBtn.addEventListener('click', closeExamModal);
        cancelExamBtn.addEventListener('click', closeExamModal);
        window.addEventListener('click', (e) => { if (e.target === examModal) closeExamModal(); });

        // SEKMELER ARASI GEÇİŞ (TYT / AYT)
        const examTabBtns = document.querySelectorAll('.exam-tab-btn');
        examTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                examTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                document.querySelectorAll('.exam-section').forEach(sec => sec.style.display = 'none');
                document.getElementById(btn.getAttribute('data-target')).style.display = 'block';
                
                calculateTotalNet(); // Sekme değişince o sekmenin netini hesapla
            });
        });

        // AYT ALAN SEÇİMİ DEĞİŞTİĞİNDE DERSLERİ GÜNCELLE
        aytTrackSelect.addEventListener('change', (e) => {
            const selectedTrack = e.target.value;
            generateSubjectInputs(examSubjectsData.ayt[selectedTrack], 'ayt-subjects-container');
            calculateTotalNet(); // Alan değişince neti sıfırla/hesapla
        });

        // [TOOLTIP] --- KÜRESEL İPUCU (GLOBAL TOOLTIP) MOTORU ---
        const tooltipEl = document.createElement('div');
        tooltipEl.id = 'global-custom-tooltip';
        document.body.appendChild(tooltipEl);

        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-custom-title]');
            if (target) {
                tooltipEl.innerText = target.getAttribute('data-custom-title');
                const rect = target.getBoundingClientRect();
                
                // Hedefin tam ortasını hesapla ve elementin üstünde çıkar
                tooltipEl.style.left = rect.left + (rect.width / 2) + 'px';
                tooltipEl.style.top = rect.top - tooltipEl.offsetHeight - 8 + 'px'; 
                tooltipEl.classList.add('show');
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('[data-custom-title]')) {
                tooltipEl.classList.remove('show');
            }
        });

        // Tıklanıldığında veya sayfa kaydırıldığında ipucu ekranda asılı kalmasın diye anında gizle
        document.addEventListener('mousedown', () => tooltipEl.classList.remove('show'));
        document.addEventListener('wheel', () => tooltipEl.classList.remove('show'), {passive: true});

        // [DENEME-KART] --- DENEMELERİ (TYT/AYT) EKRANA ÇİZME MOTORU ---
        function renderExamsToScreen() {
            const tytList = document.getElementById('tyt-exam-list');
            const aytList = document.getElementById('ayt-exam-list');
            if(!tytList || !aytList) return;

            const sortedExams = [...savedExams].sort((a, b) => new Date(b.date) - new Date(a.date));
            const tytExams = sortedExams.filter(e => e.type === 'tyt');
            const aytExams = sortedExams.filter(e => e.type === 'ayt');

            const renderMiniList = (container, examsArr, emptyMsg) => {
                container.innerHTML = '';
                if(examsArr.length === 0) {
                    container.innerHTML = `<div class="placeholder-text" style="font-size:12px; margin-top:5px;">${emptyMsg}</div>`;
                    return;
                }

                examsArr.forEach(ex => {
                    container.innerHTML += `
                        <div class="exam-mini-card" onclick="window.viewExamDetails(${ex.id})" style="cursor: pointer;">
                            <div class="exam-mini-card-left">
                                <span class="exam-mini-title" data-custom-title="${ex.title}">${ex.title}</span>
                                <span class="exam-mini-date"><i class="fa-regular fa-calendar-days"></i> ${formatDateToTurkish(ex.date)}</span>
                            </div>
                            <div class="exam-mini-net">${parseFloat(ex.net).toFixed(2)}</div>
                        </div>
                    `;
                });
            };

        renderMiniList(tytList, tytExams, "Henüz TYT denemesi eklemedin...");
        renderMiniList(aytList, aytExams, "Henüz AYT denemesi eklemedin...");
        
        // GRAFİĞİ ASLA UNUTMA: Liste her yenilendiğinde grafik de güncellenir!
        updateChart?.();

        // YENİ EKLENEN: Büyük analiz ekranı (Expanded Modal) açıksa onu da anında güncelle!
        const expandedExamsModal = document.getElementById('expandedExamsModal');
        if (expandedExamsModal && expandedExamsModal.style.display === 'flex') {
            if (typeof window.renderExpandedExamsView === 'function') {
                window.renderExpandedExamsView();
            }
        }
    }

    window.renderExamsToScreen = renderExamsToScreen;

        // --- DENEME LİSTELERİ İÇİN YUMUŞAK & YAVAŞ KAYDIRMA MOTORU ---
        const examMiniLists = document.querySelectorAll('.exam-mini-list');
        examMiniLists.forEach(list => {
            list.addEventListener('wheel', (e) => {
                e.preventDefault(); 
                list.scrollTop += e.deltaY * 0.25; 
            }, { passive: false });
        });

        // [GRAFIK] --- GELİŞİM GRAFİĞİ (CHART.JS) MOTORU ---
        let netChartInstance = null;
        let currentChartType = 'tyt'; 

        function updateChart() {
            const canvasEl = document.getElementById('netChart');
            if (!canvasEl) return;

            const filteredExams = savedExams
                .filter(e => e.type === currentChartType)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            const examData = filteredExams.map(e => ({
                x: new Date(e.date).getTime(), // Çizgideki gerçek mesafeyi ayarlayacak zaman damgası
                y: parseFloat(e.net),
                title: e.title,
                dateStr: formatDateToTurkish(e.date) // Tooltip'te okumak için
            }));

            // YENİ EKLENEN: X Eksenini 2 gün geriye ve ileriye esnetme payı (1 Gün = 86400000 ms)
            let xAxisMin = undefined;
            let xAxisMax = undefined;
            if (filteredExams.length > 0) {
                const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
                xAxisMin = new Date(filteredExams[0].date).getTime() - twoDaysMs;
                xAxisMax = new Date(filteredExams[filteredExams.length - 1].date).getTime() + twoDaysMs;
            }

            if (netChartInstance) {
                netChartInstance.destroy();
            }

            netChartInstance = new Chart(canvasEl, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Net Skoru',
                        data: examData,
                        borderColor: currentChartType === 'tyt' ? 'var(--color-primary)' : '#ffc107', 
                        backgroundColor: currentChartType === 'tyt' ? 'rgba(0, 123, 255, 0.1)' : 'rgba(255, 193, 7, 0.1)',
                        borderWidth: 2,
                        pointBackgroundColor: '#17a2b8',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 4, 
                        pointHoverRadius: 6,
                        fill: true, 
                        tension: 0.1 
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { 
                            type: 'linear',                            min: xAxisMin,
                            max: xAxisMax,
                            ticks: { 
                                font: { size: 10 },
                                maxRotation: 45,
                                callback: function(value) {
                                    // Sayısal değeri X ekseninde GG.AA.YYYY formatında tarihe çevir
                                    const d = new Date(value);
                                    return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
                                }
                            }, 
                            grid: { display: false } 
                        },
                        y: { beginAtZero: true, min: 0, ticks: { font: { size: 10 } }, border: { dash: [4, 4] } }
                    },
                    plugins: {
                        legend: { display: false }, 
                        tooltip: { 
                            callbacks: { 
                                title: function(tooltipItems) {
                                    const raw = tooltipItems[0].raw;
                                    return raw.title + ' (' + raw.dateStr + ')';
                                },
                                label: function(context) { return ' ' + context.parsed.y + ' Net'; } 
                            } 
                        }
                    }
                }
            });
        }

        document.querySelectorAll('.chart-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-toggle-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                currentChartType = e.target.getAttribute('data-chart');
                updateChart(); 
            });
        });

        // [DENEME-DETAY] --- DENEME GÖRÜNTÜLEME VE DÜZENLEME MOTORU ---
        let currentViewingExam = null;
        let editingExamId = null;
        let originalExamEditState = null;
        const viewExamModal = document.getElementById('viewExamModal');

        window.viewExamDetails = function(id) {
            const exam = savedExams.find(e => e.id === id);
            if(!exam) return;
            currentViewingExam = exam;

            document.getElementById('viewExamTitle').innerText = exam.title;
            document.getElementById('viewExamDate').innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${formatDateToTurkish(exam.date)}`;
            document.getElementById('viewExamTotalNet').innerText = parseFloat(exam.net).toFixed(2);
            
            let trackName = exam.type === 'tyt' ? 'TYT Genel' : `AYT - ${exam.track}`;
            document.getElementById('viewExamTrackBadge').innerText = trackName;

            const subjectsContainer = document.getElementById('viewExamSubjects');
            subjectsContainer.innerHTML = '';

            // Kaydettiğimiz ders detaylarını (D/Y/B) ekrana basıyoruz
            if(exam.subjects && exam.subjects.length > 0) {
                exam.subjects.forEach(sub => {
                    if (sub.d === 0 && sub.y === 0 && sub.b === 0 && sub.net === 0) return; // Boşları gizle

                    subjectsContainer.innerHTML += `
                        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed var(--color-primary-border); padding-bottom: 6px;">
                            <span style="font-size: 13px; font-weight: 800; color: var(--color-text-secondary);">${sub.name}</span>
                            <div style="display: flex; gap: 8px; font-size: 11px; font-weight: 700;">
                                <span style="color: var(--color-success); background: #e6f9ed; padding: 2px 6px; border-radius: var(--radius-xs);">${sub.d} D</span>
                                <span style="color: var(--color-danger); background: #fdf3f2; padding: 2px 6px; border-radius: var(--radius-xs);">${sub.y} Y</span>
                                <span style="color: #6c757d; background: var(--color-bg-input); padding: 2px 6px; border-radius: var(--radius-xs);">${sub.b} B</span>
                                <span style="color: #17a2b8; font-weight: 900; background: #e0f7fa; padding: 2px 6px; border-radius: var(--radius-xs); margin-left: 5px;">${sub.net.toFixed(2)} Net</span>
                            </div>
                        </div>
                    `;
                });
            } else {
                subjectsContainer.innerHTML = '<span style="font-size:12px; color:#888;">Eski kayıt olduğu için detaylı ders verisi bulunmuyor. Düzenleyerek ekleyebilirsiniz.</span>';
            }

            viewExamModal.style.display = 'flex';
        };

        // Kapatma İşlemleri
        document.getElementById('closeViewExamModalBtn').addEventListener('click', () => { viewExamModal.style.display = 'none'; });
        document.getElementById('closeViewExamBtn').addEventListener('click', () => { viewExamModal.style.display = 'none'; });
        window.addEventListener('click', (e) => { if (e.target === viewExamModal) viewExamModal.style.display = 'none'; });

        // DÜZENLE BUTONUNA TIKLANDIĞINDA
        document.getElementById('editExamBtn').addEventListener('click', () => {
            if(!currentViewingExam) return;
            
            editingExamId = currentViewingExam.id;
            viewExamModal.style.display = 'none';
            
            const examModal = document.getElementById('examModal');
            document.querySelector('#examModal h3') ? document.querySelector('#examModal h3').innerText = "Denemeyi Düzenle" : null;
            
            const tabBtn = document.querySelector(`.exam-tab-btn[data-target="${currentViewingExam.type}-section"]`);
            if(tabBtn) tabBtn.click();

            // Önce ders kutularını ilgili alana göre oluşturuyoruz
            if (currentViewingExam.type === 'ayt') {
                document.getElementById('aytTrackSelect').value = currentViewingExam.track;
                generateSubjectInputs(examSubjectsData.ayt[currentViewingExam.track], 'ayt-subjects-container');
            } else {
                generateSubjectInputs(examSubjectsData.tyt, 'tyt-subjects-container');
            }

            DOM.examTitleInput.value = currentViewingExam.title;
            DOM.examDateInput.value = currentViewingExam.date;

            const container = document.getElementById(currentViewingExam.type === 'tyt' ? 'tyt-subjects-container' : 'ayt-subjects-container');
            
            // Veritabanındaki Doğru/Yanlış değerlerini kutulara dolduruyoruz
            if(currentViewingExam.subjects) {
                currentViewingExam.subjects.forEach(sub => {
                    const row = container.querySelector(`.subject-input-row[data-subject="${sub.name}"]`);
                    if (row) {
                        if(sub.d > 0) row.querySelector('.correct-input').value = sub.d;
                        if(sub.y > 0) row.querySelector('.incorrect-input').value = sub.y;
                        if(sub.b > 0) row.querySelector('.blank-input').value = sub.b;
                    }
                });
            }
            
            calculateTotalNet(); 

            // Çıkış uyarısı için fotoğraf çek
            originalExamEditState = {
                title: currentViewingExam.title,
                date: currentViewingExam.date,
                net: currentViewingExam.net,
                type: currentViewingExam.type,
                track: currentViewingExam.track
            };

            examModal.style.display = 'flex';
        });

        // --- DENEMEYİ FIREBASE'E KAYDETME VE GÜNCELLEME MOTORU ---
        function hasExamFormChanged() {
            if (!editingExamId || !originalExamEditState) return false;
            const currentTitle = DOM.examTitleInput.value.trim();
            const currentDate = DOM.examDateInput.value;
            const currentNet = document.getElementById('totalNetValue').innerText;
            const activeTab = document.querySelector('.exam-tab-btn.active').getAttribute('data-target');
            const currentType = activeTab === 'tyt-section' ? 'tyt' : 'ayt';
            const currentTrack = currentType === 'ayt' ? document.getElementById('aytTrackSelect').value : null;

            if (currentTitle !== originalExamEditState.title) return true;
            if (currentDate !== originalExamEditState.date) return true;
            if (currentNet !== originalExamEditState.net) return true;
            if (currentType !== originalExamEditState.type) return true;
            if (currentTrack !== originalExamEditState.track) return true;
            return false;
        }

        function closeExamModalAndClear() {
            const examModal = document.getElementById('examModal');
            if(examModal) examModal.style.display = 'none';
            
            document.querySelector('#examModal h3') ? document.querySelector('#examModal h3').innerText = "Yeni Deneme Ekle" : null;
            DOM.examTitleInput.value = '';
            DOM.examDateInput.value = '';
            document.getElementById('totalNetValue').innerText = '0.00';
            document.querySelectorAll('.dyb-input').forEach(input => input.value = '');
            
            const savedEditId = editingExamId;
            editingExamId = null;
            originalExamEditState = null;

            if(savedEditId) window.viewExamDetails(savedEditId);
        }

        function attemptCloseExamModal() {
            if (editingExamId && hasExamFormChanged()) {
                document.getElementById('examCancelConfirmModal').style.display = 'flex';
            } else {
                closeExamModalAndClear(); 
            }
        }

        // Çarpı ve İptal Butonlarının Güvenli Çıkışı (Eski hatalı butonları eziyoruz)
        const closeExamModalBtnNode = document.getElementById('closeExamModalBtn');
        const cancelExamBtnNode = document.getElementById('cancelExamBtn');
        if(closeExamModalBtnNode) {
            const newCloseBtn = closeExamModalBtnNode.cloneNode(true);
            closeExamModalBtnNode.parentNode.replaceChild(newCloseBtn, closeExamModalBtnNode);
            newCloseBtn.addEventListener('click', attemptCloseExamModal);
        }
        if(cancelExamBtnNode) {
            const newCancelBtn = cancelExamBtnNode.cloneNode(true);
            cancelExamBtnNode.parentNode.replaceChild(newCancelBtn, cancelExamBtnNode);
            newCancelBtn.addEventListener('click', attemptCloseExamModal);
        }

        // Açılış modalı temizliği (Yeni eklemeler sıfırdan başlasın diye)
        document.getElementById('openExamModalBtn').addEventListener('click', () => {
            editingExamId = null;
            originalExamEditState = null;
        });

        const saveExamBtn = document.getElementById('saveExamBtn');
        if(saveExamBtn) {
            const newSaveExamBtn = saveExamBtn.cloneNode(true);
            saveExamBtn.parentNode.replaceChild(newSaveExamBtn, saveExamBtn);
            
            newSaveExamBtn.addEventListener('click', () => {
                if (!currentUserUid) {
                    alert("Lütfen giriş yapın!");
                    return;
                }
                
                const titleVal = DOM.examTitleInput.value.trim();
                const dateVal = DOM.examDateInput.value;
                if (titleVal.length === 0 || dateVal.length === 0) {
                    const examErrorMsg = document.getElementById('examErrorMsg');
                    examErrorMsg.innerText = "Lütfen Deneme Adı ve Tarihini girin!";
                    examErrorMsg.style.display = 'block';
                    setTimeout(() => examErrorMsg.style.display = 'none', 3000);
                    return;
                }

                if (editingExamId && !hasExamFormChanged()) {
                    closeExamModalAndClear();
                    return;
                }
                
                if (editingExamId && hasExamFormChanged()) {
                    document.getElementById('examSaveConfirmModal').style.display = 'flex';
                } else {
                    executeSaveExam();
                }
            });
        }

        document.getElementById('yesExamSaveBtn').addEventListener('click', () => {
            document.getElementById('examSaveConfirmModal').style.display = 'none';
            executeSaveExam();
        });
        document.getElementById('yesExamCancelBtn').addEventListener('click', () => {
            document.getElementById('examCancelConfirmModal').style.display = 'none';
            closeExamModalAndClear();
        });

        // Veritabanına Gerçek Kayıt Motoru (Dersler Artık Kaybolmuyor)
        async function executeSaveExam() {
            const saveBtn = document.getElementById('saveExamBtn') || document.querySelector('.save-note-btn[id="saveExamBtn"]');
            const titleVal = DOM.examTitleInput.value.trim();
            const dateVal = DOM.examDateInput.value;
            const activeTab = document.querySelector('.exam-tab-btn.active').getAttribute('data-target');
            const examType = activeTab === 'tyt-section' ? 'tyt' : 'ayt';
            const track = examType === 'ayt' ? document.getElementById('aytTrackSelect').value : null;
            const totalNet = document.getElementById('totalNetValue').innerText;

            // Ders Detaylarını Toplama İşlemi
            const container = document.getElementById(activeTab === 'tyt-section' ? 'tyt-subjects-container' : 'ayt-subjects-container');
            const rows = container.querySelectorAll('.subject-input-row');
            let subjectsData = [];
            
            rows.forEach(row => {
                const subjectName = row.getAttribute('data-subject');
                const d = parseInt(row.querySelector('.correct-input').value) || 0;
                const y = parseInt(row.querySelector('.incorrect-input').value) || 0;
                const b = parseInt(row.querySelector('.blank-input').value) || 0;
                const net = d - (y * 0.25);
                subjectsData.push({ name: subjectName, d: d, y: y, b: b, net: net });
            });

            const newExam = {
                id: editingExamId ? editingExamId : Date.now(),
                title: titleVal,
                date: dateVal,
                type: examType,
                track: track,
                net: totalNet,
                subjects: subjectsData // İŞTE BU KISIM EKSİKTİ, ARTIK FIREBASE'E GİDİYOR!
            };

            const originalText = saveBtn.innerText;
            saveBtn.innerText = "Kaydediliyor...";
            saveBtn.disabled = true;

            try {
                const examDocRef = doc(db, "users", currentUserUid, "userExams", newExam.id.toString());
                await setDoc(examDocRef, newExam);

                if (editingExamId) {
                    const index = savedExams.findIndex(e => e.id === editingExamId);
                    if(index !== -1) savedExams[index] = newExam;
                } else {
                    savedExams.push(newExam);
                }

                renderExamsToScreen(); 
                
                currentViewingExam = newExam;
                closeExamModalAndClear(); 
                
            } catch (error) {
                alert("Sistem Hatası: Deneme kaydedilemedi.");
            } finally {
                saveBtn.innerText = originalText;
                saveBtn.disabled = false;
            }
        }

        // --- DENEME SİLME MOTORU VE BUTON GÖRÜNÜRLÜĞÜ ---
        
        // Yeni ekle derken "Sil" butonunu gizle
        document.getElementById('openExamModalBtn').addEventListener('click', () => {
            const deleteBtn = document.getElementById('deleteExamBtn');
            if(deleteBtn) deleteBtn.style.display = 'none';
        });

        // "Düzenle" derken "Sil" butonunu görünür yap
        document.getElementById('editExamBtn').addEventListener('click', () => {
            const deleteBtn = document.getElementById('deleteExamBtn');
            if(deleteBtn) deleteBtn.style.display = 'block';
        });

        const deleteExamBtn = document.getElementById('deleteExamBtn');
        if (deleteExamBtn) {
            deleteExamBtn.addEventListener('click', () => {
                document.getElementById('examDeleteConfirmModal').style.display = 'flex';
            });
        }

        // Asıl Silme İşlemi (Firebase + Arayüz)
        document.getElementById('yesExamDeleteBtn').addEventListener('click', async () => {
            document.getElementById('examDeleteConfirmModal').style.display = 'none';
            if (!currentUserUid || !editingExamId) return;

            const originalText = deleteExamBtn.innerHTML;
            deleteExamBtn.innerHTML = "Siliniyor...";
            deleteExamBtn.disabled = true;

            try {
                // Veritabanından (Firestore) sil
                await deleteDoc(doc(db, "users", currentUserUid, "userExams", editingExamId.toString()));
                
                // Ekran hafızasından sil
                savedExams = savedExams.filter(e => e.id !== editingExamId);
                
                // Ekranları ve grafiği güncelle
                renderExamsToScreen();
                
                // Modalı sıfırlayıp kapat
                const examModal = document.getElementById('examModal');
                if(examModal) examModal.style.display = 'none';
                editingExamId = null;
                originalExamEditState = null;
                
            } catch (error) {
                alert("Sistem Hatası: Deneme silinemedi.");
            } finally {
                deleteExamBtn.innerHTML = originalText;
                deleteExamBtn.disabled = false;
            }
        });

