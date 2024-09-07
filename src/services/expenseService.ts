import { AppDataSource } from '../config/ormconfig';
import { Expense } from '../models/Expense';
import { ExpenseSplit } from '../models/ExpenseSplit';
import { Group } from '../models/Group';
import { GroupExpense } from '../models/GroupExpense';
import { GroupExpenseSplit } from '../models/GroupExpenseSplit';
import { User } from '../models/User';
import { SplitType } from '../utils/SplitType';


// Service function to create an expense (individual or group)
export const createExpense = async (expenseData: {
    amount: number;
    description?: string;
    groupId?: string; // Optional for group expenses
    splitType: 'EQUAL' | 'UNEQUAL' | 'PERCENTAGE' | 'SHARE'; // How the expense is split
    participants: { userId: string; amountPaid?: number; percentage?: number; share?: number }[]; // Participants and their contributions
}) => {
    const expenseRepository = AppDataSource.getRepository(Expense);
    const groupExpenseRepository = AppDataSource.getRepository(GroupExpense);
    const userRepository = AppDataSource.getRepository(User);
    const expenseSplitRepository = AppDataSource.getRepository(ExpenseSplit);
    const groupExpenseSplitRepository = AppDataSource.getRepository(GroupExpenseSplit);

    let expense: Expense | GroupExpense;

    // Create a new group or individual expense
    if (expenseData.groupId) {
        // Handle group expense
        const group = await groupExpenseRepository.findOne({
            where: { id: expenseData.groupId },
            relations: ['group']
        });
        if (!group) {
            throw new Error('Group not found');
        }

        // Create new GroupExpense
        expense = groupExpenseRepository.create({
            amount: expenseData.amount,
            description: expenseData.description,
            group: group,
            createdAt: new Date(),
            groupExpenseSplits: [],
        });

        // Add splits for each participant (group splits)
        const totalAmount = expenseData.amount;
        let totalShares = 0;

        if (expenseData.splitType === 'SHARE') {
            // Calculate total shares for SHARE type
            totalShares = expenseData.participants.reduce((sum, p) => sum + (p.share || 0), 0);
        }

        for (const participant of expenseData.participants) {
            const user = await userRepository.findOneBy({id: participant.userId});
            if (!user) {
                throw new Error(`User with ID ${participant.userId} not found`);
            }

            let amountOwed = 0;

            // Calculate amountOwed based on split type
            switch (expenseData.splitType) {
                case 'EQUAL':
                    amountOwed = totalAmount / expenseData.participants.length;
                    break;
                case 'UNEQUAL':
                    amountOwed = participant.amountPaid || 0; // In UNEQUAL, amountPaid = amountOwed
                    break;
                case 'PERCENTAGE':
                    if (participant.percentage) {
                        amountOwed = (participant.percentage / 100) * totalAmount;
                    }
                    break;
                case 'SHARE':
                    if (participant.share && totalShares > 0) {
                        amountOwed = (participant.share / totalShares) * totalAmount;
                    }
                    break;
                default:
                    throw new Error('Invalid split type');
            }

            const split = groupExpenseSplitRepository.create({
                groupExpense: expense,
                user: user,
                splitType: expenseData.splitType as SplitType,
                paidAmount: participant.amountPaid, // Amount this user paid
                amountOwed: amountOwed, // Calculated amount this user owes
                percentage: participant.percentage, // For percentage splits
                share: participant.share, // For share-based splits
            });

            expense.groupExpenseSplits.push(split);
        }

        // Save the group expense and splits
        const savedGroupExpense = await groupExpenseRepository.save(expense);
        return savedGroupExpense;
    } else {
        // Handle individual expense
        expense = expenseRepository.create({
            amount: expenseData.amount,
            description: expenseData.description,
            createdAt: new Date(),
            expenseSplits: [],
        });

        const totalAmount = expenseData.amount;
        let totalShares = 0;

        if (expenseData.splitType === 'SHARE') {
            // Calculate total shares for SHARE type
            totalShares = expenseData.participants.reduce((sum, p) => sum + (p.share || 0), 0);
        }

        // Add splits for each participant (individual splits)
        for (const participant of expenseData.participants) {
            const user = await userRepository.findOneBy({id: participant.userId});
            if (!user) {
                throw new Error(`User with ID ${participant.userId} not found`);
            }

            let amountOwed = 0;

            // Calculate amountOwed based on split type
            switch (expenseData.splitType) {
                case 'EQUAL':
                    amountOwed = totalAmount / expenseData.participants.length;
                    break;
                case 'UNEQUAL':
                    amountOwed = participant.amountPaid || 0;
                    break;
                case 'PERCENTAGE':
                    if (participant.percentage) {
                        amountOwed = (participant.percentage / 100) * totalAmount;
                    }
                    break;
                case 'SHARE':
                    if (participant.share && totalShares > 0) {
                        amountOwed = (participant.share / totalShares) * totalAmount;
                    }
                    break;
                default:
                    throw new Error('Invalid split type');
            }

            const split = expenseSplitRepository.create({
                expense: expense,
                user: user,
                splitType: expenseData.splitType as SplitType,
                amount: participant.amountPaid, // Amount this user paid
                // amountOwed: amountOwed, // Calculated amount this user owes
                percentage: participant.percentage, // For percentage splits
                share: participant.share, // For share-based splits
            });

            expense.expenseSplits.push(split);
        }

        // Save the individual expense and splits
        const savedExpense = await expenseRepository.save(expense);
        return savedExpense;
    }
};

