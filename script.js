// Log a message to the console to ensure the script is linked correctly
console.log('JavaScript file is linked correctly.');

// --- Charity Water Pipe Game ---
// This code creates a simple 3x3 pipe-connecting game using only the DOM.
// The player clicks cells to rotate pipes and connect water from the spout (top-left) to the people (bottom-right).

// --- Charity Water Pipe Game with Blocked Squares ---

// Define the possible pipe types and their rotations
const PIPE_TYPES = [
    'empty',    // No pipe
    'hor',      // Horizontal pipe ─
    'ver',      // Vertical pipe │
    'bend1',    // Bend └
    'bend2',    // Bend ┌
    'bend3',    // Bend ┐
    'bend4'     // Bend ┘
];

// Add a new type for blocked squares
const BLOCKED = 'blocked';

// The initial board layout: 3x3 grid
// You can change which squares are blocked by setting 'blocked' in the array
let board = [
    ['spout', 'blocked', 'empty'],
    ['empty', 'empty', 'blocked'],
    ['empty', 'empty', 'people']
];

// Track if the game is running
let isPlaying = false;
let score = 0;

// Get DOM elements
const gameBoard = document.getElementById('gameBoard');
const exitBtn = document.getElementById('pauseBtn'); // Use the same button but change its function and label
const scoreSpan = document.getElementById('score');
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');
const startBtn = document.getElementById('startBtn');

// Add a variable for difficulty level
let difficulty = 'easy';

// Define 5 levels for each difficulty. Each board is always completable.
const levels = {
    easy: [
        [
            ['spout', 'empty', 'empty'],
            ['blocked', 'empty', 'blocked'],
            ['empty', 'empty', 'people']
        ],
        [
            ['spout', 'empty', 'blocked'],
            ['empty', 'empty', 'empty'],
            ['blocked', 'empty', 'people']
        ],
        [
            ['spout', 'empty', 'empty'],
            ['empty', 'blocked', 'blocked'],
            ['empty', 'empty', 'people']
        ],
        [
            ['spout', 'empty', 'blocked'],
            ['empty', 'blocked', 'empty'],
            ['empty', 'empty', 'people']
        ],
        [
            ['spout', 'empty', 'empty'],
            ['blocked', 'empty', 'empty'],
            ['blocked', 'empty', 'people']
        ]
    ],
    medium: [
        [
            ['spout', 'empty', 'blocked'],
            ['blocked', 'empty', 'empty'],
            ['empty', 'blocked', 'people']
        ],
        [
            ['spout', 'blocked', 'empty'],
            ['empty', 'empty', 'blocked'],
            ['empty', 'empty', 'people']
        ],
        [
            ['spout', 'blocked', 'empty'],
            ['empty', 'empty', 'blocked'],
            ['blocked', 'empty', 'people']
        ],
        [
            ['spout', 'empty', 'blocked'],
            ['blocked', 'empty', 'empty'],
            ['empty', 'blocked', 'people']
        ],
        [
            ['spout', 'blocked', 'empty'],
            ['empty', 'blocked', 'empty'],
            ['empty', 'empty', 'people']
        ]
    ],
    hard: [
        [
            ['spout', 'empty', 'empty'],
            ['blocked', 'empty', 'blocked'],
            ['empty', 'empty', 'people']
        ],
        [
            ['spout', 'blocked', 'empty'],
            ['empty', 'empty', 'empty'],
            ['blocked', 'blocked', 'people']
        ],
        [
            ['spout', 'blocked', 'blocked'],
            ['empty', 'empty', 'blocked'],
            ['blocked', 'empty', 'people']
        ],
        [
            ['spout', 'empty', 'empty'],
            ['blocked', 'empty', 'empty'],
            ['blocked', 'blocked', 'people']
        ],
        [
            ['spout', 'empty', 'empty'],
            ['blocked', 'blocked', 'empty'],
            ['blocked', 'empty', 'people']
        ]
    ]
};

// Track the current level index
let currentLevel = 0;

// Function to set up the board for the current level and difficulty
function setupBoard(level) {
    // Get the array of levels for the selected difficulty
    const levelBoards = levels[difficulty];
    // If currentLevel is out of range, reset to 0
    if (currentLevel >= levelBoards.length) {
        currentLevel = 0;
    }
    // Copy the board for this level (to avoid reference issues)
    board = levelBoards[currentLevel].map(row => row.slice());
}

