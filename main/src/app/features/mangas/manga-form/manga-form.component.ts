import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MangaService } from '../../../core/services/manga.service';
import { Manga, MangaState, MangaType } from '../../../core/interfaces/manga.interface';

@Component({
    selector: 'manga-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './manga-form.component.html',
    styleUrl: './manga-form.component.css'
})
export class MangaFormComponent {
    private mangaService = inject(MangaService);
    private fb = inject(NonNullableFormBuilder);

    manga = input<Manga | null>();

    formSumbitted = output<Manga>();

    mangaForm = this.fb.group({
        title: ["", [Validators.required, Validators.minLength(3)]],
        link: [""],
        image: [""],
        chapters: [0, [Validators.required, Validators.min(0)]],
        isFavorite: [false],
        type: [MangaType.Other],
        state: [MangaState.None],
        tags: [[] as number[]],
    });
    
    constructor() {
        effect(() => {
            const currentManga = this.manga();
            console.log('Effect triggered in MangaForm. New manga:', currentManga);
 
            if (currentManga) {
                this.mangaForm.patchValue({
                    title: currentManga.title,
                    link: currentManga.link || "",
                    image: currentManga.image || "",
                    chapters: currentManga.chapters,
                    isFavorite: currentManga.isFavorite || false,
                    type: currentManga.type || MangaType.Other,
                    state: currentManga.state || MangaState.None,
                    tags: currentManga.tags || []
                });
            } else {
                this.mangaForm.reset();
                this.mangaForm.patchValue({
                    type: MangaType.Other,
                    state: MangaState.None,
                    isFavorite: false,
                    chapters: 0,
                    tags: []
                });
            }
        });
    }
    
    
    // ESTO NO FUNCIONABA
   /* ngOnInit() {
        console.log('Hay manga?: ', this.manga())
        if (this.manga()) {
            this.mangaForm.patchValue({
                title: this.manga()!.title,
                image: this.manga()!.image || "",
                chapters: this.manga()!.chapters,
                isFavorite: this.manga()!.isFavorite || false,
                type: this.manga()!.type || MangaType.Other,
                state: this.manga()!.state || MangaState.None,
                tags: this.manga()!.tags || []
            });
            this.mangaForm.markAllAsTouched();
        }
    }*/

    /**
     * Handles the form submission.
     * If the manga is new, it will be added to the database.
     * If the manga already exists, it will be updated.
     */
    submit() {
        if (this.mangaForm.invalid) return;
        console.log('Manga form: ', this.mangaForm.getRawValue())
        const now: string = new Date().toISOString();

        const newManga: Manga = {
            ...this.mangaForm.getRawValue(),
            createdAt: now,
            updatedAt: now,
            id: Number(`${Date.now()}${Math.floor(Math.random() * 10000)}`)
        };

        if (!this.manga()) {
            this.mangaService.addManga(newManga).subscribe({
                next: () => {
                    this.formSumbitted.emit(newManga);
                    console.log("Manga added successfully");
                },
                error: (err) => console.error("Errpr:", err)
            });
        }
        else {
            this.mangaService.updateManga(this.manga()!.id, newManga).subscribe({
                next: () => {
                    this.formSumbitted.emit(newManga);
                    console.log("Manga updated successfully");
                },
                error: (err) => console.error("Errpr:", err)
            });
        }
    }
}
