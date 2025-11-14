import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    imports: [TranslocoPipe],
    styleUrls: ['./modal.component.css']
})
export class ModalComponent {
    readonly title = input<string>("My Modal");
    readonly showCloseButton = input<boolean>(true);

    isVisible = signal(false);

    closed = output<void>();    

    modalContainer = viewChild.required<ElementRef<HTMLDivElement>>

    open() {
        this.isVisible.set(true);
    }

    close() {
        this.isVisible.set(false);
        this.closed.emit();
    }
}
