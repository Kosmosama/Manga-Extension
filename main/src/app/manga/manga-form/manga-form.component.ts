import { Component, effect, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MangaService } from '../services/manga.service';
import { Manga, MangaState, MangaType } from './../../shared/interfaces/manga.interface';

@Component({
    selector: 'app-manga-form',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './manga-form.component.html',
    styleUrl: './manga-form.component.css'
})
export class MangaFormComponent {
    private mangaService = inject(MangaService);
    private fb = inject(NonNullableFormBuilder);

    manga = input<Manga>();

    mangaForm = this.fb.group({
        title: ["", [Validators.required, Validators.minLength(3)]],
        link: [""],
        image: [""],
        chapters: [0, [Validators.required, Validators.min(0)]],
        isFavorite: [false],
        type: [MangaType.Other], // #MAYBE Dont add this in the form, use the enum to loop through and if nothing is selected use MangaState.None
        state: [MangaState.None], // #MAYBE Same ^            ^
        tags: [[] as number[]], // #MAYBE Same ^
    });

    constructor() {
        effect(() => {
            if (this.manga()) {
                this.mangaForm.get('title')?.setValue(this.manga()!.title);
                this.mangaForm.get('image')?.setValue(this.manga()!.image || "");
                this.mangaForm.get('chapters')?.setValue(this.manga()!.chapters);
                this.mangaForm.get('isFavorite')?.setValue(this.manga()!.isFavorite || false);
                this.mangaForm.get('type')?.setValue(this.manga()!.type || MangaType.Other);
                this.mangaForm.get('state')?.setValue(this.manga()!.state || MangaState.None);
                this.mangaForm.get('tags')?.setValue(this.manga()!.tags || []);
                this.mangaForm.markAllAsTouched();
            }
        });
    }

    submitManga() {
        if (this.mangaForm.invalid) return;

        const now: string = new Date().toISOString();

        const newManga: Manga = {
            ...this.mangaForm.getRawValue(),
            createdAt: now,
            updatedAt: now,
            id: Date.now() + Math.floor(Math.random() * 10000)
        };

        this.mangaService.addManga(newManga).subscribe({
            next: () => {
                console.log("Something.")
            },
            error: () => console.log("Something.")
        });
    }
}
