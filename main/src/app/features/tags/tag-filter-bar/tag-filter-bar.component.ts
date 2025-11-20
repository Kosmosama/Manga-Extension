import { Component, inject } from '@angular/core';
import { TagFilterService } from '../../../core/services/tag-filter.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'tag-filter-bar',
    standalone: true,
    imports: [TranslocoPipe],
    templateUrl: './tag-filter-bar.component.html',
    styleUrl: './tag-filter-bar.component.css'
})
export class TagFilterBarComponent {
    private tagFilterService = inject(TagFilterService);

    tags = () => this.tagFilterService.tags();
    mode = this.tagFilterService.includeMode;
    selectedIds = this.tagFilterService.selectedTagIds;

    /**
     * Determines if a tag ID is currently selected.
     *
     * @param id Tag ID
     * @returns True if selected
     */
    isSelected(id: number): boolean {
        return this.selectedIds().includes(id);
    }

    /**
     * Toggles selection for the given tag ID.
     *
     * @param id Tag ID
     */
    toggle(id: number): void {
        this.tagFilterService.toggleTag(id);
    }

    /**
     * Sets the AND / OR filtering mode.
     *
     * @param mode New mode
     */
    setMode(mode: 'AND' | 'OR'): void {
        this.tagFilterService.setMode(mode);
    }

    /**
     * Clears all selected tag IDs.
     */
    clear(): void {
        this.tagFilterService.clear();
    }
}