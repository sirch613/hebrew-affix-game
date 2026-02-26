// === AQUARIUM ENGINE: Water + Fish + CHAOS ===
const canvas = document.getElementById('water-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- Image cache ---
const imageCache = {};
function loadImage(src) {
    if (imageCache[src]) return imageCache[src];
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
    return img;
}
const FISH_SRCS = [
    'assets/fish_1.png', 'assets/fish_2.png', 'assets/fish_3.png', 'assets/fish_4.png',
    'assets/fish_special.png', 'assets/ruby_fish.png', 'assets/emerald_fish.png', 'assets/diamond_fish.png'
];
FISH_SRCS.forEach(loadImage);

// === BUBBLES ===
const bubbles = [];
function spawnBubble(x) {
    bubbles.push({
        x: x !== undefined ? x : Math.random() * (canvas.width || 300),
        y: (canvas.height || 200) + 5,
        r: 2 + Math.random() * 5,
        speed: 0.5 + Math.random() * 1,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.02 + Math.random() * 0.04
    });
}
for (let i = 0; i < 5; i++) {
    bubbles.push({
        x: Math.random() * 400, y: Math.random() * 200,
        r: 2 + Math.random() * 5, speed: 0.5 + Math.random() * 1,
        wobble: Math.random() * Math.PI * 2, wobbleSpeed: 0.02 + Math.random() * 0.04
    });
}

// === FISH ===
const fish = [];

export function addFish(src, size) {
    const img = loadImage(src);
    const W = canvas.width || 300;
    const H = canvas.height || 200;
    const p = 15;
    fish.push({
        img, size, baseSize: size,
        x: p + Math.random() * (W - size - p * 2),
        y: p + 25 + Math.random() * (H - size - p * 2 - 25),
        targetX: p + Math.random() * (W - size - p * 2),
        targetY: p + 25 + Math.random() * (H - size - p * 2 - 25),
        speed: 0.3 + Math.random() * 0.5,
        facingLeft: false,
        enterScale: 0,
        glowColor: null, glowRadius: 0,
        // Trick state
        spinAngle: 0, spinning: false,
        sizeBoost: 0, speedBoost: 0,
        trailBubbles: false, trailTimer: 0
    });
}

export function addMilestoneFish(src, size, glowColor) {
    const img = loadImage(src);
    const W = canvas.width || 300;
    const H = canvas.height || 200;
    const p = 15;
    fish.push({
        img, size, baseSize: size,
        x: W / 2 - size / 2, y: H / 2 - size / 2,
        targetX: p + Math.random() * (W - size - p * 2),
        targetY: p + 25 + Math.random() * (H - size - p * 2 - 25),
        speed: 0.2 + Math.random() * 0.3,
        facingLeft: false,
        enterScale: 0,
        glowColor, glowRadius: size * 0.6,
        spinAngle: 0, spinning: false,
        sizeBoost: 0, speedBoost: 0,
        trailBubbles: false, trailTimer: 0
    });
}

export function burstBubbles(count = 8) {
    for (let i = 0; i < count; i++) spawnBubble();
}

// === PARTICLES (confetti, fireworks, stars) ===
const particles = [];

function spawnFirework(cx, cy) {
    const colors = ['#ff6b6b', '#ffd93d', '#6bff6b', '#6bcaff', '#ff6bff', '#ffaa6b', '#ffffff'];
    for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 / 30) * i + Math.random() * 0.3;
        const speed = 2 + Math.random() * 3;
        particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.015 + Math.random() * 0.01,
            size: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'firework'
        });
    }
}

function spawnConfetti(count) {
    const colors = ['#ff6b6b', '#ffd93d', '#6bff6b', '#6bcaff', '#ff6bff', '#ffaa6b'];
    const W = canvas.width || 300;
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * W, y: -10 - Math.random() * 40,
            vx: (Math.random() - 0.5) * 2,
            vy: 1 + Math.random() * 2,
            life: 1,
            decay: 0.003 + Math.random() * 0.003,
            size: 4 + Math.random() * 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: 'confetti',
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.2
        });
    }
}

function spawnStars(cx, cy, count) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        particles.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.02 + Math.random() * 0.01,
            size: 3 + Math.random() * 3,
            color: '#ffd700',
            type: 'star'
        });
    }
}