// Add difficulty buttons to the start screen
const difficultyDiv = document.createElement('div');
difficultyDiv.style.marginTop = '16px';
difficultyDiv.innerHTML = `
  <label style="font-size:1rem;">Difficulty: </label>
  <button id="easyBtn">Easy</button>
  <button id="mediumBtn">Medium</button>
  <button id="hardBtn">Hard</button>
`;
startScreen.appendChild(difficultyDiv);

// Set up event listeners for difficulty buttons
document.getElementById('easyBtn').addEventListener('click', () => {
    difficulty = 'easy';
    highlightDifficulty();
    playSound(clickSound); // Play click sound
});
document.getElementById('mediumBtn').addEventListener('click', () => {
    difficulty = 'medium';
    highlightDifficulty();
    playSound(clickSound); // Play click sound
});
document.getElementById('hardBtn').addEventListener('click', () => {
    difficulty = 'hard';
    highlightDifficulty();
    playSound(clickSound); // Play click sound
});

// Highlight the selected difficulty button
function highlightDifficulty() {
    document.getElementById('easyBtn').style.background = (difficulty === 'easy') ? '#FFC907' : '#eee';
    document.getElementById('mediumBtn').style.background = (difficulty === 'medium') ? '#FFC907' : '#eee';
    document.getElementById('hardBtn').style.background = (difficulty === 'hard') ? '#FFC907' : '#eee';
}
highlightDifficulty();

// Show the game when Start is pressed
startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameContainer.style.display = 'flex';
    isPlaying = true;
    currentLevel = 0; // Always start at first level
    setupBoard(difficulty);
    renderBoard();
    score = 0;
    scoreSpan.textContent = score;
    playSound(clickSound); // Play click sound
});

// Change the button text from "Pause" to "Exit"
exitBtn.textContent = 'Exit';

// Make the button exit to the start screen
exitBtn.addEventListener('click', () => {
    gameContainer.style.display = 'none';
    startScreen.style.display = 'flex';
    isPlaying = false;
    playSound(clickSound); // Play click sound
});

// Helper: Render the board
function renderBoard() {
    // Clear the board
    gameBoard.innerHTML = '';
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cell = document.createElement('div');
            cell.classList.add('pipe-cell');
            // Add special classes for spout, people, and blocked
            if (board[row][col] === 'spout') {
                cell.classList.add('spout');
                cell.textContent = '💧';
            } else if (board[row][col] === 'people') {
                cell.classList.add('people');
                cell.textContent = '👨‍👩‍👧‍👦';
            } else if (board[row][col] === 'blocked') {
                cell.classList.add('blocked');
                cell.textContent = '⛔';
                cell.style.background = '#F5402C';
                cell.style.color = '#fff';
                cell.style.cursor = 'not-allowed';
            } else {
                // Show pipe type as a symbol
                cell.textContent = getPipeSymbol(board[row][col]);
            }
            // Add click handler for pipes (not for spout, people, or blocked)
            if (
                board[row][col] !== 'spout' &&
                board[row][col] !== 'people' &&
                board[row][col] !== 'blocked'
            ) {
                cell.addEventListener('click', () => rotatePipe(row, col));
            }
            cell.id = `cell-${row}-${col}`;
            gameBoard.appendChild(cell);
        }
    }
}

// Helper: Get a symbol for each pipe type
function getPipeSymbol(type) {
    switch(type) {
        case 'hor': return '─';
        case 'ver': return '│';
        case 'bend1': return '└';
        case 'bend2': return '┌';
        case 'bend3': return '┐';
        case 'bend4': return '┘';
        default: return '';
    }
}

// --- Sound Effects ---
// Get audio elements for sound effects
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const collectSound = document.getElementById('collectSound');
const missSound = document.getElementById('missSound');

// Helper function to play a sound safely
function playSound(sound) {
    if (sound) {
        sound.currentTime = 0; // rewind to start
        sound.play();
    }
}

// Rotate the pipe in a cell
function rotatePipe(row, col) {
    if (!isPlaying) return;
    // Find the next pipe type
    let idx = PIPE_TYPES.indexOf(board[row][col]);
    idx = (idx + 1) % PIPE_TYPES.length;
    board[row][col] = PIPE_TYPES[idx];
    renderBoard();
    playSound(collectSound); // Play collect sound when rotating a pipe
    checkConnection();
}

