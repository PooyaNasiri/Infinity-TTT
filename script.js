/**
 * INFINITY TIC-TAC-TOE | CELESTIAL PROTOCOL
 * Integrated Logic Engine
 */

const board = document.getElementById('board');
const hudX = document.getElementById('hud-x');
const hudO = document.getElementById('hud-o');
const cursorGlow = document.getElementById('cursor-glow');
const modal = document.getElementById('modal');

// --- Global State Management ---
let currentPlayer = 'X';
let gameActive = true;
let roundCount = 1;
let scores = { 'X': 0, 'O': 0 };
let queues = { 'X': [], 'O': [] }; // Tracks the last 3 moves for each player

/**
 * 1. SENSORY FEEDBACK: Mouse Tracking & Custom Cursor
 */
document.addEventListener('mousemove', (e) => {
    // The glow and the X/O symbol follow the mouse coordinate
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

/**
 * 2. CORE INITIALIZATION
 */
function init() {
    board.innerHTML = '';
    // Clear the board physically and create 9 fresh tactical cells
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        cell.addEventListener('click', () => makeMove(cell, i));
        board.appendChild(cell);
    }
    updateUI();
}

/**
 * 3. THE INFINITY MOVE HANDLER
 */
function makeMove(cell, index) {
    if (!gameActive || cell.innerHTML !== '') return;

    const currentQueue = queues[currentPlayer];

    // INFINITY PROTOCOL: If the player has 3 pieces, the oldest (first-in) must be removed
    if (currentQueue.length === 3) {
        const oldestIdx = currentQueue.shift();
        const oldestCell = document.querySelector(`[data-index="${oldestIdx}"]`);
        
        // Instant removal of the ghosted piece
        oldestCell.innerHTML = '';
        oldestCell.className = 'cell';
    }

    // Register new move
    currentQueue.push(index);
    const svgId = currentPlayer === 'X' ? '#svg-x' : '#svg-o';
    cell.innerHTML = `<svg><use href="${svgId}"></use></svg>`;
    cell.classList.add(currentPlayer.toLowerCase());

    // Check for win condition
    const winCombo = checkWin();
    if (winCombo) {
        triggerVictory(winCombo);
        return;
    }

    // Toggle player and refresh UI
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateUI();
}

/**
 * 4. DYNAMIC UI & UX REFRESH
 */
function updateUI() {
    // HUD Active States
    hudX.classList.toggle('active', currentPlayer === 'X');
    hudO.classList.toggle('active', currentPlayer === 'O');

    // TURN-BASED CURSOR: Updates the X/O symbol following the mouse
    cursorGlow.setAttribute('data-symbol', currentPlayer);

    // TURN-BASED TILT: Leans the board toward the active player
    board.classList.toggle('tilt-x', currentPlayer === 'X');
    board.classList.toggle('tilt-o', currentPlayer === 'O');

    // UPDATE SLOT DOTS: Visualizes how many pieces are currently on board
    ['X', 'O'].forEach(p => {
        const dots = document.querySelectorAll(`#slots-${p.toLowerCase()} .slot`);
        dots.forEach((dot, i) => {
            dot.classList.toggle('filled', i < queues[p].length);
        });
    });

    // STATIC FADE WARNING: Identifies the next piece scheduled for deletion
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('fading'));
    const nextQueue = queues[currentPlayer];
    if (nextQueue.length === 3) {
        const oldestIdx = nextQueue[0];
        const targetCell = document.querySelector(`[data-index="${oldestIdx}"]`);
        if (targetCell) targetCell.classList.add('fading');
    }
}

/**
 * 5. WIN CALCULATION
 */
function checkWin() {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8], // Rows
        [0,3,6],[1,4,7],[2,5,8], // Cols
        [0,4,8],[2,4,6]           // Diagonals
    ];
    const cells = document.querySelectorAll('.cell');
    
    // Returns the winning combination array if found
    const winningPattern = wins.find(combo => 
        combo.every(i => cells[i].classList.contains(currentPlayer.toLowerCase()))
    );
    return winningPattern || null;
}

/**
 * 6. EXCITING END-GAME SEQUENCE
 */
function triggerVictory(combo) {
    gameActive = false;
    scores[currentPlayer]++; // Record the round win
    
    // Visual Juice: Shake the screen and highlight the path to victory
    document.body.classList.add('victory-shake');
    combo.forEach(idx => {
        document.querySelector(`[data-index="${idx}"]`).classList.add('winning-cell');
    });

    // Short delay to let the visual impact land before showing the modal
    setTimeout(() => {
        document.body.classList.remove('victory-shake');
        endGame();
    }, 600);
}

function endGame() {
    // Display Modal and update Player Scores
    document.getElementById('winner-symbol').innerText = currentPlayer;
    
    // Update Score HUDs (00 format)
    document.getElementById('score-x').innerText = "X : " + scores['X'].toString().padStart(2, '0');
    document.getElementById('score-o').innerText = "O : " + scores['O'].toString().padStart(2, '0');
    
    modal.classList.add('active');
}

/**
 * 7. SESSION MANAGEMENT
 */
function resetGame(nextRound = true) {
    // Increment session rounds
    if (nextRound) roundCount++;
    document.getElementById('round-display').innerText = `ROUND ${roundCount.toString().padStart(2, '0')}`;

    // Reset tactical state
    queues = { 'X': [], 'O': [] };
    currentPlayer = 'X';
    gameActive = true;
    modal.classList.remove('active');
    
    init();
}

// --- Initialize Celestial Protocol ---
document.getElementById('reset-btn').addEventListener('click', () => resetGame(false));
init();