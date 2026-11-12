import React from 'react';

const RefurbishedCard = ({ product }) => {
  return (
    <div className="glass-panel refurbished-card">
      <div className="refurbished-badge" style={{ backgroundColor: product.gradeColor }}>
        {product.badge}
      </div>
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="refurbished-content">
        <div className="refurbished-meta">
          <span className="brand-tag">{product.brand}</span>
          <span className="grade-tag">{product.gradeLabel} (Grade {product.grade})</span>
        </div>
        <h3>{product.name}</h3>
        
        <div className="price-container">
          <div className="price-group">
            <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            <span className="discount-tag">-{product.discount}% OFF</span>
          </div>
          <div className="final-price">₹{product.refurbishedPrice.toLocaleString('en-IN')}</div>
        </div>

        <button 
          className="btn btn-buy" 
          style={{width: '100%', marginTop: '1.5rem'}}
          onClick={() => onBuy(product)}
        >
          Buy This {product.category.slice(0, -1)}
        </button>
      </div>
    </div>
  );
};

export default RefurbishedCard;