// Hide game on load
window.onload = () => {
    startScreen.style.display = 'flex';
    gameContainer.style.display = 'none';
};

// Check if water can flow from spout to people
function checkConnection() {
    // We'll use a simple DFS to see if there's a path
    const visited = Array.from({length: 3}, () => Array(3).fill(false));
    function dfs(r, c, fromDir) {
        if (r < 0 || r > 2 || c < 0 || c > 2) return false;
        if (visited[r][c]) return false;
        if (board[r][c] === 'blocked') return false; // Can't go through blocked
        visited[r][c] = true;
        const type = board[r][c];
        if (type === 'people') return true;
        // Get possible directions to move based on pipe type
        const dirs = getPipeConnections(type);
        for (const dir of dirs) {
            // Don't go back the way we came
            if (oppositeDir(dir) === fromDir) continue;
            const [dr, dc] = dirToDelta(dir);
            const nr = r + dr, nc = c + dc;
            if (nr < 0 || nr > 2 || nc < 0 || nc > 2) continue;
            // Check if the next cell connects back
            const nextType = board[nr][nc];
            if (nextType === 'blocked') continue; // Can't connect to blocked
            const nextDirs = getPipeConnections(nextType);
            if (nextDirs.includes(oppositeDir(dir))) {
                if (dfs(nr, nc, dir)) return true;
            }
        }
        return false;
    }
    // Start from spout (0,0)
    const connected = dfs(0, 0, null);
    // Highlight connected path if successful
    highlightConnection(connected);
    if (connected) {
        score++;
        scoreSpan.textContent = score;
        isPlaying = false;
        playSound(winSound); // Play win sound
        // Show a fact and a Learn More button
        setTimeout(() => {
            showFactModal();
        }, 100);
    }
}

// Get possible directions for each pipe type
function getPipeConnections(type) {
    switch(type) {
        case 'spout': return ['right', 'down'];
        case 'people': return ['left', 'up'];
        case 'hor': return ['left', 'right'];
        case 'ver': return ['up', 'down'];
        case 'bend1': return ['up', 'right']; // └
        case 'bend2': return ['right', 'down']; // ┌
        case 'bend3': return ['down', 'left']; // ┐
        case 'bend4': return ['left', 'up']; // ┘
        default: return [];
    }
}

// Convert direction to row/col delta
function dirToDelta(dir) {
    switch(dir) {
        case 'up': return [-1, 0];
        case 'down': return [1, 0];
        case 'left': return [0, -1];
        case 'right': return [0, 1];
    }
}

// Get the opposite direction
function oppositeDir(dir) {
    switch(dir) {
        case 'up': return 'down';
        case 'down': return 'up';
        case 'left': return 'right';
        case 'right': return 'left';
    }
}

// Highlight the connected path if successful
function highlightConnection(connected) {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const cell = document.getElementById(`cell-${row}-${col}`);
            if (cell) {
                if (connected && board[row][col] !== 'empty' && board[row][col] !== 'blocked') {
                    cell.classList.add('connected');
                } else {
                    cell.classList.remove('connected');
                }
            }
        }
    }
}

// Make the logo on the start screen a clickable link
const logoBox = document.querySelector('.logo-box');
if (logoBox) {
    logoBox.style.cursor = 'pointer'; // Show pointer cursor on hover
    logoBox.addEventListener('click', () => {
        // When the logo is clicked, go to the charity: water Kalahari campaign page
        window.open('https://www.charitywater.org/kalahari?&utm_source=liq&utm_medium=cpc&utm_campaign=kalahari_clean_water_africa&scid=4827200&kw=44014740:0&pub_cr_id=739682160921&device=c&network=g&targetid=kwd-994734980575&loc_interest_ms=&loc_physical_ms=9030088&tc=Cj0KCQjwmqPDBhCAARIsADorxIbZuWyHcdgKjcb2fjEqWc2m4Q35yYy-acILVlQ6haPPe23HH4b4ZwsaAkbeEALw_wcB&rl_key=0f914934468b22fa1a97e8217b8aa7be&gad_source=1&gad_campaignid=22353336167&gbraid=0AAAAA98QX6-Vw9wBzjA0dRPCFlEnXzxN2&gclid=Cj0KCQjwmqPDBhCAARIsADorxIbZuWyHcdgKjcb2fjEqWc2m4Q35yYy-acILVlQ6haPPe23HH4b4ZwsaAkbeEALw_wcB', '_blank');
    });
}

