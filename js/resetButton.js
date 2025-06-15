import { UI } from './ui.js'

export class ResetButton extends UI {
    element = this.getElement(this.UISelectors.resetButton);

    changeEmotion(emotion) {
        this.element.querySelector('use').setAttribute('href', `./assets/sprite.svg#${emotion}`);
    }
}