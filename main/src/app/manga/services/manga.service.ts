import { Injectable } from '@angular/core';
import { db } from '../../shared/config/db.config';
import { INewManga, MangaState, MangaType } from '../../shared/interfaces/manga.interface';
import { EMangaType, EMangaState } from '../../../utils/things';
import { ITag } from '../../shared/interfaces/tag.interface';

@Injectable({
  providedIn: 'root'
})
export class MangaService {

  /**
   * Validates the manga data for creation.
   */
  private validateManga(manga: INewManga): void {
    if (!manga) {
      throw new Error('A manga object is required.');
    }
    if (!manga.title || typeof manga.title !== 'string' || manga.title.trim().length === 0) {
      throw new Error('The manga must have a valid title.');
    }
    if (manga.state && !EMangaState.includes(manga.state)) {
      throw new Error(`Invalid manga state: ${manga.state}`);
    }
    if (manga.type && !EMangaType.includes(manga.type)) {
      throw new Error(`Invalid manga type: ${manga.type}`);
    }
  }

  /**
   * Validates that the tag information is correct.
   */
  private validateTag(tag: ITag): void {
    if (!tag) {
      throw new Error('A tag object is required.');
    }
    if (!tag.name || typeof tag.name !== 'string' || tag.name.trim().length === 0) {
      throw new Error('The tag must have a valid name.');
    }
  }

  /**
   * Adds a new manga.
   * Uses INewManga, without the id field, as the ORM assigns the id automatically.
   */
  async addOne(manga: INewManga): Promise<INewManga> {
    this.validateManga(manga);

    const existing = await db.mangas.where('title').equalsIgnoreCase(manga.title).first();
    if (existing) {
      throw new Error('A manga with the same title already exists.');
    }

    const now = new Date();
    const mangaToAdd = {
      ...manga,
      created_at: now,
      updated_at: now
    };

    const generatedId = await db.mangas.add(mangaToAdd);
    return { id: generatedId, ...mangaToAdd } as INewManga;
  }

  /**
   * Updates an existing manga.
   */
  async updateOne(manga: INewManga): Promise<INewManga> {
    this.validateManga(manga);
    manga.updated_at = new Date();
    await db.mangas.put(manga);
    return manga;
  }

  /**
   * Deletes a manga by its id.
   */
  async deleteOne(id: number): Promise<boolean> {
    if (id == null) {
      throw new Error('The id is required to delete a manga.');
    }
    const existing = await db.mangas.get(id);
    if (!existing) {
      throw new Error('The manga does not exist.');
    }
    await db.mangas.delete(id);
    return true;
  }

  /**
   * Returns all mangas.
   */
  async getAll(): Promise<INewManga[]> {
    return await db.mangas.toArray();
  }

  /**
   * Adds a tag to a manga, avoiding duplicates.
   */
  async addTag(mangaId: number, tagId: number): Promise<INewManga> {
    if (mangaId == null) {
      throw new Error('The manga id is required.');
    }
    if (tagId == null) {
      throw new Error('The tag id is required.');
    }
    const manga = await db.mangas.get(mangaId);
    if (!manga) {
      throw new Error('Manga not found.');
    }
    if ((manga.tags ?? []).includes(tagId)) {
      throw new Error('The tag is already associated with this manga.');
    }
    manga.tags = [...(manga.tags || []), tagId];
    manga.updated_at = new Date();
    await db.mangas.put(manga);
    return manga;
  }

  /**
   * Finds mangas that have the specified tag associated.
   */
  async findByTag(tagId: number): Promise<INewManga[]> {
    if (tagId == null) {
      throw new Error('The tag id is invalid.');
    }
    return await db.mangas.filter(manga => (manga.tags ?? []).includes(tagId)).toArray();
  }

  /**
   * Finds mangas by name (title).
   */
  async findByName(name: string): Promise<INewManga[]> {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('The name is invalid.');
    }
    return await db.mangas.where('title').equalsIgnoreCase(name).toArray();
  }

  /**
   * Returns the mangas marked as favorites.
   */
  async findFavorites(): Promise<INewManga[]> {
    return await db.mangas.where('isFavorite').equals('true').toArray();
  }

  /**
   * Finds mangas by their state.
   */
  async findByState(state: MangaState): Promise<INewManga[]> {
    if (!EMangaState.includes(state)) {
      throw new Error(`Invalid manga state: ${state}`);
    }
    return await db.mangas.where('state').equals(state).toArray();
  }

  /**
   * Finds mangas by their type.
   */
  async findByType(type: MangaType): Promise<INewManga[]> {
    if (!EMangaType.includes(type)) {
      throw new Error(`Invalid manga type: ${type}`);
    }
    return await db.mangas.where('type').equals(type).toArray();
  }

  /**
   * Returns all tags.
   */
  async getAllTags(): Promise<ITag[]> {
    return await db.tags.toArray();
  }

  /**
   * Adds a new tag, verifying that there is no other with the same name.
   */
  async addTagEntry(tag: ITag): Promise<ITag> {
    this.validateTag(tag);
    const existing = await db.tags.where('name').equalsIgnoreCase(tag.name).first();
    if (existing) {
      throw new Error('A tag with that name already exists.');
    }
    tag.id = await db.tags.add(tag);
    return tag;
  }
}
