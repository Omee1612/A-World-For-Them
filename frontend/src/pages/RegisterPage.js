import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'', phone:'' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  if (authLoading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (user) return <Navigate to="/" replace />;

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Welcome to A world for them! 🐾');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      setErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return { score: 0, label: '', color: '' };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const colors = ['', '#ef5350', '#ffa726', '#66bb6a', '#26a69a', '#3d6b4f'];
    return { score, label: labels[score], color: colors[score] };
  };

  const strength = passwordStrength();

  return (
    <div style={{
      minHeight:'100vh', background:'var(--cream)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'40px 20px', position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:-120, left:-80, width:350, height:350, background:'radial-gradient(circle, rgba(61,107,79,0.1) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-80, right:-60, width:300, height:300, background:'radial-gradient(circle, rgba(196,99,58,0.1) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />

      <div className="fade-in" style={{ width:'100%', maxWidth:460 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:56, height:56, background:'linear-gradient(135deg, var(--forest), var(--forest-light))', borderRadius:16, margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow:'0 4px 16px rgba(61,107,79,0.3)' }}>🐾</div>
          <h1 style={{ fontSize:'1.75rem', marginBottom:6 }}>Join A world for them</h1>
          <p style={{ color:'var(--slate)', fontSize:'0.9rem' }}>Help stray animals find their forever home</p>
        </div>

        <div style={{ background:'white', borderRadius:'var(--radius-xl)', padding:36, boxShadow:'var(--shadow-lg)', border:'1px solid var(--border)' }}>
          {errors.general && (
            <div style={{ background:'#fff5f5', border:'1px solid #ffcdd2', borderRadius:'var(--radius-sm)', padding:'10px 14px', color:'#c62828', fontSize:'0.875rem', marginBottom:20 }}>
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div className="form-group" style={{ gridColumn:'1 / -1' }}>
                <label>Full Name</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}>👤</span>
                  <input name="name" type="text" className="form-control" style={{ paddingLeft:42, borderColor: errors.name ? '#ef5350' : undefined }}
                    placeholder="Your full name" value={form.name} onChange={handleChange} autoComplete="name" />
                </div>
                {errors.name && <span style={{ color:'#ef5350', fontSize:'0.8rem' }}>{errors.name}</span>}
              </div>

              <div className="form-group" style={{ gridColumn:'1 / -1' }}>
                <label>Email Address</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}>📧</span>
                  <input name="email" type="email" className="form-control" style={{ paddingLeft:42, borderColor: errors.email ? '#ef5350' : undefined }}
                    placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" />
                </div>
                {errors.email && <span style={{ color:'#ef5350', fontSize:'0.8rem' }}>{errors.email}</span>}
              </div>

              <div className="form-group">
                <label>Password</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}>🔒</span>
                  <input name="password" type={showPassword ? 'text' : 'password'} className="form-control"
                    style={{ paddingLeft:42, paddingRight:44, borderColor: errors.password ? '#ef5350' : undefined }}
                    placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'var(--slate)' }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop:6 }}>
                    <div style={{ display:'flex', gap:3, marginBottom:4 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= strength.score ? strength.color : '#e0e0e0', transition:'var(--transition)' }} />
                      ))}
                    </div>
                    <span style={{ fontSize:'0.75rem', color: strength.color, fontWeight:600 }}>{strength.label}</span>
                  </div>
                )}
                {errors.password && <span style={{ color:'#ef5350', fontSize:'0.8rem' }}>{errors.password}</span>}
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}>✅</span>
                  <input name="confirmPassword" type={showPassword ? 'text' : 'password'} className="form-control"
                    style={{ paddingLeft:42, borderColor: errors.confirmPassword ? '#ef5350' : undefined }}
                    placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
                </div>
                {errors.confirmPassword && <span style={{ color:'#ef5350', fontSize:'0.8rem' }}>{errors.confirmPassword}</span>}
              </div>

              <div className="form-group" style={{ gridColumn:'1 / -1' }}>
                <label>Phone Number <span style={{ color:'var(--slate)', fontWeight:400 }}>(optional)</span></label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }}>📱</span>
                  <input name="phone" type="tel" className="form-control" style={{ paddingLeft:42 }}
                    placeholder="+880 1XXX-XXXXXX" value={form.phone} onChange={handleChange} />
                </div>
              </div>
            </div>

            <p style={{ fontSize:'0.78rem', color:'var(--slate)', lineHeight:1.6 }}>
              By joining, you agree to our <span style={{ color:'var(--terracotta)', cursor:'pointer' }}>Terms of Service</span> and <span style={{ color:'var(--terracotta)', cursor:'pointer' }}>Privacy Policy</span>.
            </p>

            <button type="submit" className="btn-forest" disabled={loading} style={{
              width:'100%', justifyContent:'center', padding:'14px', fontSize:'1rem',
              opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? (
                <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Creating account...</>
              ) : 'Create My Account 🐾'}
            </button>
          </form>

          <div style={{ textAlign:'center', marginTop:24, paddingTop:24, borderTop:'1px solid var(--border)' }}>
            <p style={{ fontSize:'0.875rem', color:'var(--slate)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color:'var(--terracotta)', fontWeight:700 }}>Sign in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
