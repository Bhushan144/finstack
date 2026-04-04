import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  // Build the base filter
  const filter = { isDeleted: false };

  // Admins see all data, others see only their own
  if (req.user.role !== 'ADMIN') {
    filter.userId = new mongoose.Types.ObjectId(String(req.user.id));
  }

  // Apply date range if provided
  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // Run all 3 queries in parallel
  const [totals, byCategory, recent] = await Promise.all([

    // Query 1: Get total income and total expense
    Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]),

    // Query 2: Get spending breakdown by category
    Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]),

    // Query 3: Get 5 most recent transactions
    Transaction.find(filter)
      .sort({ date: -1 })
      .limit(5)
      .select('type amount category date note')

  ]);

  // Calculate summary numbers
  const income  = totals.find(t => t._id === 'INCOME')?.total  ?? 0;
  const expense = totals.find(t => t._id === 'EXPENSE')?.total ?? 0;

  sendSuccess(res, {
    summary: {
      income,
      expense,
      balance: income - expense
    },
    byCategory,
    recent
  }, 'Dashboard data fetched successfully');
});