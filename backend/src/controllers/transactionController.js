import Transaction from '../models/Transaction.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { logAction } from '../services/auditLogger.js';

export const create = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create({ ...req.body, userId: req.user.id });
  await logAction(req.user.id, 'CREATE', 'Transaction', transaction._id, null, transaction.toObject());
  sendSuccess(res, transaction, 'Transaction created successfully', 201);
});

export const getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, type, startDate, endDate } = req.query;

  const filter = { isDeleted: false };

  if (req.user.role !== 'ADMIN') filter.userId = req.user.id;
  if (category) {
    const categories = category.split(','); // ["Food", "Rent", "Transport"]

    filter.category = categories.length === 1
      ? categories[0]              // single → exact match
      : { $in: categories };       // multiple → match any
  }
  if (type) filter.type = type;
  if (startDate && endDate) {
    filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    Transaction.find(filter).sort({ date: -1 }).skip(skip).limit(Number(limit)),
    Transaction.countDocuments(filter)
  ]);

  sendSuccess(res, {
    data,
    pagination: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      limit: Number(limit)
    }
  }, 'Transactions retrieved successfully');
});

export const update = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id, isDeleted: false };
  if (req.user.role !== 'ADMIN') query.userId = req.user.id;

  const oldTransaction = await Transaction.findOne(query);
  if (!oldTransaction) return sendError(res, 'Transaction not found or unauthorized', 404);

  // FIX: Only allow safe fields to be updated — prevents overwriting userId, isDeleted, etc.
  const { type, amount, category, note, date } = req.body;
  const allowedUpdates = {
    ...(type && { type }),
    ...(amount && { amount }),
    ...(category && { category }),
    ...(note !== undefined && { note }),
    ...(date && { date })
  };

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    allowedUpdates,
    { new: true, runValidators: true }
  );

  await logAction(req.user.id, 'UPDATE', 'Transaction', oldTransaction._id, oldTransaction.toObject(), updatedTransaction.toObject());
  sendSuccess(res, updatedTransaction, 'Transaction updated successfully');
});

export const remove = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id, isDeleted: false };
  if (req.user.role !== 'ADMIN') query.userId = req.user.id;

  const transaction = await Transaction.findOne(query);
  if (!transaction) return sendError(res, 'Transaction not found or already deleted', 404);

  // FIX: Capture old state BEFORE mutation
  const oldState = transaction.toObject();

  transaction.isDeleted = true;
  await transaction.save();

  await logAction(req.user.id, 'DELETE', 'Transaction', transaction._id, oldState, { isDeleted: true });
  sendSuccess(res, null, 'Transaction deleted successfully');
});