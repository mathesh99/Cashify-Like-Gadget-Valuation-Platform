import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
const Quote = () => {
  const navigate = useNavigate();
  const { 
    quote, 
    pickupForm, 
    setPickupForm, 
    scheduleSuccess, 
    schedulePickup 
  } = useShop();

  React.useEffect(() => {
    if (!quote) {
      navigate('/');
    }
  }, [quote, navigate]);

  if (!quote) return null;

  const handleHandleScheduleSubmit = (e) => {
    e.preventDefault();
    schedulePickup();
  };

  return (
    <div className="fade-in section">
      {!scheduleSuccess ? (
        <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Your Instant Value</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>For {quote.productName} ({quote.category})</p>
          <div className="quote-value">
            ₹{quote.predictedPrice.toLocaleString('en-IN')}
          </div>
          <p style={{ marginBottom: '3rem', color: 'var(--text-muted)' }}>Price includes free doorstep pickup & immediate bank transfer during handover.</p>
          
          <div className="pickup-form" style={{ textAlign: 'left', marginTop: '3rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Schedule Your Pickup</h3>
            <form onSubmit={handleHandleScheduleSubmit}>
              <div className="form-group">
                <label>Pickup Address</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter full address" 
                  required 
                  value={pickupForm.address}
                  onChange={(e) => setPickupForm({...pickupForm, address: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="e.g. 9876543210" 
                  required 
                  value={pickupForm.mobile}
                  onChange={(e) => setPickupForm({...pickupForm, mobile: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Preferred Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  required 
                  value={pickupForm.pickupDate}
                  onChange={(e) => setPickupForm({...pickupForm, pickupDate: e.target.value})}
                />
              </div>
              <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Confirm Pickup</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Pickup Scheduled!</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2rem' }}>
            Our agent will contact you on {pickupForm.mobile} to confirm the timing.
          </p>
          <button className="btn" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      )}
    </div>
  );
};

export default Quote;
