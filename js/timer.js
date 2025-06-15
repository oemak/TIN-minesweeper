import { UI } from './ui.js'

export class Timer extends UI {
    #element = null;
    #interval = null;
    numberOfSeconds = 0;
    #maxNumberOfSeconds = 999;

    init() {
        this.#element = this.getElement(this.UISelectors.timer);
    }

    startTimer() {
        this.#interval = setInterval(() => this.#updateTimer(), 1000)
    }

    stoptTimer() {
        clearInterval(this.#interval);
    }

    #updateTimer() {
        this.numberOfSeconds++;

        this.numberOfSeconds <= this.#maxNumberOfSeconds
            ? this.#setTimerValue(this.numberOfSeconds)
            : this.stoptTimer();
    }

    #setTimerValue(value) {
        this.#element.textContent = value;
    }
}