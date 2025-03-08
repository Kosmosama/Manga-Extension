import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css']
})
export class ModalComponent {
    readonly title = input<string>("My Modal");
    readonly showCloseButton = input<boolean>(true);


    closed = output<void>();

    public isVisible = signal(false);

    modalContainer = viewChild.required<ElementRef<HTMLDivElement>>

    open() {
        this.isVisible.set(true);
    }

    close() {
        this.isVisible.set(false);
        this.closed.emit();
    }

}
