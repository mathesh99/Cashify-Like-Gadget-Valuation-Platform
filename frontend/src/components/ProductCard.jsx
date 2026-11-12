import React from 'react';

const ProductCard = ({ product, brand, onSelect }) => {
  return (
    <div className="glass-panel product-card" onClick={() => onSelect(product)}>
      <img src={product.image} alt={product.name} className="product-image" />
      <h3 style={{ margin: '1rem 0 0' }}>{brand}</h3>
      <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0' }}>{product.name}</p>
      <div style={{color: 'var(--accent)', fontWeight: 600}}>Sell Now ➔</div>
    </div>
  );
};

export default ProductCard;
