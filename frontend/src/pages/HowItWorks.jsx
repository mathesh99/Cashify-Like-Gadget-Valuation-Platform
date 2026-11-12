import React from 'react';

const HowItWorks = () => {
  return (
    <div className="fade-in section text-center">
      <h1>How Cell Master Pro Works</h1>
      <p className="subtitle">Trading your old tech is faster and more profitable than ever before.</p>
      
      <div className="how-it-works-grid">
        <div className="glass-panel step-card">
          <div className="step-number">1</div>
          <h3>Select Device</h3>
          <p style={{color: 'var(--text-muted)'}}>Search our immense catalog for your mobile phone, laptop, or earbuds.</p>
        </div>
        <div className="glass-panel step-card">
          <div className="step-number">2</div>
          <h3>Evaluate Condition</h3>
          <p style={{color: 'var(--text-muted)'}}>Answer our straightforward AI-backed quiz to get your true market quote.</p>
        </div>
        <div className="glass-panel step-card">
          <div className="step-number">3</div>
          <h3>Handover & Earn</h3>
          <p style={{color: 'var(--text-muted)'}}>Our agent evaluates your device at your doorstep and transfers cash instantly.</p>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
