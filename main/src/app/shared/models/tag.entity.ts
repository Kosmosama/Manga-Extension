import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ITag } from "../interfaces/tag.interface";

@Entity('tag')
export class TagEntity implements ITag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    updated_at!: Date;

    @Column()
    created_at!: Date;

}