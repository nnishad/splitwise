import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Expense } from './Expense';
import { Group } from './Group';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @OneToMany(() => Expense, (expense) => expense.payer)
    expenses: Expense[] = [];

    @ManyToMany(() => Group, (group) => group.members)
    @JoinTable()
    groups: Group[] = [];
}
