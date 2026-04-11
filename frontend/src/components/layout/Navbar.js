import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinks = [
    { path: '/adopt', label: 'Adopt', icon: '🐾' },
    { path: '/vet-care', label: 'Vet Care', icon: '🏥' },
  ];

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: scrolled ? 'rgba(253,246,236,0.97)' : 'var(--cream)',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div className="page-container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height: 68 }}>
        {/* Logo */}
        <Link to="/" style={{ display:'flex', alignItems:'center', gap: 10, textDecoration:'none' }}>
          <div style={{
            width: 40, height: 40,
            background: 'linear-gradient(135deg, var(--terracotta), var(--ochre))',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            boxShadow: '0 2px 8px rgba(196,99,58,0.3)',
          }}>🐾</div>
          <div>
            <span style={{ fontFamily:'Playfair Display, serif', fontWeight: 700, fontSize:'1.25rem', color: 'var(--charcoal)' }}>
              A World<span style={{ color: 'var(--terracotta)' }}> For Them</span>
            </span>
            <div style={{ fontSize:'0.65rem', color:'var(--slate)', letterSpacing:'0.08em', textTransform:'uppercase', marginTop:-2 }}>
              Find a Home · Give a Home
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display:'flex', alignItems:'center', gap: 6 }} className="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              padding: '8px 18px',
              borderRadius: 50,
              fontWeight: 600,
              fontSize: '0.9rem',
              color: isActive(link.path) ? 'var(--terracotta)' : 'var(--charcoal)',
              background: isActive(link.path) ? 'rgba(196,99,58,0.1)' : 'transparent',
              transition: 'var(--transition)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
              onMouseEnter={e => { if (!isActive(link.path)) e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; }}
              onMouseLeave={e => { if (!isActive(link.path)) e.currentTarget.style.background = 'transparent'; }}
            >
              <span>{link.icon}</span> {link.label}
            </Link>
          ))}

          {user ? (
            <div style={{ display:'flex', alignItems:'center', gap: 10, marginLeft: 8 }}>
              <Link to="/post-adoption" className="btn-primary" style={{ padding: '9px 20px', fontSize:'0.875rem' }}>
                + Post a Stray
              </Link>
              <div ref={dropdownRef} style={{ position:'relative' }}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
                  display:'flex', alignItems:'center', gap:8,
                  background: 'white', border:'2px solid var(--border)',
                  borderRadius: 50, padding:'6px 14px 6px 8px', cursor:'pointer',
                  transition:'var(--transition)',
                  boxShadow: dropdownOpen ? 'var(--shadow-sm)' : 'none',
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--terracotta), var(--ochre))',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color:'white', fontWeight:700, fontSize:'0.8rem',
                  }}>
                    {user.avatar ? <img src={user.avatar} alt="" style={{ width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover' }} />
                      : user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontSize:'0.875rem', fontWeight:600, maxWidth:90, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span style={{ fontSize:'0.6rem', color:'var(--slate)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition:'var(--transition)' }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position:'absolute', right:0, top:'calc(100% + 8px)',
                    background:'white', borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)', border:'1px solid var(--border)',
                    minWidth: 200, overflow:'hidden',
                    animation: 'fadeIn 0.15s ease',
                    zIndex: 100,
                  }}>
                    <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', background:'var(--cream)' }}>
                      <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{user.name}</div>
                      <div style={{ fontSize:'0.775rem', color:'var(--slate)', marginTop:2 }}>{user.email}</div>
                    </div>
                    {[
                      { path:'/dashboard', label:'My Dashboard', icon:'📊' },
                      { path:'/adopt', label:'Browse Adoptions', icon:'🐾' },
                      { path:'/vet-care', label:'Vet Care', icon:'🏥' },
                      ...(user.role === 'admin' ? [{ path:'/admin', label:'Admin Panel', icon:'🛡️' }] : []),
                    ].map(item => (
                      <Link key={item.path} to={item.path} style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'10px 16px', fontSize:'0.875rem', fontWeight:500,
                        color:'var(--charcoal)', transition:'var(--transition)',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--cream)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span>{item.icon}</span> {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop:'1px solid var(--border)' }}>
                      <button onClick={handleLogout} style={{
                        display:'flex', alignItems:'center', gap:10,
                        padding:'10px 16px', fontSize:'0.875rem', fontWeight:500,
                        color:'var(--terracotta)', background:'none', border:'none',
                        width:'100%', textAlign:'left', cursor:'pointer', transition:'var(--transition)',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span>🚪</span> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', gap:8, marginLeft:8 }}>
              <Link to="/login" className="btn-ghost" style={{ padding:'9px 20px', fontSize:'0.875rem' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ padding:'9px 20px', fontSize:'0.875rem' }}>Join Free</Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{
          display:'none', background:'none', border:'none',
          fontSize:'1.5rem', cursor:'pointer', padding:8,
        }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          background:'white', borderTop:'1px solid var(--border)',
          padding: 20, display:'flex', flexDirection:'column', gap:12,
        }} className="mobile-menu">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} style={{
              padding:'10px 16px', borderRadius:'var(--radius-sm)',
              fontWeight:600, color: isActive(link.path) ? 'var(--terracotta)' : 'var(--charcoal)',
              background: isActive(link.path) ? 'rgba(196,99,58,0.08)' : 'transparent',
            }}>
              {link.icon} {link.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" style={{ padding:'10px 16px', fontWeight:600 }}>📊 Dashboard</Link>
              <Link to="/post-adoption" className="btn-primary" style={{ textAlign:'center' }}>+ Post a Stray</Link>
              <button onClick={handleLogout} className="btn-secondary" style={{ textAlign:'center' }}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost" style={{ textAlign:'center' }}>Sign In</Link>
              <Link to="/register" className="btn-primary" style={{ textAlign:'center' }}>Join Free</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
