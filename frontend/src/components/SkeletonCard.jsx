import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="glass-panel product-card" style={{ cursor: 'default' }}>
      <div className="skeleton" style={{ height: '180px', width: '100%', marginBottom: '1.5rem', borderRadius: '15px' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '70%', height: '1.5rem' }}></div>
      <div className="skeleton skeleton-text" style={{ width: '40%', height: '1rem' }}></div>
    </div>
  );
};

export default SkeletonCard;
