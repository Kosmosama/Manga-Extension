import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ITag } from "../interfaces/tag.interface";

@Entity('tag')
export class TagEntity implements ITag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({type: 'varchar', length: 255})
    name!: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    updated_at!: Date;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    created_at!: Date;

}