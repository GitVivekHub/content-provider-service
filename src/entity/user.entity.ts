import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()

export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    username: string;

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

    @Column()
    saUserRelation:any

    @Column()
    state:string

    // @Column()
    // collegeName:string

    // @Column()
    // courseYear:string

    // @Column()
    // addressLine1:string

    // @Column()
    // addressLine2:string

    // @Column()
    // addressLine3:string

    // @Column()
    // bankName:string

    // @Column()
    // accountNo:string

    // @Column()
    // ifscCode:string

    // @Column()
    // referralCode:string
    
}