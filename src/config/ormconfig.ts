import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Group } from '../models/Group';
import { Expense } from '../models/Expense';
import { ExpenseSplit } from '../models/ExpenseSplit';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'splitwise',
  entities: [User, Group, Expense, ExpenseSplit],
  synchronize: true,
  logging: false,
});
