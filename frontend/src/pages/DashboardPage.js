import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const SPECIES_ICONS = { dog:'🐕', cat:'🐈', rabbit:'🐇', bird:'🐦', other:'🐾' };

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const [myPosts, setMyPosts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [myChats, setMyChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', bio: user?.bio || '', address: user?.address || '' });

  useEffect(() => {
    Promise.all([
      api.get('/adoptions/my-posts').then(r => setMyPosts(r.data.adoptions)),
      api.get('/adoptions/my-requests').then(r => setMyRequests(r.data.adoptions)),
      api.get('/vet/my-appointments').then(r => setMyAppointments(r.data.appointments)),
      api.get('/chat/my-rooms').then(r => setMyChats(r.data.rooms)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async () => {
    try {
      const res = await api.put('/auth/update-profile', profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditMode(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/adoptions/${id}`);
      setMyPosts(p => p.filter(x => x._id !== id));
      toast.success('Post deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const stats = [
    { icon:'🐾', label:'Animals Posted', value: myPosts.length, color:'var(--terracotta)' },
    { icon:'❤️', label:'Adoption Requests', value: myRequests.length, color:'var(--ochre)' },
    { icon:'🏥', label:'Vet Appointments', value: myAppointments.length, color:'var(--forest)' },
    { icon:'💬', label:'Active Chats', value: myChats.length, color:'#7b5ea7' },
  ];

  const tabs = [
    { key:'overview', label:'Overview', icon:'📊' },
    { key:'posts', label:'My Posts', icon:'🐾' },
    { key:'requests', label:'My Requests', icon:'❤️' },
    { key:'appointments', label:'Appointments', icon:'🏥' },
    { key:'chats', label:'Chats', icon:'💬' },
    { key:'profile', label:'Profile', icon:'👤' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', paddingBottom:60 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, var(--midnight), #1a1a1a)', padding:'40px 0' }}>
        <div className="page-container">
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg, var(--terracotta), var(--ochre))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:700, color:'white', border:'3px solid rgba(255,255,255,0.2)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{ color:'white', fontSize:'1.75rem' }}>Welcome, {user?.name?.split(' ')[0]}! 👋</h1>
              <p style={{ color:'#888', fontSize:'0.875rem' }}>Manage your posts, requests, and appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop:28 }}>
        {/* Tab bar */}
        <div style={{ display:'flex', gap:4, marginBottom:28, background:'white', borderRadius:'var(--radius-lg)', padding:6, border:'1px solid var(--border)', overflowX:'auto', flexWrap:'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding:'9px 16px', borderRadius:'var(--radius-md)', border:'none', cursor:'pointer',
              fontWeight:600, fontSize:'0.85rem', whiteSpace:'nowrap', transition:'var(--transition)',
              background: tab === t.key ? 'var(--terracotta)' : 'transparent',
              color: tab === t.key ? 'white' : 'var(--slate)',
              display:'flex', alignItems:'center', gap:6,
            }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" /></div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="fade-in">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:20, marginBottom:32 }}>
                  {stats.map(s => (
                    <div key={s.label} className="card" style={{ padding:24, display:'flex', alignItems:'center', gap:16 }}>
                      <div style={{ width:52, height:52, borderRadius:14, background:`${s.color}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{s.icon}</div>
                      <div>
                        <div style={{ fontSize:'1.75rem', fontWeight:800, fontFamily:'Playfair Display, serif', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--slate)', fontWeight:500 }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                  {/* Recent posts */}
                  <div className="card" style={{ padding:24 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                      <h4>Recent Posts</h4>
                      <Link to="/post-adoption" className="btn-primary" style={{ padding:'6px 14px', fontSize:'0.8rem' }}>+ New</Link>
                    </div>
                    {myPosts.length === 0 ? <p style={{ color:'var(--slate)', fontSize:'0.875rem' }}>No posts yet</p>
                      : myPosts.slice(0,3).map(p => (
                        <div key={p._id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{SPECIES_ICONS[p.species]} {p.animalName}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--slate)' }}>{p.requests?.length || 0} requests · {p.status}</div>
                          </div>
                          <Link to={`/adopt/${p._id}`} style={{ fontSize:'0.8rem', color:'var(--terracotta)', fontWeight:600 }}>View →</Link>
                        </div>
                      ))
                    }
                  </div>

                  {/* Upcoming appointments */}
                  <div className="card" style={{ padding:24 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                      <h4>Upcoming Appointments</h4>
                      <Link to="/vet-care" className="btn-forest" style={{ padding:'6px 14px', fontSize:'0.8rem' }}>+ Book</Link>
                    </div>
                    {myAppointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').length === 0
                      ? <p style={{ color:'var(--slate)', fontSize:'0.875rem' }}>No upcoming appointments</p>
                      : myAppointments.filter(a => a.status !== 'cancelled' && a.status !== 'completed').slice(0,3).map(a => (
                        <div key={a._id} style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                          <div style={{ fontWeight:600, fontSize:'0.875rem' }}>🏥 {a.serviceType.replace(/-/g,' ')}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--slate)' }}>
                            {a.animalName} · {format(new Date(a.appointmentDate), 'dd MMM')} at {a.timeSlot}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {tab === 'posts' && (
              <div className="fade-in">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                  <h3>My Adoption Posts ({myPosts.length})</h3>
                  <Link to="/post-adoption" className="btn-primary">+ Post a Stray</Link>
                </div>
                {myPosts.length === 0 ? (
                  <div style={{ textAlign:'center', padding:60 }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>🐾</div>
                    <p>No posts yet. Help a stray find a home!</p>
                    <Link to="/post-adoption" className="btn-primary" style={{ marginTop:16, display:'inline-flex' }}>Post a Stray</Link>
                  </div>
                ) : (
                  <div className="cards-grid">
                    {myPosts.map(p => (
                      <div key={p._id} className="card" style={{ overflow:'hidden' }}>
                        <div style={{ height:160, background:'linear-gradient(135deg, var(--sand), var(--cream))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, position:'relative' }}>
                          {p.photos?.[0] ? <img src={p.photos[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : SPECIES_ICONS[p.species]}
                          <div style={{ position:'absolute', top:8, right:8 }}>
                            <span className={`badge badge-${p.status}`}>{p.status}</span>
                          </div>
                        </div>
                        <div style={{ padding:16 }}>
                          <h4 style={{ marginBottom:4 }}>{p.animalName}</h4>
                          <p style={{ fontSize:'0.8rem', color:'var(--slate)', marginBottom:12 }}>
                            {p.breed} · {p.requests?.filter(r => r.status === 'pending').length || 0} pending requests
                          </p>
                          <div style={{ display:'flex', gap:8 }}>
                            <Link to={`/adopt/${p._id}`} className="btn-primary" style={{ flex:1, justifyContent:'center', padding:'8px 0', fontSize:'0.8rem' }}>View</Link>
                            <button onClick={() => handleDeletePost(p._id)} style={{ background:'#ffebee', color:'#c62828', border:'none', padding:'8px 14px', borderRadius:50, cursor:'pointer', fontWeight:600, fontSize:'0.8rem' }}>Delete</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'requests' && (
              <div className="fade-in">
                <h3 style={{ marginBottom:24 }}>My Adoption Requests ({myRequests.length})</h3>
                {myRequests.length === 0 ? (
                  <div style={{ textAlign:'center', padding:60 }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>❤️</div>
                    <p style={{ color:'var(--slate)' }}>No requests sent yet. Browse animals to adopt!</p>
                    <Link to="/adopt" className="btn-primary" style={{ marginTop:16, display:'inline-flex' }}>Browse Animals</Link>
                  </div>
                ) : myRequests.map(adoption => {
                  const req = adoption.myRequest;
                  return (
                    <div key={adoption._id} className="card" style={{ padding:24, marginBottom:16, display:'flex', gap:16, alignItems:'start' }}>
                      <div style={{ width:72, height:72, borderRadius:12, background:'var(--sand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, flexShrink:0, overflow:'hidden' }}>
                        {adoption.photos?.[0] ? <img src={adoption.photos[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : SPECIES_ICONS[adoption.species]}
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:6 }}>
                          <div>
                            <h4>{adoption.animalName}</h4>
                            <p style={{ fontSize:'0.8rem', color:'var(--slate)' }}>Posted by {adoption.poster?.name}</p>
                          </div>
                          <span style={{
                            padding:'4px 14px', borderRadius:50, fontSize:'0.8rem', fontWeight:700,
                            background: req?.status === 'accepted' ? 'var(--forest-pale)' : req?.status === 'rejected' ? '#ffebee' : '#fff8e1',
                            color: req?.status === 'accepted' ? 'var(--forest)' : req?.status === 'rejected' ? '#c62828' : '#e65100',
                          }}>
                            {req?.status || 'pending'}
                          </span>
                        </div>
                        {req?.message && <p style={{ fontSize:'0.8rem', color:'var(--slate)', fontStyle:'italic', marginBottom:8 }}>"{req.message}"</p>}
                        <div style={{ display:'flex', gap:8 }}>
                          <Link to={`/adopt/${adoption._id}`} className="btn-ghost" style={{ padding:'6px 14px', fontSize:'0.8rem' }}>View Post</Link>
                          {req?.chatRoomId && (
                            <Link to={`/chat/${req.chatRoomId}`} className="btn-primary" style={{ padding:'6px 14px', fontSize:'0.8rem' }}>💬 Open Chat</Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'appointments' && (
              <div className="fade-in">
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
                  <h3>Vet Appointments ({myAppointments.length})</h3>
                  <Link to="/vet-care" className="btn-forest">+ Book Appointment</Link>
                </div>
                {myAppointments.length === 0 ? (
                  <div style={{ textAlign:'center', padding:60 }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>🏥</div>
                    <p style={{ color:'var(--slate)' }}>No appointments yet</p>
                    <Link to="/vet-care" className="btn-forest" style={{ marginTop:16, display:'inline-flex' }}>Book Now</Link>
                  </div>
                ) : myAppointments.map(a => (
                  <div key={a._id} className="card" style={{ padding:20, marginBottom:12, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
                    <div>
                      <div style={{ fontWeight:700 }}>{a.serviceType.replace(/-/g,' ').replace(/\b\w/g, l => l.toUpperCase())} — {a.animalName}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--slate)', marginTop:4 }}>
                        📅 {format(new Date(a.appointmentDate), 'dd MMM yyyy')} at {a.timeSlot} · 👩‍⚕️ {a.vet}
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontWeight:700, color:'var(--forest)' }}>৳{a.fee?.toLocaleString()}</span>
                      <span style={{
                        padding:'3px 12px', borderRadius:50, fontSize:'0.78rem', fontWeight:700,
                        background: { scheduled:'#fff3e0', confirmed:'var(--forest-pale)', completed:'#e3f2fd', cancelled:'#f5f5f5' }[a.status],
                        color: { scheduled:'#e65100', confirmed:'var(--forest)', completed:'#1565c0', cancelled:'#757575' }[a.status],
                      }}>{a.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'chats' && (
              <div className="fade-in">
                <h3 style={{ marginBottom:24 }}>My Chats ({myChats.length})</h3>
                {myChats.length === 0 ? (
                  <div style={{ textAlign:'center', padding:60 }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>💬</div>
                    <p style={{ color:'var(--slate)' }}>No chats yet. Request to adopt an animal to start chatting!</p>
                  </div>
                ) : myChats.map(chat => {
                  const other = chat.poster?._id === user?._id ? chat.requester : chat.poster;
                  return (
                    <Link key={chat.roomId} to={`/chat/${chat.roomId}`} style={{ textDecoration:'none' }}>
                      <div className="card" style={{ padding:20, marginBottom:12, display:'flex', gap:14, alignItems:'center', cursor:'pointer' }}>
                        <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--sand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                          {other?.avatar ? <img src={other.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : '👤'}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700 }}>{other?.name}</div>
                          <div style={{ fontSize:'0.8rem', color:'var(--slate)' }}>re: {chat.adoption?.animalName || 'Adoption'}</div>
                          {chat.lastMessage && <div style={{ fontSize:'0.78rem', color:'#9e9e9e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:2 }}>{chat.lastMessage}</div>}
                        </div>
                        <span style={{ fontSize:'0.75rem', color:'var(--slate)', whiteSpace:'nowrap' }}>
                          {chat.lastMessageAt ? format(new Date(chat.lastMessageAt), 'dd MMM') : ''}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {tab === 'profile' && (
              <div className="fade-in" style={{ maxWidth:520 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                  <h3>My Profile</h3>
                  <button onClick={() => setEditMode(!editMode)} className={editMode ? 'btn-ghost' : 'btn-secondary'} style={{ padding:'8px 18px' }}>
                    {editMode ? 'Cancel' : '✏️ Edit'}
                  </button>
                </div>
                <div className="card" style={{ padding:28 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24, paddingBottom:24, borderBottom:'1px solid var(--border)' }}>
                    <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg, var(--terracotta), var(--ochre))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30, fontWeight:700, color:'white' }}>
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'1.2rem' }}>{user?.name}</div>
                      <div style={{ color:'var(--slate)', fontSize:'0.875rem' }}>{user?.email}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--terracotta)', marginTop:4 }}>
                        Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {editMode ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {[
                        { key:'name', label:'Full Name', type:'text' },
                        { key:'phone', label:'Phone', type:'tel' },
                        { key:'address', label:'Address', type:'text' },
                      ].map(f => (
                        <div key={f.key} className="form-group">
                          <label>{f.label}</label>
                          <input type={f.type} className="form-control" value={profileForm[f.key]} onChange={e => setProfileForm(p => ({ ...p, [f.key]: e.target.value }))} />
                        </div>
                      ))}
                      <div className="form-group">
                        <label>Bio</label>
                        <textarea className="form-control" rows={3} value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} placeholder="Tell others about yourself..." />
                      </div>
                      <button onClick={handleProfileSave} className="btn-primary" style={{ alignSelf:'flex-start' }}>Save Changes</button>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                      {[
                        { label:'Email', value: user?.email, icon:'📧' },
                        { label:'Phone', value: user?.phone || 'Not set', icon:'📱' },
                        { label:'Address', value: user?.address || 'Not set', icon:'📍' },
                        { label:'Bio', value: user?.bio || 'No bio yet', icon:'📝' },
                      ].map(f => (
                        <div key={f.label}>
                          <div style={{ fontSize:'0.75rem', color:'var(--slate)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:4 }}>{f.icon} {f.label}</div>
                          <div style={{ fontSize:'0.9rem' }}>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cards-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
