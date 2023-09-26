import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  learner_id: string;

  @Column()
  transactionId:string

  @Column()
  transactionAmount:number

  @Column()
  transactionDateTime:any
}
