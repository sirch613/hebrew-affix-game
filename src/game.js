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

const SILLY_FISH_IMGS = [
    'assets/silly_fish_1.png',
    'assets/silly_fish_2.png',
    'assets/silly_fish_3.png'
];
const DEAD_FISH_IMG = 'assets/special_dead_fish.png';

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

function addFishToAquarium(isSpecial) {
    const img = document.createElement('img');
    if (isSpecial) {
        img.src = DEAD_FISH_IMG;
        img.className = 'fish special float-anim';
    } else {
        const randomFish = SILLY_FISH_IMGS[Math.floor(Math.random() * SILLY_FISH_IMGS.length)];
        img.src = randomFish;
        img.className = 'fish float-anim';
        // random delay for floating so they don't sync
        img.style.animationDelay = `${Math.random() * 2}s`;
    }
    aquarium.appendChild(img);
    // Scroll to bottom of aquarium to see new fish
    aquarium.scrollTop = aquarium.scrollHeight;
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

        // Give a standard fish
        if (streak % 5 === 0) {
            // Give special dead fish
            addFishToAquarium(true);
            // Randomize the fish sound pitch
            playFishSound();
            addFishToAquarium(false);
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
