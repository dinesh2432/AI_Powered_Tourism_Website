import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

const AdminDashboardPage = () => {
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
      isOpen: true, type: 'success', title: 'Confirm Authorization',
      content: 'Approve this candidate for Guide Clearance Level 02?',
      confirmText: 'Authorize',
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          await api.put(`/admin/applications/${id}/approve`);
          toast.success('Authorization Successful');
          setApplications(prev => prev.filter(a => a._id !== id));
          closeModal();
        } catch (err) {
          toast.error(err.response?.data?.message || 'Authorization Failed');
        } finally { setModal(prev => ({ ...prev, loading: false })); }
      }
    });
  };

  const handleRejectApp = (id) => {
    setModal({
      isOpen: true, type: 'danger', title: 'Security Override',
      content: 'Decline this application. This action will be logged.',
      confirmText: 'Decline',
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          await api.put(`/admin/applications/${id}/reject`);
          toast.success('Protocol Executed');
          setApplications(prev => prev.filter(a => a._id !== id));
          closeModal();
        } catch { toast.error('Protocol Failure'); }
        finally { setModal(prev => ({ ...prev, loading: false })); }
      }
    });
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoForm.file) return toast.error('Transmission Payload Missing');
    setUploading(true);
    const formData = new FormData();
    formData.append('video', videoForm.file);
    formData.append('title', videoForm.title);
    formData.append('description', videoForm.description);
    formData.append('destination', videoForm.destination);
    formData.append('tags', videoForm.tags);
    try {
      await api.post('/admin/videos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Uplink Synchronized');
      setVideoForm({ title: '', description: '', destination: '', tags: '', file: null });
      api.get('/explore').then(({ data }) => setVideos(data.videos));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Uplink Failure');
    } finally { setUploading(false); }
  };

  const handleDeleteVideo = (id) => {
    setModal({
      isOpen: true, type: 'danger', title: 'Purge Sequence',
      content: 'Permanently delete this media packet from the database?',
      confirmText: 'Purge',
      onConfirm: async () => {
        setModal(prev => ({ ...prev, loading: true }));
        try {
          await api.delete(`/admin/videos/${id}`);
          toast.success('Data Purged');
          setVideos(prev => prev.filter(v => v._id !== id));
          closeModal();
        } catch { toast.error('Purge Failed'); }
        finally { setModal(prev => ({ ...prev, loading: false })); }
      }
    });
  };

  const handleChangePlan = async (userId, newPlan) => {
    setChangingPlan(userId);
    try {
      const { data } = await api.patch(`/admin/users/${userId}/subscription`, { subscription: newPlan });
      toast.success(data.message);
      setUsers(prev => prev.map(u => u._id === userId
        ? { ...u, subscription: newPlan, subscriptionEndDate: data.user?.subscriptionEndDate, monthlyTripCount: 0 }
        : u
      ));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Plan update failed');
    } finally { setChangingPlan(null); }
  };

  const tabs = ['analytics', 'users', 'applications', 'videos', 'subscriptions'];

  const planColors = {
    FREE: 'text-slate-400 bg-slate-800/50 border-slate-600',
    PRO: 'text-primary-400 bg-primary-500/10 border-primary-500/30',
    PREMIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 relative overflow-hidden grid-bg">
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm}
        loading={modal.loading}
      >
        {modal.content}
      </Modal>

      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-24 pt-20">
        <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none">
              ADMIN <span className="gradient-text">CONTROL.</span>
            </h1>
          </motion.div>
        </header>

        {/* Tactical Navigation */}
        <nav className="flex gap-4 overflow-x-auto pb-12 no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`group relative h-20 px-10 transition-all duration-500 border ${
                activeTab === tab
                  ? 'bg-white text-slate-950 border-white shadow-glow-primary'
                  : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/10'
              }`}
            >
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">
                {tab}
              </span>
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
                    className="glass-dark border border-white/5 rounded-[32px] p-8 group hover:border-primary-500/30 transition-all duration-500"
                  >
                    <div className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center justify-between">
                      <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="w-2 h-2 rounded-full bg-primary-500/20 group-hover:bg-primary-500 transition-colors" />
                    </div>
                    <div className="text-4xl font-display font-black text-white italic tracking-tighter leading-none group-hover:scale-110 transition-transform origin-left">
                      {value}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="w-[70%] h-full bg-primary-500 animate-pulse" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                <div className="glass-dark border border-white/5 rounded-[40px] p-10">
                  <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic mb-8 flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-primary-500/10 text-primary-400">👤</span>
                    User Registry
                  </h3>
                  <div className="space-y-6">
                    {analytics.recentUsers?.map((u, i) => (
                      <motion.div
                        key={u._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                      >
                        <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-primary-500 to-purple-600 p-[1px] group-hover:rotate-6 transition-all">
                          <div className="w-full h-full bg-slate-900 rounded-[13px] flex items-center justify-center text-white font-black">{u.name?.charAt(0)}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-black text-xs uppercase tracking-widest">{u.name}</div>
                          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-tight mt-0.5">{u.email}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Entry Date</div>
                          <div className="text-white font-black text-[10px] mt-0.5">{new Date(u.createdAt).toLocaleDateString()}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="glass-dark border border-white/5 rounded-[40px] p-10">
                  <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic mb-8 flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-secondary-500/10 text-secondary-400">✈️</span>
                    Mission Logs
                  </h3>
                  <div className="space-y-6">
                    {analytics.recentTrips?.map((t, i) => (
                      <motion.div
                        key={t._id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-5 p-4 rounded-2xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                      >
                        <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🗺️</div>
                        <div className="flex-1">
                          <div className="text-white font-black text-xs uppercase tracking-widest">{t.destination}</div>
                          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-tight mt-0.5">Vector: {t.source}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Timestamp</div>
                          <div className="text-white font-black text-[10px] mt-0.5">{new Date(t.startDate).toLocaleDateString()}</div>
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
            <div className="glass-dark border border-white/5 rounded-[40px] overflow-hidden">
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-3xl font-display font-black text-white tracking-tighter uppercase italic">User Management</h2>
                <div className="bg-primary-500 text-white font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest">
                  {users.length} Database entries
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      <th className="px-10 py-6 text-left">Name</th>
                      <th className="px-6 py-6 text-left">Email ID</th>
                      <th className="px-6 py-6 text-left">Role</th>
                      <th className="px-6 py-6 text-left">Trip Count</th>
                      <th className="px-10 py-6 text-right">Signup Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-black text-sm group-hover:rotate-12 transition-all">{u.name?.charAt(0)}</div>
                            <div className="text-sm font-black text-white uppercase tracking-wider">{u.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-tight">{u.email}</td>
                        <td className="px-6 py-6">
                          <div className="flex gap-2">
                            {u.isAdmin && <span className="bg-primary-500/10 text-primary-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-primary-500/20 uppercase tracking-widest">Admin</span>}
                            {u.isGuide && <span className="bg-secondary-500/10 text-secondary-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-secondary-500/20 uppercase tracking-widest">Guide</span>}
                            {u.isVerified && <span className="bg-green-500/10 text-green-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-widest">Verified</span>}
                          </div>
                        </td>
                        <td className="px-6 py-6 text-white font-black text-xs italic">{u.travelStats?.totalTrips || 0}</td>
                        <td className="px-10 py-6 text-right text-[10px] font-bold text-slate-600 uppercase tracking-widest">{new Date(u.createdAt).toLocaleDateString()}</td>
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
                <h2 className="text-3xl font-display font-black text-white tracking-tighter uppercase italic">Application Queue</h2>
                <div className="glass-dark border border-white/5 px-6 py-2 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Pending: {applications.length}
                </div>
              </div>
              {applications.length === 0 ? (
                <div className="glass-dark border border-white/5 rounded-[48px] p-24 text-center">
                  <div className="text-6xl mb-6 grayscale opacity-20">📭</div>
                  <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic mb-2">Empty Queue</h3>
                  <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">No pending applications</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {applications.map((app) => (
                    <motion.div
                      key={app._id}
                      layout
                      className="glass-dark border border-white/5 rounded-[40px] p-10 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                      <div className="relative z-10">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                          <div className="flex flex-col md:flex-row md:items-center gap-10">
                            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary-500 to-purple-600 p-[2px] shadow-glow-primary">
                              <div className="w-full h-full bg-slate-900 rounded-[30px] flex items-center justify-center font-black text-3xl text-white">{app.userId?.name?.charAt(0)}</div>
                            </div>
                            <div>
                              <h3 className="text-3xl font-display font-black text-white tracking-tighter uppercase italic mb-2">{app.userId?.name}</h3>
                              <div className="flex flex-wrap gap-3 mb-4">
                                <span className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border border-white/5">📍 {app.city}</span>
                                <span className="bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full border border-white/5">Exp: {app.experience} Yrs</span>
                              </div>
                              <div className="flex gap-2 flex-wrap">
                                {app.languages?.map((l) => (
                                  <span key={l} className="bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-widest">{l}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 xl:shrink-0">
                            <button onClick={() => handleApproveApp(app._id)} className="h-16 px-10 rounded-[20px] bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-500 hover:text-white transition-all duration-500">
                              Confirm Protocol
                            </button>
                            <button onClick={() => handleRejectApp(app._id)} className="h-16 px-10 rounded-[20px] glass-dark border border-white/5 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-all duration-500">
                              Decline
                            </button>
                          </div>
                        </div>
                        <div className="mt-10 pt-10 border-t border-white/5">
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4 italic opacity-50">Candidate Personnel Manifest</p>
                          <p className="text-white text-sm font-medium leading-relaxed max-w-4xl italic">"{app.description}"</p>
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
                <div className="glass-dark border border-white/10 rounded-[40px] p-8 md:p-10 sticky top-12">
                  <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic mb-8 flex items-center gap-3">
                    <span className="p-2 rounded-xl bg-primary-500 text-white shadow-glow-primary text-sm">🎬</span>
                    VIDEO UPLOAD HERE
                  </h2>
                  <form onSubmit={handleVideoUpload} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">VIDEO Title</label>
                      <input required className="w-full h-14 glass-dark border border-white/5 rounded-2xl px-6 text-white font-bold text-sm outline-none focus:border-primary-500/50 transition-all" placeholder="Enter video name..." value={videoForm.title} onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Location Name</label>
                      <input className="w-full h-14 glass-dark border border-white/5 rounded-2xl px-6 text-white font-bold text-sm outline-none focus:border-primary-500/50 transition-all" placeholder="e.g. Mumbai, Paris..." value={videoForm.destination} onChange={(e) => setVideoForm({ ...videoForm, destination: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Tags</label>
                      <input className="w-full h-14 glass-dark border border-white/5 rounded-2xl px-6 text-white font-bold text-sm outline-none focus:border-primary-500/50 transition-all" placeholder="adventure, funny, trekking.." value={videoForm.tags} onChange={(e) => setVideoForm({ ...videoForm, tags: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Video Upload</label>
                      <div className="relative h-32 glass-dark border border-dashed border-white/10 rounded-2xl group hover:border-primary-500/50 transition-all cursor-pointer overflow-hidden">
                        <input required type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setVideoForm({ ...videoForm, file: e.target.files[0] })} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📁</span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{videoForm.file ? videoForm.file.name : 'Select Data File'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Brief Description</label>
                      <textarea className="w-full h-32 glass-dark border border-white/5 rounded-2xl p-6 text-white font-medium text-sm outline-none focus:border-primary-500/50 transition-all resize-none" placeholder="Contextual data..." value={videoForm.description} onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })} />
                    </div>
                    <button type="submit" disabled={uploading} className="w-full h-16 rounded-[20px] bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-glow-primary hover:shadow-glow-secondary active:scale-[0.98] transition-all disabled:opacity-50">
                      {uploading ? 'SYNCHRONIZING...' : '🚀 INITIATE UPLOAD'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {videos.map((video) => (
                    <motion.div key={video._id} whileHover={{ y: -10 }} className="glass-dark border border-white/5 rounded-[40px] overflow-hidden group shadow-2xl">
                      <div className="relative h-56 overflow-hidden">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        ) : (
                          <div className="w-full h-full bg-slate-900 flex items-center justify-center text-4xl">🎬</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                        <div className="absolute top-6 left-6">
                          <span className="bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">{video.destination || 'GLOBAL'}</span>
                        </div>
                        <button onClick={() => handleDeleteVideo(video._id)} className="absolute top-6 right-6 w-10 h-10 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl flex items-center justify-center backdrop-blur-md border border-red-500/20 transition-all">🗑️</button>
                      </div>
                      <div className="p-8">
                        <h3 className="text-xl font-display font-black text-white tracking-tighter uppercase italic mb-2 line-clamp-1">{video.title}</h3>
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-glow-primary" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Feed</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-black text-xs italic">{video.views} VIEWS</div>
                            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(video.createdAt).toLocaleDateString()}</div>
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
            <div className="glass-dark border border-white/5 rounded-[40px] overflow-hidden">
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-display font-black text-white tracking-tighter uppercase italic">Subscription Control</h2>
                  <p className="text-slate-600 text-[9px] font-black uppercase tracking-widest mt-2">Manually assign plans to any user — no payment required</p>
                </div>
                <div className="bg-primary-500 text-white font-black text-[10px] px-4 py-1 rounded-full uppercase tracking-widest">
                  {users.length} Users
                </div>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                      <th className="px-10 py-6 text-left">User</th>
                      <th className="px-6 py-6 text-left">Email</th>
                      <th className="px-6 py-6 text-left">Plan</th>
                      <th className="px-6 py-6 text-left">Trips / Month</th>
                      <th className="px-6 py-6 text-left">Expires</th>
                      <th className="px-10 py-6 text-right">Change Plan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => {
                      const plan = u.subscription || 'FREE';
                      return (
                        <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-10 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-white font-black text-sm">{u.name?.charAt(0)}</div>
                              <div className="text-sm font-black text-white uppercase tracking-wider">{u.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-tight">{u.email}</td>
                          <td className="px-6 py-5">
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 border ${planColors[plan]}`}>{plan}</span>
                          </td>
                          <td className="px-6 py-5 text-white font-black text-xs italic">{u.monthlyTripCount ?? 0}</td>
                          <td className="px-6 py-5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            {plan !== 'FREE' && u.subscriptionEndDate
                              ? new Date(u.subscriptionEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </td>
                          <td className="px-10 py-5 text-right">
                            <select
                              value={plan}
                              disabled={changingPlan === u._id}
                              onChange={(e) => handleChangePlan(u._id, e.target.value)}
                              className="bg-slate-800 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest px-4 py-2 cursor-pointer hover:border-primary-500/50 transition-all disabled:opacity-50 outline-none"
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