// Some facts from charitywater.org for students to learn
const charityFacts = [
    "771 million people in the world live without clean water.",
    "Every day, women and girls spend 200 million hours walking for water.",
    "Access to clean water can improve health, education, and income.",
    "Diseases from dirty water kill more people every year than all forms of violence, including war.",
    "Clean water helps kids spend more time in school and less time collecting water."
];

// This function shows a fact and a 'Learn More' button when the player wins
function showFactModal() {
    // Show confetti!
    showConfetti();
    playSound(winSound); // Play win sound again for celebration

    // Pick a random fact
    const fact = charityFacts[Math.floor(Math.random() * charityFacts.length)];

    // Create the modal background
    const modalBg = document.createElement('div');
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.4)';
    modalBg.style.display = 'flex';
    modalBg.style.justifyContent = 'center';
    modalBg.style.alignItems = 'center';
    modalBg.style.zIndex = '1000';

    // Create the modal box
    const modalBox = document.createElement('div');
    modalBox.style.background = '#fff';
    modalBox.style.borderRadius = '16px';
    modalBox.style.padding = '32px 24px';
    modalBox.style.boxShadow = '0 2px 16px rgba(0,0,0,0.15)';
    modalBox.style.textAlign = 'center';
    modalBox.style.maxWidth = '350px';

    // Add the fact text
    const factText = document.createElement('div');
    factText.textContent = fact;
    factText.style.fontSize = '1.1rem';
    factText.style.marginBottom = '24px';
    factText.style.color = '#2E9DF7';

    // Add the Learn More button
    const learnBtn = document.createElement('button');
    learnBtn.textContent = 'Learn More';
    learnBtn.style.background = '#FFC907';
    learnBtn.style.color = '#222';
    learnBtn.style.border = 'none';
    learnBtn.style.borderRadius = '8px';
    learnBtn.style.padding = '12px 24px';
    learnBtn.style.fontSize = '1rem';
    learnBtn.style.cursor = 'pointer';
    learnBtn.style.marginRight = '12px';
    learnBtn.addEventListener('click', () => {
        playSound(clickSound); // Play click sound
        window.open('https://www.charitywater.org/kalahari?&utm_source=liq&utm_medium=cpc&utm_campaign=kalahari_clean_water_africa&scid=4827200&kw=44014740:0&pub_cr_id=739682160921&device=c&network=g&targetid=kwd-994734980575&loc_interest_ms=&loc_physical_ms=9030088&tc=Cj0KCQjwmqPDBhCAARIsADorxIbZuWyHcdgKjcb2fjEqWc2m4Q35yYy-acILVlQ6haPPe23HH4b4ZwsaAkbeEALw_wcB&rl_key=0f914934468b22fa1a97e8217b8aa7be&gad_source=1&gad_campaignid=22353336167&gbraid=0AAAAA98QX6-Vw9wBzjA0dRPCFlEnXzxN2&gclid=Cj0KCQjwmqPDBhCAARIsADorxIbZuWyHcdgKjcb2fjEqWc2m4Q35yYy-acILVlQ6haPPe23HH4b4ZwsaAkbeEALw_wcB', '_blank');
    });

    // Add a Next Level button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next Level';
    nextBtn.style.background = '#4FCB53';
    nextBtn.style.color = '#fff';
    nextBtn.style.border = 'none';
    nextBtn.style.borderRadius = '8px';
    nextBtn.style.padding = '12px 24px';
    nextBtn.style.fontSize = '1rem';
    nextBtn.style.cursor = 'pointer';
    nextBtn.style.marginRight = '12px';

    // Add a close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.background = '#F5402C';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.padding = '12px 24px';
    closeBtn.style.fontSize = '1rem';
    closeBtn.style.cursor = 'pointer';

    // Add everything to the modal box
    modalBox.appendChild(factText);
    modalBox.appendChild(learnBtn);

    // If last level, show congratulations popup instead of Next Level
    if (currentLevel >= levels[difficulty].length - 1) {
        // Remove Next Level and Close, show Congratulations and Home button
        const congrats = document.createElement('div');
        congrats.textContent = '🎉 Congratulations! You finished all 5 levels!';
        congrats.style.fontSize = '1.2rem';
        congrats.style.fontWeight = 'bold';
        congrats.style.color = '#4FCB53';
        congrats.style.margin = '24px 0 16px 0';

        const homeBtn = document.createElement('button');
        homeBtn.textContent = 'Back to Home';
        homeBtn.style.background = '#2E9DF7';
        homeBtn.style.color = '#fff';
        homeBtn.style.border = 'none';
        homeBtn.style.borderRadius = '8px';
        homeBtn.style.padding = '12px 24px';
        homeBtn.style.fontSize = '1rem';
        homeBtn.style.cursor = 'pointer';
        homeBtn.addEventListener('click', () => {
            document.body.removeChild(modalBg);
            gameContainer.style.display = 'none';
            startScreen.style.display = 'flex';
            isPlaying = false;
        });

        modalBox.appendChild(congrats);
        modalBox.appendChild(homeBtn);
    } else {
        // Not last level, show Next Level and Close
        modalBox.appendChild(nextBtn);
        modalBox.appendChild(closeBtn);
    }

    // Add the modal box to the modal background
    modalBg.appendChild(modalBox);

    // Add the modal to the page
    document.body.appendChild(modalBg);

    // Next Level button logic
    nextBtn.addEventListener('click', () => {
        playSound(clickSound); // Play click sound
        document.body.removeChild(modalBg);
        currentLevel++;
        setupBoard(difficulty);
        isPlaying = true;
        renderBoard();
    });

    // Close button logic
    closeBtn.addEventListener('click', () => {
        playSound(clickSound); // Play click sound
        document.body.removeChild(modalBg);
    });
}

