import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['ADMIN', 'ANALYST', 'VIEWER'], default: 'VIEWER' },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String , default: null}
  },
  { timestamps: true }
);

// Mongoose Pre-Save Hook: Automatically hash the password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  // Hash with a salt round of 12 (industry standard)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance Method: Safely compare an incoming password guess with the hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);