import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { GroupExpense } from './GroupExpense';

@Entity()
export class Group {
    @PrimaryGeneratedColumn()
    id!: string;

    @Column()
    name!: string;

    @ManyToMany(() => User, (user) => user.groups)
    @JoinTable({
        name: 'group_members',
        joinColumn: { name: 'group_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    members!: User[];

    @OneToMany(() => GroupExpense, (groupExpense) => groupExpense.group)
    groupExpenses?: GroupExpense[];
}
