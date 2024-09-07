import express from 'express';
import { AppDataSource } from './config/ormconfig';
import expenseRoutes from './routes/expenseRoutes';
import groupRoutes from './routes/groupRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
app.use(express.json());

// Use the routers
app.use(userRoutes);
app.use(expenseRoutes);
app.use(groupRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
