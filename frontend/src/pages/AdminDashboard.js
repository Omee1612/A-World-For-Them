import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SPECIES_ICONS = { dog:'🐕', cat:'🐈', rabbit:'🐇', bird:'🐦', other:'🐾' };

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
    <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'Playfair Display, serif', color }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--slate)', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--forest)', marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [banModal, setBanModal] = useState(null); // { userId, userName }
  const [banReason, setBanReason] = useState('');
  const [removeModal, setRemoveModal] = useState(null); // { adoptionId, animalName }
  const [removeReason, setRemoveReason] = useState('');

 

  const fetchStats = useCallback(async () => {
    const res = await api.get('/admin/stats');
    setStats(res.data.stats);
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (search) params.append('search', search);
    const res = await api.get(`/admin/users?${params}`);
    setUsers(res.data.users);
    setPagination(res.data.pagination);
    setLoading(false);
  }, [search]);

  const fetchAdoptions = useCallback(async (page = 1) => {
    setLoading(true);
    const res = await api.get(`/admin/adoptions?page=${page}&limit=15`);
    setAdoptions(res.data.adoptions);
    setPagination(res.data.pagination);
    setLoading(false);
  }, []);

  const fetchAppointments = useCallback(async (page = 1) => {
    setLoading(true);
    const res = await api.get(`/admin/appointments?page=${page}&limit=15`);
    setAppointments(res.data.appointments);
    setPagination(res.data.pagination);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (tab === 'overview') { fetchStats(); setLoading(false); }
    else if (tab === 'users') fetchUsers(1);
    else if (tab === 'adoptions') fetchAdoptions(1);
    else if (tab === 'appointments') fetchAppointments(1);
  }, [tab]);

  useEffect(() => {
    if (tab === 'users') {
      const t = setTimeout(() => fetchUsers(1), 350);
      return () => clearTimeout(t);
    }
  }, [search, tab, fetchUsers]);
