import { Component, ElementRef, HostListener, input, output, signal, viewChild } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'modal',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css']
})
export class ModalComponent {
    readonly title = input<string | null>(null);
    readonly showCloseButton = input<boolean>(true);

    isVisible = signal(false);
    closed = output<void>();

    modalContainer = viewChild.required<ElementRef<HTMLDivElement>>('modalContainer');

    private previouslyFocused: HTMLElement | null = null;

    open() {
        this.previouslyFocused = document.activeElement as HTMLElement;
        this.isVisible.set(true);
        queueMicrotask(() => this.focusFirst());
    }

    close() {
        this.isVisible.set(false);
        this.closed.emit();
        if (this.previouslyFocused) {
            this.previouslyFocused.focus();
            this.previouslyFocused = null;
        }
    }

    @HostListener('document:keydown', ['$event'])
    onKeydown(ev: KeyboardEvent) {
        if (!this.isVisible()) return;
        if (ev.key === 'Escape') {
            ev.stopPropagation();
            this.close();
        } else if (ev.key === 'Tab') {
            this.maintainFocus(ev);
        }
    }

    private focusableSelectors =
        'button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])';

    private focusFirst() {
        const el = this.modalContainer().nativeElement;
        const first = el.querySelector<HTMLElement>(this.focusableSelectors);
        first?.focus();
    }

    private maintainFocus(ev: KeyboardEvent) {
        const el = this.modalContainer().nativeElement;
        const focusables = Array.from(
            el.querySelectorAll<HTMLElement>(this.focusableSelectors)
        ).filter(f => !f.hasAttribute('disabled'));
        if (!focusables.length) return;
        const index = focusables.indexOf(document.activeElement as HTMLElement);
        let nextIndex = index;
        if (ev.shiftKey) {
            nextIndex = index <= 0 ? focusables.length - 1 : index - 1;
        } else {
            nextIndex = index === focusables.length - 1 ? 0 : index + 1;
        }
        ev.preventDefault();
        focusables[nextIndex].focus();
    }
}