// This function creates a simple confetti effect using DOM elements
function showConfetti() {
    // Create a container for confetti
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.left = '0';
    confettiContainer.style.top = '0';
    confettiContainer.style.width = '100vw';
    confettiContainer.style.height = '100vh';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '2000';

    // Add 40 confetti pieces
    for (let i = 0; i < 40; i++) {
        const confetti = document.createElement('div');
        // Random size and color from brand palette
        const size = Math.random() * 12 + 8;
        const colors = ['#FFC907', '#2E9DF7', '#8BD1CB', '#4FCB53', '#FF902A', '#F5402C', '#159A48', '#F16061'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.position = 'absolute';
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size * 0.4}px`;
        confetti.style.background = color;
        confetti.style.borderRadius = '3px';
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = `-20px`;
        confetti.style.opacity = '0.85';
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.transition = 'top 2.2s linear, left 2.2s linear, opacity 2.2s';

        // Animate confetti falling
        setTimeout(() => {
            confetti.style.top = `${80 + Math.random() * 15}vh`;
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.opacity = '0';
        }, 10);

        confettiContainer.appendChild(confetti);
    }

    document.body.appendChild(confettiContainer);

    // Remove confetti after animation
    setTimeout(() => {
        document.body.removeChild(confettiContainer);
    }, 2300);
}

// Update showFactModal to show a congratulations popup after all 5 levels
function showFactModal() {
    // Show confetti!
    showConfetti();
    playSound(winSound); // Play win sound again for celebration

    // Pick a random fact
    const fact = charityFacts[Math.floor(Math.random() * charityFacts.length)];

    // Create the modal background
    const modalBg = document.createElement('div');
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.4)';
    modalBg.style.display = 'flex';
    modalBg.style.justifyContent = 'center';
    modalBg.style.alignItems = 'center';
    modalBg.style.zIndex = '1000';

    // Create the modal box
    const modalBox = document.createElement('div');
    modalBox.style.background = '#fff';
    modalBox.style.borderRadius = '16px';
    modalBox.style.padding = '32px 24px';
    modalBox.style.boxShadow = '0 2px 16px rgba(0,0,0,0.15)';
    modalBox.style.textAlign = 'center';
    modalBox.style.maxWidth = '350px';

    // Add the fact text
    const factText = document.createElement('div');
    factText.textContent = fact;
    factText.style.fontSize = '1.1rem';
    factText.style.marginBottom = '24px';
    factText.style.color = '#2E9DF7';

    // Add the Learn More button
    const learnBtn = document.createElement('button');
    learnBtn.textContent = 'Learn More';
    learnBtn.style.background = '#FFC907';
    learnBtn.style.color = '#222';
    learnBtn.style.border = 'none';
    learnBtn.style.borderRadius = '8px';
    learnBtn.style.padding = '12px 24px';
    learnBtn.style.fontSize = '1rem';
    learnBtn.style.cursor = 'pointer';
    learnBtn.style.marginRight = '12px';
    learnBtn.addEventListener('click', () => {
        playSound(clickSound); // Play click sound
        window.open('https://www.charitywater.org/kalahari?&utm_source=liq&utm_medium=cpc&utm_campaign=kalahari_clean_water_africa&scid=4827200&kw=44014740:0&pub_cr_id=739682160921&device=c&network=g&targetid=kwd-994734980575&loc_interest_ms=&loc_physical_ms=9030088&tc=Cj0KCQjwmqPDBhCAARIsADorxIbZuWyHcdgKjcb2fjEqWc2m4Q35yYy-acILVlQ6haPPe23HH4b4ZwsaAkbeEALw_wcB&rl_key=0f914934468b22fa1a97e8217b8aa7be&gad_source=1&gad_campaignid=22353336167&gbraid=0AAAAA98QX6-Vw9wBzjA0dRPCFlEnXzxN2&gclid=Cj0KCQjwmqPDBhCAARIsADorxIbZuWyHcdgKjcb2fjEqWc2m4Q35yYy-acILVlQ6haPPe23HH4b4ZwsaAkbeEALw_wcB', '_blank');
    });

    // Add a Next Level button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next Level';
    nextBtn.style.background = '#4FCB53';
    nextBtn.style.color = '#fff';
    nextBtn.style.border = 'none';
    nextBtn.style.borderRadius = '8px';
    nextBtn.style.padding = '12px 24px';
    nextBtn.style.fontSize = '1rem';
    nextBtn.style.cursor = 'pointer';
    nextBtn.style.marginRight = '12px';

    // Add a close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.background = '#F5402C';
    closeBtn.style.color = '#fff';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.padding = '12px 24px';
    closeBtn.style.fontSize = '1rem';
    closeBtn.style.cursor = 'pointer';

    // Add everything to the modal box
    modalBox.appendChild(factText);
    modalBox.appendChild(learnBtn);

    // If last level, show congratulations popup instead of Next Level
    if (currentLevel >= levels[difficulty].length - 1) {
        // Remove Next Level and Close, show Congratulations and Home button
        const congrats = document.createElement('div');
        congrats.textContent = '🎉 Congratulations! You finished all 5 levels!';
        congrats.style.fontSize = '1.2rem';
        congrats.style.fontWeight = 'bold';
        congrats.style.color = '#4FCB53';
        congrats.style.margin = '24px 0 16px 0';

        const homeBtn = document.createElement('button');
        homeBtn.textContent = 'Back to Home';
        homeBtn.style.background = '#2E9DF7';
        homeBtn.style.color = '#fff';
        homeBtn.style.border = 'none';
        homeBtn.style.borderRadius = '8px';
        homeBtn.style.padding = '12px 24px';
        homeBtn.style.fontSize = '1rem';
        homeBtn.style.cursor = 'pointer';
        homeBtn.addEventListener('click', () => {
            document.body.removeChild(modalBg);
            gameContainer.style.display = 'none';
            startScreen.style.display = 'flex';
            isPlaying = false;
        });

        modalBox.appendChild(congrats);
        modalBox.appendChild(homeBtn);
    } else {
        // Not last level, show Next Level and Close
        modalBox.appendChild(nextBtn);
        modalBox.appendChild(closeBtn);
    }

    // Add the modal box to the modal background
    modalBg.appendChild(modalBox);

    // Add the modal to the page
    document.body.appendChild(modalBg);

    // Next Level button logic
    nextBtn.addEventListener('click', () => {
        playSound(clickSound); // Play click sound
        document.body.removeChild(modalBg);
        currentLevel++;
        setupBoard(difficulty);
        isPlaying = true;
        renderBoard();
    });

    // Close button logic
    closeBtn.addEventListener('click', () => {
        playSound(clickSound); // Play click sound
        document.body.removeChild(modalBg);
    });

    // ...existing code...
}
