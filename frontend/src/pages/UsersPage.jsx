// src/pages/UsersPage.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/formatters';

const ROLES = ['ADMIN', 'ANALYST', 'VIEWER'];

const UsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // Track which user row is being edited
  const [editingId, setEditingId]   = useState(null);
  const [editForm, setEditForm]     = useState({ role: '', isActive: true });
  const [saving, setSaving]         = useState(false);

  // ── Fetch all users ──────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ── Start editing a row ──────────────────────────────────────────────────────
  const handleEditStart = (user) => {
    setEditingId(user._id);
    setEditForm({ role: user.role, isActive: user.isActive });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditForm({ role: '', isActive: true });
  };

  // ── Save updated role / status ───────────────────────────────────────────────
  const handleSave = async (userId) => {
    setSaving(true);
    try {
      await api.put(`/users/${userId}`, editForm);
      setEditingId(null);
      fetchUsers(); // refresh the list
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user.');
    } finally {
      setSaving(false);
    }
  };

  // ── Role badge color ─────────────────────────────────────────────────────────
  const roleBadge = (role) => {
    const styles = {
      ADMIN:   'bg-purple-500/15 text-purple-400',
      ANALYST: 'bg-blue-500/15 text-blue-400',
      VIEWER:  'bg-zinc-700 text-zinc-300',
    };
    return styles[role] || styles.VIEWER;
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div>
        <h1 className="text-lg font-semibold text-zinc-100">Manage Users</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Promote roles or deactivate accounts
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">

            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Name</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Role</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Joined</th>
                <th className="text-right px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => {
                const isCurrentUser = user._id === currentUser?.id;
                const isEditing     = editingId === user._id;

                return (
                  <tr
                    key={user._id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors last:border-0"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {/* Avatar circle with first letter */}
                        <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-zinc-200 font-medium">
                          {user.name}
                          {isCurrentUser && (
                            <span className="ml-1.5 text-xs text-zinc-500">(you)</span>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-zinc-400">{user.email}</td>

                    {/* Role — dropdown when editing, badge otherwise */}
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <select
                          value={editForm.role}
                          onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                          className="bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1 text-xs text-zinc-100 outline-none focus:border-blue-500"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* Status — toggle when editing, badge otherwise */}
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <select
                          value={editForm.isActive ? 'true' : 'false'}
                          onChange={(e) =>
                            setEditForm({ ...editForm, isActive: e.target.value === 'true' })
                          }
                          className="bg-zinc-800 border border-zinc-600 rounded-lg px-2 py-1 text-xs text-zinc-100 outline-none focus:border-blue-500"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      ) : (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          user.isActive
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>

                    {/* Joined date */}
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">
                      {formatDate(user.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      {/* Can't edit yourself */}
                      {isCurrentUser ? (
                        <span className="text-xs text-zinc-600">—</span>
                      ) : isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSave(user._id)}
                            disabled={saving}
                            className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1 rounded-lg transition-colors"
                          >
                            {saving ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleEditCancel}
                            className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditStart(user)}
                          className="text-xs text-zinc-400 hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-blue-500/10"
                        >
                          Edit
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
};

export default UsersPage;