import { GAME_DATA } from './data.js';

let score = 0;
let streak = 0;
let currentLevel = 1;
// To track how many points obtained in this level
let scoreInCurrentLevel = 0;

let currentQuestion = null;
let isAnimating = false;

const scoreDisplay = document.getElementById('score-display');
const streakDisplay = document.getElementById('streak-display');
const levelDisplay = document.getElementById('level-display');
const aquarium = document.getElementById('aquarium');
const wordContainer = document.getElementById('hebrew-word');
const optionsGrid = document.getElementById('options-grid');

// Hint UI elements
const hintBtn = document.getElementById('hint-btn');
const hintOverlay = document.getElementById('hint-overlay');
const closeHintBtn = document.getElementById('close-hint-btn');
const hintText = document.getElementById('hint-text');

// Event listeners for hints
hintBtn.addEventListener('click', () => {
    hintOverlay.classList.remove('hidden');
});
closeHintBtn.addEventListener('click', () => {
    hintOverlay.classList.add('hidden');
});

const SILLY_FISH_IMGS = [
    'assets/fish_1.png',
    'assets/fish_2.png',
    'assets/fish_3.png',
    'assets/fish_4.png'
];
const DEAD_FISH_IMG = 'assets/fish_special.png';

// --- Synthesis for "Fishy / Bubble" sounds ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playFishSound() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    // Bubble sound characteristics: fast pitch drop + sine wave
    osc.type = 'sine';

    // Randomize starting pitch slightly for variety
    const baseFreq = 400 + Math.random() * 300;
    osc.frequency.setValueAtTime(baseFreq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

function initGame() {
    score = 0;
    streak = 0;
    currentLevel = 1;
    scoreInCurrentLevel = 0;
    aquarium.innerHTML = '';
    updateStats();
    nextQuestion();
}

function updateStats() {
    scoreDisplay.textContent = `Score: ${score}`;
    streakDisplay.textContent = `Streak: ${streak} 🔥`;
    levelDisplay.textContent = `Level: ${currentLevel}`;

    // Scale up the streak badge dynamically if streak is high
    if (streak > 0 && streak % 5 === 0) {
        streakDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => streakDisplay.style.transform = 'scale(1)', 300);
    }
}

function getAvailableQuestions() {
    const questions = GAME_DATA.filter(q => q.level === currentLevel);
    // If no questions in this level, clamp to highest level
    if (questions.length === 0) {
        const highestLevel = Math.max(...GAME_DATA.map(q => q.level));
        if (currentLevel > highestLevel) {
            currentLevel = highestLevel;
            return getAvailableQuestions();
        }
    }
    return questions;
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function nextQuestion() {
    const questions = getAvailableQuestions();
    // Pick a random question
    currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    renderQuestion();
}

function renderQuestion() {
    wordContainer.innerHTML = '';

    const rootSpan = document.createElement('span');
    rootSpan.className = 'hebrew-root';
    rootSpan.textContent = currentQuestion.root;

    const affixSpan = document.createElement('span');
    affixSpan.className = 'hebrew-affix';
    affixSpan.textContent = currentQuestion.affix;

    // RTL rule: First DOM element appears on the purely logical right side
    if (currentQuestion.isPrefix) {
        wordContainer.appendChild(affixSpan);
        wordContainer.appendChild(rootSpan);
    } else {
        wordContainer.appendChild(rootSpan);
        wordContainer.appendChild(affixSpan);
    }

    // Render the english definition of the full word beneath it
    let meaningP = document.getElementById('word-translation');
    if (!meaningP) {
        meaningP = document.createElement('p');
        meaningP.id = 'word-translation';
        meaningP.style.fontSize = '1.3rem';
        meaningP.style.margin = '-10px 0 20px 0';
        meaningP.style.opacity = '0.8';
        meaningP.style.fontStyle = 'italic';
        // Insert it right after the Hebrew word container
        wordContainer.after(meaningP);
    }
    meaningP.textContent = `(${currentQuestion.englishWord})`;

    // Populate hint text
    hintText.textContent = currentQuestion.hint;

    // Render options
    optionsGrid.innerHTML = '';
    const shuffledOptions = shuffleArray(currentQuestion.options);

    shuffledOptions.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => handleAnswer(opt, btn);
        optionsGrid.appendChild(btn);
    });
}

// --- Bubble particles ---
function createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = 5 + Math.random() * 10;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    const rect = aquarium.getBoundingClientRect();
    bubble.style.left = `${Math.random() * (rect.width - size)}px`;
    const duration = 2 + Math.random() * 3;
    bubble.style.setProperty('--duration', `${duration}s`);
    aquarium.appendChild(bubble);
    setTimeout(() => { if (bubble.parentElement) bubble.remove(); }, duration * 1000);
}

