import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { map, distinctUntilChanged, switchMap, of } from 'rxjs';
import { MangaService } from '../../core/services/manga.service';

/**
 * Async validator factory for unique manga title.
 * @param mangaService injected MangaService
 * @param currentIdProvider function returning the current manga id (or null/undefined for new)
 */
export function uniqueTitleValidator(
    mangaService: MangaService,
    currentIdProvider: () => number | null | undefined
): AsyncValidatorFn {
    return (control: AbstractControl) => {
        const raw = (control.value ?? '') as string;
        const trimmed = raw.trim();
        if (!trimmed) {
            return of(null);
        }
        const exclude = currentIdProvider();
        return of(trimmed).pipe(
            distinctUntilChanged(),
            switchMap(value =>
                mangaService.isTitleTaken(value, exclude ?? undefined).pipe(
                    map(isTaken => (isTaken ? { titleTaken: true } : null))
                )
            )
        );
    };
}