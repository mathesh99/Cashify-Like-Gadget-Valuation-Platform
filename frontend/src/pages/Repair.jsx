import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Repair = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/repair-services');
      if (res.ok) setServices(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '10rem', color: '#fff'}}>Loading Services...</div>;

  return (
    <div className="section fade-in" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Premium Repair Services</h1>
      <p style={{ opacity: 0.7, fontSize: '1.2rem', marginBottom: '4rem', maxWidth: '700px', margin: '0 auto 4rem' }}>
        Get your device fixed by certified professionals using original-grade parts. Book your repair in seconds.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {services.map(s => (
          <div key={s.id} className="glass-panel" style={{ padding: '2.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{s.icon}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{s.name}</h3>
              <p style={{ opacity: 0.6, fontSize: '0.95rem', marginBottom: '1.5rem', minHeight: '60px' }}>{s.description}</p>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Starting from</span>
                  <div style={{ fontWeight: 800, color: 'var(--accent)' }}>₹{s.basePrice}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Estimated Time</span>
                  <div style={{ fontWeight: 800 }}>{s.time}</div>
                </div>
              </div>
            </div>
            
            <button className="btn" style={{ width: '100%' }} onClick={() => navigate('/partner')}>
              Book This Service
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Repair;
