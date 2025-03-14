import { Component, effect, inject, signal } from '@angular/core';
import { TagService } from '../../../core/services/tag.service';
import { Tag } from '../../../core/interfaces/tag.interface';
import { TagCardComponent } from '../tag-card/tag-card.component';

@Component({
    selector: 'app-tags-page',
    imports: [TagCardComponent],
    templateUrl: './tags-page.component.html',
    styleUrl: './tags-page.component.css'
})
export class TagsPageComponent {
    private tagService = inject(TagService);

    tagList = signal<Tag[]>([]);

    ngOnInit() {
        effect(() => {
            this.tagService.getAllTags().subscribe(mangas => this.tagList.set(mangas));
            console.log("Tags were fetched");
        });
    }

    /**
     * Deletes a tag by ID from the list.
     * 
     * @param id The ID of the tag to delete.
     */
    handleTagDeletion(id: number) {
        this.tagList.update((tags) => tags.filter(tag => tag.id !== id));
    }
}
