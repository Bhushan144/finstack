// src/utils/formatters.js

// Format a number as currency  e.g. 5000 → ₹5,000
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style:    'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format a date string  e.g. "2024-03-15" → "Mar 15, 2024"
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year:  'numeric',
    month: 'short',
    day:   'numeric',
  });
};