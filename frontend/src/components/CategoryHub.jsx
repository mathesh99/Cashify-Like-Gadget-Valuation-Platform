import React from 'react';

const CategoryHub = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="category-hub">
      {categories.map(cat => (
        <button 
          key={cat} 
          className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat === 'Mobiles' && '📱'}
          {cat === 'Laptops' && '💻'}
          {cat === 'Earbuds' && '🎧'}
          {cat === 'Accessories' && '⌚'} {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryHub;
