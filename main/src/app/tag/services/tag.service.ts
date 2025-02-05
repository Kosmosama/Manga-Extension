import { Injectable } from '@angular/core';
import { ITag } from '../../shared/interfaces/tag.interface';
import { db } from '../../shared/config/db.config';
import { ITagService } from '../../shared/interfaces/service/tag.service.interface';

@Injectable({
  providedIn: 'root'
})
export class TagService implements ITagService {
   validateTag(tag: ITag): void {
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

   async save(tag: ITag): Promise<void> {
    this.validateTag(tag);
    
    const existing = await db.tags.where('name').equalsIgnoreCase(tag.name).first();

    if (existing) {
      throw new Error('A tag with the same name already exists.');
    }

    await db.tags.add(tag);
  }

   async update(tag: ITag){
    this.validateTag(tag);
    const existing = await db.tags.where('name').equalsIgnoreCase(tag.name).first();

    if (!existing) {
      throw new Error('The tag does not exist.');
    }

    await db.tags.update(existing.id, tag);

  }

   async delete(id: number): Promise<void>{
    if (id == null) {
      throw new Error('The id is required to delete a manga.');
    }
    const existing = await db.tags.get(id);
    if (!existing) {
      throw new Error('The manga does not exist.');
    }
    await db.tags.delete(id);
  }
  

   async getAll(){
    return await db.tags.toArray();
  }

   async findByName(name: string){
    return await db.tags.where('name').startsWithIgnoreCase(name).toArray();
  }

}
