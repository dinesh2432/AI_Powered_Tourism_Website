import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';

const AdminDashboardPage = () => {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoForm, setVideoForm] = useState({ title: '', description: '', destination: '', tags: '', file: null });
  const [uploading, setUploading] = useState(false);
  const [changingPlan, setChangingPlan] = useState(null);

  const [modal, setModal] = useState({ isOpen: false, type: 'info', title: '', content: '', onConfirm: null, loading: false });
  const closeModal = () => setModal({ ...modal, isOpen: false });

  useEffect(() => {
    if (activeTab === 'analytics') {
      api.get('/admin/analytics').then(({ data }) => setAnalytics(data)).catch(() => toast.error('Failed to load analytics'));
    } else if (activeTab === 'users' || activeTab === 'subscriptions') {
      setLoading(true);
      api.get('/admin/users').then(({ data }) => setUsers(data.users)).catch(() => {}).finally(() => setLoading(false));
    } else if (activeTab === 'applications') {
      setLoading(true);
      api.get('/admin/applications').then(({ data }) => setApplications(data.applications)).catch(() => {}).finally(() => setLoading(false));
    } else if (activeTab === 'videos') {
      setLoading(true);
      api.get('/explore').then(({ data }) => setVideos(data.videos)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [activeTab]);

  const handleApproveApp = (id) => {
    setModal({
      isOpen: true, type: 'success', title: 'Approve Guide Application',
      content: 'Approve this candidate as a verified local guide?',
      confirmText: 'Approve',
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          await api.put(`/admin/applications/${id}/approve`);
          toast.success('Guide application approved!');
          setApplications(prev => prev.filter(a => a._id !== id));
          closeModal();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to approve application');
        } finally { setModal(prev => ({ ...prev, loading: false })); }
      }
    });
  };

  const handleRejectApp = (id) => {
    setModal({
      isOpen: true, type: 'danger', title: 'Reject Application',
      content: 'Reject this guide application? This cannot be undone.',
      confirmText: 'Reject',
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          await api.put(`/admin/applications/${id}/reject`);
          toast.success('Application rejected');
          setApplications(prev => prev.filter(a => a._id !== id));
          closeModal();
        } catch { toast.error('Failed to reject application'); }
        finally { setModal(prev => ({ ...prev, loading: false })); }
      }
    });
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoForm.file) return toast.error('Please select a video file to upload.');
    setUploading(true);
    const formData = new FormData();
    formData.append('video', videoForm.file);
    formData.append('title', videoForm.title);
    formData.append('description', videoForm.description);
    formData.append('destination', videoForm.destination);
    formData.append('tags', videoForm.tags);
    try {
      await api.post('/admin/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Video uploaded successfully!');
      setVideoForm({ title: '', description: '', destination: '', tags: '', file: null });
      api.get('/explore').then(({ data }) => setVideos(data.videos));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Video upload failed. Please try again.');
    } finally { setUploading(false); }
  };

  const handleDeleteVideo = (id) => {
    setModal({
      isOpen: true, type: 'danger', title: 'Delete Video',
      content: 'Permanently delete this video? This action cannot be undone.',
      confirmText: 'Delete',
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          await api.delete(`/admin/videos/${id}`);
          toast.success('Video deleted');
          setVideos(prev => prev.filter(v => v._id !== id));
          closeModal();
        } catch { toast.error('Failed to delete video'); }
        finally { setModal(prev => ({ ...prev, loading: false })); }
      }
    });
  };

  const handleChangePlan = async (userId, newPlan) => {
    setChangingPlan(userId);
    try {
      const { data } = await api.patch(`/admin/users/${userId}/subscription`, { subscription: newPlan });
      toast.success(`Plan updated to ${newPlan} ✓`);
      setUsers(prev => prev.map(u => u._id === userId
        ? { ...u, subscription: newPlan, subscriptionEndDate: data.user?.subscriptionEndDate, monthlyTripCount: 0 }
        : u
      ));
      // Refresh current logged-in user from server so features unlock immediately
      await refreshUser();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Plan update failed');
    } finally { setChangingPlan(null); }
  };

  const tabs = ['analytics', 'users', 'applications', 'videos', 'subscriptions'];

  const planStyles = {
    FREE: { color: 'var(--text-secondary)', background: 'var(--bg-hover)', border: '1px solid var(--border)' },
    PRO: { color: 'rgb(var(--accent))', background: 'rgba(var(--accent), 0.1)', border: '1px solid rgba(var(--accent), 0.3)' },
    PREMIUM: { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' },
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm}
        loading={modal.loading}
      >
        <div style={{ color: 'var(--text-secondary)' }}>{modal.content}</div>
      </Modal>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-24 pt-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black leading-tight" style={{ color: 'var(--text-primary)' }}>
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Manage users, guides, content, and subscriptions</p>
          </motion.div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex gap-2 overflow-x-auto pb-6 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap capitalize transition-all ${
                activeTab === tab ? 'tab-btn-active' : 'tab-btn'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Command Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Analytics View */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {Object.entries(analytics.stats).map(([key, value], idx) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="card p-8 group hover:border-primary-500/30 transition-all duration-500"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center justify-between" style={{ color: 'var(--text-secondary)' }}>
                      <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="w-2 h-2 rounded-full transition-colors" style={{ background: 'rgba(var(--accent), 0.2)' }} />
                    </div>
                    <div className="text-4xl font-display font-black italic tracking-tighter leading-none group-hover:scale-110 transition-transform origin-left" style={{ color: 'var(--text-primary)' }}>
                      {value}
                    </div>
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                        <div className="w-[70%] h-full animate-pulse" style={{ background: 'rgb(var(--accent))' }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="card p-10">
                  <h3 className="text-2xl font-display font-black tracking-tighter uppercase italic mb-8 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <span className="p-2 rounded-xl" style={{ background: 'rgba(var(--accent), 0.1)', color: 'rgb(var(--accent))' }}>👤</span>
                    User Registry
                  </h3>
                  <div className="space-y-6">
                    {analytics.recentUsers?.map((u, i) => (
                      <motion.div
                        key={u._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-5 p-4 rounded-2xl transition-all group border border-transparent"
                        style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)' }}
                      >
                        <div className="w-12 h-12 rounded-[14px] p-[1px] group-hover:rotate-6 transition-all" style={{ background: 'linear-gradient(to bottom right, rgb(var(--accent)), #8b5cf6)' }}>
                          <div className="w-full h-full rounded-[13px] flex items-center justify-center font-black" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{u.name?.charAt(0)}</div>
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-xs uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                          <div className="text-[10px] font-bold uppercase tracking-tight mt-0.5" style={{ color: 'var(--text-secondary)' }}>{u.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Entry Date</div>
                          <div className="font-black text-[10px] mt-0.5" style={{ color: 'var(--text-primary)' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="card p-10">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span>✈️</span>
                    Recent Trips
                  </h3>
                  <div className="space-y-6">
                    {analytics.recentTrips?.map((t, i) => (
                      <motion.div
                        key={t._id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-5 p-4 rounded-2xl transition-all group border border-transparent"
                        style={{ background: 'var(--bg-hover)', borderColor: 'var(--border)' }}
                      >
                        <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🗺️</div>
                        <div className="flex-1">
                          <div className="font-black text-xs uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{t.destination}</div>
                          <div className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>From: {t.source}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Timestamp</div>
                          <div className="font-black text-[10px] mt-0.5" style={{ color: 'var(--text-primary)' }}>{new Date(t.startDate).toLocaleDateString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Operations View */}
          {activeTab === 'users' && (
            <div className="card overflow-hidden !p-0">
              <div className="p-10 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic" style={{ color: 'var(--text-primary)' }}>User Management</h2>
                <div className="text-white font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest" style={{ background: 'rgb(var(--accent))' }}>
                  {users.length} Database entries
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                      <th className="px-10 py-6 text-left">Name</th>
                      <th className="px-6 py-6 text-left">Email ID</th>
                      <th className="px-6 py-6 text-left">Role</th>
                      <th className="px-6 py-6 text-left">Trip Count</th>
                      <th className="px-10 py-6 text-right">Signup Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {users.map((u) => (
                      <tr key={u._id} className="transition-colors group hover:bg-black/5 dark:hover:bg-white/5">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm group-hover:rotate-12 transition-all" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{u.name?.charAt(0)}</div>
                            <div className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-[10px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td className="px-6 py-6">
                          <div className="flex gap-2">
                            {u.isAdmin && <span className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.2)' }}>Admin</span>}
                            {u.isGuide && <span className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest" style={{ background: 'rgba(var(--accent), 0.1)', color: 'rgb(var(--accent))', borderColor: 'rgba(var(--accent), 0.2)' }}>Guide</span>}
                            {u.isVerified && <span className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>Verified</span>}
                          </div>
                        </td>
                        <td className="px-6 py-6 font-black text-xs italic" style={{ color: 'var(--text-primary)' }}>{u.travelStats?.totalTrips || 0}</td>
                        <td className="px-10 py-6 text-right text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Queue Management View */}
          {activeTab === 'applications' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic" style={{ color: 'var(--text-primary)' }}>Application Queue</h2>
                <div className="card px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-secondary)' }}>
                  Pending: {applications.length}
                </div>
              </div>
              {applications.length === 0 ? (
                <div className="card rounded-[48px] p-24 text-center">
                  <div className="text-6xl mb-6 grayscale opacity-20">📭</div>
                  <h3 className="text-2xl font-display font-black tracking-tighter uppercase italic mb-2" style={{ color: 'var(--text-primary)' }}>Empty Queue</h3>
                  <p className="font-black text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>No pending applications</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {applications.map((app) => (
                    <motion.div
                      key={app._id}
                      layout
                      className="card rounded-[40px] p-10 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" style={{ background: 'rgba(var(--accent), 0.05)' }} />
                      <div className="relative z-10">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                          <div className="flex flex-col md:flex-row md:items-center gap-10">
                            <div className="w-24 h-24 rounded-[32px] p-[2px]" style={{ background: 'linear-gradient(to bottom right, rgb(var(--accent)), #8b5cf6)', boxShadow: '0 0 20px rgba(var(--accent), 0.2)' }}>
                              <div className="w-full h-full rounded-[30px] flex items-center justify-center font-black text-3xl" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{app.userId?.name?.charAt(0)}</div>
                            </div>
                            <div>
                              <h3 className="text-3xl font-display font-black tracking-tighter uppercase italic mb-2" style={{ color: 'var(--text-primary)' }}>{app.userId?.name}</h3>
                              <div className="flex flex-wrap gap-3 mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>📍 {app.city}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', borderColor: 'var(--border)' }}>Exp: {app.experience} Yrs</span>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {app.languages?.map((l) => (
                                  <span key={l} className="border text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest" style={{ background: 'rgba(var(--accent), 0.1)', color: 'rgb(var(--accent))', borderColor: 'rgba(var(--accent), 0.2)' }}>{l}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 xl:shrink-0">
                            <button onClick={() => handleApproveApp(app._id)} className="btn-primary h-16 px-10 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] transition-all duration-500">
                              Confirm Protocol
                            </button>
                            <button onClick={() => handleRejectApp(app._id)} className="btn-secondary h-16 px-10 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all duration-500">
                              Decline
                            </button>
                          </div>
                        </div>
                        <div className="mt-10 pt-10 border-t" style={{ borderColor: 'var(--border)' }}>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-4 italic opacity-70" style={{ color: 'var(--text-secondary)' }}>Candidate Personnel Manifest</p>
                          <p className="text-sm font-medium leading-relaxed max-w-4xl italic" style={{ color: 'var(--text-primary)' }}>"{app.description}"</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Media Operations View */}
          {activeTab === 'videos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <div className="card rounded-[40px] p-8 md:p-10 sticky top-12">
                  <h2 className="text-2xl font-display font-black tracking-tighter uppercase italic mb-8 flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
                    <span className="p-2 rounded-xl text-white text-sm" style={{ background: 'rgb(var(--accent))', boxShadow: '0 0 15px rgba(var(--accent), 0.3)' }}>🎬</span>
                    VIDEO UPLOAD HERE
                  </h2>
                  <form onSubmit={handleVideoUpload} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-4" style={{ color: 'var(--text-secondary)' }}>VIDEO Title</label>
                      <input required className="input-field h-14 rounded-2xl px-6 font-bold" placeholder="Enter video name..." value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-4" style={{ color: 'var(--text-secondary)' }}>Location Name</label>
                      <input className="input-field h-14 rounded-2xl px-6 font-bold" placeholder="e.g. Mumbai, Paris..." value={videoForm.destination} onChange={(e) => setVideoForm({ ...videoForm, destination: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-4" style={{ color: 'var(--text-secondary)' }}>Tags</label>
                      <input className="input-field h-14 rounded-2xl px-6 font-bold" placeholder="adventure, funny, trekking.." value={videoForm.tags} onChange={(e) => setVideoForm({ ...videoForm, tags: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-4" style={{ color: 'var(--text-secondary)' }}>Video Upload</label>
                      <div className="relative h-32 rounded-2xl group transition-all cursor-pointer overflow-hidden" style={{ border: '1px dashed var(--border)', background: 'var(--bg-hover)' }}>
                        <input required type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setVideoForm({ ...videoForm, file: e.target.files[0] })} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
                          <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📁</span>
                          <span className="text-[9px] font-black uppercase tracking-widest">{videoForm.file ? videoForm.file.name : 'Select Data File'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest ml-4" style={{ color: 'var(--text-secondary)' }}>Brief Description</label>
                      <textarea className="input-field h-32 rounded-2xl p-6 font-medium resize-none" placeholder="Contextual data..." value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} />
                    </div>
                    <button type="submit" disabled={uploading} className="btn-primary w-full h-16 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-50">
                      {uploading ? 'SYNCHRONIZING...' : '🚀 INITIATE UPLOAD'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {videos.map((video) => (
                    <motion.div key={video._id} whileHover={{ y: -10 }} className="card !p-0 rounded-[40px] overflow-hidden group shadow-xl hover:shadow-2xl">
                      <div className="relative h-56 overflow-hidden bg-black/10 dark:bg-black/50">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🎬</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-6 left-6">
                          <span className="backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10" style={{ background: 'rgba(0,0,0,0.6)' }}>{video.destination || 'GLOBAL'}</span>
                        </div>
                        <button onClick={() => handleDeleteVideo(video._id)} className="absolute top-6 right-6 w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center backdrop-blur-md border border-red-500/20 transition-all">🗑️</button>
                      </div>
                      <div className="p-8">
                        <h3 className="text-xl font-display font-black tracking-tighter uppercase italic mb-2 line-clamp-1" style={{ color: 'var(--text-primary)' }}>{video.title}</h3>
                        <div className="flex items-center justify-between mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Active Feed</span>
                          </div>
                          <div className="text-right">
                            <div className="font-black text-xs italic" style={{ color: 'var(--text-primary)' }}>{video.views} VIEWS</div>
                            <div className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{new Date(video.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subscription Management View */}
          {activeTab === 'subscriptions' && (
            <div className="card overflow-hidden !p-0">
              <div className="p-10 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic" style={{ color: 'var(--text-primary)' }}>Subscription Control</h2>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-2" style={{ color: 'var(--text-secondary)' }}>Manually assign plans to any user — no payment required</p>
                </div>
                <div className="text-white font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest" style={{ background: 'rgb(var(--accent))' }}>
                  {users.length} Users
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}>
                      <th className="px-10 py-6 text-left">User</th>
                      <th className="px-6 py-6 text-left">Email</th>
                      <th className="px-6 py-6 text-left">Plan</th>
                      <th className="px-6 py-6 text-left">Trips / Month</th>
                      <th className="px-6 py-6 text-left">Expires</th>
                      <th className="px-10 py-6 text-right">Change Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {users.map((u) => {
                      const plan = u.subscription || 'FREE';
                      return (
                        <tr key={u._id} className="transition-colors group hover:bg-black/5 dark:hover:bg-white/5">
                          <td className="px-10 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>{u.name?.charAt(0)}</div>
                              <div className="text-sm font-black uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-[10px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td className="px-6 py-5">
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-md" style={planStyles[plan]}>{plan}</span>
                          </td>
                          <td className="px-6 py-5 font-black text-xs italic" style={{ color: 'var(--text-primary)' }}>{u.monthlyTripCount ?? 0}</td>
                          <td className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                            {plan !== 'FREE' && u.subscriptionEndDate
                              ? new Date(u.subscriptionEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </td>
                          <td className="px-10 py-5 text-right">
                            <select
                              value={plan}
                              disabled={changingPlan === u._id}
                              onChange={(e) => handleChangePlan(u._id, e.target.value)}
                              className="input-field !py-2 !px-4 text-[10px] font-black uppercase tracking-widest cursor-pointer inline-block w-auto"
                            >
                              <option value="FREE">FREE</option>
                              <option value="PRO">PRO</option>
                              <option value="PREMIUM">PREMIUM</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
