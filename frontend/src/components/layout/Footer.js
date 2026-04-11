import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{
    background: 'var(--midnight)',
    color: '#ccc',
    padding: '48px 0 28px',
    marginTop: 'auto',
  }}>
    <div className="page-container">
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:40 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{
              width:36, height:36, background:'linear-gradient(135deg, var(--terracotta), var(--ochre))',
              borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            }}>🐾</div>
            <span style={{ fontFamily:'Playfair Display, serif', fontWeight:700, fontSize:'1.2rem', color:'white' }}>
              A World<span style={{ color:'var(--terracotta-light)' }}> For Them</span>
            </span>
          </div>
          <p style={{ fontSize:'0.875rem', lineHeight:1.7, maxWidth:260 }}>
            Connecting stray animals with loving homes. Every paw deserves a place to belong.
          </p>
          <div style={{ display:'flex', gap:12, marginTop:20 }}>
            {['🐦','📘','📷'].map((icon, i) => (
              <div key={i} style={{
                width:36, height:36, background:'rgba(255,255,255,0.08)',
                borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', transition:'var(--transition)', fontSize:16,
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(196,99,58,0.3)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              >{icon}</div>
            ))}
          </div>
        </div>

        {[
          { title:'Explore', links:[
            { to:'/adopt', label:'Find a Pet' },
            { to:'/post-adoption', label:'Post a Stray' },
            { to:'/vet-care', label:'Vet Care' },
            { to:'/dashboard', label:'Dashboard' },
          ]},
          { title:'Support', links:[
            { to:'/', label:'How It Works' },
            { to:'/', label:'Safety Tips' },
            { to:'/', label:'Success Stories' },
            { to:'/', label:'Contact Us' },
          ]},
          { title:'Legal', links:[
            { to:'/', label:'Privacy Policy' },
            { to:'/', label:'Terms of Service' },
            { to:'/', label:'Cookie Policy' },
          ]},
        ].map(col => (
          <div key={col.title}>
            <h4 style={{ color:'white', fontSize:'0.875rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:16, fontFamily:'DM Sans, sans-serif' }}>{col.title}</h4>
            <ul style={{ listStyle:'none', display:'flex', flexDirection:'column', gap:10 }}>
              {col.links.map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{ fontSize:'0.875rem', color:'#aaa', transition:'var(--transition)' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--terracotta-light)'}
                    onMouseLeave={e => e.currentTarget.style.color = '#aaa'}
                  >{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <p style={{ fontSize:'0.8rem', color:'#666' }}>
          © {new Date().getFullYear()} A World For Them. Made with ❤️ for animals everywhere.
        </p>
        <p style={{ fontSize:'0.8rem', color:'#555' }}>
          🐾 Every animal deserves a loving home
        </p>
      </div>
    </div>

    <style>{`
      @media (max-width: 768px) {
        footer > div > div:first-child > div:first-child {
          grid-template-columns: 1fr 1fr !important;
        }
      }
    `}</style>
  </footer>
);

export default Footer;
