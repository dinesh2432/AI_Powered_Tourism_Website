import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    preferredLanguage: user?.preferredLanguage || 'en',
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(user?.travelStats || {});
  const [myRequests, setMyRequests] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user?.profileImage || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setStats(data.user.travelStats);
      setForm({ name: data.user.name, preferredLanguage: data.user.preferredLanguage || 'en' });
      setPreviewUrl(data.user.profileImage || '');
    });
    api.get('/guides/my-sent-requests').then(({ data }) => setMyRequests(data.requests)).catch(() => {});
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setSaving(false);
    }
  };

  /* ── Profile image upload ── */
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5 MB');

    // Local preview immediately
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
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

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: 'var(--bg-primary)', fontFamily: "'Inter', 'Outfit', sans-serif" }}
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── Profile Header Card ── */}
        <div
          className="card"
          style={{ border: `1px solid rgba(var(--accent), 0.2)` }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">

            {/* Avatar with upload overlay */}
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
                ) : (
                  initials
                )}
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
                      title="Change photo"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      Edit
                    </button>
                    {previewUrl && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to remove your profile picture?')) {
                            setUploading(true);
                            try {
                              await api.delete('/auth/remove-avatar');
                              setPreviewUrl('');
                              updateUser({ ...user, profileImage: '' });
                              toast.success('Profile photo removed!');
                            } catch (err) {
                              toast.error('Failed to remove photo');
                            } finally {
                              setUploading(false);
                            }
                          }
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 text-[10px] font-bold py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors w-full cursor-pointer border border-transparent hover:border-red-500/20"
                        title="Remove photo"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1
                className="text-2xl font-black mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {user?.name}
              </h1>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                {user?.email}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {user?.isVerified && (
                  <span
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                  >
                    ✓ Verified
                  </span>
                )}
                {user?.isGuide && (
                  <span
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{
                      background: `rgba(var(--accent), 0.12)`,
                      color: `rgb(var(--accent))`,
                      border: `1px solid rgba(var(--accent), 0.25)`,
                    }}
                  >
                    👤 Local Guide
                  </span>
                )}
                {user?.isAdmin && (
                  <span
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)' }}
                  >
                    ⚙️ Admin
                  </span>
                )}
              </div>
              <p
                className="text-xs mt-2 italic"
                style={{ color: 'var(--text-muted)' }}
              >
                Hover the photo to upload a new one
              </p>
            </div>
          </div>
        </div>

        {/* ── Travel Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '✈️', label: 'Total Trips', value: stats.totalTrips || 0 },
            { icon: '🏙️', label: 'Cities Visited', value: stats.citiesVisited || 0 },
            { icon: '🌍', label: 'Countries', value: stats.countriesVisited || 0 },
            { icon: '📅', label: 'Travel Days', value: stats.totalDays || 0 },
          ].map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-extrabold gradient-text">{s.value}</div>
              <div
                className="text-sm mt-1"
                style={{ color: 'var(--text-secondary)' }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Edit Profile ── */}
        <div className="card">
          <h2
            className="text-xl font-bold mb-5"
            style={{ color: 'var(--text-primary)' }}
          >
            Edit Profile
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label
                className="text-sm font-medium mb-1.5 block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label
                className="text-sm font-medium mb-1.5 block"
                style={{ color: 'var(--text-secondary)' }}
              >
                Preferred Language (for chat translation)
              </label>
              <select
                className="input-field"
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
              >
                {[
                  ['en', 'English'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'],
                  ['ja', 'Japanese'], ['zh', 'Chinese'], ['ar', 'Arabic'], ['hi', 'Hindi'], ['pt', 'Portuguese'],
                ].map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* ── Guide Requests ── */}
        {myRequests.length > 0 && (
          <div className="card">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
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
                      <div
                        className="font-semibold text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {req.guideId?.userId?.name || 'Guide'}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        📍 {req.guideId?.city}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      req.status === 'accepted'
                        ? 'bg-green-500/20 text-green-500'
                        : req.status === 'rejected'
                        ? 'bg-red-500/20 text-red-500'
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
