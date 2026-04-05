// ============================================================
// YENİ NESİL GRAFİK ÇİZİCİ MOTORU
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("graphCanvas");
    if(!canvas) return; // Canvas yoksa çalışmayı durdur

    const ctx = canvas.getContext("2d");
    const input = document.getElementById("functionInput");
    
    // Canvas boyutlarını kabı ile eşleştir
    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    
    window.addEventListener("resize", () => {
        resizeCanvas();
        draw();
    });
    
    // Modal açıldığında canvas boyutlarını güncelle
    document.addEventListener("click", (e) => {
        if(e.target.closest('[data-custom-title="Grafik Çizme"]')) {
            setTimeout(() => {
                resizeCanvas();
                draw();
            }, 100);
        }
    });
    
    resizeCanvas();

    // Grafik Ayarları
    let scale = 40; // 1 birimin kaç piksel olduğu (Zoom için)
    let offsetX = canvas.width / 2; // Orijin X
    let offsetY = canvas.height / 2; // Orijin Y

    // Matematiksel ifadeyi JS formatına çevirme
    function parseMathExpression(expr) {
        let parsed = expr.replace(/\^/g, '**'); 
        const mathFuncs = ['sin', 'cos', 'tan', 'log', 'abs', 'sqrt'];
        mathFuncs.forEach(func => {
            const regex = new RegExp(`\\b${func}\\b`, 'g');
            parsed = parsed.replace(regex, `Math.${func}`);
        });
        return parsed;
    }

    // Izgara (Grid) ve Eksenleri Çizme
    function drawAxes() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // CSS Temasından Renkleri Çek (Dark/Light Mode Uyumu)
        const rootStyles = getComputedStyle(document.documentElement);
        const gridColor = rootStyles.getPropertyValue('--color-border').trim() || "#e1e1e1";
        const textColor = rootStyles.getPropertyValue('--color-text-muted').trim() || "#888";
        const axisColor = rootStyles.getPropertyValue('--color-text-main').trim() || "#333";

        ctx.lineWidth = 1;
        ctx.font = "11px Arial";
        
        // Dikey ve Yatay Gridler
        for (let i = 0; i < canvas.width; i += scale) {
            let x = offsetX % scale + i;
            ctx.strokeStyle = gridColor;
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
            
            // X ekseni sayıları
            let val = Math.round((x - offsetX) / scale);
            if(val !== 0) {
                ctx.fillStyle = textColor;
                ctx.fillText(val, x - 5, offsetY + 15);
            }
        }
        for (let i = 0; i < canvas.height; i += scale) {
            let y = offsetY % scale + i;
            ctx.strokeStyle = gridColor;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
            
            // Y ekseni sayıları
            let val = Math.round((offsetY - y) / scale);
            if(val !== 0) {
                ctx.fillStyle = textColor;
                ctx.fillText(val, offsetX + 8, y + 4);
            }
        }

        // Ana Eksenler (Koyu Çizgiler)
        ctx.lineWidth = 2;
        ctx.strokeStyle = axisColor;
        // X Ekseni
        ctx.beginPath(); ctx.moveTo(0, offsetY); ctx.lineTo(canvas.width, offsetY); ctx.stroke();
        // Y Ekseni
        ctx.beginPath(); ctx.moveTo(offsetX, 0); ctx.lineTo(offsetX, canvas.height); ctx.stroke();
        
        // Orijin(0)
        ctx.fillStyle = axisColor;
        ctx.fillText("0", offsetX + 5, offsetY + 15);
    }

    // Fonksiyonu Çizme
    function drawFunction(expr) {
        if (!expr.trim()) return;
        
        const rootStyles = getComputedStyle(document.documentElement);
        const drawColor = rootStyles.getPropertyValue('--color-primary').trim() || "#007bff";

        const parsedExpr = parseMathExpression(expr);
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = drawColor; // Temanın ana rengini (mavi/kırmızı) alır

        let firstPoint = true;

        try {
            const f = new Function('x', `return ${parsedExpr}`);

            for (let pixelX = 0; pixelX <= canvas.width; pixelX++) {
                let mathX = (pixelX - offsetX) / scale;
                let mathY = f(mathX);
                let pixelY = offsetY - (mathY * scale);

                // Tanımsız veya asimptot kontrolü
                if (isNaN(pixelY) || Math.abs(pixelY) > 10000) {
                    firstPoint = true; 
                    continue;
                }

                if (firstPoint) {
                    ctx.moveTo(pixelX, pixelY);
                    firstPoint = false;
                } else {
                    ctx.lineTo(pixelX, pixelY);
                }
            }
            ctx.stroke();
        } catch (e) {
            console.error("Geçersiz fonksiyon:", e);
        }
    }

    // Ana Çizim Tetikleyici
    function draw() {
        // Ekranın merkezi değişmişse düzelt
        offsetX = canvas.width / 2;
        offsetY = canvas.height / 2;
        drawAxes();
        drawFunction(input.value);
    }

    // Buton Tetikleyicileri
    document.getElementById("btnDraw").addEventListener("click", draw);
    
    document.getElementById("btnClear").addEventListener("click", () => {
        input.value = "";
        draw();
    });

    document.getElementById("btnZoomIn").addEventListener("click", () => {
        scale += 10;
        draw();
    });

    document.getElementById("btnZoomOut").addEventListener("click", () => {
        if (scale > 10) scale -= 10;
        draw();
    });

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") draw();
    });

    // İlk açılışta çiz
    setTimeout(draw, 200);
});

// ============================================================
// MODAL (PENCERE) AÇMA VE KAPATMA İŞLEMLERİ
// ============================================================

const graphModal = document.getElementById("graphModal");
const closeGraphModalBtn = document.getElementById("closeGraphModalBtn");

// 1. Modalı Açma (Menüdeki butona tıklanınca)
document.addEventListener("click", (e) => {
    // Menüdeki grafik çizme butonunu yakalamak için olası tüm durumları kapsıyoruz
    const isGraphButton = e.target.closest('[data-custom-title="Grafik Çizme"]') || 
                          e.target.closest('.graph-menu-btn') || 
                          (e.target.closest('li, div, button') && e.target.closest('li, div, button').innerHTML.includes('fa-chart-line'));
                          
    if (isGraphButton) {
        e.preventDefault(); // Sayfanın yenilenmesini veya yukarı kaymasını engeller
        if (graphModal) {
            graphModal.style.display = "flex"; // Modalı görünür yap
            
            // Modal açıldığında Canvas'ın (çizim alanının) kendini doğru boyutlandırması için tetikleme
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        }
    }
});

// 2. Modalı Kapatma (Çarpı butonuna basılınca)
if (closeGraphModalBtn) {
    closeGraphModalBtn.addEventListener("click", () => {
        if (graphModal) graphModal.style.display = "none";
    });
}

// 3. Modalı Kapatma (Pencerenin dışındaki karanlık alana tıklanınca)
window.addEventListener("click", (e) => {
    if (e.target === graphModal) {
        graphModal.style.display = "none";
    }
});