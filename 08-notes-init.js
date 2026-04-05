        // [NOTLAR] 5. YENİ MİMARİ: ALT KOLEKSİYONLU FIREBASE NOT MOTORU
        const mainPageLoader = document.getElementById('mainPageLoader');
        function hideLoader() {
            if (mainPageLoader) {
                mainPageLoader.classList.add('hidden');
                setTimeout(() => mainPageLoader.style.display = 'none', 500); 
            }
        }

        const noteModal = document.getElementById('noteModal');
        const openNoteModalBtn = document.getElementById('openNoteModalBtn');
        const closeNoteModalBtn = document.getElementById('closeNoteModalBtn');
        const cancelNoteBtn = document.getElementById('cancelNoteBtn');
        const saveNoteBtn = document.getElementById('saveNoteBtn');
        
        const noteTitleInput = document.getElementById('noteTitle');
        const noteContentInput = document.getElementById('noteContent');
        const noteErrorMsg = document.getElementById('noteErrorMsg');
        const noteMediaInput = document.getElementById('noteMedia');
        const notesList = document.getElementById('notes-list');

        let selectedMediaFiles = []; 
        let currentUserUid = null; 
        let savedNotes = []; 
        let savedExams = []; // Denemelerin tutulacağı dizi
        let savedPlaylists = [];
        let taskToDeleteFromDrag = null;
        let editingTaskId = null;
        let currentViewingTask = null;
        let selectedDateForTask = null;
        let originalTaskEditState = null;
        let editingNoteId = null; 
        let currentViewingNote = null; 
        let originalEditState = null;        let draggedTaskInfo = null;

        // Diğer script bloklarının hazır olmasını bekle
        function waitForAppReady(maxWaitMs = 8000) {
            return new Promise(resolve => {
                const required = ['renderTodayTasks','updateWeeklyPlannerView','refreshCalendar','renderPlaylists'];
                const t0 = Date.now();
                (function check() {
                    if (required.every(fn => typeof window[fn] === 'function')) return resolve();
                    if (Date.now() - t0 >= maxWaitMs) return resolve();
                    setTimeout(check, 50);
                })();
            });
        }