// Service function to get all expenses (individual and group) for a user
export const getExpensesForUser = async (userId: string) => {
    const expenseSplitRepository = AppDataSource.getRepository(ExpenseSplit);
    const groupExpenseSplitRepository = AppDataSource.getRepository(GroupExpenseSplit);

    // Get individual expenses for the user
    const individualExpenses = await expenseSplitRepository.find({
        where: { user: { id: userId } },
        relations: ['expense', 'expense.expenseSplits', 'expense.expenseSplits.user'],
    });

    // Get group expenses for the user
    const groupExpenses = await groupExpenseSplitRepository.find({
        where: { user: { id: userId } },
        relations: ['groupExpense', 'groupExpense.groupExpenseSplits', 'groupExpense.groupExpenseSplits.user'],
    });

    // Combine individual and group expenses
    const combinedExpenses = {
        individualExpenses: individualExpenses.map(split => ({
            id: split.expense.id,
            amount: split.expense.amount,
            description: split.expense.description,
            createdAt: split.expense.createdAt,
            participants: split.expense.expenseSplits.map(s => ({
                userId: s.user.id,
                name: s.user.name,
            })),
        })),
        groupExpenses: groupExpenses.map(split => ({
            id: split.groupExpense.id,
            amount: split.groupExpense.amount,
            description: split.groupExpense.description,
            createdAt: split.groupExpense.createdAt,
            paidAmount: split.paidAmount,
            amountOwed: split.amountOwed,
            participants: split.groupExpense.groupExpenseSplits.map(s => ({
                userId: s.user.id,
                name: s.user.name,
                amountOwed: s.amountOwed,
                paidAmount: s.paidAmount,
            })),
        })),
    };

    return combinedExpenses;
};

// Service function to get an expense by ID (individual or group)
export const getExpenseById = async (expenseId: string) => {
    const expenseRepository = AppDataSource.getRepository(Expense);
    const groupExpenseRepository = AppDataSource.getRepository(GroupExpense);

    let expense : Expense | GroupExpense | null;
    // Try to find the expense in the individual expenses first
    expense = await expenseRepository.findOne({
        where: { id: expenseId },
        relations: ['expenseSplits', 'expenseSplits.user'],
    });

    // If not found, try to find it in the group expenses
    if (!expense) {
        expense = await groupExpenseRepository.findOne({
            where: { id: expenseId },
            relations: ['groupExpenseSplits', 'groupExpenseSplits.user'],
        });

        if (!expense) {
            throw new Error('Expense not found');
        }

        // Return group expense details
        return {
            id: expense.id,
            amount: expense.amount,
            description: expense.description,
            createdAt: expense.createdAt,
            type: 'group',
            participants: expense.groupExpenseSplits.map(split => ({
                userId: split.user.id,
                name: split.user.name,
                paidAmount: split.paidAmount,
                amountOwed: split.amountOwed,
            })),
        };
    }

    // Return individual expense details
    return {
        id: expense.id,
        amount: expense.amount,
        description: expense.description,
        createdAt: expense.createdAt,
        type: 'individual',
        participants: expense.expenseSplits.map(split => ({
            userId: split.user.id,
            name: split.user.name,
            // paidAmount: split.paidAmount,
            // amountOwed: split.amountOwed,
        })),
    };
};

