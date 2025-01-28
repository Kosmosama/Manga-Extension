import { ITagRepository } from "../interfaces/repositories/tag.repository.interface";
import { InjectionToken } from "@angular/core";

export const TAG_REPOSITORY = new InjectionToken<ITagRepository>('TagRepository');