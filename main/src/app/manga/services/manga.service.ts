import { Inject, Injectable } from '@angular/core';
import { MANGA_REPOSITORY } from '../../shared/tokens/manga.token';
import type { IMangaRepository } from '../../shared/interfaces/repositories/manga.repository.interface';
import { IManga, MangaState, MangaType } from '../../shared/interfaces/manga.interface';

@Injectable({
  providedIn: 'root'
})
export class MangaService {
  constructor(@Inject(MANGA_REPOSITORY) private readonly mangaRepository: IMangaRepository) {}

  async addOne(manga: IManga): Promise<IManga> {
    if (!manga) {
      throw new Error('Manga is required');
    }
    return await this.mangaRepository.save(manga);
  }

  async updateOne(manga: IManga): Promise<IManga> {
    if (!manga || !manga.id) {
      throw new Error('Valid manga with ID is required');
    }
    return await this.mangaRepository.update(manga);
  }

  async deleteOne(id: number): Promise<boolean> {
    if (!id) {
      throw new Error('ID is required');
    }
    return await this.mangaRepository.delete(id);
  }

  async getAll(): Promise<IManga[]> {
    return await this.mangaRepository.getAll();
  }

  async addTag(mangaId: number, tagId: number): Promise<IManga> {
    if (!mangaId || !tagId) {
      throw new Error('Manga ID and Tag ID are required');
    }
    return await this.mangaRepository.addTag(mangaId, tagId);
  }

  async findByTag(tagId: number): Promise<IManga[] | null> {
    if (!tagId) {
      throw new Error('Tag ID is required');
    }
    return await this.mangaRepository.findByTag(tagId);
  }

  async findByName(name: string): Promise<IManga[] | null> {
    if (!name) {
      throw new Error('Name is required');
    }
    return await this.mangaRepository.findByName(name);
  }

  async findFavorites(): Promise<IManga[] | null> {
    return await this.mangaRepository.findFavorites();
  }

  async findByState(state: MangaState): Promise<IManga[] | null> {
    if (!state) {
      throw new Error('State is required');
    }
    return await this.mangaRepository.findByState(state);
  }

  async findByType(type: MangaType): Promise<IManga[] | null> {
    if (!type) {
      throw new Error('Type is required');
    }
    return await this.mangaRepository.findByType(type);
  }
}