// Service function to update splits for an expense (individual or group)
export const updateExpenseSplits = async (
    expenseId: string,
    splitsData: {
        userId: number;
        amountPaid?: number;
        percentage?: number;
        share?: number;
    }[]
) => {
    const expenseRepository = AppDataSource.getRepository(Expense);
    const groupExpenseRepository = AppDataSource.getRepository(GroupExpense);
    const expenseSplitRepository = AppDataSource.getRepository(ExpenseSplit);
    const groupExpenseSplitRepository = AppDataSource.getRepository(GroupExpenseSplit);

    let expense : GroupExpense | Expense | null;
    // Try to find the expense in individual expenses first
    expense = await expenseRepository.findOne({
        where: { id: expenseId },
        relations: ['expenseSplits', 'expenseSplits.user'],
    });
    if (expense) {
        // Update splits for individual expenses
        await updateIndividualExpenseSplits(expense, splitsData, expenseSplitRepository);
    } else {
        // If not found in individual expenses, try to find in group expenses
        expense = await groupExpenseRepository.findOne({
            where: { id: expenseId },
            relations: ['groupExpenseSplits', 'groupExpenseSplits.user'],
        });

        if (!expense) {
            throw new Error('Expense not found');
        }

        // Update splits for group expenses
        await updateGroupExpenseSplits(expense, splitsData, groupExpenseSplitRepository);
    }

    return expense;
};

// Function to update individual expense splits
const updateIndividualExpenseSplits = async (
    expense: Expense,
    splitsData: {
        userId: number;
        amountPaid?: number;
        percentage?: number;
        share?: number;
    }[],
    expenseSplitRepository: any
) => {
    const totalAmount = expense.amount;
    let totalShares = 0;

    // If SHARE split type, calculate total shares
    if (splitsData.some((s) => s.share)) {
        totalShares = splitsData.reduce((sum, split) => sum + (split.share || 0), 0);
    }

    // Clear existing splits
    await expenseSplitRepository.remove(expense.expenseSplits);

    // Add updated splits
    for (const splitData of splitsData) {
        let amountOwed = 0;

        // Calculate the amountOwed based on the split type
        if (splitData.percentage) {
            amountOwed = (splitData.percentage / 100) * totalAmount;
        } else if (splitData.share && totalShares > 0) {
            amountOwed = (splitData.share / totalShares) * totalAmount;
        } else if (splitData.amountPaid) {
            amountOwed = splitData.amountPaid; // For UNEQUAL splits
        }

        const newSplit = expenseSplitRepository.create({
            expense: expense,
            user: { id: splitData.userId },
            paidAmount: splitData.amountPaid,
            amountOwed: amountOwed,
            percentage: splitData.percentage,
            share: splitData.share,
        });

        await expenseSplitRepository.save(newSplit);
    }
};

// Function to update group expense splits
const updateGroupExpenseSplits = async (
    expense: GroupExpense,
    splitsData: {
        userId: number;
        amountPaid?: number;
        percentage?: number;
        share?: number;
    }[],
    groupExpenseSplitRepository: any
) => {
    const totalAmount = expense.amount;
    let totalShares = 0;

    // If SHARE split type, calculate total shares
    if (splitsData.some((s) => s.share)) {
        totalShares = splitsData.reduce((sum, split) => sum + (split.share || 0), 0);
    }

    // Clear existing splits
    await groupExpenseSplitRepository.remove(expense.groupExpenseSplits);

    // Add updated splits
    for (const splitData of splitsData) {
        let amountOwed = 0;

        // Calculate the amountOwed based on the split type
        if (splitData.percentage) {
            amountOwed = (splitData.percentage / 100) * totalAmount;
        } else if (splitData.share && totalShares > 0) {
            amountOwed = (splitData.share / totalShares) * totalAmount;
        } else if (splitData.amountPaid) {
            amountOwed = splitData.amountPaid; // For UNEQUAL splits
        }

        const newSplit = groupExpenseSplitRepository.create({
            groupExpense: expense,
            user: { id: splitData.userId },
            paidAmount: splitData.amountPaid,
            amountOwed: amountOwed,
            percentage: splitData.percentage,
            share: splitData.share,
        });

        await groupExpenseSplitRepository.save(newSplit);
    }
};