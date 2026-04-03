import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import InviteCollaboratorModal from './InviteCollaboratorModal';
import ShareTripModal from './ShareTripModal';
import toast from 'react-hot-toast';

const RoleBadge = ({ role }) => {
 const styles = {
  owner: 'bg-white text-slate-950',
  editor: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
  viewer: 'bg-slate-700 text-slate-400 border border-slate-600',
 };
 return (
  <span className={`text-xs font-bold px-2 py-1 ${styles[role] || styles.viewer}`}>
   {role}
  </span>
 );
};

const Avatar = ({ user }) => {
 if (user?.profileImage) {
  return <img src={user.profileImage} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />;
 }
 return (
  <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 font-bold text-sm">
   {user?.name?.[0]?.toUpperCase() || '?'}
  </div>
 );
};

const CollaboratorPanel = ({ tripId, isOwner }) => {
 const { user } = useAuth();
 const [collaborators, setCollaborators] = useState([]);
 const [owner, setOwner] = useState(null);
 const [loading, setLoading] = useState(true);
 const [showInviteModal, setShowInviteModal] = useState(false);
 const [showShareModal, setShowShareModal] = useState(false);
 const [removing, setRemoving] = useState(null);

 useEffect(() => {
  fetchCollaborators();
 }, [tripId]);

 const fetchCollaborators = async () => {
  try {
   const { data } = await api.get(`/trips/${tripId}/collaborators`);
   setOwner(data.owner);
   setCollaborators(data.collaborators);
  } catch {
   toast.error('Failed to load collaborators');
  } finally {
   setLoading(false);
  }
 };

 const handleRemove = async (collaboratorUserId) => {
  setRemoving(collaboratorUserId);
  try {
   await api.delete(`/trips/${tripId}/collaborators/${collaboratorUserId}`);
   setCollaborators((prev) => prev.filter((c) => c.user._id !== collaboratorUserId));
   toast.success('Collaborator removed');
  } catch (err) {
   toast.error(err.response?.data?.message || 'Failed to remove');
  } finally {
   setRemoving(null);
  }
 };

 if (loading) {
  return (
   <div className="card p-10 space-y-6 animate-pulse">
    {[...Array(3)].map((_, i) => (
     <div key={i} className="h-12 bg-white/5 rounded" />
    ))}
   </div>
  );
 }

 return (
  <>
   <InviteCollaboratorModal
    tripId={tripId}
    isOpen={showInviteModal}
    onClose={() => setShowInviteModal(false)}
    onCollaboratorAdded={(c) => setCollaborators((prev) => [...prev, c])}
   />
   <ShareTripModal
    tripId={tripId}
    isOpen={showShareModal}
    onClose={() => setShowShareModal(false)}
   />

   <div className="card p-10 space-y-10">
    {/* Header */}
    <div className="flex items-center justify-between">
     <div>
      <div className="text-xs font-semibold text-primary-500 mb-1">
       Mission Team
      </div>
      <h3 className="text-2xl font-bold text-white">
       Collaborators
      </h3>
     </div>
     {isOwner && (
      <div className="flex gap-3">
       <button
        onClick={() => setShowShareModal(true)}
        className="h-10 px-5 bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-all"
       >
        🔗 Share
       </button>
       <button
        onClick={() => setShowInviteModal(true)}
        className="h-10 px-5 bg-primary-500 text-white font-bold text-xs hover:bg-primary-600 transition-all"
       >
        + Invite
       </button>
      </div>
     )}
    </div>

    {/* Owner */}
    {owner && (
     <div className="space-y-3">
      <div className="text-xs font-bold text-slate-600 ">Owner</div>
      <motion.div
       initial={{ opacity: 0, x: -10 }}
       animate={{ opacity: 1, x: 0 }}
       className="flex items-center gap-5 p-5 bg-white/3 border border-white/5"
      >
       <Avatar user={owner} />
       <div className="flex-1">
        <div className="text-white font-bold text-sm ">{owner.name}</div>
        <div className="text-slate-500 text-xs font-mono mt-0.5">{owner.email}</div>
       </div>
       <RoleBadge role="owner" />
      </motion.div>
     </div>
    )}

    {/* Collaborators */}
    <div className="space-y-3">
     <div className="text-xs font-bold text-slate-600 ">
      Team Members ({collaborators.length})
     </div>

     {collaborators.length === 0 ? (
      <div className="py-10 text-center">
       <div className="text-3xl mb-4">👥</div>
       <p className="text-slate-600 text-sm font-bold ">
        No collaborators yet
       </p>
       {isOwner && (
        <p className="text-slate-700 text-xs mt-2">
         Click "Invite" to add team members
        </p>
       )}
      </div>
     ) : (
      <div className="space-y-3">
       {collaborators.map((c, i) => (
        <motion.div
         key={c.user._id || i}
         initial={{ opacity: 0, x: -10 }}
         animate={{ opacity: 1, x: 0 }}
         transition={{ delay: i * 0.05 }}
         className="flex items-center gap-5 p-5 bg-white/3 border border-white/5 group"
        >
         <Avatar user={c.user} />
         <div className="flex-1 min-w-0">
          <div className="text-white font-bold text-sm truncate">{c.user.name}</div>
          <div className="text-slate-500 text-xs font-mono mt-0.5 truncate">{c.user.email}</div>
         </div>
         <RoleBadge role={c.role} />
         {isOwner && (
          <button
           onClick={() => handleRemove(c.user._id)}
           disabled={removing === c.user._id}
           className="w-8 h-8 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center"
          >
           {removing === c.user._id ? '…' : '✕'}
          </button>
         )}
        </motion.div>
       ))}
      </div>
     )}
    </div>
   </div>
  </>
 );
};

export default CollaboratorPanel;
