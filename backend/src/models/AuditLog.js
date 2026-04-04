import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, enum: ['CREATE', 'UPDATE', 'DELETE'], required: true },
    entityName: { type: String, required: true }, // e.g., 'Transaction'
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    
    // Mixed types allow us to store flexible JSON snapshots of the data
    oldValues: { type: mongoose.Schema.Types.Mixed },
    newValues: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Indexes to quickly find all logs by a specific user or for a specific record
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ entityName: 1, entityId: 1 });

export default mongoose.model('AuditLog', auditLogSchema);