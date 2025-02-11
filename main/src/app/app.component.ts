import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MangaType, MangaState, NewManga, Manga } from './shared/interfaces/manga.interface';
import { MangaService } from './manga/services/manga.service';
import { TagService } from './tag/services/tag.service';
import { NewTag, Tag } from './shared/interfaces/tag.interface';
import { FilterTypes } from './shared/interfaces/filters.interface';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public manga = inject(MangaService);
  public tags = inject(TagService);
  public MangaList: Manga[] = [];
  public TagList: Tag[] = [];
  public selectedMangaId: number | null = null; // Para identificar el manga seleccionado
  public selectedTagId: number | null = null; // Para identificar el tag seleccionado
  #fb = inject(NonNullableFormBuilder);
  #f2 = inject(NonNullableFormBuilder);

  tagsForm = this.#f2.group({
    name: [''],
    color: ['']
  });

  mangaForm = this.#fb.group({
    title: [''],
    chapters: [0],
    updatedAt: [new Date().toISOString()],
    createdAt: [new Date().toISOString()],
    link: [''],
    image: [''],
    type: [MangaType.Manga],
    state: [MangaState.None],
    isFavorite: [false],
    tags: [[]]
  });

  ngOnInit() {
    this.manga.getAllMangas({ type: FilterTypes.NONE }).subscribe({
      next: (mangas) => {
        this.MangaList = mangas;
        console.log('Lista de mangas:', mangas);
      },
      error: (err) => {
        console.error('Error al obtener los mangas:', err);
      }
    });

    this.tags.getAllTags().subscribe({
      next: (tagList) => {
        this.TagList = tagList;
        console.log('Lista de tags:', tagList);
      },
      error: (err) => {
        console.error('Error al obtener los tags:', err);
      }
    });
  }

  saveTag() {
    const newTag: NewTag = {
      ...this.tagsForm.getRawValue()
    };

    this.tags.addTag(newTag).subscribe(() => {
      this.tagsForm.reset();
    });
  }

  saveManga() {
    const newManga: NewManga = {
      ...this.mangaForm.getRawValue()
    };

    this.manga.addManga(newManga).subscribe(() => {
      this.mangaForm.reset();
    });
  }

  addTagToManga() {
    if (this.selectedMangaId !== null && this.selectedTagId !== null) {
      this.manga.addTagToManga(this.selectedMangaId, this.selectedTagId).subscribe({
        next: () => {
          console.log(`Tag ${this.selectedTagId} añadido a manga ${this.selectedMangaId}`);
          this.selectedMangaId = null; // Reset después de asignar
          this.selectedTagId = null; // Reset después de asignar
        },
        error: (err) => {
          console.error('Error al añadir tag al manga:', err);
        }
      });
    }
  }
  getTagNames(tags: any[]): string {
    return tags?.map(tag => tag.name).join(', ') || 'Sin tags';
  }
}