// === CHAOS EVENTS ===
let activeEvent = null;
let eventTimer = 0;
let discoHue = 0;
let screenShake = 0;
let rainbowOverlay = 0;

const EVENTS = [
    'fireworks',    // Colorful explosions everywhere
    'disco',        // Rainbow water + fish go crazy
    'tornado',      // Fish spiral into center then explode out
    'confetti',     // Raining confetti
    'shark',        // Giant shadow swims across
    'earthquake',   // Screen shakes and fish panic
    'growth',       // All fish temporarily grow huge
    'conga',        // Fish line up and swim in a conga line
];

export function triggerSpectacular() {
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    activeEvent = event;
    eventTimer = 0;
    screenShake = 0;

    switch (event) {
        case 'fireworks':
            // Launch multiple timed fireworks
            for (let i = 0; i < 6; i++) {
                setTimeout(() => {
                    const W = canvas.width || 300;
                    const H = canvas.height || 200;
                    spawnFirework(30 + Math.random() * (W - 60), 20 + Math.random() * (H - 40));
                }, i * 300);
            }
            setTimeout(() => activeEvent = null, 2500);
            break;

        case 'disco':
            setTimeout(() => activeEvent = null, 3000);
            break;

        case 'tornado':
            setTimeout(() => activeEvent = null, 3000);
            break;

        case 'confetti':
            spawnConfetti(60);
            setTimeout(() => spawnConfetti(40), 500);
            setTimeout(() => spawnConfetti(30), 1000);
            setTimeout(() => activeEvent = null, 3000);
            break;

        case 'shark':
            setTimeout(() => activeEvent = null, 3000);
            break;

        case 'earthquake':
            setTimeout(() => { activeEvent = null; screenShake = 0; }, 2000);
            break;

        case 'growth':
            fish.forEach(f => f.sizeBoost = f.baseSize * 0.8);
            setTimeout(() => {
                fish.forEach(f => f.sizeBoost = 0);
                activeEvent = null;
            }, 2500);
            break;

        case 'conga':
            setTimeout(() => activeEvent = null, 4000);
            break;
    }

    // Always burst bubbles during events
    burstBubbles(15);
}

// Random fish tricks (called periodically)
function doRandomTrick() {
    if (fish.length === 0) return;
    const f = fish[Math.floor(Math.random() * fish.length)];
    const trick = Math.floor(Math.random() * 4);

    switch (trick) {
        case 0: // Spin!
            f.spinning = true;
            f.spinAngle = 0;
            break;
        case 1: // Speed boost
            f.speedBoost = 3;
            break;
        case 2: // Size pulse
            f.sizeBoost = f.baseSize * 0.5;
            break;
        case 3: // Bubble trail
            f.trailBubbles = true;
            f.trailTimer = 60;
            break;
    }
}

let t = 0;
let trickCooldown = 0;

