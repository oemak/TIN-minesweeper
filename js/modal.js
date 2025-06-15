import { UI } from './ui.js'

export class Modal extends UI {
    buttonText = '';
    infoText = '';
    element = this.getElement(this.UISelectors.modal);
    button = this.getElement(this.UISelectors.modalButton);
    header = this.getElement(this.UISelectors.modalHeader);

    toggleModal = () => {
        this.element.classList.toggle('hide');
    }

    setText() {
        this.header.textContent = this.infoText;
        this.button.textContent = this.buttonText;
    }
}