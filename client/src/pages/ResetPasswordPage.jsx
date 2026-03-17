import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: form.password });
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed or link expired');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="card">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔑</div>
            <h1 className="text-2xl font-bold text-white">Reset Password</h1>
            <p className="text-slate-400 mt-1">Enter your new password below</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">New Password</label>
              <input type="password" required className="input-field" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Confirm Password</label>
              <input type="password" required className="input-field" placeholder="••••••••"
                value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
