import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    mobile: string;

    @Column()
    password: string;

    @Column()
    role: string;

    @Column()
    name:string

}