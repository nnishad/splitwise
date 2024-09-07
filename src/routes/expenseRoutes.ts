import { Router } from 'express';
import { createExpense, getExpenseById, getExpensesForUser } from '../services/expenseService';
const router = Router();

// Create a new individual or group expense
router.post('/expenses', async (req, res) => {
    const expenseData = req.body;
    // Logic to create an expense
    // e.g. await expenseService.createExpense(expenseData);
    try {
        // Call the service to create the expense
        const createdExpense = await createExpense(expenseData);

        // Respond with the created expense
        res.status(201).json({
            message: 'Expense created successfully',
            expense: createdExpense
        });
    } catch (error) {
        // Handle any errors
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(400).json({
            message: message,
        });
    }
});

// Get all expenses for a user
router.get('/users/:userId/expenses', async (req, res) => {
    const userId = req.params.userId;
    // Logic to get all expenses for the user
    // e.g. await expenseService.getExpensesForUser(userId);
    try {
        const expenses = await getExpensesForUser(userId);
        res.status(200).json(expenses);
    } catch (error) {
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(400).json({
            message: message,
        });
    }
});

// Get a specific expense by ID
router.get('/expenses/:expenseId', async (req, res) => {
    const expenseId = req.params.expenseId;
    // Logic to get expense by ID
    // e.g. await expenseService.getExpenseById(expenseId);
    try {
        const expense = await getExpenseById(expenseId);
        res.status(200).json(expense);
    } catch (error) {
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(400).json({
            message: message,
        });
    }
});

// Create or update splits for an expense (already part of creating an expense)
router.put('/expenses/:expenseId/splits', async (req, res) => {
    const expenseId = req.params.expenseId;
    const splitsData = req.body.splits;
    // Logic to update splits for the expense
    // e.g. await expenseService.updateExpenseSplits(expenseId, splitsData);
});

export default router;
