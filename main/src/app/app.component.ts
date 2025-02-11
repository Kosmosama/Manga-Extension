import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MangaType, MangaState, NewManga } from './shared/interfaces/manga.interface';
import { MangaService } from './manga/services/manga.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  public manga = inject(MangaService);
  #fb = inject(NonNullableFormBuilder);

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

  saveManga() {
    const newManga: NewManga = {
      ...this.mangaForm.getRawValue()
    };

    this.manga.addManga(newManga).subscribe(() => {
      this.mangaForm.reset();
    });
  }
}