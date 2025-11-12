import { Component, inject, signal, viewChild } from '@angular/core';
import { TagService } from '../../../core/services/tag.service';
import { Tag } from '../../../core/interfaces/tag.interface';
import { TagCardComponent } from '../tag-card/tag-card.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { TagFormComponent } from '../tag-form/tag-form.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'tags-page',
    standalone: true,
    imports: [TranslocoPipe, TagCardComponent, ModalComponent, TagFormComponent],
    templateUrl: './tags-page.component.html',
    styleUrl: './tags-page.component.css',
})
export class TagsPageComponent {
    private tagService = inject(TagService);

    modal = viewChild.required<ModalComponent>('modal');

    tagList = signal<Tag[]>([]);
    selectedTag = signal<Tag | null>(null);

    ngOnInit() {
        this.tagService.getAllTags().subscribe((tags) => this.tagList.set(tags));
    }

    handleTagDeletion(id: number) {
        this.tagService.deleteTag(id).subscribe(() => {
            this.tagList.update((tags) => tags.filter((t) => t.id !== id));
        });
    }

    openForm(tag?: Tag) {
        this.selectedTag.set(tag || null);
        this.modal().open();
    }

    handleFormSumbission(tag: Tag) {
        this.tagList.update((tags) => {
            const index = tags.findIndex((t) => t.id === tag.id);
            if (index === -1) {
                return [...tags, tag];
            } else {
                const next = [...tags];
                next[index] = tag;
                return next;
            }
        });
    }
}