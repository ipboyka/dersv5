        // [PANEL] --- SÜRÜKLENEBİLİR PANELLER (DİNAMİK BOYUTLANDIRMA MOTORU) ---
        const middleSection = document.getElementById('dynamicMiddleSection');
        const resizer1 = document.getElementById('resizer1');
        const resizer2 = document.getElementById('resizer2');
        
        let isDraggingLayout = false;
        let currentResizerId = null;
        let startX, startWLeft, startWRight;
        let widget1, widget2, widget3;

        function startLayoutDrag(e, resizerNum) {
            isDraggingLayout = true;
            currentResizerId = resizerNum;
            startX = e.clientX;

            // Kutuları dinamik olarak seçiyoruz (Aralarda resizer'lar olduğu için indexler 0, 2, 4)
            widget1 = middleSection.children[0];
            widget2 = middleSection.children[2];
            widget3 = middleSection.children[4];

            // Anlık genişlikleri piksel (px) olarak ölçüp sisteme kilitliyoruz
            const w1 = widget1.getBoundingClientRect().width;
            const w2 = widget2.getBoundingClientRect().width;
            const w3 = widget3.getBoundingClientRect().width;

            middleSection.style.setProperty('--col1', w1 + 'px');
            middleSection.style.setProperty('--col2', w2 + 'px');
            middleSection.style.setProperty('--col3', w3 + 'px');

            if (resizerNum === 1) {
                startWLeft = w1;
                startWRight = w2;
                resizer1.classList.add('dragging');
            } else {
                startWLeft = w2;
                startWRight = w3;
                resizer2.classList.add('dragging');
            }

            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none'; // Sürüklerken yazıların mavi mavi seçilmesini engeller

            document.addEventListener('mousemove', layoutDrag);
            document.addEventListener('mouseup', stopLayoutDrag);
        }

        if(resizer1 && resizer2) {
            resizer1.addEventListener('mousedown', (e) => startLayoutDrag(e, 1));
            resizer2.addEventListener('mousedown', (e) => startLayoutDrag(e, 2));
        }

        function layoutDrag(e) {
            if (!isDraggingLayout) return;
            const dx = e.clientX - startX;

            let newLeft = startWLeft + dx;
            let newRight = startWRight - dx;

            // KORUMA KALKANI: Kutuların çok fazla küçülüp görünmez olmasını (ezilmesini) engeller
            if (newLeft < 250) {
                newLeft = 250;
                newRight = startWLeft + startWRight - 250;
            }
            if (newRight < 250) {
                newRight = 250;
                newLeft = startWLeft + startWRight - 250;
            }

            if (currentResizerId === 1) {
                middleSection.style.setProperty('--col1', newLeft + 'px');
                middleSection.style.setProperty('--col2', newRight + 'px');
            } else {
                middleSection.style.setProperty('--col2', newLeft + 'px');
                middleSection.style.setProperty('--col3', newRight + 'px');
            }
        }

        function stopLayoutDrag() {
            if(!isDraggingLayout) return;
            isDraggingLayout = false;
            document.removeEventListener('mousemove', layoutDrag);
            document.removeEventListener('mouseup', stopLayoutDrag);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            if(resizer1) resizer1.classList.remove('dragging');
            if(resizer2) resizer2.classList.remove('dragging');

            // Pikselleri tekrar oransal 'fr' (kesir) birimine çeviriyoruz ki 
            // kullanıcı tarayıcıyı tam ekran yaptığında oranlar bozulmasın
            const w1 = widget1.getBoundingClientRect().width;
            const w2 = widget2.getBoundingClientRect().width;
            const w3 = widget3.getBoundingClientRect().width;
            
            middleSection.style.setProperty('--col1', w1 + 'fr');
            middleSection.style.setProperty('--col2', w2 + 'fr');
            middleSection.style.setProperty('--col3', w3 + 'fr');
            
            // Grafiğin çözünürlüğünü yeni boyuta göre onar
            updateChart?.(); 
        }

        // --- DÜZENİ KISMİ SIFIRLAMA BUTONLARI (KORUMA KALKANLI MOTOR) ---
        const resetLeftBtn = document.getElementById('resetLeftBtn');
        const resetRightBtn = document.getElementById('resetRightBtn');

        // --- DÜZENİ KISMİ SIFIRLAMA BUTONLARI ---
        // Sorun: px bazlı animasyon 3 sütunu da aynı anda piksel cinsinden kilitleyip
        //        dokunulmayan paneli de kaydırıyordu ve animasyon sırasında ekstradan
        //        küçülüp-büyüme titremesi oluşuyordu.
        // Çözüm: Animasyonu tamamen kaldır; doğrudan fr değerlerine geç.
        //        fr biriminde CSS kendi içinde oransal hesap yapar, hiçbir panel
        //        istemeden etkilenmez.

        if (resetLeftBtn) {
            resetLeftBtn.addEventListener('mousedown', (e) => e.stopPropagation());
            resetLeftBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const w3 = middleSection.children[4].getBoundingClientRect().width;
                const pool = middleSection.children[0].getBoundingClientRect().width
                           + middleSection.children[2].getBoundingClientRect().width;
                const t1 = pool * (1 / 3);
                const t2 = pool * (2 / 3);
                middleSection.style.transition = 'grid-template-columns 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                middleSection.style.setProperty('--col1', t1 + 'px');
                middleSection.style.setProperty('--col2', t2 + 'px');
                middleSection.style.setProperty('--col3', w3 + 'px');
                setTimeout(() => {
                    middleSection.style.transition = '';
                    middleSection.style.setProperty('--col1', t1 + 'fr');
                    middleSection.style.setProperty('--col2', t2 + 'fr');
                    middleSection.style.setProperty('--col3', w3 + 'fr');
                    updateChart?.();
                }, 400);
            });
        }

        if (resetRightBtn) {
            resetRightBtn.addEventListener('mousedown', (e) => e.stopPropagation());
            resetRightBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const w1 = middleSection.children[0].getBoundingClientRect().width;
                const pool = middleSection.children[2].getBoundingClientRect().width
                           + middleSection.children[4].getBoundingClientRect().width;
                const t2 = pool * (2 / 3);
                const t3 = pool * (1 / 3);
                middleSection.style.transition = 'grid-template-columns 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)';
                middleSection.style.setProperty('--col1', w1 + 'px');
                middleSection.style.setProperty('--col2', t2 + 'px');
                middleSection.style.setProperty('--col3', t3 + 'px');
                setTimeout(() => {
                    middleSection.style.transition = '';
                    middleSection.style.setProperty('--col1', w1 + 'fr');
                    middleSection.style.setProperty('--col2', t2 + 'fr');
                    middleSection.style.setProperty('--col3', t3 + 'fr');
                    updateChart?.();
                }, 400);
            });
        }

        // --- ÖZEL TARİH SEÇİCİ (NATIVE TOOLTIP İPTALİ) MOTORU ---
        document.querySelectorAll('input[type="date"]').forEach(dateInput => {
            // Kutuya tıklandığında modern tarayıcıların takvimini zorla açar
            dateInput.addEventListener('click', function() {
                if (typeof this.showPicker === 'function') {
                    this.showPicker();
                }
            });
        });

