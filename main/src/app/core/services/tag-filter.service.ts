import { Injectable, signal, computed, inject } from '@angular/core';
import { TagService } from './tag.service';
import { Tag } from '../interfaces/tag.interface';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TagFilterService {
    private tagService = inject(TagService);

    private allTagsSignal = signal<Tag[]>([]);
    readonly selectedTagIds = signal<number[]>([]);
    readonly includeMode = signal<'AND' | 'OR'>('AND');

    /**
     * Computed list of selected tag entities.
     */
    readonly selectedTags = computed(() =>
        this.allTagsSignal().filter(t => this.selectedTagIds().includes(t.id))
    );

    constructor() {
        // One-time load of tags; if real-time updates needed, convert to a stream with effect.
        this.tagService.getAllTags().pipe(take(1)).subscribe(tags => {
            this.allTagsSignal.set(tags);
        });
    }

    /**
     * Gets all available tags.
     *
     * @returns Current tag array
     */
    tags(): Tag[] {
        return this.allTagsSignal();
    }

    /**
     * Toggles a tag ID between selected and unselected state.
     *
     * @param id Tag identifier
     */
    toggleTag(id: number): void {
        this.selectedTagIds.update(list =>
            list.includes(id) ? list.filter(t => t !== id) : [...list, id]
        );
    }

    /**
     * Clears all tag selections.
     */
    clear(): void {
        this.selectedTagIds.set([]);
    }

    /**
     * Sets the include mode (AND / OR) for tag evaluation.
     *
     * @param mode Desired mode
     */
    setMode(mode: 'AND' | 'OR'): void {
        this.includeMode.set(mode);
    }
}