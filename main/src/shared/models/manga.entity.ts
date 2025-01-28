import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToMany 
} from 'typeorm';
import { IManga } from '../interfaces/manga';
import { TagEntity } from './tag.entity';

@Entity('manga')
export class MangaEntity implements IManga {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    updated_at!: Date;

    @Column()
    created_at!: Date;

    @Column({ nullable: true })
    link?: string;

    @Column({ nullable: true })
    image?: string;

    @Column({ nullable: true })
    chapters?: number;

    @Column({ nullable: true })
    isFavorite?: boolean;

    @OneToMany(() => TagEntity, tag => tag.id)
    tags?: number[];
}