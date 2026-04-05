        // [DERSLER] 4. DİNAMİK DERS VE MENÜ MOTORU
        let currentExam = "tyt"; 
        let currentTrack = "sayisal"; 

        const lessonData = {
            tyt: [
                { name: "Türkçe", icon: "fa-book-open" },
                { name: "Sosyal Bilimler", icon: "fa-globe" },
                { name: "Temel Matematik", icon: "fa-calculator" },
                { name: "Fen Bilimleri", icon: "fa-flask" }
            ],
            ayt: {
                sayisal: [
                    { name: "Matematik", icon: "fa-calculator" },
                    { name: "Fizik", icon: "fa-atom" },
                    { name: "Kimya", icon: "fa-vial" },
                    { name: "Biyoloji", icon: "fa-dna" }
                ],
                ea: [
                    { name: "Matematik", icon: "fa-calculator" },
                    { name: "Edebiyat", icon: "fa-book" },
                    { name: "Tarih (1)", icon: "fa-landmark" },
                    { name: "Coğrafya (1)", icon: "fa-earth-europe" }
                ],
                sozel: [
                    { name: "Edebiyat", icon: "fa-book" },
                    { name: "Tarih (1-2)", icon: "fa-landmark" },
                    { name: "Coğrafya (1-2)", icon: "fa-earth-europe" },
                    { name: "Felsefe Grubu", icon: "fa-brain" },
                    { name: "Din Kültürü", icon: "fa-mosque" }
                ],
                dil: ["İngilizce", "Almanca", "Arapça", "Fransızca", "Rusça"]
            }
        };

        const subjectContainer = document.getElementById("subject-container");

        function renderLessons() {
            subjectContainer.innerHTML = ""; 
            if (currentExam === "tyt") {
                lessonData.tyt.forEach(lesson => {
                    const col = document.createElement('div');
                    col.className = 'lesson-column';
                    col.innerHTML = `<i class="fa-solid ${lesson.icon} lesson-icon"></i><span class="lesson-name">${lesson.name}</span>`;
                    col.addEventListener('click', () => openLessonDetail(lesson.name));
                    subjectContainer.appendChild(col);
                });
            } else {
                if (currentTrack === "dil") {
                    let sidebarHtml = '<div class="lang-sidebar">';
                    lessonData.ayt.dil.forEach((lang, index) => {
                        let activeClass = index === 0 ? "active" : "";
                        sidebarHtml += `<button class="lang-btn ${activeClass}" onclick="window.selectLanguage('${lang}', this)">${lang}</button>`;
                    });
                    sidebarHtml += '</div>';
                    
                    let contentHtml = `
                        <div class="lang-content">
                            <div class="lesson-column" style="width: 100%; height: 100%; cursor: default; transform: none; box-shadow: none;">
                                <i class="fa-solid fa-language lesson-icon" style="font-size: 30px; margin-bottom: 10px;"></i>
                                <span class="lesson-name" id="selected-lang-title" style="font-size: 16px;">${lessonData.ayt.dil[0]}</span>
                            </div>
                        </div>
                    `;
                    subjectContainer.innerHTML = `<div class="lang-container">${sidebarHtml}${contentHtml}</div>`;
                } else {
                    lessonData.ayt[currentTrack].forEach(lesson => {
                        const col = document.createElement('div');
                        col.className = 'lesson-column';
                        col.innerHTML = `<i class="fa-solid ${lesson.icon} lesson-icon"></i><span class="lesson-name">${lesson.name}</span>`;
                        col.addEventListener('click', () => openLessonDetail(lesson.name));
                        subjectContainer.appendChild(col);
                    });
                }
            }
        }

        // Ders detay görünümü: Konular / Playlistler
        function openLessonDetail(lessonName) {
            showLessonMenu(lessonName);
        }

        function showLessonMenu(lessonName) {
            // Header'ı gizle, container tam alanı kaplasın
            document.querySelector('.subject-header').style.display = 'none';
            subjectContainer.style.flex = '1';

            subjectContainer.innerHTML = `
                <div style="display:flex; flex-direction:column; width:100%; height:100%; min-height:0; gap:10px;">
                    <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                        <button id="lessonMenuBackBtn" style="background:var(--color-bg-hover); border:none; color:var(--color-primary); width:28px; height:28px; border-radius:var(--radius-md); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:var(--transition-fast);" onmouseover="this.style.background='var(--color-primary)';this.style.color='#fff'" onmouseout="this.style.background='var(--color-bg-hover)';this.style.color='var(--color-primary)'">
                            <i class="fa-solid fa-arrow-left" style="font-size:11px;"></i>
                        </button>
                        <span style="font-size:13px; font-weight:800; color:var(--color-text-main); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${lessonName}</span>
                    </div>
                    <div style="display:flex; flex-direction:row; gap:10px; flex:1; min-height:0;">
                        <button id="btnKonular" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; background:var(--color-bg-input); border:2px solid var(--color-border); border-radius:var(--radius-lg); cursor:pointer; transition:var(--transition-fast); font-family:inherit;"
                            onmouseover="this.style.background='var(--color-primary-lighter)';this.style.borderColor='var(--color-primary-border)'"
                            onmouseout="this.style.background='var(--color-bg-input)';this.style.borderColor='var(--color-border)'">
                            <i class="fa-solid fa-list-check" style="font-size:26px; color:var(--color-primary);"></i>
                            <span style="font-size:13px; font-weight:800; color:var(--color-text-main);">Konular</span>
                        </button>
                        <button id="btnPlaylistler" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; background:var(--color-bg-input); border:2px solid var(--color-border); border-radius:var(--radius-lg); cursor:pointer; transition:var(--transition-fast); font-family:inherit;"
                            onmouseover="this.style.background='#fff0f0';this.style.borderColor='#ffaaaa'"
                            onmouseout="this.style.background='var(--color-bg-input)';this.style.borderColor='var(--color-border)'">
                            <i class="fa-brands fa-youtube" style="font-size:26px; color:#ff4444;"></i>
                            <span style="font-size:13px; font-weight:800; color:var(--color-text-main);">Playlistler</span>
                        </button>
                    </div>
                </div>
            `;
            document.getElementById('lessonMenuBackBtn').addEventListener('click', () => {
                document.querySelector('.subject-header').style.display = '';
                subjectContainer.style.flex = '';
                renderLessons();
            });
            document.getElementById('btnKonular').addEventListener('click', () => showLessonKonular(lessonName));
            document.getElementById('btnPlaylistler').addEventListener('click', () => showLessonPlaylistler(lessonName));
        }

        // [KONULAR] --- KONU VERİLERİ ---
        const topicData = {
            "Türkçe": ["Sözcükte Anlam","Söz Yorumu","Deyim ve Atasözü","Cümlede Anlam","Paragrafta Anlatım Teknikleri","Paragrafta Düşünceyi Geliştirme Yolları","Paragrafta Yapı","Paragrafta Konu-Ana Düşünce","Paragrafta Yardımcı Düşünce","Ses Bilgisi","Yazım Kuralları","Noktalama İşaretleri","Sözcükte Yapı/Ekler","İsimler","Zamirler","Sıfatlar","Zarflar","Edat – Bağlaç – Ünlem","Fiilde Anlam (Kip-Kişi-Yapı)","Ek Fiil","Fiilimsi","Fiilde Çatı","Sözcük Grupları","Cümlenin Ögeleri","Cümle Türleri","Anlatım Bozukluğu"],
            "Sosyal Bilimler": ["Tarih Bilimi","Osmanlı Tarihi","Türk İnkılap Tarihi","Coğrafya Temel Kavramlar","Türkiye Coğrafyası","Felsefe","Psikoloji","Sosyoloji","Mantık","Din Kültürü"],
            "Temel Matematik": ["Sayılar","Bölme-Bölünebilme","Rasyonel Sayılar","Üslü Sayılar","Köklü Sayılar","Çarpanlara Ayırma","Denklemler","Problemler","Kümeler","Fonksiyonlar","Permütasyon","Olasılık","İstatistik","Dörtgenler","Trigonometri"],
            "Fen Bilimleri": ["Fizik: Hareket","Fizik: Kuvvet","Fizik: Elektrik","Kimya: Atom","Kimya: Periyodik Tablo","Kimya: Bağlar","Kimya: Madde","Biyoloji: Hücre","Biyoloji: Canlılar","Biyoloji: Genetik"],
            "Matematik": ["Fonksiyonlar","Polinomlar","Logaritma","Diziler","İkinci Dereceden Denklemler","Trigonometri","Vektörler","Karmaşık Sayılar","Permütasyon","Kombinasyon","Binom","Olasılık","İstatistik","Limit","Türev","İntegral","Analitik Geometri","Doğrular","Çember","Parabol"],
            "Fizik": ["Vektörler","Kinematik","Dinamik","İş-Enerji","Momentum","Tork","Basit Harmonik Hareket","Dalgalar","Optik","Elektrostatik","Elektrik Akımı","Manyetizma","Modern Fizik"],
            "Kimya": ["Atom Modelleri","Periyodik Tablo","Kimyasal Bağlar","Maddenin Halleri","Çözeltiler","Asit-Baz","Kimyasal Denge","Kimyasal Tepkimeler","Elektrokimya","Organik Kimya"],
            "Biyoloji": ["Hücre","Hücre Bölünmesi","Kalıtım","Genetik Mühendisliği","Canlıların Sınıflandırılması","Bitkiler","Hayvanlar","Ekosistem","Fotosentez","Solunum","Dolaşım Sistemi","Sinir Sistemi"],
            "Edebiyat": ["Şiir Bilgisi","Edebi Sanatlar","Halk Edebiyatı","Divan Edebiyatı","Tanzimat Edebiyatı","Servet-i Fünun","Milli Edebiyat","Cumhuriyet Edebiyatı","Roman","Hikâye","Tiyatro"],
            "Tarih (1)": ["İlk Uygarlıklar","Orta Çağ","Osmanlı Kuruluş","Osmanlı Yükselme","Osmanlı Gerileme","Osmanlı Çöküş","Fransız İhtilali","Sanayi Devrimi"],
            "Tarih (1-2)": ["İlk Çağ","Orta Çağ","Yeni Çağ","Yakın Çağ","Osmanlı Tarihi","Kurtuluş Savaşı","Atatürk Dönemi","Türkiye Cumhuriyeti"],
            "Coğrafya (1)": ["Doğa ve İnsan","İklim","Yeryüzü Şekilleri","Nüfus","Yerleşme","Ekonomi"],
            "Coğrafya (1-2)": ["Harita","İklim Tipleri","Türkiye İklimi","Türkiye Nüfusu","Tarım","Sanayi","Enerji","Çevre"],
            "Felsefe Grubu": ["Felsefenin Alanı","Bilgi Felsefesi","Varlık Felsefesi","Ahlak Felsefesi","Siyaset Felsefesi","Mantık","Psikoloji","Sosyoloji"],
            "Din Kültürü": ["İslam'ın Temel Kavramları","İbadetler","Kuran","Hz. Muhammed","İslam Tarihi","Diyanet ve Din Hizmetleri"],
            "İngilizce": ["Tenses","Modals","Conditionals","Passive Voice","Relative Clauses","Reported Speech","Vocabulary","Reading","Listening","Writing"],
            "Almanca": ["Grammatik","Zeiten","Modalverben","Wortschatz","Lesen","Hören"],
            "Arapça": ["Alfabe","Gramer","Fiiller","İsimler","Cümle Yapısı"],
            "Fransızca": ["Grammaire","Les Temps","Vocabulaire","Lecture","Expression"],
            "Rusça": ["Алфавит","Грамматика","Глаголы","Существительные","Разговор"]
        };

        window.completedTopics = window.completedTopics || {};

        async function saveCompletedTopics() {
            if (!currentUserUid) return;
            try {
                await setDoc(doc(db, "users", currentUserUid), { completedTopics: window.completedTopics }, { merge: true });
            } catch(e) { console.error(e); }
        }

        function showLessonKonular(lessonName) {
            const topics      = topicData[lessonName] || [];
            const completed   = window.completedTopics[lessonName] || [];
            const doneCount   = completed.length;
            const undoneCount = topics.length - doneCount;
            const pct = topics.length > 0 ? Math.round((doneCount / topics.length) * 100) : 0;

            const widget = subjectContainer.closest('.subject-widget');
            if (widget) widget.style.position = 'relative';

            subjectContainer.innerHTML = `
                <div style="display:flex;flex-direction:column;width:100%;height:100%;min-height:0;gap:8px;">
                    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                        <button id="lessonKonularBackBtn" style="background:var(--color-bg-hover);border:none;color:var(--color-primary);width:28px;height:28px;border-radius:var(--radius-md);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:var(--transition-fast);" onmouseover="this.style.background='var(--color-primary)';this.style.color='#fff'" onmouseout="this.style.background='var(--color-bg-hover)';this.style.color='var(--color-primary)'">
                            <i class="fa-solid fa-arrow-left" style="font-size:11px;"></i>
                        </button>
                        <span style="font-size:13px;font-weight:800;color:var(--color-text-main);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${lessonName} <span style="color:var(--color-primary);">· Konular</span></span>
                        <button id="topicDetailBtn" style="background:var(--color-bg-hover);border:1px solid var(--color-border);color:var(--color-primary);width:28px;height:28px;border-radius:var(--radius-md);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:var(--transition-fast);" onmouseover="this.style.background='var(--color-primary)';this.style.color='#fff'" onmouseout="this.style.background='var(--color-bg-hover)';this.style.color='var(--color-primary)'" data-custom-title="Tümünü Yönet">
                            <i class="fa-solid fa-sliders" style="font-size:11px;"></i>
                        </button>
                    </div>
                    <div style="flex-shrink:0;background:var(--color-border);border-radius:4px;height:5px;overflow:hidden;">
                        <div style="width:${pct}%;height:100%;background:var(--color-success);border-radius:4px;transition:width 0.4s ease;"></div>
                    </div>
                    <div style="display:flex;flex-direction:row;gap:10px;flex:1;min-height:0;">
                        <button id="btnTamamlananlar" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:var(--color-success-light);border:2px solid var(--color-success-border);border-radius:var(--radius-lg);cursor:pointer;transition:var(--transition-fast);font-family:inherit;">
                            <i class="fa-solid fa-check-circle" style="font-size:26px;color:var(--color-success);"></i>
                            <span style="font-size:13px;font-weight:800;color:var(--color-success);">Tamamlanan</span>
                            <span style="font-size:18px;font-weight:900;color:var(--color-success);">${doneCount}</span>
                        </button>
                        <button id="btnTamamlanmayanlar" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:var(--color-bg-input);border:2px solid var(--color-border);border-radius:var(--radius-lg);cursor:pointer;transition:var(--transition-fast);font-family:inherit;">
                            <i class="fa-solid fa-circle-half-stroke" style="font-size:26px;color:var(--color-primary);"></i>
                            <span style="font-size:13px;font-weight:800;color:var(--color-text-main);">Tamamlanmayan</span>
                            <span style="font-size:18px;font-weight:900;color:var(--color-primary);">${undoneCount}</span>
                        </button>
                    </div>
                </div>

                <div id="topicDetailOverlay" style="display:none;position:absolute;inset:0;background:rgba(0,0,0,0.35);border-radius:var(--radius-xl);z-index:50;backdrop-filter:blur(2px);"></div>
                <div id="topicDetailPopup" style="display:none;position:absolute;inset:8px;background:var(--color-bg-card);border-radius:var(--radius-lg);box-shadow:var(--shadow-modal);z-index:51;flex-direction:column;gap:0;overflow:hidden;animation:slideUp 0.2s ease;">
                    <div style="display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--color-border);flex-shrink:0;background:var(--color-bg-input);">
                        <span style="font-size:13px;font-weight:800;color:var(--color-text-main);flex:1;">${lessonName} · Konular</span>
                        <button id="topicDetailCloseBtn" style="background:none;border:none;font-size:18px;color:var(--color-text-muted);cursor:pointer;line-height:1;transition:color 0.2s;" onmouseover="this.style.color='var(--color-danger)'" onmouseout="this.style.color='var(--color-text-muted)'">&times;</button>
                    </div>
                    <div style="display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid var(--color-border);flex-shrink:0;">
                        <button id="topicMarkAllBtn" style="flex:1;padding:7px;background:var(--color-success-light);border:1px solid var(--color-success-border);border-radius:var(--radius-md);color:var(--color-success);font-size:11px;font-weight:800;cursor:pointer;transition:var(--transition-fast);" onmouseover="this.style.background='var(--color-success)';this.style.color='#fff'" onmouseout="this.style.background='var(--color-success-light)';this.style.color='var(--color-success)'">
                            <i class="fa-solid fa-check-double"></i> Tümünü Tamamla
                        </button>
                        <button id="topicClearAllBtn" style="flex:1;padding:7px;background:var(--color-danger-light);border:1px solid var(--color-danger-border);border-radius:var(--radius-md);color:var(--color-danger);font-size:11px;font-weight:800;cursor:pointer;transition:var(--transition-fast);" onmouseover="this.style.background='var(--color-danger)';this.style.color='#fff'" onmouseout="this.style.background='var(--color-danger-light)';this.style.color='var(--color-danger)'">
                            <i class="fa-solid fa-rotate-left"></i> Sıfırla
                        </button>
                    </div>
                    <div id="topicDetailList" style="flex:1;overflow-y:auto;padding:8px 14px;display:flex;flex-direction:column;gap:4px;"></div>
                </div>
            `;

            document.getElementById('lessonKonularBackBtn').addEventListener('click', () => {
                if (widget) widget.style.position = '';
                showLessonMenu(lessonName);
            });
            document.getElementById('btnTamamlananlar').addEventListener('click', () => showTopicFilteredList(lessonName, true));
            document.getElementById('btnTamamlanmayanlar').addEventListener('click', () => showTopicFilteredList(lessonName, false));
            document.getElementById('topicDetailBtn').addEventListener('click', () => openTopicDetailPopup(lessonName));
        }

        function showTopicFilteredList(lessonName, showDone) {
            const topics    = topicData[lessonName] || [];
            const completed = window.completedTopics[lessonName] || [];
            const filtered  = topics.filter(t => showDone ? completed.includes(t) : !completed.includes(t));
            const accentColor = showDone ? 'var(--color-success)' : 'var(--color-primary)';
            const label       = showDone ? 'Tamamlanan' : 'Tamamlanmayan';

            let listHtml = '';
            if (filtered.length === 0) {
                listHtml = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:8px;color:var(--color-text-muted);">
                    <i class="fa-solid ${showDone ? 'fa-check-circle' : 'fa-circle-half-stroke'}" style="font-size:24px;color:${accentColor};opacity:0.4;"></i>
                    <span style="font-size:12px;font-weight:700;">${showDone ? 'Henüz tamamlanan konu yok.' : 'Tüm konular tamamlandı!'}</span>
                </div>`;
            } else {
                listHtml = filtered.map(topic => `
                    <div style="display:flex;align-items:center;gap:10px;padding:8px 6px;border-bottom:1px solid var(--color-border);">
                        <div style="width:20px;height:20px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;
                            background:${showDone ? 'var(--color-success)' : 'var(--color-bg-input)'};
                            border:2px solid ${showDone ? 'var(--color-success)' : 'var(--color-border-medium)'};">
                            ${showDone ? '<i class="fa-solid fa-check" style="font-size:9px;color:#fff;"></i>' : ''}
                        </div>
                        <span style="font-size:12px;font-weight:${showDone ? '700' : '600'};color:${showDone ? 'var(--color-success)' : 'var(--color-text-main)'};text-decoration:${showDone ? 'line-through' : 'none'};flex:1;">${topic}</span>
                    </div>`).join('');
            }

            subjectContainer.innerHTML = `
                <div style="display:flex;flex-direction:column;width:100%;height:100%;min-height:0;gap:8px;">
                    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                        <button id="topicFilterBackBtn" style="background:var(--color-bg-hover);border:none;color:var(--color-primary);width:28px;height:28px;border-radius:var(--radius-md);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:var(--transition-fast);" onmouseover="this.style.background='var(--color-primary)';this.style.color='#fff'" onmouseout="this.style.background='var(--color-bg-hover)';this.style.color='var(--color-primary)'">
                            <i class="fa-solid fa-arrow-left" style="font-size:11px;"></i>
                        </button>
                        <span style="font-size:13px;font-weight:800;color:var(--color-text-main);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${lessonName} <span style="color:${accentColor};">· ${label}</span></span>
                        <span style="font-size:11px;font-weight:800;color:${accentColor};flex-shrink:0;">${filtered.length}</span>
                    </div>
                    <div style="flex:1;overflow-y:auto;min-height:0;">${listHtml}</div>
                </div>
            `;
            document.getElementById('topicFilterBackBtn').addEventListener('click', () => showLessonKonular(lessonName));
        }

        function openTopicDetailPopup(lessonName) {
            const topics    = topicData[lessonName] || [];
            const overlay   = document.getElementById('topicDetailOverlay');
            const popup     = document.getElementById('topicDetailPopup');
            const list      = document.getElementById('topicDetailList');

            function renderPopupList() {
                const completed = window.completedTopics[lessonName] || [];
                list.innerHTML = topics.map(topic => {
                    const isDone = completed.includes(topic);
                    return `<div class="topic-popup-row" data-topic="${topic}" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:var(--radius-md);cursor:pointer;transition:background 0.15s;background:${isDone ? 'var(--color-success-light)' : 'transparent'};"
                        onmouseover="this.style.background='${isDone ? 'var(--color-success-light)' : 'var(--color-bg-hover)'}'"
                        onmouseout="this.style.background='${isDone ? 'var(--color-success-light)' : 'transparent'}'">
                        <div style="width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;
                            background:${isDone ? 'var(--color-success)' : 'var(--color-bg-input)'};
                            border:2px solid ${isDone ? 'var(--color-success)' : 'var(--color-border-medium)'};">
                            ${isDone ? '<i class="fa-solid fa-check" style="font-size:10px;color:#fff;"></i>' : ''}
                        </div>
                        <span style="font-size:12px;font-weight:${isDone ? '700' : '600'};color:${isDone ? 'var(--color-success)' : 'var(--color-text-main)'};flex:1;">${topic}</span>
                        <span style="font-size:10px;font-weight:700;color:${isDone ? 'var(--color-success)' : 'var(--color-text-muted)'};">${isDone ? 'Tamamlandı' : 'Tamamlanmadı'}</span>
                    </div>`;
                }).join('');

                // Satır tıklama
                list.querySelectorAll('.topic-popup-row').forEach(row => {
                    row.addEventListener('click', async () => {
                        const topic = row.dataset.topic;
                        if (!window.completedTopics[lessonName]) window.completedTopics[lessonName] = [];
                        const arr = window.completedTopics[lessonName];
                        const idx = arr.indexOf(topic);
                        if (idx >= 0) arr.splice(idx, 1); else arr.push(topic);
                        await saveCompletedTopics();
                        renderPopupList();
                        showLessonKonular(lessonName); // arka listeyi güncelle
                        // Popup'ı kapat
                    });
                });
            }

            renderPopupList();
            overlay.style.display = 'block';
            popup.style.display = 'flex';

            // Kapat
            const closePopup = () => {
                overlay.style.display = 'none';
                popup.style.display = 'none';
            };
            document.getElementById('topicDetailCloseBtn').onclick = closePopup;
            overlay.onclick = closePopup;

            // Tümünü tamamla
            document.getElementById('topicMarkAllBtn').onclick = async () => {
                window.completedTopics[lessonName] = [...topics];
                await saveCompletedTopics();
                renderPopupList();
                showLessonKonular(lessonName);
            };

            // Sıfırla
            document.getElementById('topicClearAllBtn').onclick = async () => {
                window.completedTopics[lessonName] = [];
                await saveCompletedTopics();
                renderPopupList();
                showLessonKonular(lessonName);
            };
        }

        function showLessonPlaylistler(lessonName) {
            const mainPlaylists = savedPlaylists.filter(p => p.isMain && p.subject === lessonName);

            let listHtml = '';
            if (mainPlaylists.length === 0) {
                listHtml = `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:8px; color:var(--color-text-muted);">
                    <i class="fa-brands fa-youtube" style="font-size:28px; color:#ffaaaa;"></i>
                    <span style="font-size:12px; font-weight:700; text-align:center;"><b>${lessonName}</b> için ana playlist bulunamadı.<br><span style="font-size:11px;">Playlistler menüsünden "Ana" olarak işaretle.</span></span>
                </div>`;
            } else {
                listHtml = '<div style="display:flex; flex-wrap:wrap; gap:8px; align-content:flex-start;">';
                mainPlaylists.forEach(pl => {
                    const total   = pl.videos ? pl.videos.length : 0;
                    const watched = pl.videos ? pl.videos.filter(v => v.isWatched).length : 0;
                    const planned = pl.videos ? pl.videos.filter(v => v.isPlanned).length : 0;
                    const pct     = total > 0 ? Math.round((watched / total) * 100) : 0;
                    const title   = pl.customTitle || pl.subject;
                    listHtml += `
                        <div style="flex:1; min-width:120px; background:var(--color-bg-input); border:1px solid var(--color-border); border-radius:var(--radius-md); padding:10px 12px; cursor:pointer; transition:var(--transition-fast);"
                             onmouseover="this.style.borderColor='var(--color-primary-border)';this.style.background='var(--color-primary-lighter)'"
                             onmouseout="this.style.borderColor='var(--color-border)';this.style.background='var(--color-bg-input)'"
                             onclick="window.openVideoSelectionFromSubject && window.openVideoSelectionFromSubject('${pl.id}')">
                            <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                                <i class="fa-brands fa-youtube" style="color:#ff4444; font-size:13px; flex-shrink:0;"></i>
                                <span style="font-size:11px; font-weight:800; color:var(--color-text-main); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${title}</span>
                            </div>
                            <div style="background:var(--color-border); border-radius:4px; height:5px; overflow:hidden; margin-bottom:4px;">
                                <div style="width:${pct}%; height:100%; background:var(--color-success); border-radius:4px;"></div>
                            </div>
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:10px; font-weight:700; color:var(--color-text-muted);">%${pct}</span>
                                <span style="font-size:10px; font-weight:700; color:var(--color-primary);">${watched}/${total}</span>
                            </div>
                            ${planned > 0 ? `<div style="margin-top:4px; font-size:10px; font-weight:700; color:#17a2b8;"><i class="fa-solid fa-calendar-plus"></i> ${planned} plana eklendi</div>` : ''}
                        </div>`;
                });
                listHtml += '</div>';
            }

            subjectContainer.innerHTML = `
                <div style="display:flex; flex-direction:column; width:100%; height:100%; min-height:0; gap:10px;">
                    <div style="display:flex; align-items:center; gap:8px; flex-shrink:0;">
                        <button id="lessonPlBackBtn" style="background:var(--color-bg-hover); border:none; color:var(--color-primary); width:28px; height:28px; border-radius:var(--radius-md); cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:var(--transition-fast);" onmouseover="this.style.background='var(--color-primary)';this.style.color='#fff'" onmouseout="this.style.background='var(--color-bg-hover)';this.style.color='var(--color-primary)'">
                            <i class="fa-solid fa-arrow-left" style="font-size:11px;"></i>
                        </button>
                        <span style="font-size:13px; font-weight:800; color:var(--color-text-main);">${lessonName} <span style="color:#ff4444;">· Playlistler</span></span>
                    </div>
                    <div style="flex:1; overflow-y:auto; min-height:0;">${listHtml}</div>
                </div>
            `;
            document.getElementById('lessonPlBackBtn').addEventListener('click', () => showLessonMenu(lessonName));
        }

        window.selectLanguage = function(langName, btnElement) {
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            btnElement.classList.add('active');
            document.getElementById('selected-lang-title').innerText = langName;
        }

        const customSelects = document.querySelectorAll(".custom-select");
        customSelects.forEach(select => {
            const selectedBtn = select.querySelector(".select-selected");
            const itemsList = select.querySelector(".select-items");
            const options = select.querySelectorAll(".select-items div");

            selectedBtn.addEventListener("click", function(e) {
                e.stopPropagation(); 
                closeAllSelect(this); 
                itemsList.classList.toggle("select-hide");
                selectedBtn.classList.toggle("select-arrow-active");
            });

            options.forEach(option => {
                option.addEventListener("click", function(e) {
                    e.stopPropagation();
                    const val = this.getAttribute("data-val");
                    const text = this.innerText;
                    
                    selectedBtn.innerHTML = text + ' <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i>';
                    
                    if (select.id === "examTypeSelect") currentExam = val;
                    if (select.id === "trackSelect") currentTrack = val;

                    renderLessons();
                    itemsList.classList.add("select-hide");
                    selectedBtn.classList.remove("select-arrow-active");
                });
            });
        });

        function closeAllSelect(exceptThisBtn) {
            const items = document.querySelectorAll(".select-items");
            const btns = document.querySelectorAll(".select-selected");
            for (let i = 0; i < items.length; i++) {
                if (btns[i] !== exceptThisBtn) {
                    items[i].classList.add("select-hide");
                    btns[i].classList.remove("select-arrow-active");
                }
            }
        }
        document.addEventListener("click", closeAllSelect);
        renderLessons();

        // [BULUT-AYAR] --- BULUT AYAR SENKRONİZASYON MOTORU ---
        window.loadGlobalSettings = async function(existingDocSnap) {
            if (!currentUserUid) return;
            try {
                const docSnap = existingDocSnap || await getDoc(doc(db, "users", currentUserUid));
                
                if (docSnap.exists() && docSnap.data().settings) {
                    const settings = docSnap.data().settings;
                    
                    // 1. Hedef Netler
                    if (settings.targetNets) {
                        window.targetNets = settings.targetNets;
                        localStorage.setItem('targetNets', JSON.stringify(window.targetNets));
                    }
                    
                    // 2. Ders Renkleri
                    if (settings.subjectColors) {
                        window.subjectColors = settings.subjectColors;
                        localStorage.setItem('subjectColors', JSON.stringify(window.subjectColors));
                    }
                    
                    // 3. Planlayıcı Düzeni ve Filtreler
                    if (settings.plannerLayout) {
                        localStorage.setItem('plannerLayout', settings.plannerLayout);
                        window.plannerLayout = settings.plannerLayout;
                    }
                    if (settings.filteredSubjects) {
                        window.filteredSubjects = settings.filteredSubjects;
                    }
                }
            } catch (e) {
            }
        };

        window.saveGlobalSettings = async function() {
            if (!currentUserUid) return;
            try {
                const settingsData = {
                    targetNets: window.targetNets || JSON.parse(localStorage.getItem('targetNets') || "{}"),
                    subjectColors: window.subjectColors || JSON.parse(localStorage.getItem('subjectColors') || "{}"),
                    plannerLayout: localStorage.getItem('plannerLayout') || "column",
                    filteredSubjects: window.filteredSubjects || []
                };
                await setDoc(doc(db, "users", currentUserUid), { settings: settingsData }, { merge: true });
            } catch (e) {
            }
        };

