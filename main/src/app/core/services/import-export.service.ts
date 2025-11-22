import { Injectable, inject } from '@angular/core';
import { Observable, defer } from 'rxjs';
import { map } from 'rxjs/operators';
import { MangaService } from './manga.service';
import { TagService } from './tag.service';
import { Manga } from '../interfaces/manga.interface';
import { Tag } from '../interfaces/tag.interface';
import { ImportCollision, ImportResult, RawExport } from '../interfaces/import-export.interface';

@Injectable({ providedIn: 'root' })
export class ImportExportService {
    private mangaService = inject(MangaService);
    private tagService = inject(TagService);
    private readonly EXPORT_VERSION = 1;

    /**
     * Exports the current library (mangas + tags) wrapped in JSON blob.
     */
    export$(): Observable<Blob> {
        return defer(() => new Observable<Blob>(subscriber => {
            // Collect all mangas & tags
            this.mangaService.getAllMangas({}).subscribe(mangas => {
                this.tagService.getAllTags().subscribe(tags => {
                    const payload: RawExport = {
                        version: this.EXPORT_VERSION,
                        mangas: mangas.map(m => ({
                            title: m.title,
                            link: m.link,
                            image: m.image,
                            chapters: m.chapters,
                            isFavorite: m.isFavorite,
                            type: m.type,
                            state: m.state,
                            tags: m.tags,
                            createdAt: m.createdAt,
                            updatedAt: m.updatedAt
                        })),
                        tags: tags.map(t => ({
                            name: t.name,
                            color: t.color
                        }))
                    };
                    try {
                        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
                        subscriber.next(blob);
                    } catch {
                        // fallback text
                        subscriber.next(new Blob(['{}'], { type: 'application/json' }));
                    } finally {
                        subscriber.complete();
                    }
                });
            });
        }));
    }

    /**
     * Imports a JSON file. Validates basic schema. Collisions gathered by matching titles.
     * Strategy only applies if caller wants immediate handling:
     *  - 'mergeAll': all collisions auto-merged
     *  - 'skipAll': all collisions skipped
     *  - 'prompt': collisions returned for user decision
     */
    importFile$(file: File, strategy: 'prompt' | 'mergeAll' | 'skipAll' = 'prompt'): Observable<ImportResult> {
        return defer(() => this.readFile$(file).pipe(
            map(text => this.processRawImport(text, strategy))
        ));
    }

    /**
     * Applies user decisions to collision list and persists resolved entries.
     */
    applyCollisionDecisions$(result: ImportResult): Observable<ImportResult> {
        return defer(() => new Observable<ImportResult>(subscriber => {
            const chosenToMerge = result.collisions.filter(c => c.decision === 'merge');
            let importedExtra = 0;

            const proceed = () => {
                subscriber.next({
                    ...result,
                    imported: result.imported + importedExtra
                });
                subscriber.complete();
            };

            if (!chosenToMerge.length) {
                proceed();
                return;
            }

            // Sequential merge
            let index = 0;
            const next = () => {
                if (index >= chosenToMerge.length) {
                    proceed();
                    return;
                }
                const col = chosenToMerge[index++];
                // Merge = update existing manga's mutable fields (chapters, link, image, tags, state, type, favorite)
                this.mangaService.getMangaById(col.existing.id).subscribe(existing => {
                    if (existing) {
                        const merged: Partial<Manga> = {
                            link: col.incoming.link ?? existing.link,
                            image: col.incoming.image ?? existing.image,
                            chapters: col.incoming.chapters ?? existing.chapters,
                            isFavorite: existing.isFavorite || col.incoming.isFavorite,
                            type: col.incoming.type ?? existing.type,
                            state: col.incoming.state ?? existing.state,
                            tags: this.mergeTagArrays(existing.tags, col.incoming.tags)
                        };
                        this.mangaService.updateManga(existing.id, merged).subscribe({
                            next: () => {
                                importedExtra++;
                                next();
                            },
                            error: () => next()
                        });
                    } else {
                        next();
                    }
                });
            };
            next();
        }));
    }

