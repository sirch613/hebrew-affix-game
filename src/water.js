// --- Animated Water + Fish Canvas ---
const canvas = document.getElementById('water-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- Image preloader ---
const imageCache = {};
function loadImage(src) {
    if (imageCache[src]) return imageCache[src];
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
    return img;
}

// Pre-load all fish images
const FISH_SRCS = [
    'assets/fish_1.png', 'assets/fish_2.png',
    'assets/fish_3.png', 'assets/fish_4.png',
    'assets/fish_special.png',
    'assets/ruby_fish.png', 'assets/emerald_fish.png', 'assets/diamond_fish.png'
];
FISH_SRCS.forEach(loadImage);

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
// Pre-populate
for (let i = 0; i < 6; i++) {
    bubbles.push({
        x: Math.random() * 400, y: Math.random() * 200,
        r: 2 + Math.random() * 5, speed: 0.4 + Math.random() * 0.8,
        wobble: Math.random() * Math.PI * 2, wobbleSpeed: 0.02 + Math.random() * 0.03
    });
}

// --- Fish system (all canvas-based) ---
const fish = [];

export function addFish(src, size) {
    const img = loadImage(src);
    const W = canvas.width || 300;
    const H = canvas.height || 200;
    const padding = 15;
    fish.push({
        img, size,
        x: padding + Math.random() * (W - size - padding * 2),
        y: padding + 20 + Math.random() * (H - size - padding * 2 - 20),
        targetX: padding + Math.random() * (W - size - padding * 2),
        targetY: padding + 20 + Math.random() * (H - size - padding * 2 - 20),
        speed: 0.25 + Math.random() * 0.4,
        facingLeft: false,
        enterScale: 0,  // animate entrance from 0 to 1
        glowColor: null,
        glowRadius: 0
    });
}

export function addMilestoneFish(src, size, glowColor) {
    const img = loadImage(src);
    const W = canvas.width || 300;
    const H = canvas.height || 200;
    const padding = 15;
    fish.push({
        img, size,
        x: W / 2 - size / 2,
        y: H / 2 - size / 2,
        targetX: padding + Math.random() * (W - size - padding * 2),
        targetY: padding + 20 + Math.random() * (H - size - padding * 2 - 20),
        speed: 0.2 + Math.random() * 0.3,
        facingLeft: false,
        enterScale: 0,
        glowColor,
        glowRadius: size * 0.6
    });
}

export function burstBubbles(count = 8) {
    for (let i = 0; i < count; i++) spawnBubble();
}

let t = 0;

function drawFrame() {
    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) { requestAnimationFrame(drawFrame); return; }
    ctx.clearRect(0, 0, W, H);
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

    // --- Caustic swirls ---
    ctx.save();
    ctx.globalAlpha = 0.06;
    for (let i = 0; i < 10; i++) {
        const cx = (i * 45 + Math.sin(t * 0.7 + i * 0.9) * 30) % W;
        const cy = H * 0.6 + Math.cos(t * 0.5 + i * 1.2) * 20;
        const r = 20 + Math.sin(t + i) * 10;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150, 230, 255, 1)';
        ctx.fill();
    }
    ctx.restore();

    // --- Draw fish ---
    for (const f of fish) {
        // Entrance animation
        if (f.enterScale < 1) {
            f.enterScale = Math.min(1, f.enterScale + 0.03);
        }

        // Move toward waypoint
        const dx = f.targetX - f.x;
        const dy = f.targetY - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) {
            // Pick new waypoint
            const padding = 15;
            f.targetX = padding + Math.random() * (W - f.size - padding * 2);
            f.targetY = padding + 20 + Math.random() * (H - f.size - padding * 2 - 20);
            f.speed = 0.25 + Math.random() * 0.4;
        } else {
            const vx = (dx / dist) * f.speed;
            const vy = (dy / dist) * f.speed;
            f.x += vx;
            f.y += vy;
            f.facingLeft = vx < 0;
        }

        ctx.save();
        const cx = f.x + f.size / 2;
        const cy = f.y + f.size / 2;
        const scale = f.enterScale;

        // Glow for milestone fish
        if (f.glowColor && scale > 0.5) {
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(t * 3) * 0.15;
            ctx.shadowColor = f.glowColor;
            ctx.shadowBlur = f.glowRadius + Math.sin(t * 2) * 10;
            ctx.beginPath();
            ctx.arc(cx, cy, f.size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = f.glowColor;
            ctx.fill();
            ctx.restore();
        }

        ctx.translate(cx, cy);
        ctx.scale(f.facingLeft ? -scale : scale, scale);
        // Slight wobble
        ctx.rotate(Math.sin(t * 1.5 + f.x * 0.01) * 0.05);

        if (f.img.complete && f.img.naturalWidth > 0) {
            ctx.drawImage(f.img, -f.size / 2, -f.size / 2, f.size, f.size);
        }
        ctx.restore();
    }

    // --- Animated wave lines at the top ---
    for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const amplitude = 3 + layer * 1.5;
        const freq = 0.03 - layer * 0.005;
        const yBase = 8 + layer * 5;
        const speed = 1.5 + layer * 0.8;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= W; x += 3) {
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
    if (Math.random() < 0.06) spawnBubble();
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        b.x += Math.sin(b.wobble) * 0.5;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // Highlight
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        if (b.y + b.r < 0) bubbles.splice(i, 1);
    }

    requestAnimationFrame(drawFrame);
}

drawFrame();
