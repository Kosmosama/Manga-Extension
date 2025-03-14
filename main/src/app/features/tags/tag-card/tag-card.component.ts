import { ChangeDetectorRef, Component, DestroyRef, inject, model, output } from '@angular/core';
import { Tag } from '../../../core/interfaces/tag.interface';
import { TagService } from '../../../core/services/tag.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-tags-card',
    imports: [],
    templateUrl: './tag-card.component.html',
    styleUrl: './tag-card.component.css'
})
export class TagsCardComponent {
    private tagService = inject(TagService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);

    tag = model.required<Tag>();

    deleted = output<number>(); // Emit the ID of the deleted tag

    /**
     * Deletes the current tag by its ID and emits the deleted event.
     */
    deleteTag() {
        this.tagService
            .deleteTag(this.tag().id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.deleted.emit(this.tag().id));
    }

    /**
     * Edits the current tag.
     */
    //#TODO Edit tag functionality
    editTag() {
        console.log(`Editing tag: ${this.tag().name}`);

        const newTestManga: Tag = {
            ...this.tag(),
        };

        this.tag.set(newTestManga);
    }
}
