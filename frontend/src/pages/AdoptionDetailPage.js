import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const SPECIES_ICONS = { dog:'🐕', cat:'🐈', rabbit:'🐇', bird:'🐦', other:'🐾' };

const AdoptionDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adoption, setAdoption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestMsg, setRequestMsg] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    api.get(`/adoptions/${id}`)
      .then(res => setAdoption(res.data.adoption))
      .catch(() => navigate('/adopt'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const myRequest = adoption?.requests?.find(r => r.requester?._id === user?._id || r.requester === user?._id);
  const isOwner = adoption?.poster?._id === user?._id;

  const handleAdoptRequest = async () => {
    if (!user) { navigate('/login', { state: { from: { pathname: `/adopt/${id}` } } }); return; }
    setRequesting(true);
    try {
      const res = await api.post(`/adoptions/${id}/request`, { message: requestMsg });
      toast.success('Adoption request sent! 🐾');
      setShowRequestModal(false);
      navigate(`/chat/${res.data.chatRoomId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequesting(false);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await api.put(`/adoptions/${id}/request/${requestId}/respond`, { action });
      toast.success(`Request ${action}ed!`);
      const res = await api.get(`/adoptions/${id}`);
      setAdoption(res.data.adoption);
    } catch (err) {
      toast.error('Failed to respond');
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Mark this adoption as complete?')) return;
    try {
      await api.put(`/adoptions/${id}/complete`);
      toast.success('Adoption completed! 🎉');
      const res = await api.get(`/adoptions/${id}`);
      setAdoption(res.data.adoption);
    } catch (err) {
      toast.error('Failed to complete');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await api.delete(`/adoptions/${id}`);
      toast.success('Post deleted');
      navigate('/adopt');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:100 }}>
      <div className="spinner" />
    </div>
  );

  if (!adoption) return null;

  const photos = adoption.photos?.length > 0 ? adoption.photos : null;

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', paddingBottom:60 }}>
      <div className="page-container" style={{ paddingTop:32 }}>
        {/* Breadcrumb */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24, fontSize:'0.875rem', color:'var(--slate)' }}>
          <Link to="/adopt" style={{ color:'var(--terracotta)' }}>Browse</Link>
          <span>›</span>
          <span>{adoption.animalName}</span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 380px', gap:32, alignItems:'start' }}>
          {/* Left: Photos + Details */}
          <div>
            {/* Photo gallery */}
            <div style={{ borderRadius:'var(--radius-xl)', overflow:'hidden', background:'var(--sand)', marginBottom:24 }}>
              <div style={{ height:400, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, var(--sand), var(--cream))', position:'relative', overflow:'hidden' }}>
                {photos
                  ? <img src={photos[selectedPhoto]} alt={adoption.animalName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize:120 }}>{SPECIES_ICONS[adoption.species]}</span>
                }
                {adoption.urgency !== 'normal' && (
                  <div style={{ position:'absolute', top:16, left:16 }}>
                    <span style={{ background: adoption.urgency === 'critical' ? '#c62828' : '#e65100', color:'white', padding:'6px 16px', borderRadius:50, fontWeight:700, fontSize:'0.85rem' }}>
                      {adoption.urgency === 'critical' ? '🚨 Needs Immediate Help' : '⚡ Urgent'}
                    </span>
                  </div>
                )}
                <div style={{ position:'absolute', top:16, right:16 }}>
                  <span className={`badge badge-${adoption.status}`} style={{ fontSize:'0.8rem' }}>{adoption.status}</span>
                </div>
              </div>
              {photos?.length > 1 && (
                <div style={{ display:'flex', gap:8, padding:12, overflowX:'auto' }}>
                  {photos.map((p, i) => (
                    <img key={i} src={p} alt="" onClick={() => setSelectedPhoto(i)} style={{
                      width:72, height:72, objectFit:'cover', borderRadius:8, cursor:'pointer',
                      border: selectedPhoto === i ? '2px solid var(--terracotta)' : '2px solid transparent',
                      opacity: selectedPhoto === i ? 1 : 0.7, transition:'var(--transition)',
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Details card */}
            <div className="card" style={{ padding:28, marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:20 }}>
                <div>
                  <h1 style={{ fontSize:'2rem', marginBottom:8 }}>{adoption.animalName}</h1>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <span className={`badge badge-${adoption.species}`}>{SPECIES_ICONS[adoption.species]} {adoption.species}</span>
                    {adoption.breed !== 'Unknown' && <span className="badge" style={{ background:'var(--cream)', color:'var(--charcoal)' }}>{adoption.breed}</span>}
                    <span className="badge" style={{ background:'var(--cream)', color:'var(--charcoal)' }}>{adoption.gender}</span>
                    {adoption.size && <span className="badge" style={{ background:'var(--cream)', color:'var(--charcoal)' }}>{adoption.size}</span>}
                  </div>
                </div>
                {isOwner && (
                  <div style={{ display:'flex', gap:8 }}>
                    <button onClick={handleDelete} style={{ background:'#ffebee', color:'#c62828', border:'none', padding:'8px 16px', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:'0.8rem' }}>
                      🗑️ Delete
                    </button>
                    {adoption.status === 'pending' && (
                      <button onClick={handleComplete} className="btn-forest" style={{ padding:'8px 16px', fontSize:'0.8rem' }}>
                        ✅ Mark Adopted
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Quick info */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:24, padding:20, background:'var(--cream)', borderRadius:'var(--radius-md)' }}>
                {[
                  { icon:'📅', label:'Age', value: adoption.age?.value ? `${adoption.age.value} ${adoption.age.unit}` : 'Unknown' },
                  { icon:'📍', label:'Location', value: adoption.location?.city || 'Not specified' },
                  { icon:'👁️', label:'Views', value: adoption.views || 0 },
                ].map(item => (
                  <div key={item.label} style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'1.25rem', marginBottom:4 }}>{item.icon}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--slate)', textTransform:'uppercase', letterSpacing:'0.04em', fontWeight:600 }}>{item.label}</div>
                    <div style={{ fontWeight:700, marginTop:2 }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginBottom:12, fontSize:'1.1rem' }}>About {adoption.animalName}</h3>
              <p style={{ color:'var(--charcoal)', lineHeight:1.8, marginBottom:24 }}>{adoption.description}</p>

              {adoption.personality?.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <h4 style={{ fontSize:'0.9rem', marginBottom:10, color:'var(--slate)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Personality</h4>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {adoption.personality.map(p => (
                      <span key={p} style={{ background:'#fdf0e8', color:'var(--terracotta)', border:'1px solid rgba(196,99,58,0.2)', padding:'4px 14px', borderRadius:50, fontSize:'0.85rem', fontWeight:500 }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Health */}
              <div>
                <h4 style={{ fontSize:'0.9rem', marginBottom:10, color:'var(--slate)', textTransform:'uppercase', letterSpacing:'0.04em' }}>Health Status</h4>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {[
                    { key:'vaccinated', label:'Vaccinated', icon:'💉' },
                    { key:'neutered', label:'Neutered/Spayed', icon:'✂️' },
                    { key:'microchipped', label:'Microchipped', icon:'📡' },
                  ].map(h => (
                    <div key={h.key} style={{
                      display:'flex', alignItems:'center', gap:6,
                      padding:'6px 14px', borderRadius:8,
                      background: adoption.healthStatus?.[h.key] ? 'var(--forest-pale)' : '#f5f5f5',
                      color: adoption.healthStatus?.[h.key] ? 'var(--forest)' : '#9e9e9e',
                      fontSize:'0.85rem', fontWeight:500,
                    }}>
                      <span>{h.icon}</span>
                      <span>{h.label}</span>
                      <span>{adoption.healthStatus?.[h.key] ? '✓' : '✗'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Poster info + Actions */}
          <div style={{ position:'sticky', top:80 }}>
            {/* Poster card */}
            <div className="card" style={{ padding:24, marginBottom:16 }}>
              <h4 style={{ marginBottom:16, fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--slate)' }}>Posted by</h4>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg, var(--terracotta), var(--ochre))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, color:'white', fontWeight:700, flexShrink:0 }}>
                  {adoption.poster?.avatar ? <img src={adoption.poster.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : adoption.poster?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <div style={{ fontWeight:700 }}>{adoption.poster?.name}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--slate)' }}>
                    Member since {adoption.poster?.createdAt ? format(new Date(adoption.poster.createdAt), 'MMM yyyy') : 'N/A'}
                  </div>
                </div>
              </div>
              {adoption.poster?.phone && (
                <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.875rem', color:'var(--charcoal)', marginBottom:8 }}>
                  📱 {adoption.poster.phone}
                </div>
              )}
              <div style={{ fontSize:'0.8rem', color:'var(--slate)', marginTop:8 }}>
                📅 Posted {format(new Date(adoption.createdAt), 'dd MMM yyyy')}
              </div>
            </div>

            {/* Adopt button */}
            {!isOwner && (
              <div className="card" style={{ padding:24, marginBottom:16 }}>
                {adoption.status === 'adopted' ? (
                  <div style={{ textAlign:'center', padding:16 }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>🎉</div>
                    <p style={{ fontWeight:700, color:'var(--forest)' }}>Already Adopted!</p>
                    <p style={{ fontSize:'0.875rem', color:'var(--slate)', marginTop:6 }}>This animal has found a home.</p>
                  </div>
                ) : myRequest ? (
                  <div>
                    <div style={{
                      background: myRequest.status === 'accepted' ? 'var(--forest-pale)' : myRequest.status === 'rejected' ? '#ffebee' : '#fff8e1',
                      borderRadius:'var(--radius-md)', padding:16, marginBottom:12,
                    }}>
                      <div style={{ fontWeight:700, fontSize:'0.9rem', color: myRequest.status === 'accepted' ? 'var(--forest)' : myRequest.status === 'rejected' ? '#c62828' : '#e65100' }}>
                        {myRequest.status === 'accepted' ? '✅ Request Accepted!' : myRequest.status === 'rejected' ? '❌ Request Declined' : '⏳ Request Pending'}
                      </div>
                      <p style={{ fontSize:'0.8rem', color:'var(--slate)', marginTop:4 }}>
                        {myRequest.status === 'accepted' ? 'Congratulations! The poster has accepted your request.' : myRequest.status === 'rejected' ? 'Unfortunately, the poster has declined your request.' : 'Waiting for the poster to review your request.'}
                      </p>
                    </div>
                    {myRequest.chatRoomId && (
                      <Link to={`/chat/${myRequest.chatRoomId}`} className="btn-primary" style={{ width:'100%', justifyContent:'center', display:'flex' }}>
                        💬 Open Chat
                      </Link>
                    )}
                  </div>
                ) : (
                  <div>
                    <h4 style={{ marginBottom:12 }}>Interested in adopting?</h4>
                    <p style={{ fontSize:'0.875rem', color:'var(--slate)', marginBottom:16 }}>
                      Send a request and chat with the poster to learn more about {adoption.animalName}.
                    </p>
                    {user ? (
                      <button onClick={() => setShowRequestModal(true)} className="btn-primary" style={{ width:'100%', justifyContent:'center' }}>
                        🐾 Request to Adopt
                      </button>
                    ) : (
                      <Link to="/login" state={{ from: { pathname: `/adopt/${id}` } }} className="btn-primary" style={{ width:'100%', justifyContent:'center', display:'flex' }}>
                        Sign in to Request
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Owner: requests management */}
            {isOwner && adoption.requests?.length > 0 && (
              <div className="card" style={{ padding:24 }}>
                <h4 style={{ marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                  Adoption Requests
                  <span style={{ background:'var(--terracotta)', color:'white', borderRadius:'50%', width:22, height:22, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700 }}>
                    {adoption.requests.filter(r => r.status === 'pending').length}
                  </span>
                </h4>
                <div style={{ display:'flex', flexDirection:'column', gap:12, maxHeight:400, overflowY:'auto' }}>
                  {adoption.requests.map(req => (
                    <div key={req._id} style={{
                      padding:14, borderRadius:'var(--radius-md)', border:'1px solid var(--border)',
                      background: req.status === 'accepted' ? 'var(--forest-pale)' : req.status === 'rejected' ? '#ffebee' : 'var(--cream)',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--sand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                          {req.requester?.avatar ? <img src={req.requester.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : '👤'}
                        </div>
                        <div>
                          <div style={{ fontWeight:700, fontSize:'0.875rem' }}>{req.requester?.name}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--slate)' }}>{format(new Date(req.requestedAt), 'dd MMM')}</div>
                        </div>
                        <span style={{
                          marginLeft:'auto', fontSize:'0.7rem', fontWeight:700, padding:'2px 8px', borderRadius:50,
                          background: req.status === 'accepted' ? 'var(--forest)' : req.status === 'rejected' ? '#c62828' : '#e65100',
                          color:'white',
                        }}>{req.status}</span>
                      </div>
                      {req.message && <p style={{ fontSize:'0.8rem', color:'var(--slate)', marginBottom:10, fontStyle:'italic' }}>"{req.message}"</p>}
                      <div style={{ display:'flex', gap:8 }}>
                        {req.chatRoomId && (
                          <Link to={`/chat/${req.chatRoomId}`} style={{ flex:1, textAlign:'center', padding:'6px 0', background:'var(--midnight)', color:'white', borderRadius:6, fontSize:'0.8rem', fontWeight:600, textDecoration:'none' }}>
                            💬 Chat
                          </Link>
                        )}
                        {req.status === 'pending' && (
                          <>
                            <button onClick={() => handleRespond(req._id, 'accept')} style={{ flex:1, padding:'6px 0', background:'var(--forest)', color:'white', border:'none', borderRadius:6, fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
                              ✓ Accept
                            </button>
                            <button onClick={() => handleRespond(req._id, 'reject')} style={{ flex:1, padding:'6px 0', background:'#ffebee', color:'#c62828', border:'none', borderRadius:6, fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
                              ✗ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request modal */}
      {showRequestModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
          <div className="fade-in" style={{ background:'white', borderRadius:'var(--radius-xl)', padding:32, width:'100%', maxWidth:460, boxShadow:'var(--shadow-lg)' }}>
            <h3 style={{ marginBottom:8 }}>Request to Adopt {adoption.animalName}</h3>
            <p style={{ color:'var(--slate)', fontSize:'0.875rem', marginBottom:20 }}>
              Introduce yourself! Let the poster know why you'd be a great match.
            </p>
            <textarea className="form-control" value={requestMsg} onChange={e => setRequestMsg(e.target.value)}
              placeholder={`Hi! I'm interested in adopting ${adoption.animalName}. I have experience with ${adoption.species}s and...`}
              style={{ minHeight:120, marginBottom:20 }} />
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={() => setShowRequestModal(false)} className="btn-ghost" style={{ flex:1 }}>Cancel</button>
              <button onClick={handleAdoptRequest} className="btn-primary" disabled={requesting} style={{ flex:2, justifyContent:'center' }}>
                {requesting ? 'Sending...' : '🐾 Send Request & Open Chat'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .page-container > div > div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdoptionDetailPage;
