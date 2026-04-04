import mongoose from 'mongoose';
import env from './config/env.js';
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import AuditLog from './models/AuditLog.js';

const seedDatabase = async () => {
  try {
    // 1. Connect to Database — matches db.js connection pattern
    await mongoose.connect(`${env.MONGO_URI}/${env.DB_NAME}`);
    console.log('Connected to MongoDB for seeding...');

    // 2. Wipe existing data to prevent duplicate key errors on multiple runs
    await User.deleteMany();
    await Transaction.deleteMany();
    await AuditLog.deleteMany();
    console.log(' Cleared existing database records.');

    // 3. Create Users individually to ensure the bcrypt pre('save') hook fires
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@finstack.com',
      password: 'Password@123',
      role: 'ADMIN'
    });

    const analyst = await User.create({
      name: 'Data Analyst',
      email: 'analyst@finstack.com',
      password: 'Password@123',
      role: 'ANALYST'
    });

    const viewer = await User.create({
      name: 'Guest Viewer',
      email: 'viewer@finstack.com',
      password: 'Password@123',
      role: 'VIEWER'
    });

    console.log(' Created Admin, Analyst, and Viewer accounts.');

    // 4. Categories strictly mapped to correct transaction type
    const CATEGORIES = {
      INCOME:  ['Salary', 'Freelance', 'Investments', 'Dividends'],
      EXPENSE: ['Food', 'Rent', 'Transport', 'Entertainment', 'Healthcare', 'Software Subscriptions']
    };

    // 5. Generate 50 realistic transactions over the last 180 days
    const users = [admin._id, analyst._id, viewer._id];
    const transactions = [];

    for (let i = 0; i < 50; i++) {
      const type = Math.random() > 0.3 ? 'EXPENSE' : 'INCOME';

      const categoryArray = CATEGORIES[type];
      const category = categoryArray[Math.floor(Math.random() * categoryArray.length)];

      const amount = type === 'INCOME'
        ? Math.floor(Math.random() * 4000) + 1000  // 1000 - 5000
        : Math.floor(Math.random() * 300)  + 10;   // 10 - 310

      const daysAgo = Math.floor(Math.random() * 180);
      const date    = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      transactions.push({
        userId: users[i % 3],
        type,
        amount,
        category,
        date,
        note: `Auto-generated ${category} record`
      });
    }

    // 6. Bulk insert transactions
    await Transaction.insertMany(transactions);
    console.log('Successfully seeded 50 financial transactions.');

    // 7. Graceful exit
    console.log('\n SEED COMPLETE. You can now log in with:');
    console.log('--------------------------------------------------');
    console.log('Admin:   admin@finstack.com   | Pass: Password@123');
    console.log('Analyst: analyst@finstack.com | Pass: Password@123');
    console.log('Viewer:  viewer@finstack.com  | Pass: Password@123');
    console.log('--------------------------------------------------\n');

    process.exit(0);

  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();