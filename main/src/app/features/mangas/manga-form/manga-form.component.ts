import { Component, effect, inject, input, output } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MangaService } from '../../../core/services/manga.service';
import { Manga, MangaState, MangaType } from '../../../core/interfaces/manga.interface';
import { ToastService } from '../../../core/services/toast.service';

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
    private toastService = inject(ToastService);

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

    submit() {
        if (this.mangaForm.invalid) return;

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
                    this.toastService.success('toasts.manga.added', { title: newManga.title });
                },
                error: () => this.toastService.error('toasts.error.generic')
            });
        }
        else {
            this.mangaService.updateManga(this.manga()!.id, newManga).subscribe({
                next: () => {
                    this.formSumbitted.emit(newManga);
                    this.toastService.success('toasts.manga.updated', { title: newManga.title });
                },
                error: () => this.toastService.error('toasts.error.generic')
            });
        }
    }
}