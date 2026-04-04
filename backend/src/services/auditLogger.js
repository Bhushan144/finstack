import AuditLog from '../models/AuditLog.js';

// Define fields that should never be written to the plain-text audit logs
const SENSITIVE_FIELDS = ['password', 'refreshToken'];

const sanitize = (obj) => {
  if (!obj) return obj;
  // Deep copy to safely mutate without affecting the original Mongoose document
  const copy = JSON.parse(JSON.stringify(obj)); 
  
  SENSITIVE_FIELDS.forEach(field => {
    if (copy[field]) delete copy[field];
  });
  
  return copy;
};

export const logAction = async (userId, action, entityName, entityId, oldValues, newValues) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entityName,
      entityId,
      oldValues: sanitize(oldValues),
      newValues: sanitize(newValues)
    });
  } catch (error) {
    // We log the error but DO NOT throw. Audit log failures should not crash the main transaction flow.
    console.error('🔥 Audit Log Failed:', error.message);
  }
};