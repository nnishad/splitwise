import { User } from '../models/User';
import { AppDataSource } from '../config/ormconfig';

// Function to create a new user
export const createUser = async (userData: { name: string; email: string }) => {
    const userRepository = AppDataSource.getRepository(User);
    const { name, email } = userData;

    // Check if the user with the same email already exists
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
        throw new Error('User with this email already exists');
    }
    // Create a new user object
    const newUser = userRepository.create({
        name: name,
        email: email,
    });

    // Save the new user to the database
    const savedUser = await userRepository.save(newUser);
    
    return savedUser; // Return the newly created user
};

export const getAllUsers = async () => {
    const userRepository = AppDataSource.getRepository(User);

    // Retrieve all users from the database
    const users = await userRepository.find();

    return users; // Return the list of users
};

// Function to get a user by ID
export const getUserById = async (userId: string) => {
    const userRepository = AppDataSource.getRepository(User);

    // Find the user by ID
    const user = await userRepository.findOneBy({id: userId});

    // If the user is not found, throw an error
    if (!user) {
        throw new Error('User not found');
    }

    return user; // Return the found user
};