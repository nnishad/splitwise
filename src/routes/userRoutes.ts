import { Router } from 'express';
const router = Router();
import { createUser, getAllUsers, getUserById } from '../services/userService';

// Create a new user
router.post('/users', async (req, res) => {
    // Logic to create user
    // e.g. await userService.createUser(req.body);
    try {
        // Call the createUser function from the service
        const newUser = await createUser(req.body);

        // Respond with the created user
        res.status(201).json({
            message: 'User created successfully',
            user: newUser,
        });
    } catch (error) {
        // Assert error as an instance of Error to access message property
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(400).json({
            message: message,
        });
    }
});

// Get all users
router.get('/users', async (req, res) => {
    // Logic to get all users
    // e.g. await userService.getAllUsers();
    try {
        // Call the getAllUsers function from the service
        const users = await getAllUsers();

        // Respond with the list of users
        res.status(200).json(users);
    } catch (error) {
         // Assert error as an instance of Error to access message property
         const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
         res.status(400).json({
             message: message,
         });
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    const userId = req.params.id;
    // Logic to get user by ID
    // e.g. await userService.getUserById(userId);

    try {
        // Call the getUserById function from the service
        const user = await getUserById(userId);

        // Respond with the found user
        res.status(200).json(user);
    } catch (error) {
        // Handle errors (e.g., user not found)
        const message = (error instanceof Error) ? error.message : 'An unknown error occurred';
         res.status(400).json({
             message: message,
         });
    }
});

export default router;
