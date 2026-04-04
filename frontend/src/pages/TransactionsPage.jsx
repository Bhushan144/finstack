// src/pages/TransactionsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import FilterBar         from '../components/transactions/FilterBar';
import TransactionTable  from '../components/transactions/TransactionTable';
import TransactionModal  from '../components/transactions/TransactionModal';

const TransactionsPage = () => {
  const { isAdmin, isAnalyst } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [filters, setFilters]           = useState({});
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]   = useState(null); // null = create, object = edit

  // ── Fetch transactions ───────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10, ...filters };
      const res = await api.get('/transactions', { params });
      setTransactions(res.data.data.data);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // ── Filter handler — reset to page 1 when filters change ────────────────────
  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  // ── Create ───────────────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    await api.post('/transactions', formData);
    fetchTransactions();
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEdit = (tx) => {
    setEditData(tx);
    setModalOpen(true);
  };

  const handleUpdate = async (formData) => {
    await api.put(`/transactions/${editData._id}`, formData);
    fetchTransactions();
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch {
      alert('Failed to delete transaction.');
    }
  };

  // ── Open modal for new transaction ───────────────────────────────────────────
  const openCreateModal = () => {
    setEditData(null);
    setModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Transactions</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {pagination ? `${pagination.total} records found` : ''}
          </p>
        </div>

        {/* Add button — only for Admin and Analyst */}
        {(isAdmin || isAnalyst) && (
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Add Transaction
          </button>
        )}
      </div>

      {/* Filters */}
      <FilterBar onFilter={handleFilter} />

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
        <TransactionTable
          transactions={transactions}
          pagination={pagination}
          onPageChange={setPage}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Create / Edit modal */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={editData ? handleUpdate : handleCreate}
        editData={editData}
      />

    </div>
  );
};

export default TransactionsPage;