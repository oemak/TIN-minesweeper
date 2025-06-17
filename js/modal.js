import { UI } from './ui.js'

export class Modal extends UI {
    #element = null;
    #button = null;
    #header = null;
    #scoresTable = null;
    #infoText = '';
    #buttonText = 'Play again!';
    #onPlayAgain = null;

    init() {
        this.#element = this.getElement(this.UISelectors.modal);
        this.#button = this.getElement(this.UISelectors.modalButton);
        this.#header = this.getElement(this.UISelectors.modalHeader);
        this.#scoresTable = this.getElement('[data-scores-table]');
        
        this.#button.addEventListener('click', () => {
            this.toggleModal();
            if (this.#onPlayAgain) {
                this.#onPlayAgain();
            }
        });
    }

    set onPlayAgain(callback) {
        this.#onPlayAgain = callback;
    }

    toggleModal() {
        this.#element.classList.toggle('hide');
    }

    setText() {
        this.#header.textContent = this.#infoText;
        this.#button.textContent = this.#buttonText;
    }

    set infoText(text) {
        this.#infoText = text;
    }

    set buttonText(text) {
        this.#buttonText = text;
    }

    updateScoresTable(scores) {
        if (!this.#scoresTable) return;
        
        this.#scoresTable.innerHTML = '';
        scores.forEach((score, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${score} seconds</td>
            `;
            this.#scoresTable.appendChild(row);
        });
    }
}