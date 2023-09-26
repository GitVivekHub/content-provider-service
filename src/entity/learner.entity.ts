import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export class Learner {

    @Column()
    name:string

    @Column()
    phone:string

    @Column()
    email:string

    @Column()
    learner_id:string
    
}