    /**
     * Imports bookmarks (scaffold – collects URLs, attempts title from URL segment).
     * Produces a partial ImportResult.
     */
    importBookmarks$(): Observable<ImportResult> {
        return defer(() => new Observable<ImportResult>(subscriber => {
            const chromeObj = (window as any).chrome;
            if (!chromeObj?.bookmarks?.getTree) {
                subscriber.next({
                    imported: 0,
                    skipped: 0,
                    collisions: [],
                    errors: ['import.error.bookmarksUnsupported']
                });
                subscriber.complete();
                return;
            }
            chromeObj.bookmarks.getTree((nodes: any[]) => {
                const urls: string[] = [];
                const walk = (n: any) => {
                    if (n.url) urls.push(n.url);
                    if (n.children) n.children.forEach(walk);
                };
                nodes.forEach(walk);

                // Basic transform: derive title from last path segment
                const mangas: Omit<Manga, 'id' | 'resolvedTags'>[] = urls.map(u => {
                    const title = decodeURIComponent(
                        (u.split('/').pop() || 'Untitled')
                            .replace(/[\?#].*$/, '')
                            .replace(/[-_]/g, ' ')
                    );
                    return {
                        title: title.trim(),
                        link: u,
                        image: undefined,
                        chapters: 0,
                        isFavorite: false,
                        type: undefined,
                        state: undefined,
                        tags: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                });

                // Check collisions
                this.mangaService.getAllMangas({}).subscribe(existingList => {
                    const existingTitles = new Map(existingList.map(m => [m.title.toLowerCase(), m]));
                    const collisions: ImportCollision[] = [];
                    let imported = 0;
                    let skipped = 0;

                    const processSequential = (idx: number) => {
                        if (idx >= mangas.length) {
                            subscriber.next({
                                imported,
                                skipped,
                                collisions,
                                errors: []
                            });
                            subscriber.complete();
                            return;
                        }
                        const mg = mangas[idx];
                        const found = existingTitles.get(mg.title.toLowerCase());
                        if (found) {
                            collisions.push({
                                title: mg.title,
                                incoming: mg,
                                existing: found
                            });
                            skipped++;
                            processSequential(idx + 1);
                        } else {
                            this.mangaService.addMangaMinimal({
                                title: mg.title,
                                link: mg.link,
                                image: mg.image,
                                tags: []
                            }).subscribe({
                                next: () => {
                                    imported++;
                                    processSequential(idx + 1);
                                },
                                error: () => {
                                    skipped++;
                                    processSequential(idx + 1);
                                }
                            });
                        }
                    };
                    processSequential(0);
                });
            });
        }));
    }

    /**
     * Internal: Reads file content as Observable<string>.
     */
    private readFile$(file: File): Observable<string> {
        return defer(() => new Observable<string>(subscriber => {
            const reader = new FileReader();
            reader.onload = () => {
                subscriber.next(reader.result as string);
                subscriber.complete();
            };
            reader.onerror = () => {
                subscriber.error('import.error.readFailed');
            };
            reader.readAsText(file);
        }));
    }

    /**
     * Processes raw JSON text into ImportResult (no mutations yet except non-colliding inserts).
     */
    private processRawImport(raw: string, strategy: 'prompt' | 'mergeAll' | 'skipAll'): ImportResult {
        const errors: string[] = [];
        let parsed: RawExport | null = null;

        try {
            parsed = JSON.parse(raw);
        } catch {
            return { imported: 0, skipped: 0, collisions: [], errors: ['import.error.invalidJson'] };
        }

        if (!parsed || typeof parsed !== 'object') {
            return { imported: 0, skipped: 0, collisions: [], errors: ['import.error.invalidJson'] };
        }
        if (parsed.version !== this.EXPORT_VERSION) {
            errors.push('import.error.unsupportedVersion');
        }
        if (!Array.isArray(parsed.mangas)) {
            errors.push('import.error.missingMangas');
        }
        if (!Array.isArray(parsed.tags)) {
            errors.push('import.error.missingTags');
        }
        if (errors.length) {
            return { imported: 0, skipped: 0, collisions: [], errors };
        }

        // Prepare tag map (by name lowercase)
        const tagNameMap = new Map<string, Omit<Tag, 'id'>>();
        parsed.tags.forEach(t => {
            if (t?.name) {
                tagNameMap.set(t.name.toLowerCase(), { name: t.name, color: t.color });
            }
        });

        let imported = 0;
        let skipped = 0;
        const collisions: ImportCollision[] = [];

        const seenTitles = new Set<string>();
        parsed.mangas.forEach(mg => {
            const norm = (mg.title || '').trim();
            if (!norm) {
                skipped++;
                errors.push('import.error.missingTitle');
                return;
            }
            if (seenTitles.has(norm.toLowerCase())) {
                // internal duplicate
                collisions.push({
                    title: norm,
                    incoming: mg,
                    existing: { // stub existing (same as incoming)
                        id: 0 as unknown as number,
                        title: norm,
                        link: mg.link,
                        image: mg.image,
                        chapters: mg.chapters ?? 0,
                        isFavorite: !!mg.isFavorite,
                        type: mg.type as any,
                        state: mg.state as any,
                        tags: mg.tags ?? [],
                        createdAt: mg.createdAt ?? new Date().toISOString(),
                        updatedAt: mg.updatedAt ?? new Date().toISOString(),
                        resolvedTags: []
                    }
                });
                skipped++;
                return;
            }
            seenTitles.add(norm.toLowerCase());
            imported++;
        });

        // Strategy handling – if mergeAll or skipAll we set decisions
        if (strategy !== 'prompt') {
            collisions.forEach(c => {
                c.decision = strategy === 'mergeAll' ? 'merge' : 'skip';
            });
        }

        return { imported, skipped, collisions, errors };
    }

    private mergeTagArrays(existing: number[] | undefined, incoming: number[] | undefined): number[] {
        return Array.from(new Set([...(existing ?? []), ...(incoming ?? [])]));
    }
}