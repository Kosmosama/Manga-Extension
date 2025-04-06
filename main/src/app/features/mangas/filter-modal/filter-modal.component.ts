import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TagService } from '../../../core/services/tag.service';
import { Tag } from '../../../core/interfaces/tag.interface';
import { MangaFilters } from '../../../core/interfaces/filters.interface';
import { KeyPressService } from '../../../core/services/keypress.service';
import { Subscription } from 'rxjs';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
    selector: 'app-filter-modal',
    imports: [ReactiveFormsModule],
    templateUrl: './filter-modal.component.html',
    styleUrl: './filter-modal.component.css'
})
export class FilterModalComponent {
    private tagService = inject(TagService);
    private settingsService = inject(SettingsService);
    private fb = inject(NonNullableFormBuilder);
    private keyPress = inject(KeyPressService);
    private keyPressSubscription: Subscription | null = null; // dunno if this is how subscriptions works, don't kill me uwu
    inputHasFocus: boolean = false;

    private searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

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

        if(this.settingsService.focusSearchInput()){
            this.keyPressSubscription = this.keyPress.keyPress$.subscribe(event => {
                if (this.inputHasFocus && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
                    this.searchInput().nativeElement.value += event.key; // Dunno if this adds properly the thing
                }
                if(!this.inputHasFocus){
                    this.searchInput().nativeElement.focus();
                }
            });
        }
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
