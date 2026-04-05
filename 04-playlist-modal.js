        // [PLAYLIST] --- PLAYLİSTLERİM MODAL MOTORU ---
        const openPlaylistsBtn = document.getElementById('openPlaylistsBtn');
        const playlistsModal = document.getElementById('playlistsModal');
        const closePlaylistsModalBtn = document.getElementById('closePlaylistsModalBtn');

        if (openPlaylistsBtn && playlistsModal) {
            openPlaylistsBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Sayfanın en üste atmasını engeller
                
                // Yan menü (Sidebar) açıksa önce onu güzelce kapatalım
                const sideMenu = DOM.sideMenu;
                const menuOverlay = DOM.menuOverlay;
                if(sideMenu) sideMenu.classList.remove('open');
                if(menuOverlay) menuOverlay.classList.remove('show');
                
                // Playlist panelini açalım
                playlistsModal.style.display = 'flex';
            });
        }

        if (closePlaylistsModalBtn) {
            closePlaylistsModalBtn.addEventListener('click', () => {
                playlistsModal.style.display = 'none';
            });
        }

        // Çarpı haricinde karanlık alana tıklayınca da kapansın
        window.addEventListener('click', (e) => {
            if (e.target === playlistsModal) {
                playlistsModal.style.display = 'none';
            }
        });
        
        // --- YOUTUBE PLAYLIST ÇEKME OTOMASYONU (SENİN KODUN) ---
        const addNewPlaylistBtn = document.getElementById('addNewPlaylistBtn');
        const addPlaylistModal = document.getElementById('addPlaylistModal');
        const closeAddPlaylistModalBtn = document.getElementById('closeAddPlaylistModalBtn');
        const cancelAddPlaylistBtn = document.getElementById('cancelAddPlaylistBtn');
        const fetchPlaylistBtn = document.getElementById('fetchPlaylistBtn');
        const confirmSavePlaylistBtn = document.getElementById('confirmSavePlaylistBtn');
        
        // Modal aç/kapat işlemleri
        if(addNewPlaylistBtn) {
            addNewPlaylistBtn.addEventListener('click', () => {
                document.getElementById('playlistLinkInput').value = '';
                document.getElementById('youtubeTabloGovdesi').innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--color-text-light);">Link girip "Videoları Bul" butonuna basınız.</td></tr>';
                confirmSavePlaylistBtn.style.display = 'none';
                addPlaylistModal.style.display = 'flex';
            });
        }
        if(closeAddPlaylistModalBtn) closeAddPlaylistModalBtn.addEventListener('click', () => addPlaylistModal.style.display = 'none');
        if(cancelAddPlaylistBtn) cancelAddPlaylistBtn.addEventListener('click', () => addPlaylistModal.style.display = 'none');

        // Senin yazdığın yardımcı fonksiyonlar
        const YT_API_KEY = 'AIzaSyB8W8bN9pcrMuFfr3vSC-YqEPHq7hN93XQ';

        function extractPlaylistId(url) {
            const reg = /[&?]list=([^&]+)/i;
            const match = url.match(reg);
            return match ? match[1] : null;
        }

        function parseDuration(duration) {
            const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            const hours = (parseInt(match[1]) || 0);
            const minutes = (parseInt(match[2]) || 0);
            const seconds = (parseInt(match[3]) || 0);
            
            let result = '';
            if (hours > 0) result += hours + ":";
            result += (minutes < 10 ? "0" + minutes : minutes) + ":";
            result += (seconds < 10 ? "0" + seconds : seconds);
            return result;
        }

        function parseDurationToSeconds(duration) {
            const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            const hours = (parseInt(match[1]) || 0);
            const minutes = (parseInt(match[2]) || 0);
            const seconds = (parseInt(match[3]) || 0);
            return (hours * 3600) + (minutes * 60) + seconds;
        }

        function formatSecondsToText(totalSeconds) {
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            if(h > 0) return `${h}s ${m}dk`;
            return `${m}dk`;
        }

        // Asıl veri çekme fonksiyonu
        if(fetchPlaylistBtn) {
            fetchPlaylistBtn.addEventListener('click', async () => {
                const link = document.getElementById('playlistLinkInput').value.trim();
                const playlistId = extractPlaylistId(link);
                const tabloGovdesi = document.getElementById('youtubeTabloGovdesi');
                
                if (!playlistId) {
                    // Sitede hazır bulunan "Eksik Bilgi" penceresinin yazısını değiştirip ekranda gösteriyoruz
                    DOM.customAlertMessage.innerText = 'Lütfen geçerli bir YouTube Playlist linki giriniz.';
                    DOM.customAlertModal.style.display = 'flex';
                    return;
                }

                const origBtnHtml = fetchPlaylistBtn.innerHTML;
                fetchPlaylistBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Aranıyor...';
                fetchPlaylistBtn.disabled = true;
                confirmSavePlaylistBtn.style.display = 'none';
                
                tabloGovdesi.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--color-primary);"><i class="fa-solid fa-spinner fa-spin"></i> Videolar YouTube\'dan çekiliyor...</td></tr>';

                let allItems = [];
                let nextPageToken = '';

                try {
                    do {
                        const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YT_API_KEY}&pageToken=${nextPageToken}`;
                        const response = await fetch(playlistUrl);
                        const data = await response.json();
                        
                        if (data.items) {
                            allItems = allItems.concat(data.items);
                        }
                        nextPageToken = data.nextPageToken || '';
                    } while (nextPageToken);

                    let allVideos = [];
                    for (let i = 0; i < allItems.length; i += 50) {
                        const chunkIds = allItems.slice(i, i + 50).map(item => item.snippet.resourceId.videoId).join(',');
                        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${chunkIds}&key=${YT_API_KEY}`;
                        const vidResponse = await fetch(videosUrl);
                        const vidData = await vidResponse.json();
                        
                        if(vidData.items) {
                            allVideos = allVideos.concat(vidData.items);
                        }
                    }

                    tabloGovdesi.innerHTML = '';
                    
                    let validVideosCount = 0;
                    let totalPlaylistSeconds = 0;
                    let videosArray = []; // Videoları hafızada tutmak için array açtık

                    allItems.forEach((item, index) => {
                        const baslik = item.snippet.title;
                        const videoId = item.snippet.resourceId.videoId;
                        // YouTube'dan en yüksek kaliteyi çekmeye çalışır, bulamazsa bir alt kaliteye geçer
                        const thumbs = item.snippet.thumbnails;
                        const kapakGorseli = thumbs?.high?.url || thumbs?.medium?.url || thumbs?.default?.url || '';
                        
                        if (baslik === 'Private video' || baslik === 'Deleted video') return;

                        const videoDetay = allVideos.find(v => v.id === videoId);
                        const rawSure = videoDetay ? videoDetay.contentDetails.duration : 'PT0S';
                        const formatliSure = parseDuration(rawSure);
                        
                        totalPlaylistSeconds += parseDurationToSeconds(rawSure); // Toplam süreyi saniye olarak biriktiriyoruz
                        
                        // Videoyu listeye ekle
                        videosArray.push({
                            title: baslik,
                            thumb: kapakGorseli,
                            duration: formatliSure,
                            videoId: videoId
                        });

                        const tr = document.createElement('tr');
                        validVideosCount++;
                        tr.innerHTML = `
                            <td>
                                <div style="position: relative; display: inline-block;">
                                    <span style="position: absolute; top: -5px; left: -5px; background: var(--color-primary); color: white; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 10px; font-weight: bold; border: 1px solid white;">${validVideosCount}</span>
                                    <img src="${kapakGorseli}" alt="Kapak">
                                </div>
                            </td>
                            <td style="line-height: 1.4;">${baslik}</td>
                            <td style="color: var(--color-text-muted); font-weight: 800;"><i class="fa-solid fa-clock"></i> ${formatliSure}</td>
                        `;
                        tabloGovdesi.appendChild(tr);
                    });

                    // Eğer işlem başarılıysa kaydetme butonunu ekranda göster ve paketi hazırla!
                    if(validVideosCount > 0) {
                        confirmSavePlaylistBtn.style.display = 'block';
                        
                        window.tempPlaylistData = {
                            id: Date.now(),
                            link: link,
                            videoCount: validVideosCount,
                            totalDuration: formatSecondsToText(totalPlaylistSeconds), // Formatlı süre!
                            firstVideoThumb: allItems[0].snippet.thumbnails?.medium?.url || allItems[0].snippet.thumbnails?.default?.url || '',
                            videos: videosArray // Videolar artık paketin içinde!
                        };
                    } else {
                        tabloGovdesi.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--color-danger);">Bu listede görüntülenebilir video bulunamadı.</td></tr>';
                    }

                } catch (error) {
                    tabloGovdesi.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 20px; color: var(--color-danger);">Veriler çekilirken hata oluştu. API anahtarını veya linki kontrol et.</td></tr>';
                } finally {
                    fetchPlaylistBtn.innerHTML = origBtnHtml;
                    fetchPlaylistBtn.disabled = false;
                }
            });

            // --- PLAYLIST KAYDETME VE EKRANA ÇİZME MOTORU ---
            let tempPlaylistData = null; // API'den çekilenleri geçici olarak tutacak

            // Eğer API'den veri başarılı gelirse (validVideosCount > 0) fetchPlaylistBtn içinde şunu yapmalısın:
            // (Bunu fetchPlaylistBtn try bloğu içine, "confirmSavePlaylistBtn.style.display = 'block';" yazdığımız yere ekle)
            /*
            tempPlaylistData = {
                id: Date.now(),
                link: link,
                videoCount: validVideosCount,
                firstVideoThumb: allItems[0].snippet.thumbnails?.medium?.url || allItems[0].snippet.thumbnails?.default?.url || ''
            };
            */

        }

