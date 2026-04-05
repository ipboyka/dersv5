        // [NOT-KART] --- EKRANA KARTLARI ÇİZME ---
        function renderNotesToScreen() {
            notesList.innerHTML = ''; 
            if (savedNotes.length === 0) {
                notesList.innerHTML = '<div class="placeholder-text">Henüz not eklemedin...</div>';
                return;
            }
            savedNotes.forEach(note => {
                let dateHtml = '';
                
                // Öncelik başlangıç tarihi, o yoksa bitiş tarihini gösterir.
                if (note.startDate || note.endDate) {
                    let dateText = note.startDate ? formatDateToTurkish(note.startDate) : formatDateToTurkish(note.endDate);
                    
                    dateHtml = `
                        <div class="note-card-date">
                            <i class="fa-regular fa-calendar-days"></i>
                            <span>${dateText}</span>
                        </div>
                    `;
                }

                // Medya Sayacı Rozeti (Korundu)
                let mediaHtml = '';
                if (note.media && note.media.length > 0) {
                    mediaHtml = `
                        <div class="note-card-media-count" style="display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: #17a2b8; background-color: #e0f7fa; padding: 4px 8px; border-radius: var(--radius-sm); white-space: nowrap; flex-shrink: 0;">
                            <i class="fa-solid fa-paperclip"></i>
                            <span>${note.media.length}</span>
                        </div>
                    `;
                }

                const cardHtml = `
                    <div class="note-card" onclick="window.viewNoteDetails(${note.id})">
                        <div class="note-card-left" style="overflow: hidden; flex: 1; padding-right: 10px;">
                            <div class="note-card-icon"><i class="fa-solid fa-note-sticky"></i></div>
                            <span class="note-card-title">${note.title}</span>
                        </div>
                        <div style="display: flex; gap: 5px; align-items: center; flex-shrink: 0;">
                            ${mediaHtml}
                            ${dateHtml}
                        </div>
                    </div>
                `;
                notesList.insertAdjacentHTML('beforeend', cardHtml); 
            });
        }

        // [NOT-MODAL] --- PENCERE (MODAL) AÇMA/KAPATMA İŞLEMLERİ ---
        openNoteModalBtn.addEventListener('click', () => {
            if(!currentUserUid) {
                alert("Not eklemek için lütfen giriş yapın!");
                return;
            }
            editingNoteId = null; 
            originalEditState = null; // Yeni eklemede takip yok
            document.querySelector('#noteModal .modal-header h3').innerText = "Yeni Not Ekle";
            noteModal.style.display = 'flex';
        });

        function closeModalAndClear() {
            noteModal.style.display = 'none';
            
            // Formu temizle
            noteTitleInput.value = '';
            noteContentInput.value = '';
            DOM.noteStartDate.value = '';
            DOM.noteEndDate.value = '';
            noteErrorMsg.style.display = 'none';
            noteMediaInput.value = ''; 
            selectedMediaFiles = []; 
            
            const savedEditId = editingNoteId; 
            
            // Sistemi yeni ekleme moduna hazırla
            editingNoteId = null;
            originalEditState = null;
            updateMediaUI(); 

            // o notun detay (okuma) ekranını anında tekrar aç!
            if (savedEditId) {
                window.viewNoteDetails(savedEditId);
            }
        }

        function hasFormChanged() {
            if (!editingNoteId || !originalEditState) return false;
            
            const currentTitle = noteTitleInput.value.trim();
            const currentContent = noteContentInput.value.trim();
            const currentStart = DOM.noteStartDate.value;
            const currentEnd = DOM.noteEndDate.value;
            const currentMediaCount = selectedMediaFiles.length;
            const currentMediaNames = selectedMediaFiles.map(m => m.customName).join(',');

            if (currentTitle !== originalEditState.title) return true;
            if (currentContent !== originalEditState.content) return true;
            if (currentStart !== originalEditState.startDate) return true;
            if (currentEnd !== originalEditState.endDate) return true;
            if (currentMediaCount !== originalEditState.mediaCount) return true;
            if (currentMediaNames !== originalEditState.mediaNames) return true;
            
            return false;
        }

        function attemptCloseModal() {
            if (editingNoteId && hasFormChanged()) {
                DOM.cancelConfirmModal.style.display = 'flex';
            } else {
                closeModalAndClear(); // Değişiklik yoksa sormadan anında kapat
            }
        }

        closeNoteModalBtn.addEventListener('click', attemptCloseModal);
        cancelNoteBtn.addEventListener('click', attemptCloseModal);
        window.addEventListener('click', (e) => { if (e.target === noteModal) attemptCloseModal(); });

        // [MEDYA] --- AKILLI MEDYA MOTORU ---
        noteMediaInput.addEventListener('change', function() {
            Array.from(this.files).forEach(file => {
                if(selectedMediaFiles.some(item => item.customName === file.name)) return; 

                const isImage = file.type.startsWith('image/');
                const isPdf = file.type === 'application/pdf';

                if (!isImage && !isPdf) {
                    alert(`"${file.name}" desteklenmiyor. Lütfen sadece fotoğraf veya PDF yükleyin.`);
                    return;
                }

                if (isPdf && file.size > 700 * 1024) {
                    alert(`"${file.name}" çok büyük! Lütfen 700KB altı PDF'ler yüklemeye çalışın.`);
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    if (isPdf) {
                        selectedMediaFiles.push({ customName: file.name, data: e.target.result, type: file.type });
                        updateMediaUI();
                    } else if (isImage) {
                        const img = new Image();
                        img.src = e.target.result;
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            let width = img.width;
                            let height = img.height;
                            const MAX_DIM = 800; 

                            if (width > height && width > MAX_DIM) {
                                height = Math.round(height * (MAX_DIM / width));
                                width = MAX_DIM;
                            } else if (height > MAX_DIM) {
                                width = Math.round(width * (MAX_DIM / height));
                                height = MAX_DIM;
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);

                            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.5);
                            selectedMediaFiles.push({ customName: file.name, data: compressedDataUrl, type: 'image/jpeg' });
                            updateMediaUI();
                        };
                    }
                };
                reader.readAsDataURL(file);
            });
        });

        function updateMediaUI() {
            const noMediaText = document.getElementById('noMediaText');
            const imageCategory = document.getElementById('imageCategory');
            const documentCategory = document.getElementById('documentCategory');
            const imageItems = document.getElementById('imageItems');
            const documentItems = document.getElementById('documentItems');

            imageItems.innerHTML = ''; documentItems.innerHTML = '';
            let imageCount = 0; let docCount = 0;

            if (selectedMediaFiles.length === 0) {
                noMediaText.style.display = 'block';
                imageCategory.style.display = 'none';
                documentCategory.style.display = 'none';
                return;
            }

            noMediaText.style.display = 'none';

            selectedMediaFiles.forEach((item, index) => {
                const displayName = item.customName;
                const isImage = item.type.startsWith('image/');
                let iconClass = 'fa-file';
                
                if(isImage) { iconClass = 'fa-image'; imageCount++; }
                else if(item.type === 'application/pdf') { iconClass = 'fa-file-pdf'; docCount++; }
                else { docCount++; } 

                const itemHtml = `
                    <div class="preview-item" onclick="window.openMediaPreview(${index}, false)" data-custom-title="Önizlemek için tıkla">
                        <i class="fa-solid ${iconClass}"></i> 
                        <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${displayName}</span>
                        <div class="media-actions">
                            <div class="edit-media-btn" onclick="event.stopPropagation(); window.renameMedia(${index})" data-custom-title="Adını Değiştir">
                                <i class="fa-solid fa-pen"></i>
                            </div>
                            <div class="remove-media-btn" onclick="event.stopPropagation(); window.removeMedia(${index})" data-custom-title="Kaldır">
                                <i class="fa-solid fa-xmark"></i>
                            </div>
                        </div>
                    </div>
                `;

                if (isImage) imageItems.innerHTML += itemHtml;
                else documentItems.innerHTML += itemHtml;
            });

            imageCategory.style.display = imageCount > 0 ? 'flex' : 'none';
            documentCategory.style.display = docCount > 0 ? 'flex' : 'none';
        }

        window.removeMedia = function(index) {
            selectedMediaFiles.splice(index, 1);
            updateMediaUI();
        }

        // --- İSİM DEĞİŞTİRME PENCERESİ MOTORU ---
        const renameMediaModal = document.getElementById('renameMediaModal');
        const newMediaNameInput = document.getElementById('newMediaNameInput');
        let currentEditingMediaIndex = -1; 

        window.renameMedia = function(index) {
            currentEditingMediaIndex = index;
            newMediaNameInput.value = selectedMediaFiles[index].customName;
            renameMediaModal.style.display = 'flex';
            setTimeout(() => newMediaNameInput.focus(), 100); 
        };

        function closeRenameModal() {
            renameMediaModal.style.display = 'none';
            currentEditingMediaIndex = -1;
            newMediaNameInput.style.borderColor = '#dce4ec'; 
        }

        document.getElementById('closeRenameModalBtn').addEventListener('click', closeRenameModal);
        document.getElementById('cancelRenameBtn').addEventListener('click', closeRenameModal);
        renameMediaModal.addEventListener('click', (e) => { if (e.target === renameMediaModal) closeRenameModal(); });

        document.getElementById('saveRenameBtn').addEventListener('click', () => {
            const newName = newMediaNameInput.value.trim();
            if (newName !== "" && currentEditingMediaIndex !== -1) {
                selectedMediaFiles[currentEditingMediaIndex].customName = newName;
                updateMediaUI(); 
                closeRenameModal(); 
            } else {
                newMediaNameInput.style.borderColor = '#d9534f';
                setTimeout(() => newMediaNameInput.style.borderColor = '#dce4ec', 2000);
            }
        });

        // --- NOT GÖRÜNTÜLEME VE DÜZENLEME MOTORU ---
        const viewNoteModal = document.getElementById('viewNoteModal');
        const editNoteBtn = document.getElementById('editNoteBtn');

        window.viewNoteDetails = function(noteId) {
            const note = savedNotes.find(n => n.id === noteId);
            if (!note) return;
            currentViewingNote = note;

            const dateEl = document.getElementById('viewNoteDate');
            if (note.startDate || note.endDate) {
                let dateText = '';
                if (note.startDate && note.endDate) dateText = `${formatDateToTurkish(note.startDate)} - ${formatDateToTurkish(note.endDate)}`;
                else if (note.startDate) dateText = formatDateToTurkish(note.startDate);
                else if (note.endDate) dateText = formatDateToTurkish(note.endDate);
                
                dateEl.innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${dateText}`;
                dateEl.style.display = 'inline-flex';
            } else {
                dateEl.style.display = 'none';
            }

            document.getElementById('viewNoteTitle').innerText = note.title;
            document.getElementById('viewNoteContent').innerText = note.content;

            const mediaSection = document.getElementById('viewNoteMediaSection');
            const mediaList = document.getElementById('viewNoteMediaList');
            mediaList.innerHTML = '';

            if (note.media && note.media.length > 0) {
                mediaSection.style.display = 'block';
                note.media.forEach((mediaItem, index) => {
                    const isImage = mediaItem.type.startsWith('image/');
                    const iconClass = isImage ? 'fa-image' : 'fa-file-pdf';
                    
                    mediaList.innerHTML += `
                        <div class="view-media-item" onclick="window.openMediaPreview(${index}, true)" style="cursor:pointer; background:var(--color-primary-lighter); transition:all 0.2s;">
                            <i class="fa-solid ${iconClass}" style="font-size: 16px;"></i>
                            <span>${mediaItem.customName}</span>
                        </div>
                    `;
                });
            } else {
                mediaSection.style.display = 'none';
            }

            viewNoteModal.style.display = 'flex';
        };

        function closeViewModal() {
            viewNoteModal.style.display = 'none';
            currentViewingNote = null;
        }

        document.getElementById('closeViewNoteModalBtn').addEventListener('click', closeViewModal);
        document.getElementById('closeViewNoteBtn').addEventListener('click', closeViewModal);
        window.addEventListener('click', (e) => { if (e.target === viewNoteModal) closeViewModal(); });

        // DÜZENLE BUTONUNA TIKLANINCA İLK HALİN FOTOĞRAFINI ÇEK
        editNoteBtn.addEventListener('click', () => {
            if (!currentViewingNote) return;
            
            editingNoteId = currentViewingNote.id; 
            
            noteTitleInput.value = currentViewingNote.title || '';
            noteContentInput.value = currentViewingNote.content || '';
            DOM.noteStartDate.value = currentViewingNote.startDate || '';
            DOM.noteEndDate.value = currentViewingNote.endDate || '';
            
            selectedMediaFiles = currentViewingNote.media ? JSON.parse(JSON.stringify(currentViewingNote.media)) : [];
            updateMediaUI();
            
            originalEditState = {
                title: noteTitleInput.value.trim(),
                content: noteContentInput.value.trim(),
                startDate: DOM.noteStartDate.value,
                endDate: DOM.noteEndDate.value,
                mediaCount: selectedMediaFiles.length,
                mediaNames: selectedMediaFiles.map(m => m.customName).join(',')
            };
            
            closeViewModal();
            document.querySelector('#noteModal .modal-header h3').innerText = "Notu Düzenle";
            noteModal.style.display = 'flex';
        });

        // --- MEDYA ÖNİZLEME (FULL EKRAN) MOTORU ---
        const mediaPreviewModal = document.getElementById('mediaPreviewModal');
        const previewContentContainer = document.getElementById('previewContentContainer');
        
        window.openMediaPreview = function(index, isViewMode = false) {
            let mediaItem;
            if (isViewMode && currentViewingNote) {
                mediaItem = currentViewingNote.media[index];
            } else {
                mediaItem = selectedMediaFiles[index];
            }

            if (!mediaItem) return;
            const src = mediaItem.data; 
            
            previewContentContainer.innerHTML = ''; 
            
            if (mediaItem.type.startsWith('image/')) {
                previewContentContainer.innerHTML = `<img src="${src}" alt="Önizleme">`;
            } else if (mediaItem.type === 'application/pdf') {
                previewContentContainer.innerHTML = `<iframe src="${src}"></iframe>`;
            } else {
                previewContentContainer.innerHTML = `
                    <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <i class="fa-solid fa-file-circle-exclamation" style="font-size: 50px; color: #ffc107; margin-bottom: 15px;"></i>
                        <h3 style="color: var(--color-text-main); margin-bottom: 10px;">Önizleme Desteklenmiyor</h3>
                    </div>
                `;
            }
            mediaPreviewModal.style.display = 'flex';
        };

        function closeMediaPreview() {
            mediaPreviewModal.style.display = 'none';
            previewContentContainer.innerHTML = ''; 
        }

        document.getElementById('closeMediaPreviewBtn').addEventListener('click', closeMediaPreview);
        mediaPreviewModal.addEventListener('click', (e) => { if (e.target === mediaPreviewModal) closeMediaPreview(); });

        // [NOT-KAYDET] --- KAYDETME TETİKLEYİCİSİ (ONAY PENCERESİ BAĞLANTISI) ---
        saveNoteBtn.addEventListener('click', async () => {
            if (!currentUserUid) {
                alert("Lütfen giriş yapın!");
                return;
            }

            const titleVal = noteTitleInput.value.trim();
            const contentVal = noteContentInput.value.trim();
            const startDateVal = DOM.noteStartDate.value;
            const endDateVal = DOM.noteEndDate.value;

            // 1. Boş Alan Kontrolü
            if (titleVal.length === 0 || contentVal.length === 0) {
                noteErrorMsg.style.display = 'block';
                noteErrorMsg.innerText = "Lütfen zorunlu alanları (Başlık ve Açıklama) doldurun!";
                if(titleVal.length === 0) noteTitleInput.style.borderColor = '#d9534f';
                if(contentVal.length === 0) noteContentInput.style.borderColor = '#d9534f';
                setTimeout(() => { noteTitleInput.style.borderColor = '#dce4ec'; noteContentInput.style.borderColor = '#dce4ec'; }, 3000);
                return; 
            }

            // YENİ 2. Tarih Mantığı Kontrolü
            if (startDateVal && endDateVal) {
                if (new Date(startDateVal) > new Date(endDateVal)) {
                    noteErrorMsg.style.display = 'block';
                    noteErrorMsg.innerText = "Başlangıç tarihi, bitiş tarihinden sonra olamaz!";
                    
                    // Gözden kaçmasın diye tarih kutularını kırmızı yapıyoruz
                    DOM.noteStartDate.style.color = '#d9534f';
                    DOM.noteEndDate.style.color = '#d9534f';
                    setTimeout(() => { 
                        DOM.noteStartDate.style.color = '#333'; 
                        DOM.noteEndDate.style.color = '#333'; 
                    }, 3000);
                    return; // Hata varsa kaydetmeyi anında durdur
                }
            }

            noteErrorMsg.style.display = 'none';

            // EĞER DÜZENLEME MODUNDAYSAK VE DEĞİŞİKLİK YOKSA SESSİZCE ÇIK
            if (editingNoteId) {
                if (!hasFormChanged()) {
                    closeModalAndClear();
                    return;
                }
                // DEĞİŞİKLİK VARSA "EMİN MİSİN?" DİYE SOR
                DOM.saveConfirmModal.style.display = 'flex';
            } else {
                // YENİ NOT EKLENİYORSA SORMADAN DİREKT KAYDET
                executeSaveNote();
            }
        });

        // --- ASIL KAYDETME İŞLEMİ (Bildirim Baloncuğu Entegreli) ---
        async function executeSaveNote() {
            const titleVal = noteTitleInput.value.trim();
            const contentVal = noteContentInput.value.trim();
            const startDateVal = DOM.noteStartDate.value;
            const endDateVal = DOM.noteEndDate.value;

            const newNote = {
                id: editingNoteId ? editingNoteId : Date.now(), 
                title: titleVal,
                content: contentVal,
                startDate: startDateVal,
                endDate: endDateVal,
                media: selectedMediaFiles 
            };

            let updatedNotes = [...savedNotes];

            if (editingNoteId) {
                const noteIndex = updatedNotes.findIndex(n => n.id === editingNoteId);
                if (noteIndex !== -1) updatedNotes[noteIndex] = newNote;
            } else {
                updatedNotes.unshift(newNote); 
            }

            // BALONCUĞU GÖSTER
            const toast = document.getElementById('actionToast');
            const toastText = document.getElementById('toastText');
            toastText.innerText = "Kaydediliyor...";
            toast.classList.add('show');
            
            // Butonu pasif yap ama yazısını bozma
            saveNoteBtn.disabled = true;
            saveNoteBtn.style.opacity = "0.7";

            try {
                const noteDocRef = doc(db, "users", currentUserUid, "userNotes", newNote.id.toString());
                await setDoc(noteDocRef, newNote);

                savedNotes = updatedNotes;
                renderNotesToScreen();
                
                // Başarı durumunda baloncuğu güncelle
                toastText.innerText = "Başarıyla Kaydedildi!";
                toast.querySelector('.toast-spinner').style.display = 'none'; // Spinner'ı gizle
                
                setTimeout(() => {
                    toast.classList.remove('show');
                    closeModalAndClear(); 
                    // Bir sonraki kullanım için spinner'ı geri getir
                    setTimeout(() => { toast.querySelector('.toast-spinner').style.display = 'block'; }, 500);
                }, 1500);

            } catch (error) {
                toastText.innerText = "Hata Oluştu!";
                setTimeout(() => toast.classList.remove('show'), 3000);
                alert("Sistem Hatası: Medya boyutu çok büyük olabilir.");
            } finally {
                saveNoteBtn.disabled = false;
                saveNoteBtn.style.opacity = "1";
            }
        }

        // --- ONAY PENCERESİ (CONFIRM MODAL) BUTON DİNLEYİCİLERİ ---
        
        // KAYDET ONAYI BUTONLARI
        document.getElementById('yesSaveBtn').addEventListener('click', () => {
            DOM.saveConfirmModal.style.display = 'none';
            executeSaveNote();
        });
        document.getElementById('noSaveBtn').addEventListener('click', () => {
            DOM.saveConfirmModal.style.display = 'none';
        });
        DOM.saveConfirmModal.addEventListener('click', (e) => {
            if(e.target === DOM.saveConfirmModal) DOM.saveConfirmModal.style.display = 'none';
        });

        // ÇIKIŞ (İPTAL) ONAYI BUTONLARI
        document.getElementById('yesCancelBtn').addEventListener('click', () => {
            DOM.cancelConfirmModal.style.display = 'none';
            closeModalAndClear();
        });
        document.getElementById('noCancelBtn').addEventListener('click', () => {
            DOM.cancelConfirmModal.style.display = 'none';
        });
        DOM.cancelConfirmModal.addEventListener('click', (e) => {
            if(e.target === DOM.cancelConfirmModal) DOM.cancelConfirmModal.style.display = 'none';
        });

        // --- ONAY PENCERESİ (CONFIRM MODAL) BUTON DİNLEYİCİLERİ ---
        
        // 1. KAYDET ONAYI BUTONLARI
        const yesSaveBtn = document.getElementById('yesSaveBtn');
        if (yesSaveBtn) {
            yesSaveBtn.addEventListener('click', () => {
                DOM.saveConfirmModal.style.display = 'none';
                executeSaveNote(); // Onay verildi, asıl kaydetme fonksiyonunu (ve baloncuğu) çalıştır
            });
        }
        
        const noSaveBtn = document.getElementById('noSaveBtn');
        if (noSaveBtn) {
            noSaveBtn.addEventListener('click', () => {
                DOM.saveConfirmModal.style.display = 'none';
            });
        }

        // 2. ÇIKIŞ (İPTAL) ONAYI BUTONLARI
        const yesCancelBtn = document.getElementById('yesCancelBtn');
        if (yesCancelBtn) {
            yesCancelBtn.addEventListener('click', () => {
                DOM.cancelConfirmModal.style.display = 'none';
                closeModalAndClear(); // Bu fonksiyon artık bizi direkt detay ekranına döndürecek!
            });
        }

        const noCancelBtn = document.getElementById('noCancelBtn');
        if (noCancelBtn) {
            noCancelBtn.addEventListener('click', () => {
                DOM.cancelConfirmModal.style.display = 'none';
            });
        }

