import { UI } from './ui.js'

export class Timer extends UI {
    #element = null;
    #interval = null;
    numberOfSeconds = 0;
    maxNumberOfSeconds = 999;

    init() {
        this.#element = document.querySelector('[data-timer]');
    }

    #startTimer() {
        this.#interval = setInterval(() => this.#updateTimer(), 1000)
    }

    stoptTimer() {
        clearInterval(this.#interval);
    }

    resetTimer() {
        this.numberOfSeconds = 0;
        this.#element.textContent = this.numberOfSeconds;
        this.stoptTimer();
        this.#startTimer();
    }

    #updateTimer() {
        this.numberOfSeconds++;

        if (this.numberOfSeconds <= this.maxNumberOfSeconds) {
            this.#element.textContent = this.numberOfSeconds;
        } else {
            this.stoptTimer();
        }
    }
}