import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const SPECIES = ['all', 'dog', 'cat', 'rabbit', 'bird', 'other'];
const SPECIES_ICONS = { dog:'🐕', cat:'🐈', rabbit:'🐇', bird:'🐦', other:'🐾', all:'🐾' };

const AdoptionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adoptions, setAdoptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ species:'all', search:'', city:'' });
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 });

  const fetchAdoptions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (filters.species !== 'all') params.append('species', filters.species);
      if (filters.search) params.append('search', filters.search);
      if (filters.city) params.append('city', filters.city);

      const res = await api.get(`/adoptions?${params}`);
      setAdoptions(res.data.adoptions);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAdoptions(1), 300);
    return () => clearTimeout(timer);
  }, [filters, fetchAdoptions]);

  const urgencyColor = (u) => ({ critical:'#c62828', urgent:'#e65100', normal:'var(--forest)' }[u]);
  const statusBadge = (s) => ({ available:'badge-available', pending:'badge-pending', adopted:'badge-adopted' }[s] || 'badge-available');

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', paddingBottom:60 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, var(--midnight), #2a1a0e)', padding:'48px 0 56px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, width:300, height:300, background:'radial-gradient(circle, rgba(196,99,58,0.2) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
        <div className="page-container" style={{ position:'relative', zIndex:1 }}>
          <h1 style={{ color:'white', fontSize:'clamp(1.75rem, 4vw, 2.75rem)', marginBottom:12 }}>Find Your Companion</h1>
          <p style={{ color:'#b0a898', fontSize:'1rem', marginBottom:28 }}>
            {pagination.total > 0 ? `${pagination.total} animals looking for homes` : 'Browse animals waiting for a loving home'}
          </p>

          {/* Search */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', maxWidth:700 }}>
            <div style={{ flex:1, minWidth:200, position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>🔍</span>
              <input className="form-control" style={{ paddingLeft:42, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'white', borderRadius:50 }}
                placeholder="Search by name, breed..."
                value={filters.search}
                onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
              />
            </div>
            <div style={{ flex:1, minWidth:160, position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}>📍</span>
              <input className="form-control" style={{ paddingLeft:42, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'white', borderRadius:50 }}
                placeholder="City / Area"
                value={filters.city}
                onChange={e => setFilters(p => ({ ...p, city: e.target.value }))}
              />
            </div>
            {user && (
              <Link to="/post-adoption" className="btn-primary" style={{ whiteSpace:'nowrap', padding:'12px 24px' }}>
                + Post a Stray
              </Link>
            )}
          </div>

          {/* Species filter */}
          <div style={{ display:'flex', gap:8, marginTop:20, flexWrap:'wrap' }}>
            {SPECIES.map(s => (
              <button key={s} onClick={() => setFilters(p => ({ ...p, species: s }))} style={{
                padding:'7px 18px', borderRadius:50, border:'none', cursor:'pointer',
                fontWeight:600, fontSize:'0.85rem', transition:'var(--transition)',
                background: filters.species === s ? 'var(--terracotta)' : 'rgba(255,255,255,0.12)',
                color: filters.species === s ? 'white' : '#ccc',
                display:'flex', alignItems:'center', gap:6,
              }}>
                {SPECIES_ICONS[s]} {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container" style={{ marginTop:36 }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
            <div className="spinner" />
          </div>
        ) : adoptions.length === 0 ? (
          <div style={{ textAlign:'center', padding:80 }}>
            <div style={{ fontSize:64, marginBottom:20 }}>🔍</div>
            <h3 style={{ marginBottom:12 }}>No animals found</h3>
            <p style={{ color:'var(--slate)' }}>Try adjusting your filters or{' '}
              {user ? <Link to="/post-adoption" style={{ color:'var(--terracotta)' }}>post a stray you've found</Link>
                : <Link to="/register" style={{ color:'var(--terracotta)' }}>join to post a stray</Link>}
            </p>
          </div>
        ) : (
          <>
            <div className="cards-grid">
              {adoptions.map((a, i) => (
                <Link key={a._id} to={`/adopt/${a._id}`} style={{ textDecoration:'none' }}>
                  <div className="card fade-in" style={{ cursor:'pointer', animationDelay:`${i * 0.05}s` }}>
                    <div style={{ height:200, background:'linear-gradient(135deg, var(--sand), var(--cream))', position:'relative', overflow:'hidden' }}>
                      {a.photos?.[0]
                        ? <img src={a.photos[0]} alt={a.animalName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:72 }}>
                            {SPECIES_ICONS[a.species]}
                          </div>
                      }
                      <div style={{ position:'absolute', top:10, left:10, display:'flex', gap:6 }}>
                        <span className={`badge ${statusBadge(a.status)}`}>{a.status}</span>
                      </div>
                      {a.urgency !== 'normal' && (
                        <div style={{ position:'absolute', top:10, right:10 }}>
                          <span style={{ background: urgencyColor(a.urgency), color:'white', fontSize:'0.7rem', fontWeight:700, padding:'3px 10px', borderRadius:50, textTransform:'uppercase' }}>
                            {a.urgency === 'critical' ? '🚨 Critical' : '⚡ Urgent'}
                          </span>
                        </div>
                      )}
                      <div style={{ position:'absolute', bottom:10, right:10, background:'rgba(0,0,0,0.5)', borderRadius:50, padding:'2px 8px', fontSize:'0.75rem', color:'white' }}>
                        👀 {a.views || 0}
                      </div>
                    </div>

                    <div style={{ padding:20 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:6 }}>
                        <h3 style={{ fontSize:'1.1rem', color:'var(--charcoal)' }}>{a.animalName}</h3>
                        <span className={`badge badge-${a.species}`}>{SPECIES_ICONS[a.species]} {a.species}</span>
                      </div>
                      <p style={{ color:'var(--slate)', fontSize:'0.8rem', marginBottom:10 }}>
                        {a.breed !== 'Unknown' && `${a.breed} · `}
                        {a.age?.value && `${a.age.value} ${a.age.unit} · `}
                        {a.gender} · {a.location?.city || 'Location TBD'}
                      </p>
                      <p style={{ color:'var(--charcoal)', fontSize:'0.875rem', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', marginBottom:12 }}>
                        {a.description}
                      </p>

                      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                        {a.healthStatus?.vaccinated && <span style={{ fontSize:'0.72rem', color:'var(--forest)', background:'var(--forest-pale)', padding:'2px 8px', borderRadius:50 }}>✓ Vaccinated</span>}
                        {a.healthStatus?.neutered && <span style={{ fontSize:'0.72rem', color:'var(--forest)', background:'var(--forest-pale)', padding:'2px 8px', borderRadius:50 }}>✓ Neutered</span>}
                        {a.personality?.slice(0,2).map(p => (
                          <span key={p} style={{ fontSize:'0.72rem', color:'#6b4f3a', background:'#f5e6d3', padding:'2px 8px', borderRadius:50 }}>{p}</span>
                        ))}
                      </div>

                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:'1px solid var(--border)', paddingTop:12 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--sand)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>
                            {a.poster?.avatar ? <img src={a.poster.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} /> : '👤'}
                          </div>
                          <span style={{ fontSize:'0.8rem', color:'var(--slate)' }}>{a.poster?.name || 'Anonymous'}</span>
                        </div>
                        <span style={{ fontSize:'0.72rem', color:'var(--slate)' }}>
                          {a.requests?.length || 0} request{a.requests?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:40 }}>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => fetchAdoptions(p)} style={{
                    width:38, height:38, borderRadius:8, border:'2px solid',
                    borderColor: p === pagination.page ? 'var(--terracotta)' : 'var(--border)',
                    background: p === pagination.page ? 'var(--terracotta)' : 'white',
                    color: p === pagination.page ? 'white' : 'var(--charcoal)',
                    fontWeight:600, cursor:'pointer', transition:'var(--transition)',
                  }}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdoptionPage;
