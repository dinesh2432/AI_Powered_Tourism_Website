import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ── Password strength helper ──────────────────────────────────────────────────
const getStrength = (pw) => {
  if (!pw) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { level: 0, label: '', color: '' },
    { level: 1, label: 'Weak', color: '#ef4444' },
    { level: 2, label: 'Fair', color: '#f59e0b' },
    { level: 3, label: 'Good', color: '#3b82f6' },
    { level: 4, label: 'Strong 💪', color: '#10b981' },
  ];
  return levels[score] || levels[0];
};

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  // ── Profile form state ─────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: user?.name || '',
    preferredLanguage: user?.preferredLanguage || 'en',
  });
  const [initialForm, setInitialForm] = useState({ ...form });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Password form state ────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  // ── Other state ────────────────────────────────────────────────────────────
  const [stats, setStats] = useState(user?.travelStats || {});
  const [myRequests, setMyRequests] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage || '');
  const fileInputRef = useRef(null);

  const isGoogleUser = user?.authProvider === 'google';
  const isDirty = form.name !== initialForm.name || form.preferredLanguage !== initialForm.preferredLanguage;
  const strength = getStrength(pwForm.newPassword);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      const u = data.user;
      setStats(u.travelStats);
      const loaded = { name: u.name, preferredLanguage: u.preferredLanguage || 'en' };
      setForm(loaded);
      setInitialForm(loaded);
      setPreviewUrl(u.profileImage || '');
    });
    api.get('/guides/my-sent-requests').then(({ data }) => setMyRequests(data.requests)).catch(() => {});
  }, []);

  // ── Profile save ───────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      setInitialForm({ ...form });
      setIsEditing(false);
      toast.success('Profile updated! ✅');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({ ...initialForm });
    setIsEditing(false);
  };

  // ── Password change ────────────────────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirm) {
      return toast.error('Please fill all password fields');
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      return toast.error('New passwords do not match');
    }
    if (pwForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    setPwLoading(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success(data.message || 'Password changed! 🔒');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5 MB');
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreviewUrl(data.profileImage);
      updateUser({ ...user, profileImage: data.profileImage });
      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setPreviewUrl(user?.profileImage || '');
    } finally {
      setUploading(false);
    }
  };

  const initials = user?.name?.charAt(0).toUpperCase() || '?';
  const togglePw = (field) => setShowPasswords((p) => ({ ...p, [field]: !p[field] }));

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: 'var(--bg-primary)', fontFamily: "'Inter', 'Outfit', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Profile Header ── */}
        <div className="card" style={{ border: `1px solid rgba(var(--accent), 0.2)` }}>
          <div className="flex flex-col sm:flex-row items-center gap-6">

            {/* Avatar */}
            <div className="relative shrink-0 group">
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center text-3xl font-black text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, rgb(var(--accent)), #818cf8)` }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewUrl('')}
                  />
                ) : initials}
              </div>

              {/* Upload overlay */}
              <div
                className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'rgba(0,0,0,0.65)' }}
              >
                {uploading ? (
                  <svg className="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <div className="flex flex-col gap-2 w-full px-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-white text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-white/20 transition-colors w-full cursor-pointer border border-transparent hover:border-white/10"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Edit
                    </button>
                    {previewUrl && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Remove your profile picture?')) {
                            setUploading(true);
                            try {
                              await api.delete('/auth/remove-avatar');
                              setPreviewUrl('');
                              updateUser({ ...user, profileImage: '' });
                              toast.success('Photo removed');
                            } catch {
                              toast.error('Failed to remove photo');
                            } finally {
                              setUploading(false);
                            }
                          }
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors w-full cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>{user?.name}</h1>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {user?.isVerified && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                    ✓ Verified
                  </span>
                )}
                {user?.isGuide && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: `rgba(var(--accent), 0.12)`, color: `rgb(var(--accent))`, border: `1px solid rgba(var(--accent), 0.25)` }}>
                    👤 Local Guide
                  </span>
                )}
                {user?.isAdmin && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}>
                    ⚙️ Admin
                  </span>
                )}
              </div>
              <p className="text-xs mt-2 italic" style={{ color: 'var(--text-muted)' }}>
                Hover the photo to upload a new one
              </p>
            </div>
          </div>
        </div>

        {/* ── Travel Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '✈️', label: 'Total Trips',    value: stats.totalTrips || 0 },
            { icon: '🏙️', label: 'Cities Visited', value: stats.citiesVisited || 0 },
            { icon: '🌍', label: 'Countries',       value: stats.countriesVisited || 0 },
            { icon: '📅', label: 'Travel Days',     value: stats.totalDays || 0 },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-extrabold gradient-text">{s.value}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Edit Profile Card ── */}
        <div className="card">
          {/* Card header with Edit / Save buttons — FIX 2 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Edit Profile
            </h2>
            <div className="flex gap-3">
              {/* Edit Profile button */}
              <button
                id="edit-profile-btn"
                type="button"
                onClick={() => setIsEditing(true)}
                disabled={isEditing}
                className="h-9 px-5 text-xs font-bold rounded-xl transition-all"
                style={{
                  background: isEditing ? 'var(--bg-hover)' : 'rgba(var(--accent), 0.12)',
                  color: isEditing ? 'var(--text-muted)' : 'rgb(var(--accent))',
                  border: `1px solid ${isEditing ? 'var(--border)' : 'rgba(var(--accent), 0.3)'}`,
                  cursor: isEditing ? 'default' : 'pointer',
                }}
              >
                ✏️ Edit Profile
              </button>

              {/* Save Changes button */}
              <button
                id="save-profile-btn"
                form="profile-form"
                type="submit"
                disabled={!isEditing || !isDirty || saving}
                className="h-9 px-5 text-xs font-bold rounded-xl transition-all"
                style={{
                  background: isEditing && isDirty ? 'rgb(var(--accent))' : 'var(--bg-hover)',
                  color: isEditing && isDirty ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${isEditing && isDirty ? 'rgb(var(--accent))' : 'var(--border)'}`,
                  cursor: isEditing && isDirty ? 'pointer' : 'not-allowed',
                  opacity: isEditing && isDirty ? 1 : 0.5,
                }}
              >
                {saving ? '⏳ Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </div>

          <form id="profile-form" onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Full Name
              </label>
              <input
                type="text"
                id="profile-name-input"
                className="input-field"
                value={form.name}
                disabled={!isEditing}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ opacity: isEditing ? 1 : 0.7, cursor: isEditing ? 'text' : 'default' }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                Preferred Language (for chat translation)
              </label>
              <select
                className="input-field"
                id="profile-language-select"
                value={form.preferredLanguage}
                disabled={!isEditing}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                style={{ opacity: isEditing ? 1 : 0.7, cursor: isEditing ? 'pointer' : 'default' }}
              >
                {[
                  ['en', 'English'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'],
                  ['ja', 'Japanese'], ['zh', 'Chinese'], ['ar', 'Arabic'], ['hi', 'Hindi'], ['pt', 'Portuguese'],
                ].map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>

            {/* Cancel button shown only while editing */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-xs font-medium mt-1"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    ↩ Cancel changes
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* ── Change Password Card — FIX 1 ── */}
        <div className="card">
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            🔒 Change Password
          </h2>

          {isGoogleUser ? (
            <div
              className="px-4 py-3 rounded-xl text-sm"
              style={{ background: 'rgba(var(--accent), 0.06)', border: '1px solid rgba(var(--accent), 0.2)', color: 'var(--text-secondary)' }}
            >
              You signed in with <strong style={{ color: 'var(--text-primary)' }}>Google</strong>. Password management is handled by Google — no manual password is set for your account.
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4 mt-5">
              {/* Current password */}
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password-input"
                    type={showPasswords.current ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Your current password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePw('current')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPasswords.current ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password-input"
                    type={showPasswords.new ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="At least 6 characters"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePw('new')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPasswords.new ? '🙈' : '👁'}
                  </button>
                </div>

                {/* Password strength meter */}
                {pwForm.newPassword && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 space-y-1"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((lvl) => (
                        <div
                          key={lvl}
                          className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            background: strength.level >= lvl ? strength.color : 'var(--border)',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</p>
                  </motion.div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password-input"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Repeat new password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePw('confirm')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lg"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPasswords.confirm ? '🙈' : '👁'}
                  </button>
                </div>

                {/* Match indicator */}
                {pwForm.confirm && (
                  <p className="text-xs mt-1 font-semibold" style={{ color: pwForm.newPassword === pwForm.confirm ? '#10b981' : '#ef4444' }}>
                    {pwForm.newPassword === pwForm.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                id="change-password-submit"
                type="submit"
                disabled={pwLoading || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirm}
                className="btn-primary h-12 text-sm w-full disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pwLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Updating Password…
                  </span>
                ) : '🔒 Update Password'}
              </button>
            </form>
          )}
        </div>

        {/* ── Guide Requests ── */}
        {myRequests.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              My Guide Requests
            </h2>
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between rounded-xl p-4"
                  style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                      style={{ background: `linear-gradient(135deg, rgb(var(--accent)), #818cf8)` }}
                    >
                      {req.guideId?.userId?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                        {req.guideId?.userId?.name || 'Guide'}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        📍 {req.guideId?.city}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'accepted' ? 'bg-green-500/20 text-green-500'
                        : req.status === 'rejected' ? 'bg-red-500/20 text-red-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
