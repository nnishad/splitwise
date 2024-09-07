import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { ExpenseSplit } from './ExpenseSplit';

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column('decimal')
    amount!: number;

    @Column({ nullable: true })
    description?: string;

    @ManyToOne(() => User, (user) => user.expenses)
    payer!: User;

    @OneToMany(() => ExpenseSplit, (expenseSplit) => expenseSplit.expense, { cascade: true })
    expenseSplits: ExpenseSplit[] = [];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
