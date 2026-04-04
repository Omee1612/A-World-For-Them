import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';

const HomePage = () => {
  const [stats, setStats] = useState({ available: 0, adopted: 0, appointments: 0 });
  const [recentAdoptions, setRecentAdoptions] = useState([]);

  useEffect(() => {
    api.get('/adoptions?limit=4').then(res => {
      setRecentAdoptions(res.data.adoptions || []);
      setStats(p => ({ ...p, available: res.data.pagination?.total || 0 }));
    }).catch(() => {});
  }, []);

  const features = [
    { icon:'🐾', title:'Post a Stray', desc:'Found a stray? Create a listing with photos and details to help them find a loving home.', color:'var(--terracotta)' },
    { icon:'❤️', title:'Request Adoption', desc:'Browse animals and send adoption requests. Chat directly with the poster to get to know the pet.', color:'var(--ochre)' },
    { icon:'🏥', title:'Vet Care', desc:'Schedule veterinary appointments for checkups, vaccinations, and specialized care.', color:'var(--forest)' },
    { icon:'💬', title:'Real-Time Chat', desc:'Communicate securely with adopters or posters through our built-in messaging system.', color:'#7b5ea7' },
  ];

  const testimonials = [
    { name:'Sarah K.', text:'Found my amazing cat Luna through StrayPaws. The process was so smooth!', avatar:'👩' },
    { name:'Rahul M.', text:'Posted about a stray dog I found and he got adopted within 3 days. Amazing platform!', avatar:'👨' },
    { name:'Nadia H.', text:'The vet booking feature is so convenient. My rescue cat got her first checkup easily.', avatar:'👩‍🦱' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--midnight) 0%, #2a1a0e 60%, #1a2e1a 100%)',
        padding: '80px 0 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        {['rgba(196,99,58,0.15)', 'rgba(61,107,79,0.12)', 'rgba(212,136,44,0.1)'].map((color, i) => (
          <div key={i} style={{
            position:'absolute',
            width: [500,350,200][i], height: [500,350,200][i],
            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
            borderRadius:'50%',
            top: ['-20%','40%','10%'][i], left: ['60%','-10%','30%'][i],
            pointerEvents:'none',
          }} />
        ))}

        <div className="page-container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
            <div className="fade-in">
              <div style={{
                display:'inline-flex', alignItems:'center', gap:8,
                background:'rgba(196,99,58,0.2)', border:'1px solid rgba(196,99,58,0.4)',
                borderRadius:50, padding:'6px 16px', marginBottom:24,
              }}>
                <span style={{ fontSize:'0.75rem', color:'var(--terracotta-light)', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  🐾 Bangladesh's Stray Animal Network
                </span>
              </div>

              <h1 style={{
                color:'white', fontSize:'clamp(2rem, 5vw, 3.25rem)',
                lineHeight:1.2, marginBottom:24,
              }}>
                Every Stray Deserves<br />
                <span style={{ color:'var(--terracotta-light)' }}>a Loving Home</span>
              </h1>

              <p style={{ color:'#b0a898', fontSize:'1.05rem', lineHeight:1.8, marginBottom:36, maxWidth:480 }}>
                Connect with compassionate people to rescue, rehome, and care for stray animals. 
                Post a stray, request adoption, or book vet appointments — all in one place.
              </p>

              <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
                <Link to="/adopt" className="btn-primary" style={{ padding:'14px 32px', fontSize:'1rem' }}>
                  🐾 Find a Pet
                </Link>
                <Link to="/post-adoption" className="btn-secondary" style={{ padding:'12px 28px', fontSize:'1rem', borderColor:'rgba(255,255,255,0.3)', color:'white' }}>
                  + Post a Stray
                </Link>
              </div>

              <div style={{ display:'flex', gap:32, marginTop:40 }}>
                {[
                  { value: stats.available || '50+', label:'Available Now' },
                  { value:'200+', label:'Adopted' },
                  { value:'100+', label:'Vet Bookings' },
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ fontSize:'1.75rem', fontWeight:800, color:'white', fontFamily:'Playfair Display, serif' }}>{stat.value}</div>
                    <div style={{ fontSize:'0.8rem', color:'#888', marginTop:2 }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero illustration */}
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center' }}>
              <div style={{
                width:320, height:320,
                background:'linear-gradient(135deg, rgba(196,99,58,0.2), rgba(61,107,79,0.2))',
                borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:120, border:'2px solid rgba(255,255,255,0.1)',
                boxShadow:'0 0 80px rgba(196,99,58,0.2)',
                animation:'float 3s ease-in-out infinite',
              }}>
                🐕
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding:'80px 0', background:'var(--warm-white)' }}>
        <div className="page-container">
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <h2 style={{ fontSize:'clamp(1.75rem, 4vw, 2.5rem)', marginBottom:12 }}>How StrayPaws Works</h2>
            <p style={{ color:'var(--slate)', fontSize:'1rem', maxWidth:520, margin:'0 auto' }}>
              A simple, secure platform designed to bring strays and humans together
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:24 }}>
            {features.map((f, i) => (
              <div key={i} className="card fade-in" style={{ padding:32, animationDelay:`${i * 0.1}s` }}>
                <div style={{
                  width:56, height:56, borderRadius:16,
                  background: `${f.color}18`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:26, marginBottom:20,
                  border: `1px solid ${f.color}30`,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize:'1.1rem', marginBottom:10 }}>{f.title}</h3>
                <p style={{ color:'var(--slate)', fontSize:'0.875rem', lineHeight:1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent adoptions */}
      {recentAdoptions.length > 0 && (
        <section style={{ padding:'80px 0' }}>
          <div className="page-container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:40, flexWrap:'wrap', gap:16 }}>
              <div>
                <h2 style={{ fontSize:'clamp(1.5rem, 3vw, 2rem)', marginBottom:6 }}>Recently Posted</h2>
                <p style={{ color:'var(--slate)', fontSize:'0.9rem' }}>Strays looking for their forever families</p>
              </div>
              <Link to="/adopt" className="btn-secondary">View All →</Link>
            </div>
            <div className="cards-grid">
              {recentAdoptions.slice(0, 4).map(a => (
                <Link key={a._id} to={`/adopt/${a._id}`} style={{ textDecoration:'none' }}>
                  <div className="card" style={{ cursor:'pointer' }}>
                    <div style={{
                      height:200, background:'linear-gradient(135deg, var(--sand), var(--cream))',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:60,
                      position:'relative', overflow:'hidden',
                    }}>
                      {a.photos?.[0]
                        ? <img src={a.photos[0]} alt={a.animalName} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        : { dog:'🐕', cat:'🐈', rabbit:'🐇', bird:'🐦' }[a.species] || '🐾'
                      }
                      {a.urgency !== 'normal' && (
                        <div style={{ position:'absolute', top:10, right:10 }}>
                          <span className={`badge badge-${a.urgency === 'critical' ? 'urgent' : 'pending'}`}>
                            {a.urgency === 'critical' ? '🚨 Critical' : '⚡ Urgent'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div style={{ padding:20 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:8 }}>
                        <h3 style={{ fontSize:'1.1rem' }}>{a.animalName}</h3>
                        <span className={`badge badge-${a.species}`}>{a.species}</span>
                      </div>
                      <p style={{ color:'var(--slate)', fontSize:'0.825rem', marginBottom:12 }}>
                        {a.breed} · {a.location?.city || 'Location not specified'}
                      </p>
                      <p style={{ color:'var(--charcoal)', fontSize:'0.875rem', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {a.description}
                      </p>
                      <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
                        {a.healthStatus?.vaccinated && <span style={{ fontSize:'0.75rem', color:'var(--forest)', background:'var(--forest-pale)', padding:'2px 8px', borderRadius:50 }}>✓ Vaccinated</span>}
                        {a.healthStatus?.neutered && <span style={{ fontSize:'0.75rem', color:'var(--forest)', background:'var(--forest-pale)', padding:'2px 8px', borderRadius:50 }}>✓ Neutered</span>}
                        <span style={{ fontSize:'0.75rem', color:'var(--slate)' }}>👀 {a.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section style={{ padding:'80px 0', background:'var(--midnight)' }}>
        <div className="page-container">
          <h2 style={{ textAlign:'center', color:'white', fontSize:'clamp(1.5rem, 3vw, 2rem)', marginBottom:48 }}>
            Stories That Warm Your Heart
          </h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:24 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{
                background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)',
                borderRadius:'var(--radius-lg)', padding:28,
              }}>
                <p style={{ color:'#ccc', fontSize:'0.9rem', lineHeight:1.7, marginBottom:20, fontStyle:'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(196,99,58,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{t.avatar}</div>
                  <div>
                    <div style={{ color:'white', fontWeight:600, fontSize:'0.875rem' }}>{t.name}</div>
                    <div style={{ color:'var(--terracotta-light)', fontSize:'0.75rem' }}>Happy Adopter ⭐⭐⭐⭐⭐</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:'80px 0', background:'linear-gradient(135deg, var(--terracotta), var(--ochre))' }}>
        <div className="page-container" style={{ textAlign:'center' }}>
          <div style={{ fontSize:56, marginBottom:20 }}>🐾</div>
          <h2 style={{ color:'white', fontSize:'clamp(1.75rem, 4vw, 2.5rem)', marginBottom:16 }}>Ready to Make a Difference?</h2>
          <p style={{ color:'rgba(255,255,255,0.85)', fontSize:'1.05rem', marginBottom:36, maxWidth:480, margin:'0 auto 36px' }}>
            Join thousands of caring individuals helping strays find their forever homes.
          </p>
          <div style={{ display:'flex', gap:16, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/register" style={{ background:'white', color:'var(--terracotta)', border:'none', padding:'14px 36px', borderRadius:50, fontWeight:700, fontSize:'1rem', textDecoration:'none', transition:'var(--transition)' }}>
              Get Started Free
            </Link>
            <Link to="/adopt" style={{ background:'transparent', color:'white', border:'2px solid rgba(255,255,255,0.7)', padding:'12px 32px', borderRadius:50, fontWeight:600, fontSize:'1rem', textDecoration:'none', transition:'var(--transition)' }}>
              Browse Animals
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        @media (max-width: 768px) {
          section > div > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
