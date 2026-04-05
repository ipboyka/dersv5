        // [SIDEBAR] --- YAN MENÜ (SIDEBAR) MOTORU ---
        const menuBtn = document.querySelector('.menu-btn');
        const sideMenu = DOM.sideMenu;
        const menuOverlay = DOM.menuOverlay;
        const closeMenuBtn = document.getElementById('closeMenuBtn');

        if (menuBtn && sideMenu && menuOverlay && closeMenuBtn) {
            function openMenu() {
                sideMenu.classList.add('open');
                menuOverlay.classList.add('show');
            }

            function closeMenu() {
                sideMenu.classList.remove('open');
                menuOverlay.classList.remove('show');
            }

            // Olay Dinleyicileri (Event Listeners)
            menuBtn.addEventListener('click', openMenu);
            closeMenuBtn.addEventListener('click', closeMenu);
            
            // Kullanıcı siyah arka plana tıklarsa da menüyü kapat
            menuOverlay.addEventListener('click', closeMenu);
        }

