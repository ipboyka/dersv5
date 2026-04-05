        // [YKS-SAYAC] 2. YKS 2026 SAYACI
        const targetDate = new Date(2026, 5, 20, 10, 15, 0).getTime(); 

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                document.getElementById("yks-timer").innerHTML = "<div class='time-box'><span class='time-val'>Sınav</span><span class='time-label'>BAŞLADI</span></div>";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            const h = hours < 10 ? "0" + hours : hours;
            const m = minutes < 10 ? "0" + minutes : minutes;

            document.getElementById("yks-timer").innerHTML = `
                <div class="time-box">
                    <span class="time-val">${days}</span>
                    <span class="time-label">GÜN</span>
                </div>
                <span class="time-sep">:</span>
                <div class="time-box">
                    <span class="time-val">${h}</span>
                    <span class="time-label">SAAT</span>
                </div>
                <span class="time-sep">:</span>
                <div class="time-box">
                    <span class="time-val">${m}</span>
                    <span class="time-label">DAK</span>
                </div>
            `;
        }

        setInterval(updateCountdown, 1000);
        updateCountdown();

