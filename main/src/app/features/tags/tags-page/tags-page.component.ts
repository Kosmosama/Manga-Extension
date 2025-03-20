import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { TagService } from '../../../core/services/tag.service';
import { Tag } from '../../../core/interfaces/tag.interface';
import { TagCardComponent } from '../tag-card/tag-card.component';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { TagFormComponent } from '../tag-form/tag-form.component';

@Component({
    selector: 'app-tags-page',
    imports: [TagCardComponent, ModalComponent, TagFormComponent],
    templateUrl: './tags-page.component.html',
    styleUrl: './tags-page.component.css'
})
export class TagsPageComponent {
    private tagService = inject(TagService);

    modal = viewChild.required<ModalComponent>('modal');

    tagList = signal<Tag[]>([]);
    selectedTag = signal<Tag | null>(null);


    /**
     * 
     * The effect() was deleted cuz it throws an error:
     * RuntimeError: NG0203: effect() can only be used within an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`. Find more at https://angular.dev/errors/NG0203
     * 
     */
    ngOnInit() {
        this.tagService.getAllTags().subscribe(tags => this.tagList.set(tags)); // tf 
        console.log(this.tagList());
        console.log("Tags were fetched");
    }

    /**
     * Deletes a tag by ID from the list.
     * 
     * @param id The ID of the tag to delete.
     */
    handleTagDeletion(id: number) {
        this.tagService.deleteTag(id).subscribe(() => this.tagList.update((tags) => tags.filter(tag => tag.id !== id)));
    }

    /**
     * Opens the modal to create or edit a tag.
     */
    openForm(tag?: Tag) {
        this.selectedTag.set(tag || null);
        this.modal().open();
    }

    /**
     * Handles the form submission.
     * 
     * @param tag The tag to add or update.
     */
    handleFormSumbission(tag: Tag) {
        this.tagList.update((tags) => {
            const index = tags.findIndex(m => m.id === tag.id);
            if (index === -1) {
                return [...tags, tag];
            } else {
                tags[index] = tag;
                return tags;
            }
        });
    }
}
