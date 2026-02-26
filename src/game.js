import { GAME_DATA } from './data.js';
import { addFish, addMilestoneFish, burstBubbles } from './water.js';

let score = 0;
let streak = 0;
let totalCorrect = 0;  // tracks total correct answers for milestones
let currentLevel = 1;
let scoreInCurrentLevel = 0;

let currentQuestion = null;
let isAnimating = false;

// Milestone tracking — each milestone fires only once
const milestones = {
    5: false,   // Ruby fish
    10: false,  // Emerald fish
    15: false   // Diamond fish
};

const scoreDisplay = document.getElementById('score-display');
const streakDisplay = document.getElementById('streak-display');
const levelDisplay = document.getElementById('level-display');
const wordContainer = document.getElementById('hebrew-word');
const optionsGrid = document.getElementById('options-grid');

// Hint UI elements
const hintBtn = document.getElementById('hint-btn');
const hintOverlay = document.getElementById('hint-overlay');
const closeHintBtn = document.getElementById('close-hint-btn');
const hintText = document.getElementById('hint-text');

hintBtn.addEventListener('click', () => {
    hintOverlay.classList.remove('hidden');
});
closeHintBtn.addEventListener('click', () => {
    hintOverlay.classList.add('hidden');
});

const FISH_IMGS = [
    'assets/fish_1.png',
    'assets/fish_2.png',
    'assets/fish_3.png',
    'assets/fish_4.png'
];
const FISH_SPECIAL = 'assets/fish_special.png';

// --- Synthesis for "Fishy / Bubble" sounds ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playFishSound() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = 'sine';
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
    totalCorrect = 0;
    currentLevel = 1;
    scoreInCurrentLevel = 0;
    Object.keys(milestones).forEach(k => milestones[k] = false);
    updateStats();
    nextQuestion();
}

function updateStats() {
    scoreDisplay.textContent = `Score: ${score}`;
    streakDisplay.textContent = `Streak: ${streak} 🔥`;
    levelDisplay.textContent = `Level: ${currentLevel}`;

    if (streak > 0 && streak % 5 === 0) {
        streakDisplay.style.transform = 'scale(1.2)';
        setTimeout(() => streakDisplay.style.transform = 'scale(1)', 300);
    }
}

function getAvailableQuestions() {
    const questions = GAME_DATA.filter(q => q.level === currentLevel);
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

    if (currentQuestion.isPrefix) {
        wordContainer.appendChild(affixSpan);
        wordContainer.appendChild(rootSpan);
    } else {
        wordContainer.appendChild(rootSpan);
        wordContainer.appendChild(affixSpan);
    }

    let meaningP = document.getElementById('word-translation');
    if (!meaningP) {
        meaningP = document.createElement('p');
        meaningP.id = 'word-translation';
        meaningP.style.fontSize = '1.3rem';
        meaningP.style.margin = '-10px 0 20px 0';
        meaningP.style.opacity = '0.8';
        meaningP.style.fontStyle = 'italic';
        wordContainer.after(meaningP);
    }
    meaningP.textContent = `(${currentQuestion.englishWord})`;

    hintText.textContent = currentQuestion.hint;

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

function awardFish() {
    // Regular goldfish on every correct answer
    const src = FISH_IMGS[Math.floor(Math.random() * FISH_IMGS.length)];
    addFish(src, 45);
    burstBubbles(6);

    // Streak bonus: special golden koi every 5-streak
    if (streak % 5 === 0) {
        addFish(FISH_SPECIAL, 55);
        burstBubbles(10);
    }

    // Milestone rewards based on total correct
    if (totalCorrect === 5 && !milestones[5]) {
        milestones[5] = true;
        addMilestoneFish('assets/ruby_fish.png', 90, 'rgba(255, 50, 50, 0.7)');
        burstBubbles(15);
    }
    if (totalCorrect === 10 && !milestones[10]) {
        milestones[10] = true;
        addMilestoneFish('assets/emerald_fish.png', 110, 'rgba(50, 255, 100, 0.7)');
        burstBubbles(20);
    }
    if (totalCorrect === 15 && !milestones[15]) {
        milestones[15] = true;
        addMilestoneFish('assets/diamond_fish.png', 150, 'rgba(180, 220, 255, 0.9)');
        burstBubbles(30);
    }
}

function advanceLevelCheck() {
    if (scoreInCurrentLevel >= 5) {
        scoreInCurrentLevel = 0;
        currentLevel++;
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
        totalCorrect += 1;
        scoreInCurrentLevel += 1;

        playFishSound();
        awardFish();

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
