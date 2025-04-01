document.addEventListener('DOMContentLoaded', () => {
    // Game constants
    const BOARD_SIZE = 8;
    const CANDY_TYPES = 6;
    const MATCH_MIN = 3;
    const POINTS_PER_CANDY = 10;
    
    // Game state variables
    let board = [];
    let score = 0;
    let selectedCandy = null;
    let isSwapping = false;
    let isFilling = false;
    
    // DOM elements
    const boardElement = document.getElementById('board');
    const scoreElement = document.getElementById('score');
    const restartButton = document.getElementById('restart');
    
    // Initialize the game
    initGame();
    
    // Event listeners
    restartButton.addEventListener('click', initGame);
    
    // Functions
    function initGame() {
        // Reset game state
        board = [];
        score = 0;
        selectedCandy = null;
        isSwapping = false;
        isFilling = false;
        scoreElement.textContent = score;
        boardElement.innerHTML = '';
        
        // Create the board
        createBoard();
        
        // Find and remove initial matches
        removeInitialMatches();
    }
    
    function createBoard() {
        // Create 2D array for board
        for (let i = 0; i < BOARD_SIZE; i++) {
            board[i] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                const type = getRandomCandyType();
                board[i][j] = type;
                
                // Create candy element
                const candy = document.createElement('div');
                candy.className = `candy type${type}`;
                candy.dataset.row = i;
                candy.dataset.col = j;
                candy.addEventListener('click', handleCandyClick);
                boardElement.appendChild(candy);
            }
        }
    }
    
    function getRandomCandyType() {
        return Math.floor(Math.random() * CANDY_TYPES) + 1;
    }
    
    function removeInitialMatches() {
        let hasMatches = true;
        
        while (hasMatches) {
            hasMatches = false;
            
            // Find all matches
            const matches = findAllMatches();
            
            if (matches.length > 0) {
                hasMatches = true;
                
                // Replace matched candies with new ones
                for (const candy of matches) {
                    const { row, col } = candy;
                    board[row][col] = getRandomCandyType();
                }
                
                // Update the DOM
                updateBoardView();
            }
        }
    }
    
    function handleCandyClick(event) {
        if (isSwapping || isFilling) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        if (selectedCandy === null) {
            // Select the candy
            selectedCandy = { row, col };
            event.target.classList.add('selected');
        } else {
            // Check if the clicked candy is adjacent to the selected one
            if (isAdjacent(selectedCandy, { row, col })) {
                // Swap the candies
                swapCandies(selectedCandy, { row, col });
            } else {
                // Deselect the current candy and select the new one
                document.querySelector('.candy.selected').classList.remove('selected');
                selectedCandy = { row, col };
                event.target.classList.add('selected');
            }
        }
    }
    
    function isAdjacent(pos1, pos2) {
        return (
            (Math.abs(pos1.row - pos2.row) === 1 && pos1.col === pos2.col) ||
            (Math.abs(pos1.col - pos2.col) === 1 && pos1.row === pos2.row)
        );
    }
    
    function swapCandies(pos1, pos2) {
        isSwapping = true;
        
        // Visually deselect the candy
        document.querySelector('.candy.selected').classList.remove('selected');
        
        // Swap in board array
        const temp = board[pos1.row][pos1.col];
        board[pos1.row][pos1.col] = board[pos2.row][pos2.col];
        board[pos2.row][pos2.col] = temp;
        
        // Update the view
        updateBoardView();
        
        // Check if the swap creates a match
        setTimeout(() => {
            const matches = findAllMatches();
            
            if (matches.length > 0) {
                // Match found, remove matches and drop candies
                removeMatches(matches);
            } else {
                // No match, swap back
                const temp = board[pos1.row][pos1.col];
                board[pos1.row][pos1.col] = board[pos2.row][pos2.col];
                board[pos2.row][pos2.col] = temp;
                
                // Update the view
                updateBoardView();
                isSwapping = false;
            }
            
            selectedCandy = null;
        }, 300);
    }
    
    function updateBoardView() {
        const candies = document.querySelectorAll('.candy');
        
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                const index = i * BOARD_SIZE + j;
                candies[index].className = `candy type${board[i][j]}`;
                candies[index].dataset.row = i;
                candies[index].dataset.col = j;
            }
        }
    }
    
    function findAllMatches() {
        const matches = [];
        
        // Check horizontal matches
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE - 2; col++) {
                const candyType = board[row][col];
                if (
                    candyType === board[row][col + 1] &&
                    candyType === board[row][col + 2]
                ) {
                    // Found at least 3 in a row
                    let matchLength = 3;
                    while (
                        col + matchLength < BOARD_SIZE &&
                        board[row][col + matchLength] === candyType
                    ) {
                        matchLength++;
                    }
                    
                    // Add all candies in the match to the matches array
                    for (let i = 0; i < matchLength; i++) {
                        matches.push({ row, col: col + i });
                    }
                    
                    // Skip the matched candies
                    col += matchLength - 1;
                }
            }
        }
        
        // Check vertical matches
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = 0; row < BOARD_SIZE - 2; row++) {
                const candyType = board[row][col];
                if (
                    candyType === board[row + 1][col] &&
                    candyType === board[row + 2][col]
                ) {
                    // Found at least 3 in a column
                    let matchLength = 3;
                    while (
                        row + matchLength < BOARD_SIZE &&
                        board[row + matchLength][col] === candyType
                    ) {
                        matchLength++;
                    }
                    
                    // Add all candies in the match to the matches array
                    for (let i = 0; i < matchLength; i++) {
                        matches.push({ row: row + i, col });
                    }
                    
                    // Skip the matched candies
                    row += matchLength - 1;
                }
            }
        }
        
        // Remove duplicates (candies that are part of both horizontal and vertical matches)
        return Array.from(new Set(matches.map(JSON.stringify))).map(JSON.parse);
    }
    
    function removeMatches(matches) {
        // Add to score
        score += matches.length * POINTS_PER_CANDY;
        scoreElement.textContent = score;
        
        // Mark all matching candies for visual effect
        for (const candy of matches) {
            const { row, col } = candy;
            const index = row * BOARD_SIZE + col;
            const candyElement = document.querySelectorAll('.candy')[index];
            candyElement.classList.add('pop');
        }
        
        // After animation, drop candies and fill in new ones
        setTimeout(() => {
            dropCandies(matches);
        }, 300);
    }
    
    function dropCandies(matches) {
        isFilling = true;
        
        // Remove all matched candies
        for (const candy of matches) {
            const { row, col } = candy;
            // Mark position as empty (0)
            board[row][col] = 0;
        }
        
        // Drop existing candies down
        for (let col = 0; col < BOARD_SIZE; col++) {
            let emptyCount = 0;
            
            // Start from bottom and move up
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                if (board[row][col] === 0) {
                    emptyCount++;
                } else if (emptyCount > 0) {
                    // Move candy down
                    board[row + emptyCount][col] = board[row][col];
                    board[row][col] = 0;
                }
            }
            
            // Fill in new candies at the top
            for (let row = 0; row < emptyCount; row++) {
                board[row][col] = getRandomCandyType();
            }
        }
        
        // Update the view with drop animation
        updateBoardView();
        
        // Apply drop animation to new candies
        const candies = document.querySelectorAll('.candy');
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                const index = i * BOARD_SIZE + j;
                candies[index].classList.add('drop');
            }
        }
        
        // Check for new matches after dropping
        setTimeout(() => {
            // Remove the animation classes
            for (const candy of candies) {
                candy.classList.remove('drop', 'pop');
            }
            
            // Check for new matches
            const newMatches = findAllMatches();
            
            if (newMatches.length > 0) {
                // If new matches are found, remove them
                removeMatches(newMatches);
            } else {
                // If no new matches, continue the game
                isSwapping = false;
                isFilling = false;
            }
        }, 300);
    }
});
