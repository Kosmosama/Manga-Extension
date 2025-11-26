import { Component, input, signal, computed, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateRef } from '@angular/core';

@Component({
    selector: 'virtual-scroll-container',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './virtual-scroll-container.component.html',
    styleUrl: './virtual-scroll-container.component.css'
})
export class VirtualScrollContainerComponent<T> {
    items = input<T[]>([]);
    itemHeight = input<number>(260);
    overscan = input<number>(2);

    itemTemplate = input<TemplateRef<{ $implicit: T; index: number }> | null>(null);

    viewportRef = viewChild<ElementRef<HTMLDivElement>>('viewportRef');
    private viewportHeightSignal = signal<number>(0);
    private scrollTopSignal = signal<number>(0);

    readonly totalHeight = computed(() => this.items().length * this.itemHeight());

    /**
     * Visible items slice: always returns objects of shape { value: T; index: number } to keep typing consistent.
     */
    readonly visibleItems = computed(() => {
        const scrollTop = this.scrollTopSignal();
        const height = this.viewportHeightSignal();
        const per = this.itemHeight();

        const count = this.items().length;

        // If item height is invalid or viewport is zero, render everything mapped to {value,index}
        if (per <= 0 || height <= 0) {
            return this.items().map((val, i) => ({ value: val, index: i }));
        }

        const startIndex = Math.max(Math.floor(scrollTop / per) - this.overscan(), 0);
        const endIndex = Math.min(Math.ceil((scrollTop + height) / per) + this.overscan(), count);

        return this.items().slice(startIndex, endIndex).map((val, i) => ({
            value: val,
            index: startIndex + i
        }));
    });

    /**
     * Scroll handler (attach to viewport).
     */
    onScroll(ev: Event) {
        const target = ev.target as HTMLElement;
        this.scrollTopSignal.set(target.scrollTop);
    }

    /**
     * Initializes a ResizeObserver on the viewport to keep its height signal in sync.
     * Called lazily once the viewChild resolves.
     */
    private initViewportObserver() {
        const el = this.viewportRef()?.nativeElement;
        if (!el) return;

        this.viewportHeightSignal.set(el.clientHeight);

        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                const target = entry.target as HTMLElement;
                this.viewportHeightSignal.set(target.clientHeight);
            }
        });
        ro.observe(el);
    }

    constructor() {
        effect(() => {
            if (this.viewportRef()) {
                this.initViewportObserver();
            }
        });
    }
}