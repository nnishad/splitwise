import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Group } from './Group';
import { GroupExpenseSplit } from './GroupExpenseSplit';

@Entity()
export class GroupExpense {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column('decimal')
    amount!: number;

    @Column({ nullable: true })
    description?: string;

    @ManyToOne(() => Group, (group) => group.groupExpenses)
    group!: Group;

    @OneToMany(() => GroupExpenseSplit, (groupExpenseSplit) => groupExpenseSplit.groupExpense, { cascade: true })
    groupExpenseSplits: GroupExpenseSplit[] = [];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
