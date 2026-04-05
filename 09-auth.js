        // [AUTH] --- FIREBASE: KULLANICI GİRİŞ DURUMUNU DİNLE ---
        onAuthStateChanged(auth, async (user) => {
            const minLoadTime = new Promise(resolve => setTimeout(resolve, 400));

            const safetyTimeout = setTimeout(() => {
                console.warn('Yükleme zaman aşımına uğradı, loader kapatılıyor.');
                hideLoader();
            }, 15000);

            await waitForAppReady();

            if (user) {
                currentUserUid = user.uid;

                if(document.getElementById('sideMenuProfileBtn')) document.getElementById('sideMenuProfileBtn').style.display = '';
                if(document.getElementById('sideMenuLoginBtn')) document.getElementById('sideMenuLoginBtn').style.display = 'none';
                if(document.getElementById('sideMenuRegisterBtn')) document.getElementById('sideMenuRegisterBtn').style.display = 'none';

                const initialName = user.displayName || "Profil";
                document.getElementById('headerAuthContainer').innerHTML = `
                    <button class="header-icon-btn" id="headerProfileBtn" onclick="window.openProfileModal()"><i class="fa-solid fa-user"></i> ${initialName}</button>
                    <button class="header-icon-btn" id="headerSettingsBtn"><i class="fa-solid fa-gear"></i> Ayarlar</button>
                `;
                document.getElementById('headerSettingsBtn').addEventListener('click', window.openSettingsModal);

                try {
                    // Planner profilleri önce (diğerleri buna bağlı)
                    // Tüm koleksiyonları PARALEL çek
                    const [
                        userDocSnap,
                        notesSnap,
                        examsSnap,
                        playlistsSnap,
                        tasksSnap
                    ] = await Promise.all([
                        getDoc(doc(db, "users", user.uid)),
                        getDocs(collection(db, "users", user.uid, "userNotes")),
                        getDocs(collection(db, "users", user.uid, "userExams")),
                        getDocs(collection(db, "users", user.uid, "userPlaylists")),
                        getDocs(collection(db, "users", user.uid, "userTasks"))
                    ]);

                    // Profil verisi
                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        window.currentUserProfileData = userData;
                        if (userData.username) {
                            const profBtn = document.getElementById('headerProfileBtn');
                            if (profBtn) profBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${userData.username}`;
                        }
                        // Konu tamamlanma verilerini yükle
                        window.completedTopics = userData.completedTopics || {};
                        // Eski not migrasyonu (varsa)
                        if (userData.notes && userData.notes.length > 0) {
                            const migrationPromises = userData.notes.map(oldNote =>
                                setDoc(doc(db, "users", user.uid, "userNotes", oldNote.id.toString()), oldNote)
                            );
                            await Promise.all(migrationPromises);
                            await setDoc(doc(db, "users", user.uid), { notes: [] }, { merge: true });
                        }
                    } else {
                        window.currentUserProfileData = {};
                    }

                    // Notlar
                    savedNotes = [];
                    notesSnap.forEach(d => savedNotes.push(d.data()));
                    savedNotes.sort((a, b) => b.id - a.id);
                    renderNotesToScreen();

                    // Denemeler
                    savedExams = [];
                    examsSnap.forEach(d => savedExams.push(d.data()));
                    renderExamsToScreen();

                    // Playlistler
                    savedPlaylists = [];
                    playlistsSnap.forEach(d => savedPlaylists.push(d.data()));
                    window.renderPlaylists?.();

                    // Görevler
                    userTasks = {};
                    tasksSnap.forEach(d => {
                        const taskData = d.data();
                        if (!userTasks[taskData.dateKey]) userTasks[taskData.dateKey] = [];
                        userTasks[taskData.dateKey].push(taskData);
                    });

                    window.updateWeeklyPlannerView?.();
                    window.renderTodayTasks?.();
                    window.refreshCalendar?.();

                    // Planner profilleri snapshot ile yükle (ekstra istek yok)
                    if (window.loadPlannerProfilesFromDB) {
                        await window.loadPlannerProfilesFromDB(userDocSnap);
                    }

                    // Ayarlar (renk/hedef bağımlı, en son)
                    await window.loadGlobalSettings(userDocSnap);
                    window.refreshCalendar?.();

                } catch (error) {
                    console.error('Veri yükleme hatası:', error);
                }

                clearTimeout(safetyTimeout);
                await minLoadTime;
                hideLoader();

            } else {
                currentUserUid = null;

                if(document.getElementById('sideMenuProfileBtn')) document.getElementById('sideMenuProfileBtn').style.display = 'none';
                if(document.getElementById('sideMenuLoginBtn')) document.getElementById('sideMenuLoginBtn').style.display = '';
                if(document.getElementById('sideMenuRegisterBtn')) document.getElementById('sideMenuRegisterBtn').style.display = '';

                document.getElementById('headerAuthContainer').innerHTML = `
                    <button class="btn-outline" onclick="window.location.href='index.html?action=login'">Giriş Yap</button>
                    <button class="btn-primary" onclick="window.location.href='index.html?action=register'">Kaydol</button>
                `;

                savedNotes = [];
                userTasks = {};
                notesList.innerHTML = '<div class="placeholder-text">Notlarınızı görmek için giriş yapın...</div>';

                clearTimeout(safetyTimeout);
                await minLoadTime;
                hideLoader();
            }
        });

        function formatDateToTurkish(dateString) {
            if (!dateString) return "";
            const parts = dateString.split('-');
            if (parts.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
            return dateString;
        }

