import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

const SERVICES = {
  'general-checkup':     { name:'General Checkup', icon:'🩺', duration:'30 min', fee:500 },
  'vaccination':         { name:'Vaccination', icon:'💉', duration:'20 min', fee:800 },
  'neutering-spaying':   { name:'Neutering/Spaying', icon:'✂️', duration:'2 hrs', fee:3500 },
  'dental-care':         { name:'Dental Care', icon:'🦷', duration:'1 hr', fee:1500 },
  'emergency':           { name:'Emergency Care', icon:'🚨', duration:'1 hr', fee:2000 },
  'microchipping':       { name:'Microchipping', icon:'📡', duration:'15 min', fee:600 },
  'deworming':           { name:'Deworming', icon:'💊', duration:'15 min', fee:400 },
  'skin-treatment':      { name:'Skin Treatment', icon:'🧴', duration:'45 min', fee:1200 },
  'nutrition-consult':   { name:'Nutrition Consult', icon:'🥗', duration:'30 min', fee:700 },
  'post-adoption-checkup':{ name:'Post-Adoption Checkup', icon:'🐾', duration:'30 min', fee:400 },
};

const VetCarePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('book');
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    animalName:'', species:'dog', breed:'', serviceType:'general-checkup',
    appointmentDate:'', timeSlot:'', notes:'', isStray:false,
    age: { value:1, unit:'years' },
  });

  useEffect(() => {
    if (user && tab === 'appointments') {
      api.get('/vet/my-appointments').then(res => setAppointments(res.data.appointments)).catch(() => {});
    }
  }, [user, tab]);

  useEffect(() => {
    if (form.appointmentDate) {
      setLoadingSlots(true);
      api.get(`/vet/available-slots?date=${form.appointmentDate}`)
        .then(res => setAvailableSlots(res.data.slots))
        .catch(() => setAvailableSlots([]))
        .finally(() => setLoadingSlots(false));
    }
  }, [form.appointmentDate]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    if (!form.animalName || !form.serviceType || !form.appointmentDate || !form.timeSlot) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      await api.post('/vet/book', form);
      toast.success('Appointment booked! 🏥');
      setTab('appointments');
      setForm({ animalName:'', species:'dog', breed:'', serviceType:'general-checkup', appointmentDate:'', timeSlot:'', notes:'', isStray:false, age:{ value:1, unit:'years' } });
      const res = await api.get('/vet/my-appointments');
      setAppointments(res.data.appointments);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.put(`/vet/${id}/cancel`);
      toast.success('Appointment cancelled');
      setAppointments(p => p.map(a => a._id === id ? { ...a, status:'cancelled' } : a));
    } catch {
      toast.error('Failed to cancel');
    }
  };

  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const statusColor = (s) => ({
    scheduled:'#e65100', confirmed:'var(--forest)', completed:'#1565c0', cancelled:'#757575',
  }[s] || 'var(--slate)');

  return (
    <div style={{ minHeight:'100vh', background:'var(--cream)', paddingBottom:60 }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg, #1a2e1a, #0d1f1d)', padding:'48px 0 56px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, width:300, height:300, background:'radial-gradient(circle, rgba(61,107,79,0.3) 0%, transparent 70%)', borderRadius:'50%', pointerEvents:'none' }} />
        <div className="page-container" style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
            <div style={{ width:56, height:56, background:'var(--forest)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🏥</div>
            <div>
              <h1 style={{ color:'white', fontSize:'clamp(1.75rem, 4vw, 2.5rem)' }}>Veterinary Care</h1>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.9rem' }}>Professional healthcare for your rescued companions</p>
            </div>
          </div>

          <div style={{ display:'flex', gap:8, marginTop:24 }}>
            {[
              { key:'book', label:'📅 Book Appointment' },
              { key:'appointments', label:'📋 My Appointments' },
            ].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); if (t.key==='appointments' && user) {} }} style={{
                padding:'10px 22px', borderRadius:50, border:'none', cursor:'pointer', fontWeight:600, fontSize:'0.9rem', transition:'var(--transition)',
                background: tab === t.key ? 'var(--forest)' : 'rgba(255,255,255,0.1)',
                color: tab === t.key ? 'white' : 'rgba(255,255,255,0.7)',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container" style={{ paddingTop:36 }}>
        {tab === 'book' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:32, alignItems:'start' }}>
            <div className="card fade-in" style={{ padding:32 }}>
              <h3 style={{ marginBottom:24 }}>Book an Appointment</h3>

              {/* Service picker */}
              <div style={{ marginBottom:24 }}>
                <label style={{ fontWeight:600, fontSize:'0.875rem', display:'block', marginBottom:12 }}>Select Service *</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:10 }}>
                  {Object.entries(SERVICES).map(([key, svc]) => (
                    <button key={key} type="button" onClick={() => set('serviceType', key)} style={{
                      padding:'12px', borderRadius:'var(--radius-sm)', border:'2px solid', cursor:'pointer', transition:'var(--transition)',
                      borderColor: form.serviceType === key ? 'var(--forest)' : 'var(--border)',
                      background: form.serviceType === key ? 'var(--forest-pale)' : 'white',
                      textAlign:'left',
                    }}>
                      <div style={{ fontSize:'1.25rem', marginBottom:4 }}>{svc.icon}</div>
                      <div style={{ fontWeight:700, fontSize:'0.82rem', color: form.serviceType === key ? 'var(--forest)' : 'var(--charcoal)' }}>{svc.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--slate)', marginTop:2 }}>
                        {svc.duration} · ৳{svc.fee}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label>Animal's Name *</label>
                  <input className="form-control" placeholder="Your pet's name" value={form.animalName} onChange={e => set('animalName', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Species *</label>
                  <select className="form-control" value={form.species} onChange={e => set('species', e.target.value)}>
                    {['dog','cat','rabbit','bird','other'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Breed</label>
                  <input className="form-control" placeholder="Mixed, Unknown..." value={form.breed} onChange={e => set('breed', e.target.value)} />
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <div style={{ display:'flex', gap:8 }}>
                    <input type="number" className="form-control" min={0} value={form.age.value} onChange={e => setForm(p => ({ ...p, age: { ...p.age, value: +e.target.value } }))} style={{ flex:1 }} />
                    <select className="form-control" value={form.age.unit} onChange={e => setForm(p => ({ ...p, age: { ...p.age, unit: e.target.value } }))} style={{ flex:1 }}>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input type="date" className="form-control" min={minDate} value={form.appointmentDate} onChange={e => { set('appointmentDate', e.target.value); set('timeSlot', ''); }} />
                </div>

                <div className="form-group">
                  <label>Time Slot *</label>
                  {loadingSlots ? (
                    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 16px', border:'2px solid var(--border)', borderRadius:'var(--radius-sm)' }}>
                      <div style={{ width:16, height:16, border:'2px solid var(--sand)', borderTopColor:'var(--terracotta)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                      <span style={{ fontSize:'0.875rem', color:'var(--slate)' }}>Loading slots...</span>
                    </div>
                  ) : !form.appointmentDate ? (
                    <div style={{ padding:'10px 16px', border:'2px solid var(--border)', borderRadius:'var(--radius-sm)', color:'var(--slate)', fontSize:'0.875rem' }}>
                      Select a date first
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div style={{ padding:'10px 16px', border:'2px solid #ffcdd2', borderRadius:'var(--radius-sm)', color:'#c62828', fontSize:'0.875rem' }}>
                      No slots available on this date
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {availableSlots.map(slot => (
                        <button key={slot} type="button" onClick={() => set('timeSlot', slot)} style={{
                          padding:'7px 14px', borderRadius:8, border:'2px solid', cursor:'pointer', fontSize:'0.85rem', fontWeight:600, transition:'var(--transition)',
                          borderColor: form.timeSlot === slot ? 'var(--forest)' : 'var(--border)',
                          background: form.timeSlot === slot ? 'var(--forest-pale)' : 'white',
                          color: form.timeSlot === slot ? 'var(--forest)' : 'var(--charcoal)',
                        }}>
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label>Additional Notes</label>
                  <textarea className="form-control" rows={3} placeholder="Any symptoms, medical history, or special concerns..." value={form.notes} onChange={e => set('notes', e.target.value)} />
                </div>

                <div style={{ gridColumn:'1/-1', display:'flex', alignItems:'center', gap:10 }}>
                  <input type="checkbox" id="isStray" checked={form.isStray} onChange={e => set('isStray', e.target.checked)} style={{ width:18, height:18, accentColor:'var(--terracotta)', cursor:'pointer' }} />
                  <label htmlFor="isStray" style={{ fontSize:'0.875rem', fontWeight:500, cursor:'pointer' }}>
                    This is a rescued stray animal <span style={{ color:'var(--terracotta)' }}>(may qualify for reduced fees)</span>
                  </label>
                </div>
              </div>

              <button onClick={handleBook} className="btn-forest" disabled={loading} style={{ marginTop:20, padding:'14px 36px', fontSize:'1rem' }}>
                {loading ? <><div style={{ width:18, height:18, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} /> Booking...</> : '📅 Confirm Appointment'}
              </button>
            </div>

            {/* Info sidebar */}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {form.serviceType && (
                <div className="card" style={{ padding:24, border:'2px solid var(--forest)', background:'var(--forest-pale)' }}>
                  <h4 style={{ color:'var(--forest)', marginBottom:12 }}>Selected Service</h4>
                  <div style={{ fontSize:32, marginBottom:8 }}>{SERVICES[form.serviceType].icon}</div>
                  <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:4 }}>{SERVICES[form.serviceType].name}</div>
                  <div style={{ color:'var(--slate)', fontSize:'0.875rem', marginBottom:12 }}>Duration: {SERVICES[form.serviceType].duration}</div>
                  <div style={{ fontSize:'1.5rem', fontWeight:800, color:'var(--forest)' }}>৳{SERVICES[form.serviceType].fee.toLocaleString()}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--slate)', marginTop:4 }}>Estimated fee</div>
                </div>
              )}

              <div className="card" style={{ padding:24 }}>
                <h4 style={{ marginBottom:16 }}>Our Veterinarians</h4>
                {[
                  { name:'Dr. Anika Rahman', spec:'General Practice', emoji:'👩‍⚕️' },
                  { name:'Dr. Sharif Hossain', spec:'Surgery', emoji:'👨‍⚕️' },
                  { name:'Dr. Priya Das', spec:'Exotic Animals', emoji:'👩‍⚕️' },
                ].map(v => (
                  <div key={v.name} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--forest-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>{v.emoji}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{v.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--slate)' }}>{v.spec}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ padding:24, background:'#fff8e1', border:'1px solid #ffe082' }}>
                <h4 style={{ marginBottom:8, color:'#e65100' }}>📍 Clinic Info</h4>
                <p style={{ fontSize:'0.875rem', color:'var(--charcoal)', lineHeight:1.7 }}>
                  <strong>A World For Them Vet Center</strong><br />
                  Road 4, Dhanmondi<br />
                  Dhaka 1205, Bangladesh<br />
                  📞 +880 1700-000000<br />
                  ⏰ Sun–Thu: 9am–5pm<br />
                  Fri–Sat: 10am–3pm
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === 'appointments' && (
          <div className="fade-in">
            <h3 style={{ marginBottom:24 }}>My Appointments</h3>
            {!user ? (
              <div style={{ textAlign:'center', padding:60 }}>
                <p>Please <a href="/login" style={{ color:'var(--terracotta)' }}>sign in</a> to view appointments</p>
              </div>
            ) : appointments.length === 0 ? (
              <div style={{ textAlign:'center', padding:60 }}>
                <div style={{ fontSize:56, marginBottom:16 }}>📅</div>
                <h3 style={{ marginBottom:8 }}>No appointments yet</h3>
                <p style={{ color:'var(--slate)', marginBottom:20 }}>Book your first vet appointment to get started</p>
                <button onClick={() => setTab('book')} className="btn-forest">Book Appointment</button>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {appointments.map(appt => (
                  <div key={appt._id} className="card" style={{ padding:24, display:'flex', justifyContent:'space-between', alignItems:'start', flexWrap:'wrap', gap:16 }}>
                    <div style={{ display:'flex', gap:16, alignItems:'start' }}>
                      <div style={{ width:52, height:52, borderRadius:14, background:'var(--forest-pale)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                        {SERVICES[appt.serviceType]?.icon || '🏥'}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'1.05rem', marginBottom:4 }}>
                          {SERVICES[appt.serviceType]?.name || appt.serviceType}
                        </div>
                        <div style={{ color:'var(--slate)', fontSize:'0.875rem', marginBottom:6 }}>
                          🐾 {appt.animalName} · {appt.species} · {appt.breed}
                        </div>
                        <div style={{ fontSize:'0.875rem', display:'flex', gap:16, flexWrap:'wrap' }}>
                          <span>📅 {format(new Date(appt.appointmentDate), 'dd MMM yyyy')}</span>
                          <span>🕐 {appt.timeSlot}</span>
                          <span>👩‍⚕️ {appt.vet}</span>
                        </div>
                        {appt.notes && <p style={{ marginTop:8, fontSize:'0.8rem', color:'var(--slate)', fontStyle:'italic' }}>{appt.notes}</p>}
                      </div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                      <span style={{
                        padding:'4px 14px', borderRadius:50, fontSize:'0.8rem', fontWeight:700,
                        background: statusColor(appt.status) + '18',
                        color: statusColor(appt.status),
                        border: `1px solid ${statusColor(appt.status)}40`,
                      }}>
                        {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      </span>
                      <div style={{ fontWeight:700, color:'var(--forest)' }}>৳{appt.fee?.toLocaleString()}</div>
                      {appt.status === 'scheduled' && (
                        <button onClick={() => handleCancel(appt._id)} style={{ background:'#ffebee', color:'#c62828', border:'none', padding:'6px 14px', borderRadius:6, cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .page-container > div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VetCarePage;
