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
        
        // Get DOM elements for the two candies
        const candies = document.querySelectorAll('.candy');
        const index1 = pos1.row * BOARD_SIZE + pos1.col;
        const index2 = pos2.row * BOARD_SIZE + pos2.col;
        const candy1 = candies[index1];
        const candy2 = candies[index2];
        
        // Determine the direction of movement
        let direction1, direction2;
        if (pos1.row < pos2.row) {
            direction1 = 'moveDown';
            direction2 = 'moveUp';
        } else if (pos1.row > pos2.row) {
            direction1 = 'moveUp';
            direction2 = 'moveDown';
        } else if (pos1.col < pos2.col) {
            direction1 = 'moveRight';
            direction2 = 'moveLeft';
        } else {
            direction1 = 'moveLeft';
            direction2 = 'moveRight';
        }
        
        // Add animation classes
        candy1.classList.add(direction1);
        candy2.classList.add(direction2);
        
        // Swap in board array
        const temp = board[pos1.row][pos1.col];
        board[pos1.row][pos1.col] = board[pos2.row][pos2.col];
        board[pos2.row][pos2.col] = temp;
        
        // After animation completes, update the view and check for matches
        setTimeout(() => {
            // Remove animation classes
            candy1.classList.remove(direction1);
            candy2.classList.remove(direction2);
            
            // Update the view
            updateBoardView();
            
            // Check if the swap creates a match
            const matches = findAllMatches();
            
            if (matches.length > 0) {
                // Match found, remove matches and drop candies
                removeMatches(matches);
            } else {
                // No match, animate swap back
                const candiesUpdated = document.querySelectorAll('.candy');
                const candy1Updated = candiesUpdated[index1];
                const candy2Updated = candiesUpdated[index2];
                
                candy1Updated.classList.add(direction2);
                candy2Updated.classList.add(direction1);
                
                setTimeout(() => {
                    // Remove animation classes
                    candy1Updated.classList.remove(direction2);
                    candy2Updated.classList.remove(direction1);
                    
                    // Swap back in board array
                    const temp = board[pos1.row][pos1.col];
                    board[pos1.row][pos1.col] = board[pos2.row][pos2.col];
                    board[pos2.row][pos2.col] = temp;
                    
                    // Update the view
                    updateBoardView();
                    isSwapping = false;
                }, 300);
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
        
        // Remove all matched candies and mark with pop animation
        for (const candy of matches) {
            const { row, col } = candy;
            const index = row * BOARD_SIZE + col;
            const candyElement = document.querySelectorAll('.candy')[index];
            candyElement.classList.add('pop');
        }
        
        // Wait for pop animation to complete before dropping
        setTimeout(() => {
            // Remove all matched candies
            for (const candy of matches) {
                const { row, col } = candy;
                // Mark position as empty (0)
                board[row][col] = 0;
            }
            
            // Calculate new positions for dropping candies
            const dropMoves = [];
            
            // Map out the drop movements
            for (let col = 0; col < BOARD_SIZE; col++) {
                let emptySpaces = 0;
                
                // Start from bottom and move up
                for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                    if (board[row][col] === 0) {
                        emptySpaces++;
                    } else if (emptySpaces > 0) {
                        // Record the move information for animation
                        dropMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: row + emptySpaces,
                            toCol: col,
                            type: board[row][col]
                        });
                        
                        // Move candy down in the board array
                        board[row + emptySpaces][col] = board[row][col];
                        board[row][col] = 0;
                    }
                }
                
                // Record new candies to be added at the top
                for (let i = 0; i < emptySpaces; i++) {
                    const type = getRandomCandyType();
                    board[i][col] = type;
                }
            }
            
            // Update the view without animations first
            updateBoardView();
            
            // Apply drop animations to moved candies
            const allCandies = document.querySelectorAll('.candy');
            
            // Clear any previous animations
            allCandies.forEach(candy => {
                candy.classList.remove('pop', 'drop', 'moveDown', 'moveUp', 'moveLeft', 'moveRight');
            });
            
            // Apply drop animations to moved candies
            dropMoves.forEach(move => {
                const index = move.toRow * BOARD_SIZE + move.toCol;
                const candy = allCandies[index];
                
                // Calculate distance to drop
                const dropDistance = move.toRow - move.fromRow;
                
                // Apply custom drop animation based on distance
                candy.style.transform = `translateY(-${dropDistance * 50}px)`;
                candy.style.transition = 'none';
                
                // Force reflow to make sure the transform is applied
                void candy.offsetWidth;
                
                // Now animate back to normal position
                candy.style.transition = 'transform 0.5s ease';
                candy.style.transform = 'translateY(0)';
            });
            
            // Apply drop animation to new candies at the top
            for (let i = 0; i < BOARD_SIZE; i++) {
                for (let j = 0; j < BOARD_SIZE; j++) {
                    const index = i * BOARD_SIZE + j;
                    const candy = allCandies[index];
                    
                    // If this is a new candy at the top, add drop animation
                    if (dropMoves.every(move => move.toRow !== i || move.toCol !== j) && i < matches.length) {
                        candy.classList.add('drop');
                    }
                }
            }
            
            // Check for new matches after all animations complete
            setTimeout(() => {
                // Check for new matches
                const newMatches = findAllMatches();
                
                if (newMatches.length > 0) {
                    // If new matches are found, remove them
                    dropCandies(newMatches);
                } else {
                    // If no new matches, continue the game
                    isSwapping = false;
                    isFilling = false;
                }
            }, 500); // Slightly longer delay to account for drop animations
        }, 300); // Wait for pop animation
    }
});
