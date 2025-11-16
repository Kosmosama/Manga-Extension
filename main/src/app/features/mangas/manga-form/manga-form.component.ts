import { Component, effect, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MangaService } from '../../../core/services/manga.service';
import { Manga, MangaState, MangaType } from '../../../core/interfaces/manga.interface';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { uniqueTitleValidator } from '../../../core/validators/unique-title.validator';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
    selector: 'manga-form',
    standalone: true,
    imports: [ReactiveFormsModule, TranslocoPipe],
    templateUrl: './manga-form.component.html',
    styleUrl: './manga-form.component.css'
})
export class MangaFormComponent {
    private mangaService = inject(MangaService);
    private fb = inject(NonNullableFormBuilder);
    private toastService = inject(ToastService);

    manga = input<Manga | null>();

    formSumbitted = output<Manga>();

    imagePreviewUrl = signal<string | null>(null);
    imageLoading = signal<boolean>(false);
    imageError = signal<boolean>(false);

    mangaForm = this.fb.group({
        title: ["", {
            validators: [Validators.required, Validators.minLength(3)],
            asyncValidators: [uniqueTitleValidator(this.mangaService, () => this.manga()?.id)]
        }],
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
                }, { emitEvent: false });
                this.mangaForm.get('title')?.updateValueAndValidity();
                this.imagePreviewUrl.set(currentManga.image || null);
            } else {
                this.mangaForm.reset();
                this.mangaForm.patchValue({
                    type: MangaType.Other,
                    state: MangaState.None,
                    isFavorite: false,
                    chapters: 0,
                    tags: []
                }, { emitEvent: false });
                this.imagePreviewUrl.set(null);
            }
        });

        this.mangaForm.get('image')?.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            filter(v => v !== null)
        ).subscribe(value => {
            const url = (value ?? '').trim();
            if (!url) {
                this.imagePreviewUrl.set(null);
                this.imageError.set(false);
                return;
            }
            this.imageLoading.set(true);
            this.imageError.set(false);
            this.imagePreviewUrl.set(url);
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

    onPreviewLoad() {
        this.imageLoading.set(false);
        this.imageError.set(false);
    }
    onPreviewError() {
        this.imageLoading.set(false);
        this.imageError.set(true);
    }
}