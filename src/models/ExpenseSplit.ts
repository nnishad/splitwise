import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Expense } from './Expense';
import { User } from './User';
import { SplitType } from '../utils/SplitType';


@Entity()
export class ExpenseSplit {
    @PrimaryGeneratedColumn()
    id!: string;

    @ManyToOne(() => Expense, (expense) => expense.expenseSplits)
    expense!: Expense;

    @ManyToOne(() => User)
    user!: User;

    @Column('decimal', { nullable: true })
    amount?: number;

    @Column('decimal', { nullable: true })
    percentage?: number;

    @Column('decimal', { nullable: true })
    share?: number;

    @Column({
        type: 'enum',
        enum: SplitType,
    })
    splitType!: SplitType;
}
