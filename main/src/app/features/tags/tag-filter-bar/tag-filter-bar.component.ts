import { Component, inject, output, signal, computed, effect } from '@angular/core';
import { TagService } from '../../../core/services/tag.service';
import { Tag } from '../../../core/interfaces/tag.interface';

@Component({
    selector: 'tag-filter-bar',
    standalone: true,
    imports: [],
    templateUrl: './tag-filter-bar.component.html',
    styleUrl: './tag-filter-bar.component.css'
})
export class TagFilterBarComponent {
    private tagService = inject(TagService);

    tags = signal<Tag[]>([]);
    selectedTagIds = signal<Set<number>>(new Set());
    mode = signal<'AND' | 'OR'>('AND');

    filterChanged = output<{ tagIds: number[]; mode: 'AND' | 'OR' }>();

    constructor() {
        this.tagService.getAllTags().subscribe(all => this.tags.set(all));
        effect(() => {
            this.filterChanged.emit({
                tagIds: Array.from(this.selectedTagIds()),
                mode: this.mode()
            });
        });
    }

    toggleTag(id: number) {
        this.selectedTagIds.update(set => {
            const next = new Set(set);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    setMode(next: 'AND' | 'OR') {
        this.mode.set(next);
    }

    isSelected(id: number): boolean {
        return this.selectedTagIds().has(id);
    }

    clear() {
        this.selectedTagIds.set(new Set());
    }

    count = computed(() => this.selectedTagIds().size);
}