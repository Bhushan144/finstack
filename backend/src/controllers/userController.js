import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

const VALID_ROLES = ['ADMIN', 'ANALYST', 'VIEWER'];

export const getAllUsers = asyncHandler(async (req, res) => {
    // Fetch all users, but explicitly exclude the password field
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    sendSuccess(res, users, 'Users retrieved successfully');
});


export const updateUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role, isActive } = req.body;

    if (role && !VALID_ROLES.includes(role)) {
        return sendError(res, 'Invalid role specified', 400);
    }

    // Prevent Admins from downgrading or locking themselves out accidentally
    if (req.user.id === id) {
        return sendError(res, 'You cannot modify your own role or active status', 400);
    }

    const updateFields = {};
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const user = await User.findByIdAndUpdate(id, updateFields, { new: true }).select('-password');

    if (!user) return sendError(res, 'User not found', 404);

    sendSuccess(res, user, 'User updated successfully');
});