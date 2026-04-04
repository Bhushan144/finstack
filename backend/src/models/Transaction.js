import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, required: true, trim: true },
    note: { type: String, trim: true },
    date: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false } // We use this explicitly in queries, NOT via hooks
  },
  { timestamps: true }
);

// Performance Indexes (Crucial for the Phase 5 Dashboard Aggregations)
transactionSchema.index({ userId: 1 });
transactionSchema.index({ date: -1 });
transactionSchema.index({ category: 1 });
transactionSchema.index({ isDeleted: 1 });

// Compound Index: Optimizes queries that filter by user, ensure it's not deleted, and sort by date
transactionSchema.index({ userId: 1, isDeleted: 1, date: -1 }); 

export default mongoose.model('Transaction', transactionSchema);