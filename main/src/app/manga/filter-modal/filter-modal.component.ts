import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MangaFilters } from '../../shared/interfaces/filters.interface';
import { Tag } from '../../shared/interfaces/tag.interface';
import { TagService } from '../services/tag.service';

@Component({
    selector: 'app-filter-modal',
    imports: [ReactiveFormsModule],
    templateUrl: './filter-modal.component.html',
    styleUrl: './filter-modal.component.css'
})
export class FilterModalComponent {
    private tagService: TagService = inject(TagService);
    private fb = inject(NonNullableFormBuilder);
    
    tags = signal<Tag[]>([]);
    isModalOpen = signal(false);
    
    // #TODO Instead of non nullable, make form controls nullable
    filtersForm = this.fb.group({
        search: [''],
        includeTags: [[]],
        excludeTags: [[]],
        chapterRange: [''],
        lastSeenRange: [''],
        addedRange: [''],
        sortBy: [''],
        order: [''],
        random: [false],
        limit: [0],
    });

    ngOnInit() {
        this.tagService.getAllTags().subscribe(tags => {
            this.tags.set(tags);
        });
    }

    openModal() {
        this.isModalOpen.set(true);
    }

    closeModal() {
        this.isModalOpen.set(false);
    }

    applyFilters() {
        const filters: MangaFilters = {
            search: this.filtersForm.value.search,
            includeTags: this.filtersForm.value.includeTags,
            excludeTags: this.filtersForm.value.excludeTags,
            chapterRange: { min: 0, max: Number(this.filtersForm.value.chapterRange) }, // #TODO Make it so that max chapters is mangaWithMostChapter.chapters
        };
    }
}
