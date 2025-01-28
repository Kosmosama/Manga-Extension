import { InjectionToken } from '@angular/core';
import { IMangaRepository } from '../interfaces/repositories/manga.repository.interface';

export const MANGA_REPOSITORY = new InjectionToken<IMangaRepository>('MangaRepository');