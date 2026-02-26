// --- Animated Water Canvas ---
const canvas = document.getElementById('water-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- Bubble system ---
const bubbles = [];
function spawnBubble() {
    bubbles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 5,
        r: 2 + Math.random() * 5,
        speed: 0.4 + Math.random() * 0.8,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03
    });
}

// Pre-populate some bubbles
for (let i = 0; i < 8; i++) {
    const b = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 2 + Math.random() * 5,
        speed: 0.4 + Math.random() * 0.8,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.03
    };
    bubbles.push(b);
}

let t = 0;

function drawWater() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const W = canvas.width;
    const H = canvas.height;
    t += 0.02;

    // --- Deep water gradient ---
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(100, 200, 255, 0.5)');
    grad.addColorStop(0.3, 'rgba(30, 120, 220, 0.6)');
    grad.addColorStop(1, 'rgba(10, 50, 120, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // --- Underwater light rays ---
    ctx.save();
    ctx.globalAlpha = 0.07;
    for (let i = 0; i < 5; i++) {
        const cx = W * 0.15 + i * W * 0.18 + Math.sin(t * 0.3 + i) * 15;
        const spread = 25 + Math.sin(t * 0.5 + i * 1.5) * 10;
        ctx.beginPath();
        ctx.moveTo(cx - spread * 0.3, 0);
        ctx.lineTo(cx + spread * 0.3, 0);
        ctx.lineTo(cx + spread * 2, H);
        ctx.lineTo(cx - spread * 2, H);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 220, 1)';
        ctx.fill();
    }
    ctx.restore();

    // --- Caustic swirls (wobbly light patterns on the bottom) ---
    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 12; i++) {
        const cx = (i * 45 + Math.sin(t * 0.7 + i * 0.9) * 30) % W;
        const cy = H * 0.6 + Math.cos(t * 0.5 + i * 1.2) * 20;
        const r = 20 + Math.sin(t + i) * 10;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150, 230, 255, 1)';
        ctx.fill();
    }
    ctx.restore();

    // --- Animated wave lines at the top ---
    for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const amplitude = 3 + layer * 1.5;
        const freq = 0.03 - layer * 0.005;
        const yBase = 8 + layer * 5;
        const speed = 1.5 + layer * 0.8;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 2) {
            const y = yBase + Math.sin(x * freq + t * speed) * amplitude
                + Math.sin(x * freq * 2.3 + t * speed * 0.7) * amplitude * 0.4;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(W, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fillStyle = `rgba(180, 220, 255, ${0.25 - layer * 0.06})`;
        ctx.fill();
    }

    // --- Bubbles ---
    // Spawn new bubbles occasionally
    if (Math.random() < 0.08) spawnBubble();

    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        b.x += Math.sin(b.wobble) * 0.5;

        // Draw bubble
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Highlight
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // Remove if off-screen
        if (b.y + b.r < 0) {
            bubbles.splice(i, 1);
        }
    }

    requestAnimationFrame(drawWater);
}

drawWater();

// Export a function to burst bubbles (called from game.js)
export function burstBubbles(count = 8) {
    for (let i = 0; i < count; i++) {
        spawnBubble();
    }
}