// --- Fish swimming system (JS-driven) ---
const swimFish = []; // Array to track all swimming fish

function pickWaypoint(fishSize) {
    const rect = aquarium.getBoundingClientRect();
    const padding = 10;
    return {
        x: padding + Math.random() * (rect.width - fishSize - padding * 2),
        y: padding + 20 + Math.random() * (rect.height - fishSize - padding * 2 - 20) // avoid wave zone
    };
}

function animateFish() {
    swimFish.forEach(f => {
        const dx = f.targetX - f.x;
        const dy = f.targetY - f.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
            // Reached waypoint, pick a new one
            const wp = pickWaypoint(f.size);
            f.targetX = wp.x;
            f.targetY = wp.y;
            // Randomize speed slightly
            f.speed = 0.3 + Math.random() * 0.5;
        } else {
            // Move toward waypoint
            const vx = (dx / dist) * f.speed;
            const vy = (dy / dist) * f.speed;
            f.x += vx;
            f.y += vy;

            // Flip fish based on direction
            const angle = Math.atan2(vy, vx) * (180 / Math.PI);
            const scaleX = vx < 0 ? -1 : 1;
            f.el.style.left = `${f.x}px`;
            f.el.style.top = `${f.y}px`;
            f.el.style.transform = `scaleX(${scaleX}) rotate(${angle * 0.15}deg)`;
        }
    });
    requestAnimationFrame(animateFish);
}
requestAnimationFrame(animateFish);

function addFishToAquarium(isSpecial) {
    const img = document.createElement('img');
    const rect = aquarium.getBoundingClientRect();

    if (isSpecial) {
        img.src = DEAD_FISH_IMG;
        img.className = 'fish special entering';
    } else {
        const randomFish = SILLY_FISH_IMGS[Math.floor(Math.random() * SILLY_FISH_IMGS.length)];
        img.src = randomFish;
        img.className = 'fish entering';
    }

    const fishSize = isSpecial ? 70 : 55;
    // Start from a random X at the top
    const startX = 10 + Math.random() * (rect.width - fishSize - 20);
    const startY = 30 + Math.random() * (rect.height - fishSize - 40);

    img.style.left = `${startX}px`;
    img.style.top = `${startY}px`;
    img.style.opacity = '1';

    aquarium.appendChild(img);

    // Remove 'entering' class after splash animation finishes
    setTimeout(() => {
        img.classList.remove('entering');
    }, 800);

    // Register in the swim system
    const wp = pickWaypoint(fishSize);
    swimFish.push({
        el: img,
        x: startX,
        y: startY,
        targetX: wp.x,
        targetY: wp.y,
        speed: 0.3 + Math.random() * 0.5,
        size: fishSize
    });

    // Create a burst of bubbles when dropped
    for (let i = 0; i < 6; i++) {
        setTimeout(createBubble, Math.random() * 800);
    }
}

function advanceLevelCheck() {
    // Arbitrary curve: 5 right per level advances the level
    if (scoreInCurrentLevel >= 5) {
        scoreInCurrentLevel = 0;
        currentLevel++;
        // Notice we don't clear the aquarium, they keep their fish!
    }
}

function handleAnswer(selectedOption, buttonElement) {
    if (isAnimating) return;

    isAnimating = true;
    const isCorrect = selectedOption === currentQuestion.correctMeaning;

    if (isCorrect) {
        buttonElement.classList.add('correct');
        score += 10;
        streak += 1;
        scoreInCurrentLevel += 1;

        // Always give a standard fish + sound on correct answer
        playFishSound();
        addFishToAquarium(false);

        // Bonus: give special dead fish on every 5-streak
        if (streak % 5 === 0) {
            addFishToAquarium(true);
        }

        advanceLevelCheck();
        updateStats();

        setTimeout(() => {
            isAnimating = false;
            nextQuestion();
        }, 800);

    } else {
        buttonElement.classList.add('incorrect');
        streak = 0;
        updateStats();

        // Highlight the correct one
        const allButtons = document.querySelectorAll('.option-btn');
        allButtons.forEach(btn => {
            if (btn.textContent === currentQuestion.correctMeaning) {
                btn.style.borderColor = '#2ed573';
                btn.style.color = '#2ed573';
            }
        });

        setTimeout(() => {
            isAnimating = false;
            nextQuestion();
        }, 1200);
    }
}

// Start game
initGame();
