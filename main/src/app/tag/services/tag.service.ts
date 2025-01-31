import { Inject, Injectable } from '@angular/core';
import { TAG_REPOSITORY } from '../../shared/tokens/tags.token';
import type { ITagRepository } from '../../shared/interfaces/repositories/tag.repository.interface';
import { ITag } from '../../shared/interfaces/tag.interface';

@Injectable({
  providedIn: 'root'
})
export class TagService {

  constructor(@Inject(TAG_REPOSITORY) private readonly tagRepository: ITagRepository) { }

  async addOne(tag: ITag) {
    if (!tag) {
      throw new Error('Tag is required');
    }
    return await this.tagRepository.save(tag);
  }

  async updateOne(tag: ITag) {
    if (!tag || !tag.id) {
      throw new Error('Valid tag with ID is required');
    }
    return await this.tagRepository.update(tag);
  }

  async deleteOne(id: number) {
    if (!id) {
      throw new Error('ID is required');
    }
    return await this.tagRepository.delete(id);
  }

  async findByName(name: string) {
    if (!name) {
      throw new Error('Name is required');
    }
    return await this.tagRepository.findByName(name);
  }

  async getAll() {
    return await this.tagRepository.getAll();
  }
}
