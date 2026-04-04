import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={from} replace />;
  }

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🐾');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--cream)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position:'absolute', top:-100, right:-100, width:400, height:400, background:'radial-gradient(circle, rgba(196,99,58,0.1) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-80, left:-80, width:300, height:300, background:'radial-gradient(circle, rgba(61,107,79,0.08) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div className="fade-in" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width:56, height:56, background:'linear-gradient(135deg, var(--terracotta), var(--ochre))', borderRadius:16, margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 4px 16px rgba(196,99,58,0.3)' }}>🐾</div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 6 }}>Welcome Back</h1>
          <p style={{ color: 'var(--slate)', fontSize: '0.9rem' }}>Sign in to your A world for them account</p>
        </div>

        <div style={{ background:'white', borderRadius:'var(--radius-xl)', padding:36, boxShadow:'var(--shadow-lg)', border:'1px solid var(--border)' }}>
          {errors.general && (
            <div style={{ background:'#fff5f5', border:'1px solid #ffcdd2', borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'#c62828', fontSize:'0.875rem', marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>📧</span>
                <input
                  id="email" name="email" type="email"
                  className="form-control"
                  style={{ paddingLeft: 42, borderColor: errors.email ? '#ef5350' : undefined }}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span style={{ color:'#ef5350', fontSize:'0.8rem' }}>{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:'1rem' }}>🔒</span>
                <input
                  id="password" name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: 42, paddingRight: 44, borderColor: errors.password ? '#ef5350' : undefined }}
                  placeholder="Your password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'var(--slate)', padding:4 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span style={{ color:'#ef5350', fontSize:'0.8rem' }}>{errors.password}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'1rem', marginTop:4, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? (
                <>
                  <div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                  Signing in...
                </>
              ) : 'Sign In 🐾'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:24, paddingTop:24, borderTop:'1px solid var(--border)' }}>
            <p style={{ fontSize:'0.875rem', color:'var(--slate)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color:'var(--terracotta)', fontWeight:700 }}>Create one free →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
