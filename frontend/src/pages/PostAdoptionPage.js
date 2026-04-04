import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PERSONALITY_OPTIONS = ['friendly','playful','calm','energetic','shy','protective','good-with-kids','good-with-pets','indoor','outdoor'];

const PostAdoptionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    animalName:'', species:'dog', breed:'', gender:'unknown', size:'medium',
    color:'', description:'',
    age: { value:1, unit:'years' },
    location: { city:'', area:'' },
    healthStatus: { vaccinated:false, neutered:false, microchipped:false, conditions:[] },
    personality:[],
    photos:[], urgency:'normal',
  });

  const set = (key, value) => setForm(p => ({ ...p, [key]: value }));
  const setNested = (parent, key, value) => setForm(p => ({ ...p, [parent]: { ...p[parent], [key]: value } }));

  const togglePersonality = (trait) => {
    setForm(p => ({
      ...p,
      personality: p.personality.includes(trait) ? p.personality.filter(t => t !== trait) : [...p.personality, trait],
    }));
  };

  const handlePhotoUrl = (e) => {
    const url = e.target.value.trim();
    if (url && !form.photos.includes(url)) {
      setForm(p => ({ ...p, photos: [...p.photos, url] }));
      e.target.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!form.animalName.trim()) { toast.error('Please enter animal name'); return; }
    if (!form.description.trim() || form.description.length < 20) { toast.error('Description too short (min 20 characters)'); return; }

    setLoading(true);
    try {
      const res = await api.post('/adoptions', form);
      toast.success('Adoption post created! 🎉');
      navigate(`/adopt/${res.data.adoption._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num:1, label:'Basic Info', icon:'📋' },
    { num:2, label:'Health & Traits', icon:'💊' },
    { num:3, label:'Photos & Publish', icon:'📸' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', paddingBottom:60 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, var(--forest), #2a5e3a)', padding:'40px 0' }}>
        <div className="page-container">
          <h1 style={{ color:'white', fontSize:'2rem', marginBottom:6 }}>Post a Stray Animal</h1>
          <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.95rem' }}>
            Help a stray find their forever home by creating a detailed listing
          </p>
        </div>
      </div>

      <div className="page-container" style={{ maxWidth:720, paddingTop:36 }}>
        {/* Step indicator */}
        <div style={{ display:'flex', gap:0, marginBottom:36, background:'white', borderRadius:'var(--radius-lg)', padding:6, border:'1px solid var(--border)' }}>
          {steps.map((s, i) => (
            <button key={s.num} onClick={() => setStep(s.num)} style={{
              flex:1, padding:'10px 0', borderRadius:'var(--radius-md)', border:'none', cursor:'pointer',
              background: step === s.num ? 'var(--terracotta)' : 'transparent',
              color: step === s.num ? 'white' : 'var(--slate)',
              fontWeight:600, fontSize:'0.875rem', transition:'var(--transition)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding:36 }}>
          {step === 1 && (
            <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <h3 style={{ marginBottom:4 }}>About the Animal</h3>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label>Animal's Name *</label>
                  <input className="form-control" placeholder="e.g., Bruno, Mittens..." value={form.animalName} onChange={e => set('animalName', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Species *</label>
                  <select className="form-control" value={form.species} onChange={e => set('species', e.target.value)}>
                    {['dog','cat','rabbit','bird','other'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Breed</label>
                  <input className="form-control" placeholder="Mixed breed, unknown..." value={form.breed} onChange={e => set('breed', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Size</label>
                  <select className="form-control" value={form.size} onChange={e => set('size', e.target.value)}>
                    {['tiny','small','medium','large','extra-large'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <div style={{ display:'flex', gap:8 }}>
                    <input type="number" className="form-control" min={0} value={form.age.value} onChange={e => setNested('age','value', +e.target.value)} style={{ flex:1 }} />
                    <select className="form-control" value={form.age.unit} onChange={e => setNested('age','unit', e.target.value)} style={{ flex:1 }}>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Color / Markings</label>
                  <input className="form-control" placeholder="e.g., brown with white spots" value={form.color} onChange={e => set('color', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input className="form-control" placeholder="e.g., Dhaka" value={form.location.city} onChange={e => setNested('location','city', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Area / Neighborhood</label>
                  <input className="form-control" placeholder="e.g., Dhanmondi" value={form.location.area} onChange={e => setNested('location','area', e.target.value)} />
                </div>

                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label>Urgency Level</label>
                  <div style={{ display:'flex', gap:10 }}>
                    {[
                      { val:'normal', label:'Normal', desc:'Stable situation', color:'var(--forest)' },
                      { val:'urgent', label:'Urgent', desc:'Needs help soon', color:'#e65100' },
                      { val:'critical', label:'Critical', desc:'Immediate help needed', color:'#c62828' },
                    ].map(u => (
                      <button key={u.val} type="button" onClick={() => set('urgency', u.val)} style={{
                        flex:1, padding:'10px 12px', borderRadius:'var(--radius-sm)', border:'2px solid',
                        borderColor: form.urgency === u.val ? u.color : 'var(--border)',
                        background: form.urgency === u.val ? `${u.color}12` : 'white',
                        cursor:'pointer', transition:'var(--transition)',
                      }}>
                        <div style={{ fontWeight:700, fontSize:'0.85rem', color: form.urgency === u.val ? u.color : 'var(--charcoal)' }}>{u.label}</div>
                        <div style={{ fontSize:'0.72rem', color:'var(--slate)' }}>{u.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label>Description * <span style={{ color:'var(--slate)', fontWeight:400 }}>(min. 20 characters)</span></label>
                  <textarea className="form-control" rows={5} placeholder={`Describe ${form.animalName || 'the animal'}. Include how you found them, their behavior, any special needs...`}
                    value={form.description} onChange={e => set('description', e.target.value)} />
                  <span style={{ fontSize:'0.75rem', color: form.description.length < 20 ? '#ef5350' : 'var(--slate)' }}>{form.description.length}/1000 characters</span>
                </div>
              </div>

              <button onClick={() => setStep(2)} className="btn-primary" style={{ alignSelf:'flex-end', padding:'12px 32px' }}>
                Next: Health & Traits →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:24 }}>
              <h3>Health & Personality</h3>

              <div>
                <label style={{ fontWeight:600, fontSize:'0.875rem', display:'block', marginBottom:12 }}>Health Status</label>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {[
                    { key:'vaccinated', label:'Vaccinated', icon:'💉' },
                    { key:'neutered', label:'Neutered/Spayed', icon:'✂️' },
                    { key:'microchipped', label:'Microchipped', icon:'📡' },
                  ].map(h => (
                    <button key={h.key} type="button" onClick={() => setNested('healthStatus', h.key, !form.healthStatus[h.key])} style={{
                      padding:'10px 18px', borderRadius:'var(--radius-sm)', border:'2px solid', cursor:'pointer', transition:'var(--transition)',
                      borderColor: form.healthStatus[h.key] ? 'var(--forest)' : 'var(--border)',
                      background: form.healthStatus[h.key] ? 'var(--forest-pale)' : 'white',
                      color: form.healthStatus[h.key] ? 'var(--forest)' : 'var(--charcoal)',
                      fontWeight:600, fontSize:'0.875rem', display:'flex', alignItems:'center', gap:8,
                    }}>
                      {h.icon} {h.label} {form.healthStatus[h.key] ? '✓' : ''}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontWeight:600, fontSize:'0.875rem', display:'block', marginBottom:12 }}>
                  Personality Traits <span style={{ color:'var(--slate)', fontWeight:400 }}>(select all that apply)</span>
                </label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {PERSONALITY_OPTIONS.map(trait => (
                    <button key={trait} type="button" onClick={() => togglePersonality(trait)} style={{
                      padding:'7px 16px', borderRadius:50, border:'2px solid', cursor:'pointer', transition:'var(--transition)',
                      borderColor: form.personality.includes(trait) ? 'var(--terracotta)' : 'var(--border)',
                      background: form.personality.includes(trait) ? 'rgba(196,99,58,0.1)' : 'white',
                      color: form.personality.includes(trait) ? 'var(--terracotta)' : 'var(--charcoal)',
                      fontWeight:600, fontSize:'0.85rem',
                    }}>
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <button onClick={() => setStep(1)} className="btn-ghost">← Back</button>
                <button onClick={() => setStep(3)} className="btn-primary" style={{ padding:'12px 32px' }}>
                  Next: Photos & Publish →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in" style={{ display:'flex', flexDirection:'column', gap:24 }}>
              <h3>Photos & Publish</h3>

              <div className="form-group">
                <label>Add Photo URLs</label>
                <p style={{ fontSize:'0.8rem', color:'var(--slate)', marginBottom:10 }}>
                  Paste image URLs (from Imgur, Google Drive, etc.) to add photos
                </p>
                <div style={{ display:'flex', gap:8 }}>
                  <input id="photoInput" className="form-control" placeholder="https://..." />
                  <button type="button" onClick={() => handlePhotoUrl({ target: document.getElementById('photoInput') })} className="btn-forest" style={{ whiteSpace:'nowrap', padding:'10px 20px' }}>
                    Add Photo
                  </button>
                </div>
                {form.photos.length > 0 && (
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:12 }}>
                    {form.photos.map((url, i) => (
                      <div key={i} style={{ position:'relative' }}>
                        <img src={url} alt="" style={{ width:80, height:80, objectFit:'cover', borderRadius:8, border:'2px solid var(--border)' }} />
                        <button onClick={() => setForm(p => ({ ...p, photos: p.photos.filter((_, j) => j !== i) }))} style={{
                          position:'absolute', top:-6, right:-6, width:20, height:20,
                          background:'#c62828', color:'white', border:'none', borderRadius:'50%',
                          fontSize:'0.7rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div style={{ background:'var(--cream)', borderRadius:'var(--radius-md)', padding:20 }}>
                <h4 style={{ marginBottom:12, fontSize:'0.9rem' }}>Post Summary</h4>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:'0.875rem' }}>
                  {[
                    { label:'Name', value: form.animalName || '—' },
                    { label:'Species', value: form.species },
                    { label:'Gender', value: form.gender },
                    { label:'Size', value: form.size },
                    { label:'Location', value: form.location.city || '—' },
                    { label:'Urgency', value: form.urgency },
                  ].map(item => (
                    <div key={item.label}>
                      <span style={{ color:'var(--slate)' }}>{item.label}: </span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <button onClick={() => setStep(2)} className="btn-ghost">← Back</button>
                <button onClick={handleSubmit} className="btn-primary" disabled={loading} style={{ padding:'12px 36px' }}>
                  {loading ? (
                    <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Publishing...</>
                  ) : '🚀 Publish Adoption Post'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostAdoptionPage;
