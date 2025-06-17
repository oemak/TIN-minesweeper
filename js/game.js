import { Cell } from './cell.js';
import { UI } from './ui.js';
import { Counter } from './counter.js';
import { Timer } from './timer.js';
import { ResetButton } from './resetButton.js';
import { Modal } from './modal.js';

class Game extends UI {
    #config = {
        easy: {
            rows: 8,
            cols: 8,
            mines: 10,
            key: 'easy_scores'
        },
        normal: {
            rows: 16,
            cols: 16,
            mines: 40,
            key: 'normal_scores'
        },
        expert: {
            rows: 16,
            cols: 30,
            mines: 99,
            key: 'expert_scores'
        }
    }

    #counter = new Counter();
    #timer = new Timer();
    #modal = new Modal();

    #isGameFinished = false;
    #numberOfRows = null;
    #numberOfCols = null;
    #numberOfMines = null;

    #cells = [];
    #cellsElements = null;
    #cellsToReveal = 0;
    #revealedCells = 0;

    #board = null;
    #buttons = {
        modal: null,
        easy: null,
        normal: null,
        expert: null,
        reset: new ResetButton(),
    }

    initializeGame() {
        this.#handleElements();
        this.#counter.init();
        this.#timer.init();
        this.#modal.init();
        this.#modal.onPlayAgain = () => this.#handleNewGameClick();
        this.#addButtonsEventListeners();
        this.#newGame()
    }

    #newGame(
        rows = this.#config.easy.rows,
        cols = this.#config.easy.cols,
        mines = this.#config.easy.mines,
    ){
        this.#numberOfRows = rows;
        this.#numberOfCols = cols;
        this.#numberOfMines = mines;

        this.#counter.setValue(this.#numberOfMines);
        this.#timer.resetTimer();

        this.#cellsToReveal = this.#numberOfCols * this.#numberOfRows - this.#numberOfMines;

        this.#setStyles();

        this.#generateCells();
        this.#renderBoard();
        this.#placeMinesInCells();

        this.#cellsElements = this.getElements(this.UISelectors.cell);

        this.#buttons.reset.changeEmotion('neutral');

        this.#isGameFinished = false;
        this.#revealedCells = 0;

        this.#addCellsEventListeners();
        
        // Show high scores for current difficulty
        this.#showHighScores();
    }

    #endGame(isWin) {
        this.#isGameFinished = true;
        this.#timer.stoptTimer();
        this.#modal.buttonText = 'Play again!';

        if(!isWin) {
            this.#revealMines();
            this.#modal.infoText = 'You lost, try again!';
            this.#buttons.reset.changeEmotion('sad');
            this.#modal.setText();
            this.#modal.toggleModal();
            return;
        }

        const currentTime = this.#timer.numberOfSeconds;
        console.log('Game won with time:', currentTime);
        this.#saveScore(currentTime);
        this.#showHighScores();

        this.#modal.infoText = currentTime < this.#timer.maxNumberOfSeconds
            ? `You won, it took you ${currentTime} seconds, congratulations!`
            : 'You won, congratulations';
        this.#buttons.reset.changeEmotion('happy');
        this.#modal.setText();
        this.#modal.toggleModal();
    }

    #saveScore(time) {
        try {
            const difficulty = this.#getCurrentDifficulty();
            const scores = this.#getScores(difficulty.key);
            scores.push(time);
            scores.sort((a, b) => a - b);
            scores.splice(5); // Keep only top 5 scores
            const scoresString = JSON.stringify(scores);
            localStorage.setItem(difficulty.key, scoresString);
            console.log(`Saved score ${time} for ${difficulty.key}:`, scores);
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }

    #getScores(key) {
        try {
            const scoresString = localStorage.getItem(key);
            if (!scoresString) {
                console.log(`No scores found for ${key}`);
                return [];
            }
            const scores = JSON.parse(scoresString);
            console.log(`Retrieved scores for ${key}:`, scores);
            return Array.isArray(scores) ? scores : [];
        } catch (error) {
            console.error('Error getting scores:', error);
            return [];
        }
    }

    #showHighScores() {
        try {
            const difficulty = this.#getCurrentDifficulty();
            const scores = this.#getScores(difficulty.key);
            console.log(`Showing scores for ${difficulty.key}:`, scores);
            if (this.#modal && this.#modal.updateScoresTable) {
                this.#modal.updateScoresTable(scores);
            }
        } catch (error) {
            console.error('Error showing high scores:', error);
        }
    }

    #getCurrentDifficulty() {
        if (this.#numberOfRows === this.#config.easy.rows && 
            this.#numberOfCols === this.#config.easy.cols) {
            return this.#config.easy;
        } else if (this.#numberOfRows === this.#config.normal.rows && 
                   this.#numberOfCols === this.#config.normal.cols) {
            return this.#config.normal;
        } else {
            return this.#config.expert;
        }
    }

    #handleElements() {
        try {
            this.#board = this.getElement(this.UISelectors.board);
            this.#buttons.modal = this.getElement(this.UISelectors.modalButton);
            this.#buttons.easy = this.getElement(this.UISelectors.easyButton);
            this.#buttons.normal = this.getElement(this.UISelectors.normalButton);
            this.#buttons.expert = this.getElement(this.UISelectors.expertButton);
        } catch (error) {
            console.error('Error initializing game elements:', error);
            throw new Error('Failed to initialize game elements');
        }
    }

    #addCellsEventListeners() {
        try {
            this.#cellsElements.forEach((element) => {
                element.addEventListener('click', this.#handleCellClick);
                element.addEventListener('contextmenu', this.#handleCellContextMenu);
            });
        } catch (error) {
            console.error('Error adding cell event listeners:', error);
            throw new Error('Failed to add cell event listeners');
        }
    }

    #removeCellsEventListeners() {
        this.#cellsElements.forEach((element) => {
            element.removeEventListener('click', this.#handleCellClick);
            element.removeEventListener('contextmenu', this.#handleCellContextMenu);
        })
    }

    #addButtonsEventListeners() {
        this.#buttons.modal.addEventListener('click', this.#modal.toggleModal);
        this.#buttons.easy.addEventListener('click', () =>
            this.#handleNewGameClick(
                this.#config.easy.rows,
                this.#config.easy.cols,
                this.#config.easy.mines,
            ),
        );
        this.#buttons.normal.addEventListener('click', () =>
            this.#handleNewGameClick(
                this.#config.normal.rows,
                this.#config.normal.cols,
                this.#config.normal.mines,
            ),
        );
        this.#buttons.expert.addEventListener('click', () =>
            this.#handleNewGameClick(
                this.#config.expert.rows,
                this.#config.expert.cols,
                this.#config.expert.mines,
            ),
        );
        this.#buttons.reset.element.addEventListener('click', () =>
            this.#handleNewGameClick()
        );
    }

    #handleNewGameClick(
        rows = this.#numberOfRows,
        cols = this.#numberOfCols,
        mines = this.#numberOfMines
    ) {
        this.#removeCellsEventListeners();
        this.#newGame(rows, cols, mines);
    }

    #generateCells() {
        this.#cells.length = 0;
        for(let row = 0; row < this.#numberOfRows; row++) {
            this.#cells[row] = []
            for(let col = 0; col < this.#numberOfCols; col++) {
                this.#cells[row].push(new Cell(col, row))
            }
        }
    }

    #placeMinesInCells() {
        let minesToPlace = this.#numberOfMines;

        while(minesToPlace) {
            const rowIndex = this.#getRandomInteger(0, this.#numberOfRows - 1);
            const colIndex = this.#getRandomInteger(0, this.#numberOfCols - 1);

            const cell = this.#cells[rowIndex][colIndex];

            const cellHasMine = cell.isMine;

            if(!cellHasMine) {
                cell.addMine();
                minesToPlace--;
            }
        }
    }

    #renderBoard() {
        try {
            while(this.#board.firstChild) {
                this.#board.removeChild(this.#board.lastChild);
            }
            this.#cells.flat().forEach((cell) => {
               this.#board.insertAdjacentHTML('beforeend', cell.createElement());
               cell.element = cell.getElement(cell.selector);
            });
        } catch (error) {
            console.error('Error rendering game board:', error);
            throw new Error('Failed to render game board');
        }
    }

    #handleCellClick = (event) => {
        const target = event.target;
        const rowIndex = parseInt(target.getAttribute('data-y'), 10);
        const colIndex = parseInt(target.getAttribute('data-x'), 10);

        const cell = this.#cells[rowIndex][colIndex];

        this.#clickCell(cell);
    };

    #handleCellContextMenu = (event) => {
        event.preventDefault();
        const target = event.target;
        const rowIndex = parseInt(target.getAttribute('data-y'), 10);
        const colIndex = parseInt(target.getAttribute('data-x'), 10);

        const cell = this.#cells[rowIndex][colIndex];

        if(cell.isRevealed || this.#isGameFinished) return;

        if(cell.isFlagged) {
            this.#counter.increment();
            cell.toggleFlag();
            return;
        }

        if(!!this.#counter.value) {
            this.#counter.decrement();
            cell.toggleFlag();
        }
    };

    #clickCell(cell) {
        if(this.#isGameFinished || cell.isFlagged) return;
        
        if(cell.isMine) {
            this.#endGame(false);
            return;
        }

        this.#setCellValue(cell);

        if(this.#revealedCells === this.#cellsToReveal && !this.#isGameFinished) {
            this.#endGame(true);
        }
    }

    #revealMines() {
        this.#cells.flat().filter(({isMine}) => isMine).forEach((cell) => cell.revealCell());
    }

    #setCellValue(cell) {
        let minesCount = 0;
        for(let rowIndex = Math.max(cell.y - 1, 0); rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1); rowIndex++) {
            for (let colIndex = Math.max(cell.x - 1, 0); colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1); colIndex++) {
                if(this.#cells[rowIndex][colIndex].isMine) minesCount++;
            }
        }
        cell.value = minesCount;
        cell.revealCell();
        this.#revealedCells++;

        if(!cell.value) {
            for(let rowIndex = Math.max(cell.y - 1, 0); rowIndex <= Math.min(cell.y + 1, this.#numberOfRows - 1); rowIndex++) {
                for (let colIndex = Math.max(cell.x - 1, 0); colIndex <= Math.min(cell.x + 1, this.#numberOfCols - 1); colIndex++) {
                    const cell = this.#cells[rowIndex][colIndex];
                    if(!cell.isRevealed) {
                        this.#clickCell(cell);
                    }
                }
            }
        }
    }

    #setStyles() {
        document.documentElement.style.setProperty('--cells-in-row', this.#numberOfCols)
    }

    #getRandomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

window.onload = function() {
    const game = new Game();

    game.initializeGame();
}