if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  // ── Actions ────────────────────────────────────────────────────────────────

  const handleBan = async () => {
    try {
      await api.put(`/admin/users/${banModal.userId}/ban`, { reason: banReason });
      toast.success(`${banModal.userName} banned and notified by email`);
      setBanModal(null); setBanReason('');
      fetchUsers(1);
    } catch { toast.error('Failed to ban user'); }
  };

  const handleUnban = async (userId, userName) => {
    try {
      await api.put(`/admin/users/${userId}/unban`);
      toast.success(`${userName} unbanned`);
      fetchUsers(1);
    } catch { toast.error('Failed to unban'); }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      toast.success('Role updated');
      fetchUsers(1);
    } catch { toast.error('Failed to update role'); }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Permanently delete ${userName} and all their data?`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers(1);
    } catch { toast.error('Failed to delete user'); }
  };

  const handleRemovePost = async () => {
    try {
      await api.delete(`/admin/adoptions/${removeModal.adoptionId}`, { data: { reason: removeReason } });
      toast.success('Post removed and user notified by email');
      setRemoveModal(null); setRemoveReason('');
      fetchAdoptions(1);
    } catch { toast.error('Failed to remove post'); }
  };

  const handleAdoptionStatus = async (id, status) => {
    try {
      await api.put(`/admin/adoptions/${id}/status`, { status });
      toast.success('Status updated');
      fetchAdoptions(1);
    } catch { toast.error('Failed to update status'); }
  };

  const handleAppointmentStatus = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}/status`, { status });
      toast.success('Appointment status updated');
      fetchAppointments(1);
    } catch { toast.error('Failed to update'); }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'adoptions', label: 'Adoptions', icon: '🐾' },
    { key: 'appointments', label: 'Appointments', icon: '🏥' },
  ];

  const statusBadge = (s) => {
    const map = {
      available: { bg: 'var(--forest-pale)', color: 'var(--forest)' },
      pending: { bg: '#fff3e0', color: '#e65100' },
      adopted: { bg: '#e8eaf6', color: '#3949ab' },
      scheduled: { bg: '#fff3e0', color: '#e65100' },
      confirmed: { bg: 'var(--forest-pale)', color: 'var(--forest)' },
      completed: { bg: '#e8eaf6', color: '#3949ab' },
      cancelled: { bg: '#f5f5f5', color: '#757575' },
    };
    const style = map[s] || { bg: '#f5f5f5', color: '#757575' };
    return (
      <span style={{ background: style.bg, color: style.color, padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700 }}>
        {s}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #0d0d1a, #1a0d0a)', padding: '36px 0' }}>
        <div className="page-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--terracotta), var(--ochre))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛡️</div>
            <div>
              <h1 style={{ color: 'white', fontSize: '1.75rem', margin: 0 }}>Admin Dashboard</h1>
              <p style={{ color: '#666', fontSize: '0.85rem', margin: 0 }}>Signed in as {user.name}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '9px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.875rem',
                background: tab === t.key ? 'var(--terracotta)' : 'rgba(255,255,255,0.1)',
                color: tab === t.key ? 'white' : 'rgba(255,255,255,0.65)',
                transition: 'var(--transition)',
              }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop: 32 }}>

        {/* ── Overview ── */}
        {tab === 'overview' && stats && (
          <div className="fade-in">
            <h3 style={{ marginBottom: 20 }}>Platform Overview</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
              <StatCard icon="👥" label="Total Users" value={stats.users.total} sub={`+${stats.users.newThisWeek} this week`} color="var(--terracotta)" />
              <StatCard icon="🚫" label="Banned Users" value={stats.users.banned} color="#c62828" />
              <StatCard icon="🐾" label="Total Posts" value={stats.adoptions.total} sub={`+${stats.adoptions.newThisWeek} this week`} color="var(--ochre)" />
              <StatCard icon="✅" label="Adopted" value={stats.adoptions.adopted} color="var(--forest)" />
              <StatCard icon="🔍" label="Available Now" value={stats.adoptions.available} color="#1565c0" />
              <StatCard icon="🚨" label="Urgent Posts" value={stats.adoptions.urgent} color="#c62828" />
              <StatCard icon="🏥" label="Appointments" value={stats.appointments.total} sub={`+${stats.appointments.newThisWeek} this week`} color="#7b5ea7" />
              <StatCard icon="📅" label="Pending Appts" value={stats.appointments.pending} color="#e65100" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h4 style={{ marginBottom: 16 }}>Quick Actions</h4>
                {[
                  { label: 'Manage Users', action: () => setTab('users'), icon: '👥', color: 'var(--terracotta)' },
                  { label: 'Review Adoption Posts', action: () => setTab('adoptions'), icon: '🐾', color: 'var(--ochre)' },
                  { label: 'Manage Appointments', action: () => setTab('appointments'), icon: '🏥', color: 'var(--forest)' },
                ].map(item => (
                  <button key={item.label} onClick={item.action} style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '12px 16px', background: 'var(--cream)', border: '1px solid var(--border)',
                    borderRadius: 10, cursor: 'pointer', marginBottom: 10, fontWeight: 600,
                    fontSize: '0.875rem', transition: 'var(--transition)', textAlign: 'left',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = item.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>

              <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, #fff8f5, #fff)', border: '1px solid rgba(196,99,58,0.2)' }}>
                <h4 style={{ marginBottom: 12, color: 'var(--terracotta)' }}>⚠️ Admin Notes</h4>
                <ul style={{ paddingLeft: 18, color: 'var(--slate)', fontSize: '0.875rem', lineHeight: 2 }}>
                  <li>Email notifications fire automatically on key actions</li>
                  <li>Banning a user blocks login and sends them a notification email</li>
                  <li>Deleting a user removes all their posts and appointments</li>
                  <li>Removing a post notifies the owner by email</li>
                  <li>Set your account role to admin directly in MongoDB</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Users ── */}
        {tab === 'users' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h3>Users ({pagination.total})</h3>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
                <input className="form-control" style={{ paddingLeft: 38, width: 260 }}
                  placeholder="Search name or email..."
                  value={search} onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div> : (
              <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--cream)', borderBottom: '2px solid var(--border)' }}>
                      {['User', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--slate)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid var(--border)', background: u.isBanned ? '#fff5f5' : 'white' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--terracotta), var(--ochre))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--slate)' }}>{u.email}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{
                            border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px',
                            fontSize: '0.8rem', background: 'white', cursor: 'pointer',
                          }}>
                            <option value="user">User</option>
                            <option value="vet">Vet</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 700,
                            background: u.isBanned ? '#ffebee' : 'var(--forest-pale)',
                            color: u.isBanned ? '#c62828' : 'var(--forest)',
                          }}>
                            {u.isBanned ? '🚫 Banned' : '✓ Active'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.8rem', color: 'var(--slate)' }}>
                          {format(new Date(u.createdAt), 'dd MMM yy')}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {u.isBanned ? (
                              <button onClick={() => handleUnban(u._id, u.name)} style={{ background: 'var(--forest-pale)', color: 'var(--forest)', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                                Unban
                              </button>
                            ) : (
                              <button onClick={() => setBanModal({ userId: u._id, userName: u.name })} style={{ background: '#fff3e0', color: '#e65100', border: 'none', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                                Ban
                              </button>
                            )}
                            <button onClick={() => handleDeleteUser(u._id, u.name)} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchUsers(p)} style={{
                    width: 36, height: 36, borderRadius: 8, border: '2px solid',
                    borderColor: p === pagination.page ? 'var(--terracotta)' : 'var(--border)',
                    background: p === pagination.page ? 'var(--terracotta)' : 'white',
                    color: p === pagination.page ? 'white' : 'var(--charcoal)',
                    fontWeight: 600, cursor: 'pointer',
                  }}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Adoptions ── */}
        {tab === 'adoptions' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Adoption Posts ({pagination.total})</h3>
            </div>

            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {adoptions.map(a => (
                  <div key={a._id} className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ width: 60, height: 60, borderRadius: 12, background: 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, overflow: 'hidden', flexShrink: 0 }}>
                      {a.photos?.[0] ? <img src={a.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : SPECIES_ICONS[a.species]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700 }}>{a.animalName}</span>
                        {statusBadge(a.status)}
                        {a.urgency !== 'normal' && (
                          <span style={{ background: a.urgency === 'critical' ? '#ffebee' : '#fff3e0', color: a.urgency === 'critical' ? '#c62828' : '#e65100', padding: '2px 8px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700 }}>
                            {a.urgency}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
                        {a.species} · {a.breed} · Posted by <strong>{a.poster?.name}</strong> · {format(new Date(a.createdAt), 'dd MMM yyyy')}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate)', marginTop: 2 }}>
                        👀 {a.views} views · {a.requests?.length || 0} requests
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                      <select value={a.status} onChange={e => handleAdoptionStatus(a._id, e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: '0.8rem', background: 'white', cursor: 'pointer' }}>
                        <option value="available">Available</option>
                        <option value="pending">Pending</option>
                        <option value="adopted">Adopted</option>
                        <option value="removed">Removed</option>
                      </select>
                      <button onClick={() => setRemoveModal({ adoptionId: a._id, animalName: a.animalName })} style={{ background: '#ffebee', color: '#c62828', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchAdoptions(p)} style={{
                    width: 36, height: 36, borderRadius: 8, border: '2px solid',
                    borderColor: p === pagination.page ? 'var(--terracotta)' : 'var(--border)',
                    background: p === pagination.page ? 'var(--terracotta)' : 'white',
                    color: p === pagination.page ? 'white' : 'var(--charcoal)',
                    fontWeight: 600, cursor: 'pointer',
                  }}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Appointments ── */}
        {tab === 'appointments' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3>Vet Appointments ({pagination.total})</h3>
            </div>

            {loading ? <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" /></div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {appointments.map(a => (
                  <div key={a._id} className="card" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>
                        {a.serviceType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} — {a.animalName}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate)' }}>
                        👤 {a.owner?.name} · 📅 {format(new Date(a.appointmentDate), 'dd MMM yyyy')} at {a.timeSlot} · 👩‍⚕️ {a.vet}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--forest)', marginTop: 2 }}>৳{a.fee?.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      {statusBadge(a.status)}
                      <select value={a.status} onChange={e => handleAppointmentStatus(a._id, e.target.value)} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontSize: '0.8rem', background: 'white', cursor: 'pointer' }}>
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchAppointments(p)} style={{
                    width: 36, height: 36, borderRadius: 8, border: '2px solid',
                    borderColor: p === pagination.page ? 'var(--terracotta)' : 'var(--border)',
                    background: p === pagination.page ? 'var(--terracotta)' : 'white',
                    color: p === pagination.page ? 'white' : 'var(--charcoal)',
                    fontWeight: 600, cursor: 'pointer',
                  }}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Ban Modal ── */}
      {banModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="fade-in" style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 32, width: '100%', maxWidth: 440 }}>
            <h3 style={{ marginBottom: 8, color: '#c62828' }}>🚫 Ban {banModal.userName}?</h3>
            <p style={{ color: 'var(--slate)', fontSize: '0.875rem', marginBottom: 20 }}>
              This user will be blocked from logging in and notified by email. You can unban them at any time.
            </p>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Reason (sent to user in email)</label>
              <textarea className="form-control" rows={3} value={banReason}
                onChange={e => setBanReason(e.target.value)}
                placeholder="Violation of community guidelines..." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setBanModal(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleBan} style={{ flex: 1, background: '#c62828', color: 'white', border: 'none', borderRadius: 50, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}>
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove Post Modal ── */}
      {removeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="fade-in" style={{ background: 'white', borderRadius: 'var(--radius-xl)', padding: 32, width: '100%', maxWidth: 440 }}>
            <h3 style={{ marginBottom: 8 }}>🗑️ Remove post for {removeModal.animalName}?</h3>
            <p style={{ color: 'var(--slate)', fontSize: '0.875rem', marginBottom: 20 }}>
              The post will be deleted and the owner will receive an email notification.
            </p>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Reason (optional, sent to user)</label>
              <textarea className="form-control" rows={3} value={removeReason}
                onChange={e => setRemoveReason(e.target.value)}
                placeholder="Content violates our guidelines..." />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setRemoveModal(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleRemovePost} style={{ flex: 1, background: '#c62828', color: 'white', border: 'none', borderRadius: 50, padding: '12px 0', fontWeight: 700, cursor: 'pointer' }}>
                Remove Post
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          table { font-size: 0.8rem; }
          td, th { padding: 10px 8px !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
