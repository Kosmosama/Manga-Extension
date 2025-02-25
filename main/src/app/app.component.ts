import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MangaType, MangaState, Manga } from './shared/interfaces/manga.interface';
import { MangaService } from './manga/services/manga.service';
import { TagService } from './tag/services/tag.service';
import { Tag } from './shared/interfaces/tag.interface';

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
    private fb = inject(NonNullableFormBuilder);

    // #TODO Change into using signals... // Tf is a signal tho

    public MangaList: Manga[] = [];
    public TagList: Tag[] = [];
    
    public selectedMangaId: number | null = null; // Para identificar el manga seleccionado
    public selectedTagId: number | null = null; // Para identificar el tag seleccionado

    tagsForm = this.fb.group({
        name: [''],
        color: ['']
    });

    mangaForm = this.fb.group({
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
        this.manga.getAllMangas({}).subscribe({
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
        const newTag: Tag = {
            id: Date.now(),
            ...this.tagsForm.getRawValue()
        };

        this.tags.addTag(newTag).subscribe(() => {
            this.tagsForm.reset();
        });
    }

    saveManga() {
        const newManga: Partial<Manga> = {
            id: Date.now(),
            ...this.mangaForm.getRawValue()
        };

        this.manga.addManga(newManga as Manga).subscribe(() => {
            this.mangaForm.reset();
        });
    }

    addTagToManga() {
        if (this.selectedMangaId !== null && this.selectedTagId !== null) {
            this.manga.addTagToManga(this.selectedMangaId, [this.selectedTagId]).subscribe({
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
