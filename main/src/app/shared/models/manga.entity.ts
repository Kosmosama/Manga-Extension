import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany
} from 'typeorm';

import { TagEntity } from './tag.entity';
import { IManga } from '../interfaces/manga.interface';
import type { MangaState, MangaType } from '../interfaces/manga.interface';

@Entity('manga')
export class MangaEntity implements IManga {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    link?: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image?: string;

    @Column({ type: 'int', nullable: true })
    chapters?: number;

    @Column({ type: 'enum', enum: ['manga', 'manhwa', 'manhua', 'webcomic', 'novel', 'book', 'one-shot', 'doujinshi', 'other'], nullable: true })
    type?: MangaType;

    @Column({ type: 'enum', enum: ['reading', 'completed', 'on-hold', 'dropped', 'plan-to-read', 'none'], nullable: true })
    state?: MangaState;

    @Column({ type: 'boolean', nullable: true })
    isFavorite?: boolean;

    @OneToMany(() => TagEntity, tag => tag.id)
    tags?: number[];
}