import { User } from '../models/User';
import { AppDataSource } from '../config/ormconfig';
import { Group } from '../models/Group';
import { In } from 'typeorm';
import { GroupExpense } from '../models/GroupExpense';
import { GroupExpenseSplit } from '../models/GroupExpenseSplit';
import { SplitType } from '../utils/SplitType';

// Function to create a new group
export const createGroup = async (groupData: { name: string; userIds: number[] }) => {
    const groupRepository = AppDataSource.getRepository(Group);// Get the group repository
    const userRepository = AppDataSource.getRepository(User);// Get the user repository

    // Check if users exist in the database by the provided IDs
    const users = await userRepository.find({
        where: {
            id: In(groupData.userIds)
        }
    });
    if (users.length !== groupData.userIds.length) {
        throw new Error('Some users not found');
    }

    // Create a new group instance
    const newGroup = groupRepository.create({
        name: groupData.name,
        members: users, // Associate users with the group
    });

    // Save the new group to the database
    const savedGroup = await groupRepository.save(newGroup);

    return savedGroup; // Return the newly created group
};

// Function to get all groups for a user
export const getGroupsForUser = async (userId: string) => {
    const userRepository = AppDataSource.getRepository(User);// Get the user repository

    // Find the user by ID and include the groups they belong to
// Find the user by ID and include the groups they belong to using `findOne` with relations
    const user = await userRepository.findOne({
        where: { id: userId },
        relations: ['groups'], // Load the user's associated groups
    });
    // If the user is not found, throw an error
    if (!user) {
        throw new Error('User not found');
    }

    // Return the list of groups the user belongs to
    return user.groups;
};


// Function to add users to an existing group
export const addUsersToGroup = async (groupId: string, userIds: string[]) => {
    const groupRepository = AppDataSource.getRepository(Group);// Get the group repository
    const userRepository = AppDataSource.getRepository(User);// Get the user repository

    // Find the group by ID
    const group = await groupRepository.findOne({
        where: { id: groupId },
        relations: ['members'], // Load the current members of the group
    });

    // If the group is not found, throw an error
    if (!group) {
        throw new Error('Group not found');
    }

    // Find the users by their IDs
    const users = await userRepository.findByIds(userIds);

    // If any users are not found, throw an error
    if (users.length !== userIds.length) {
        throw new Error('Some users not found');
    }

    // Add the new users to the group members
    group.members = [...group.members, ...users];

    // Save the updated group
    const updatedGroup = await groupRepository.save(group);

    return updatedGroup;
};


// Function to get all expenses for a group
export const getExpensesForGroup = async (groupId: string) => {
    const groupRepository = AppDataSource.getRepository(Group);// Get the group repository

    // Check if the group exists
    const group = await groupRepository.findOneBy({id: groupId});
    if (!group) {
        throw new Error('Group not found');
    }

    const groupExpenseRepository = AppDataSource.getRepository(GroupExpense); // Get the group expense repository

    // Find all expenses for the group
    const expenses = await groupExpenseRepository.find({
        where: { group: group }, // Fetch all expenses for the given group
        relations: ['payer', 'groupExpenseSplits', 'groupExpenseSplits.user'], // Load related entities
    });

    return expenses;
};

// Function to add/update/remove a group expense
export const addOrUpdateGroupExpense = async (
    groupId: string,
    expenseData: {
        expenseId?: string; // Optional for updating an existing expense
        action: 'add' | 'update' | 'remove'; // The action to perform
        amount?: number; // Expense amount
        description?: string; // Optional description
        splits: { userId: string; paidAmount?: number; amountOwed?: number; percentage?: number; share?: number; splitType: string }[]; // Splits array
    }
) => {
    const groupRepository = AppDataSource.getRepository(Group);
    const groupExpenseRepository = AppDataSource.getRepository(GroupExpense);
    const userRepository = AppDataSource.getRepository(User);
    const groupExpenseSplitRepository = AppDataSource.getRepository(GroupExpenseSplit);

    // Ensure the group exists
    const group = await groupRepository.findOneBy({id: groupId});
    if (!group) {
        throw new Error('Group not found');
    }

    let groupExpense: GroupExpense | null;

    // Handle "remove" action: Remove the expense from the group
    if (expenseData.action === 'remove' && expenseData.expenseId) {
        groupExpense = await groupExpenseRepository.findOne({
            where: { id: expenseData.expenseId },
            relations: ['groupExpenseSplits']
        });
        if (!groupExpense) {
            throw new Error('Expense not found');
        }

        // Remove the splits first
        await groupExpenseSplitRepository.remove(groupExpense.groupExpenseSplits);

        // Remove the expense
        await groupExpenseRepository.remove(groupExpense);
        return { message: 'Expense removed successfully' };
    }

    // Handle "add" or "update" action
    if (expenseData.action === 'add') {
        // Create a new expense
        groupExpense = groupExpenseRepository.create({
            amount: expenseData.amount,
            description: expenseData.description,
            group: group,
            groupExpenseSplits: [],
            createdAt: new Date(),
        });
    } else if (expenseData.action === 'update' && expenseData.expenseId) {
        // Updating an existing expense
        groupExpense = await groupExpenseRepository.findOne({
            where: { id: expenseData.expenseId },
            relations: ['groupExpenseSplits']
        });
        if (!groupExpense) {
            throw new Error('Expense not found');
        }

        // Update expense details
        if (expenseData.amount) groupExpense.amount = expenseData.amount;
        if (expenseData.description) groupExpense.description = expenseData.description;

        // Clear existing splits before updating
        await groupExpenseSplitRepository.remove(groupExpense.groupExpenseSplits);
        groupExpense.groupExpenseSplits = [];
    } else {
        throw new Error('Invalid action or missing expenseId');
    }

    // Add expense splits for each user involved (for add/update)
    for (const splitData of expenseData.splits) {
        const user = await userRepository.findOneBy({id: splitData.userId});
        if (!user) {
            throw new Error(`User with ID ${splitData.userId} not found`);
        }

        const split = groupExpenseSplitRepository.create({
            user: user,
            splitType: splitData.splitType as SplitType, // Cast to SplitType if splitData.splitType is a valid value
            paidAmount: splitData.paidAmount,
            amountOwed: splitData.amountOwed,
            percentage: splitData.percentage,
            share: splitData.share,
        });

        groupExpense.groupExpenseSplits.push(split);
    }

    // Save the group expense (either new or updated)
    const savedGroupExpense = await groupExpenseRepository.save(groupExpense);

    return savedGroupExpense;
};