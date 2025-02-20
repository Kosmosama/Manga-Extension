import { ChangeDetectorRef, Component, DestroyRef, inject, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Manga } from '../../shared/interfaces/manga.interface';
import { MangaService } from '../services/manga.service';

@Component({
    selector: 'app-manga',
    imports: [],
    templateUrl: './manga.component.html',
    styleUrl: './manga.component.css'
})
export class MangaComponent {
    private mangaService = inject(MangaService);
    private destroyRef = inject(DestroyRef);
    private cdr = inject(ChangeDetectorRef);

    manga = model.required<Manga>();

    deleted = output<number>(); // Emit the ID of the deleted manga

    // #TODO Implement (error)="imageError()" in the img tag in the template 
    isImageValid = signal<boolean>(true);

    /**
     * Deletes the current manga by its ID and emits the deleted event.
     */
    deleteManga() {
        this.mangaService
            .deleteManga(this.manga().id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.deleted.emit(this.manga().id));
    }

    // #TODO Create and implement modal to edit manga, open it here
    editManga() {
        console.log(`Editing manga: ${this.manga().title}`);
    }

    /**
     * Toggles the favorite status of the current manga.
     */
    toggleFavorite() {
        this.mangaService
            // #TODO Create toggleFavorite(id,actualFavoriteStatus): Observable<void> method in manga.service.ts
            .toggleFavorite(this.manga().id, this.manga().isFavorite)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.manga().isFavorite = !this.manga().isFavorite;
                // this.cdr.detectChanges(); In case favorite icon is not updated
            });
    }

    /**
     * Updates the chapters of the current manga.
     * 
     * @param chapters - The new number of chapters.
     */
    // #TODO Batch update chapters or optimize this method another way to avoid multiple instant requests, also ui should update instantly (not after the response)
    updateChapters(chapters: number) {
        this.mangaService
            // #TODO Create updateChapters(id, chapters): Observable<void> method in manga.service.ts
            .updateChapters(this.manga().id, chapters)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.manga().chapters = chapters;
                this.cdr.detectChanges();
            });
    }        

    /**
     * Handles the event when an image is not found.
     * Sets the error state to true.
     */
    imageNotFound() {
        this.isImageValid.set(false);
    }
}
