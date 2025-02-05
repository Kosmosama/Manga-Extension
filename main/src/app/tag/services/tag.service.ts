import { Injectable } from '@angular/core';
import { ITag } from '../../shared/interfaces/tag.interface';
import { db } from '../../shared/config/db.config';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private validateTag(tag: ITag): void {
    if (!tag) {
      throw new Error('A tag object is required.');
    }
    if (!tag.name || typeof tag.name !== 'string' || tag.name.trim().length === 0) {
      throw new Error('The tag must have a valid name.');
    }
    if(tag.color && typeof tag.color !== 'string') {
      throw new Error('The tag color must be a string.');
    }
    if(!tag.color){
      tag.color = '#eee'
    }
  }

  private async addOne(tag: ITag){
    this.validateTag(tag);
    
    const existing = await db.tags.where('name').equalsIgnoreCase(tag.name).first();

    if (existing) {
      throw new Error('A tag with the same name already exists.');
    }

    await db.tags.add(tag);
  }

  private async updateOne(tag: ITag){
    this.validateTag(tag);
    const existing = await db.tags.where('name').equalsIgnoreCase(tag.name).first();

    if (!existing) {
      throw new Error('The tag does not exist.');
    }

    return await db.tags.update(existing.id, tag);

  }

  private async deleteOne(id: number){
    if (id == null) {
      throw new Error('The id is required to delete a manga.');
    }
    const existing = await db.tags.get(id);
    if (!existing) {
      throw new Error('The manga does not exist.');
    }
    return await db.tags.delete(id);
  }
  

  private async getAll(){
    return await db.tags.toArray();
  }

}
