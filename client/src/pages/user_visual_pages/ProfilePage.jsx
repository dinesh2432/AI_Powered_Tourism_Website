import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', preferredLanguage: user?.preferredLanguage || 'en' });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(user?.travelStats || {});
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => {
      setStats(data.user.travelStats);
      setForm({ name: data.user.name, preferredLanguage: data.user.preferredLanguage || 'en' });
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

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="card bg-gradient-to-br from-primary-900/40 to-purple-900/40 border-primary-500/20">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
              <p className="text-slate-400">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                {user?.isVerified && <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">✓ Verified</span>}
                {user?.isGuide && <span className="bg-primary-500/20 text-primary-400 text-xs px-2 py-1 rounded-full">👤 Local Guide</span>}
                {user?.isAdmin && <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-full">⚙️ Admin</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Travel Stats */}
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
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Edit Profile */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-5">Edit Profile</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Full Name</label>
              <input type="text" className="input-field" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1.5 block">Preferred Language (for chat translation)</label>
              <select className="input-field" value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}>
                {[
                  ['en', 'English'], ['es', 'Spanish'], ['fr', 'French'], ['de', 'German'],
                  ['ja', 'Japanese'], ['zh', 'Chinese'], ['ar', 'Arabic'], ['hi', 'Hindi'], ['pt', 'Portuguese'],
                ].map(([code, label]) => (
                  <option key={code} value={code} className="bg-slate-800">{label}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Guide Requests sent */}
        {myRequests.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4">My Guide Requests</h2>
            <div className="space-y-3">
              {myRequests.map((req) => (
                <div key={req._id} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                      {req.guideId?.userId?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="text-white font-medium">{req.guideId?.userId?.name || 'Guide'}</div>
                      <div className="text-slate-400 text-sm">📍 {req.guideId?.city}</div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    req.status === 'accepted' ? 'bg-green-500/20 text-green-400' :
                    req.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
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
