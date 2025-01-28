import { InjectionToken } from "@angular/core";
import { ITagRepository } from "../interfaces/repositories/tag.repository.interface";

export const TAG_REPOSITORY = new InjectionToken<ITagRepository>('TagRepository');