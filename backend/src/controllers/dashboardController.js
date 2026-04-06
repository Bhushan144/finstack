import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { isDeleted: false };

  if (req.user.role !== 'ADMIN') {
    filter.userId = new mongoose.Types.ObjectId(String(req.user.id));
  }

  if (startDate && endDate) {
    filter.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // All 4 queries run in parallel — single DB round trip
  const [totals, byCategory, recent, trend] = await Promise.all([

    // Query 1: Total income and expense
    Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$type', total: { $sum: '$amount' } } }
    ]),

    // Query 2: Breakdown by category
    Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }
    ]),

    // Query 3: 5 most recent transactions
    Transaction.find(filter)
      .sort({ date: -1 })
      .limit(5)
      .select('type amount category date note'),

    // Query 4: Monthly trend grouped by year, month, type
    Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          type: '$_id.type',
          total: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ])

  ]);

  const income = totals.find(t => t._id === 'INCOME')?.total ?? 0;
  const expense = totals.find(t => t._id === 'EXPENSE')?.total ?? 0;

  sendSuccess(res, {
    summary: {
      income,
      expense,
      balance: income - expense
    },
    byCategory,
    recent,
    trend
  }, 'Dashboard data fetched successfully');
});