function drawFrame() {
    const W = canvas.width;
    const H = canvas.height;
    if (W === 0 || H === 0) { requestAnimationFrame(drawFrame); return; }
    t += 0.02;
    eventTimer += 1;
    trickCooldown -= 1;

    // Random tricks every ~3 seconds
    if (trickCooldown <= 0 && fish.length > 0) {
        doRandomTrick();
        trickCooldown = 100 + Math.random() * 100;
    }

    // --- Screen shake ---
    ctx.save();
    if (activeEvent === 'earthquake') {
        screenShake = 4 + Math.sin(eventTimer * 0.5) * 3;
    }
    if (screenShake > 0) {
        ctx.translate(
            (Math.random() - 0.5) * screenShake * 2,
            (Math.random() - 0.5) * screenShake * 2
        );
        screenShake *= 0.97;
        if (screenShake < 0.1) screenShake = 0;
    }

    ctx.clearRect(-10, -10, W + 20, H + 20);

    // === WATER BACKGROUND ===
    if (activeEvent === 'disco') {
        discoHue = (discoHue + 3) % 360;
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, `hsla(${discoHue}, 80%, 60%, 0.5)`);
        grad.addColorStop(0.5, `hsla(${(discoHue + 120) % 360}, 80%, 40%, 0.6)`);
        grad.addColorStop(1, `hsla(${(discoHue + 240) % 360}, 80%, 25%, 0.85)`);
        ctx.fillStyle = grad;
    } else {
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, 'rgba(100, 200, 255, 0.5)');
        grad.addColorStop(0.3, 'rgba(30, 120, 220, 0.6)');
        grad.addColorStop(1, 'rgba(10, 50, 120, 0.85)');
        ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, W, H);

    // --- Light rays ---
    ctx.save();
    ctx.globalAlpha = activeEvent === 'disco' ? 0.15 : 0.07;
    for (let i = 0; i < 5; i++) {
        const cx = W * 0.15 + i * W * 0.18 + Math.sin(t * 0.3 + i) * 15;
        const spread = 25 + Math.sin(t * 0.5 + i * 1.5) * 10;
        ctx.beginPath();
        ctx.moveTo(cx - spread * 0.3, 0);
        ctx.lineTo(cx + spread * 0.3, 0);
        ctx.lineTo(cx + spread * 2, H);
        ctx.lineTo(cx - spread * 2, H);
        ctx.closePath();
        ctx.fillStyle = activeEvent === 'disco'
            ? `hsla(${(discoHue + i * 50) % 360}, 100%, 70%, 1)`
            : 'rgba(255, 255, 220, 1)';
        ctx.fill();
    }
    ctx.restore();

    // --- Caustics ---
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

    // --- SHARK EVENT ---
    if (activeEvent === 'shark') {
        const sharkX = -200 + (eventTimer / 180) * (W + 400);
        const sharkY = H * 0.4 + Math.sin(eventTimer * 0.03) * 20;
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#1a1a2e';
        // Shark body
        ctx.beginPath();
        ctx.ellipse(sharkX, sharkY, 80, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        // Dorsal fin
        ctx.beginPath();
        ctx.moveTo(sharkX - 10, sharkY - 30);
        ctx.lineTo(sharkX + 20, sharkY - 60);
        ctx.lineTo(sharkX + 30, sharkY - 30);
        ctx.fill();
        // Tail
        ctx.beginPath();
        ctx.moveTo(sharkX - 70, sharkY);
        ctx.lineTo(sharkX - 110, sharkY - 25);
        ctx.lineTo(sharkX - 110, sharkY + 25);
        ctx.fill();
        ctx.restore();

        // Fish flee from shark
        fish.forEach(f => {
            const dx = f.x - sharkX;
            const dy = f.y - sharkY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                f.x += (dx / dist) * 3;
                f.y += (dy / dist) * 3;
                f.x = Math.max(5, Math.min(W - f.size - 5, f.x));
                f.y = Math.max(25, Math.min(H - f.size - 5, f.y));
            }
        });
    }

    // --- TORNADO EVENT ---
    if (activeEvent === 'tornado') {
        const progress = Math.min(eventTimer / 90, 1);
        const centerX = W / 2;
        const centerY = H / 2;
        if (progress < 0.6) {
            // Suck fish toward center in a spiral
            fish.forEach((f, i) => {
                const angle = t * 3 + i * 0.7;
                const radius = (1 - progress / 0.6) * 80 + 10;
                f.targetX = centerX + Math.cos(angle) * radius - f.size / 2;
                f.targetY = centerY + Math.sin(angle) * radius - f.size / 2;
                f.speed = 2;
            });
        } else if (eventTimer === 55) {
            // Explode outward
            fish.forEach(f => {
                f.targetX = Math.random() * W;
                f.targetY = Math.random() * H;
                f.speed = 4;
                f.spinning = true;
                f.spinAngle = 0;
            });
            spawnFirework(centerX, centerY);
            spawnStars(centerX, centerY, 20);
        }
        // Draw vortex
        ctx.save();
        ctx.globalAlpha = 0.15 * (1 - Math.abs(progress - 0.5) * 2);
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, 30 + i * 25 + Math.sin(t * 4) * 10, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 - i * 0.15})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }

    // --- CONGA LINE EVENT ---
    if (activeEvent === 'conga') {
        const lineY = H * 0.5;
        const progress = Math.min(eventTimer / 60, 1);
        fish.forEach((f, i) => {
            const targetX = ((-50 + eventTimer * 1.5 + i * 60) % (W + 100)) - 50;
            f.targetX = targetX;
            f.targetY = lineY + Math.sin(t * 3 + i * 0.5) * 15;
            f.speed = 1.5;
            f.facingLeft = false;
        });
    }

    // === DRAW FISH ===
    for (const f of fish) {
        if (f.enterScale < 1) f.enterScale = Math.min(1, f.enterScale + 0.04);

        // Decay tricks
        if (f.sizeBoost > 0) f.sizeBoost *= 0.97;
        if (f.sizeBoost < 0.5) f.sizeBoost = 0;
        if (f.speedBoost > 0) f.speedBoost *= 0.98;
        if (f.speedBoost < 0.1) f.speedBoost = 0;
        if (f.spinning) {
            f.spinAngle += 0.15;
            if (f.spinAngle >= Math.PI * 2) { f.spinning = false; f.spinAngle = 0; }
        }
        if (f.trailBubbles) {
            f.trailTimer--;
            if (f.trailTimer % 4 === 0) spawnBubble(f.x + f.size / 2);
            if (f.trailTimer <= 0) f.trailBubbles = false;
        }

        // Movement
        const dx = f.targetX - f.x;
        const dy = f.targetY - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const currentSpeed = f.speed + f.speedBoost;
        if (dist < 2) {
            const p = 15;
            f.targetX = p + Math.random() * (W - f.size - p * 2);
            f.targetY = p + 25 + Math.random() * (H - f.size - p * 2 - 25);
            f.speed = 0.3 + Math.random() * 0.5;
        } else {
            const vx = (dx / dist) * currentSpeed;
            const vy = (dy / dist) * currentSpeed;
            f.x += vx;
            f.y += vy;
            f.facingLeft = vx < 0;
        }

        // Clamp to bounds
        f.x = Math.max(2, Math.min(W - f.size - 2, f.x));
        f.y = Math.max(20, Math.min(H - f.size - 2, f.y));

        const currentSize = f.size + f.sizeBoost;
        const cx = f.x + currentSize / 2;
        const cy = f.y + currentSize / 2;
        const scale = f.enterScale;

        // Glow
        if (f.glowColor && scale > 0.5) {
            ctx.save();
            ctx.globalAlpha = 0.3 + Math.sin(t * 3) * 0.15;
            ctx.shadowColor = f.glowColor;
            ctx.shadowBlur = f.glowRadius + Math.sin(t * 2) * 10;
            ctx.beginPath();
            ctx.arc(cx, cy, currentSize * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = f.glowColor;
            ctx.fill();
            ctx.restore();
        }

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(f.facingLeft ? -scale : scale, scale);
        ctx.rotate(f.spinAngle + Math.sin(t * 1.5 + f.x * 0.01) * 0.05);

        // Disco shimmer on fish
        if (activeEvent === 'disco') {
            ctx.shadowColor = `hsl(${(discoHue + f.x) % 360}, 100%, 60%)`;
            ctx.shadowBlur = 15;
        }

        if (f.img.complete && f.img.naturalWidth > 0) {
            ctx.drawImage(f.img, -currentSize / 2, -currentSize / 2, currentSize, currentSize);
        }
        ctx.restore();
    }

    // === WAVES ===
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
        ctx.fillStyle = activeEvent === 'disco'
            ? `hsla(${(discoHue + layer * 40) % 360}, 80%, 70%, ${0.3 - layer * 0.06})`
            : `rgba(180, 220, 255, ${0.25 - layer * 0.06})`;
        ctx.fill();
    }

    // === BUBBLES ===
    if (Math.random() < (activeEvent === 'disco' ? 0.2 : 0.06)) spawnBubble();
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        b.y -= b.speed;
        b.wobble += b.wobbleSpeed;
        b.x += Math.sin(b.wobble) * 0.5;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = activeEvent === 'disco'
            ? `hsla(${(discoHue + b.x) % 360}, 80%, 70%, 0.4)`
            : 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
        if (b.y + b.r < 0) bubbles.splice(i, 1);
    }

    // === PARTICLES (fireworks, confetti, stars) ===
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.type === 'confetti') {
            p.vy += 0.02; // gravity
            p.rotation += p.rotSpeed;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            ctx.restore();
        } else if (p.type === 'star') {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            // Draw a 5-point star
            const s = p.size;
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
                const method = j === 0 ? 'moveTo' : 'lineTo';
                ctx[method](p.x + Math.cos(angle) * s, p.y + Math.sin(angle) * s);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        } else {
            // Firework
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            ctx.restore();
            p.vy += 0.03; // gravity on firework sparks
        }

        if (p.life <= 0) particles.splice(i, 1);
    }

    ctx.restore(); // screen shake restore

    requestAnimationFrame(drawFrame);
}

drawFrame();
