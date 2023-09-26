import { ColdObservable } from "rxjs/internal/testing/ColdObservable";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export class SaUser {

    @PrimaryGeneratedColumn()
    id: number;

    user_id: number;

    @Column({unique: true})
    email: string;

    @Column({unique: true})
    mobile: string;

    @Column()
    name:string

    @Column()
    collegeName:string

    @Column()
    courseYear:string

    @Column()
    addressLine1:string

    @Column()
    addressLine2:string

    @Column()
    addressLine3:string

    @Column()
    bankName:string

    @Column()
    accountNo:string

    @Column()
    ifscCode:string

    @Column()
    referralCode:string

    @Column()
    discount:string

    @Column()
    commission:string

    @Column()
    pan:string

    @Column()
    areaSalesManager:string

    @Column()
    state:string
    
}