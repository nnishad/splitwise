import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { GroupExpense } from './GroupExpense';
import { User } from './User';
import { SplitType } from '../utils/SplitType';

@Entity()
export class GroupExpenseSplit {
    @PrimaryGeneratedColumn()
    id!: string;

    @ManyToOne(() => GroupExpense, (groupExpense) => groupExpense.groupExpenseSplits)
    groupExpense!: GroupExpense;

    @ManyToOne(() => User)
    user!: User;

    @Column('decimal', { nullable: true })
    paidAmount?: number; // How much this user paid towards the expense

    @Column('decimal', { nullable: true })
    amountOwed?: number; // How much this user owes

    @Column('decimal', { nullable: true })
    percentage?: number; // If splitting by percentage

    @Column('decimal', { nullable: true })
    share?: number; // If splitting by share
    
    @Column({
        type: 'enum',
        enum: SplitType,
    })
    splitType!: SplitType;
}
