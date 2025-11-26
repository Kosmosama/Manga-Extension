import { Directive, ElementRef, Input, inject, signal, effect } from '@angular/core';
import { Observable, defer } from 'rxjs';

/**
 * Delays setting the actual src attribute until element intersects viewport.
 * Emits load/error events via signals if needed by host template logic.
 */
@Directive({
    selector: 'img[lazySrc]',
    standalone: true
})
export class LazyImageDirective {
    private el = inject(ElementRef<HTMLImageElement>);
    private observer: IntersectionObserver | null = null;

    @Input({ required: true }) lazySrc!: string;

    private loadedSignal = signal<boolean>(false);
    private errorSignal = signal<boolean>(false);

    readonly loaded = () => this.loadedSignal();
    readonly errored = () => this.errorSignal();

    constructor() {
        this.initObserver();
    }

    private initObserver() {
        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage();
                    this.observer?.disconnect();
                    this.observer = null;
                }
            });
        }, { rootMargin: '200px' });
        this.observer.observe(this.el.nativeElement);
    }

    private loadImage() {
        const img = this.el.nativeElement;
        img.src = this.lazySrc;
        img.addEventListener('load', () => this.loadedSignal.set(true), { once: true });
        img.addEventListener('error', () => this.errorSignal.set(true), { once: true });
    }
}