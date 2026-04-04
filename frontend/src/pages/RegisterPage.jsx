// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate      = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear the error for that field as the user types
    setErrors({ ...errors, [e.target.name]: '' });
  };

  // Simple client-side validation before hitting the API
  const validate = () => {
    const newErrors = {};
    if (!form.name || form.name.length < 2)
      newErrors.name = 'Name must be at least 2 characters.';
    if (!form.email || !form.email.includes('@'))
      newErrors.email = 'Please enter a valid email.';
    if (!form.password || form.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      // Show success then redirect to login
      navigate('/login');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reusable input field to avoid repetition
  const InputField = ({ label, name, type = 'text', placeholder }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-zinc-400">{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`bg-zinc-800 border rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 transition-colors ${
          errors[name] ? 'border-rose-500' : 'border-zinc-700'
        }`}
      />
      {/* Inline field error */}
      {errors[name] && (
        <p className="text-xs text-rose-400">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-white">fin</span>
          <span className="text-3xl font-bold text-blue-500">Stack</span>
          <p className="text-zinc-400 text-sm mt-2">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">

          {/* API error */}
          {apiError && (
            <div className="mb-4 px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            <InputField
              label="Full Name"
              name="name"
              placeholder="John Doe"
            />
            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
            />

            {/* Role note */}
            <p className="text-xs text-zinc-500 -mt-2">
              New accounts are created as <span className="text-zinc-300">VIEWER</span> by default.
              An Admin can upgrade your role.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-1"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

          </form>

          {/* Switch to login */}
          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;