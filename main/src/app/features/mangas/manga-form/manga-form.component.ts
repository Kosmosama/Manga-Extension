import { Component, inject, input, OnInit, output } from '@angular/core';
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
export class MangaFormComponent implements OnInit {
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

    ngOnInit() {
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
    }

    submit() {
        if (this.mangaForm.invalid) return;

        const now: string = new Date().toISOString();

        const newManga: Manga = {
            ...this.mangaForm.getRawValue(),
            createdAt: now,
            updatedAt: now,
            id: Number(`${Date.now()}${Math.floor(Math.random() * 10000)}`)
        };

        this.mangaService.addManga(newManga).subscribe({
            next: () => {
                this.formSumbitted.emit(newManga);
                console.log("Manga added successfully");
            },
            error: (err) => console.error("Errpr:", err)
        });
    }
}
