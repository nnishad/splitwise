import { Router } from 'express';
import { addOrUpdateGroupExpense, addUsersToGroup, createGroup, getExpensesForGroup, getGroupsForUser } from '../services/groupService';
const router = Router();

// Create a new group
router.post('/groups', async (req, res) => {
    const groupData = req.body;
    // Logic to create a new group
    // e.g. await groupService.createGroup(groupData);
    try {
        // Call the createGroup function from the service
        const newGroup = await createGroup(groupData);

        // Respond with the created group
        res.status(201).json({
            message: 'Group created successfully',
            group: newGroup,
        });
    } catch (error) {
        // Assert error as an instance of Error to access message property
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(400).json({
            message: message,
        });
    }
});

// Get all groups for a user
router.get('/users/:userId/groups', async (req, res) => {
    const userId = req.params.userId;
    // Logic to get all groups for a user
    // e.g. await groupService.getGroupsForUser(userId);
    try {
        // Call the getGroupsForUser function from the service
        const groups = await getGroupsForUser(userId);

        // Respond with the list of groups
        res.status(200).json(groups);
    } catch (error) {
       const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
       res.status(400).json({
           message: message,
       });
    }
});

// Add users to a group
router.post('/groups/:groupId/users', async (req, res) => {
    const groupId = req.params.groupId;
    const userIds = req.body.userIds;
    // Logic to add users to the group
    // e.g. await groupService.addUsersToGroup(groupId, userIds);
    try {
        // Call the addUsersToGroup function from the service
        const updatedGroup = await addUsersToGroup(groupId, userIds);

        // Respond with the updated group
        res.status(200).json({
            message: 'Users added to group successfully',
            group: updatedGroup,
        });
    } catch (error) {
        // Handle errors (e.g., group or users not found)
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(400).json({
            message: message,
        });
    }
});

// Get all expenses for a group
router.get('/groups/:groupId/expenses', async (req, res) => {
    const groupId = req.params.groupId;
    // Logic to get all expenses for the group
    // e.g. await groupService.getExpensesForGroup(groupId);
    try {
        // Call the getExpensesForGroup function from the service
        const expenses = await getExpensesForGroup(groupId);

        // Respond with the list of expenses
        res.status(200).json(expenses);
    } catch (error) {
        // Handle errors (e.g., group not found)
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(400).json({
            message: message,
        });
    }
});

// Route to add or update an expense in a group
router.post('/groups/:groupId/expenses', async (req, res) => {
    const groupId = (req.params.groupId); // Get the group ID from the route params
    const expenseData = req.body; // Get the expense data from the request body

    try {
        // Call the addOrUpdateGroupExpense function from the service
        const groupExpense = await addOrUpdateGroupExpense(groupId, expenseData);

        // Respond with the saved group expense
        res.status(200).json({
            message: 'Group expense added/updated successfully',
            groupExpense: groupExpense,
        });
    } catch (error) {
        // Handle errors (e.g., group or user not found)
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(400).json({
            message: message,
        });
    }
});

export default router;
