import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import CategoryHub from '../components/CategoryHub';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

const Home = () => {
  const navigate = useNavigate();
  const { 
    productsData, 
    selectedCategory, 
    setSelectedCategory, 
    handleProductSelect, 
    searchQuery, 
    setSearchQuery,
    filteredProducts,
    loading 
  } = useShop();

  const [brands, setBrands] = useState([
    { name: 'Apple', logoType: 'icon', logoValue: 'apple', accentColor: 'rgba(255,255,255,0.2)' },
    { name: 'Samsung', logoType: 'text', logoValue: 'SAMSUNG', accentColor: 'rgba(20, 40, 160, 0.4)' },
    { name: 'Google', logoType: 'icon', logoValue: 'google', accentColor: 'rgba(52, 168, 83, 0.4)' },
    { name: 'OnePlus', logoType: 'text', logoValue: 'ONEPLUS', accentColor: 'rgba(245, 1, 0, 0.4)' }
  ]);
  const [content, setContent] = useState({
    hero_title: 'Turn Your Old Electronics Into Instant Cash',
    hero_subtitle: 'From MacBooks and iPhones to AirPods and Smartwatches, get the highest market value for your premium devices in less than 60 seconds.',
    banner_cta: 'Sell Your Device Now'
  });

  const onProductClick = (product) => {
    handleProductSelect(product);
    navigate('/quiz');
  };

  const categories = Object.keys(productsData);
  const displayProducts = searchQuery ? filteredProducts : (productsData[selectedCategory] || {});

  const BrandLogo = ({ brand }) => {
    if (brand.logoType === 'icon') {
        return <span style={{fontSize: '2.5rem', lineHeight: 1}}>{brand.logoValue === 'apple' ? '🍎' : brand.logoValue === 'google' ? '🌐' : '📱'}</span>;
    }
    return <span className="brand-wordmark" style={{fontSize: '1.4rem'}}>{brand.logoValue}</span>;
  };

  return (
    <div className="fade-in">
      <section className="hero">
        <h1 style={{fontSize: '3.5rem', margin: '0 0 1.5rem 0'}}>{content.hero_title}</h1>
        <p style={{fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto 3rem', opacity: 0.8}}>{content.hero_subtitle}</p>
        

      </section>

      {/* DYNAMIC BRANDS MARQUEE */}
      {brands.length > 0 && (
        <section className="brands-section">
           <div className="brands-track-outer">
             <div className="brands-track">
               {[...brands, ...brands, ...brands, ...brands].map((b, i) => (
                 <div key={i} className="brand-chip" style={{ '--baccent': b.accentColor }}>
                   <div className="brand-chip-logo">
                     <BrandLogo brand={b} />
                   </div>
                   <span className="brand-chip-name">{b.name}</span>
                 </div>
               ))}
             </div>
           </div>
        </section>
      )}

      <section id="sell-section" className="section" style={{ paddingTop: '2rem' }}>
        {!searchQuery && (
          <>
            <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>What would you like to sell?</h3>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ width: '120px', height: '45px', borderRadius: '50px' }}></div>)}
              </div>
            ) : (
              <CategoryHub categories={categories} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
            )}
          </>
        )}

        <div className="product-grid">
          {loading ? (
            [1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)
          ) : (
            Object.keys(displayProducts).length > 0 ? (
              Object.entries(displayProducts).map(([brand, models]) => (
                models.map(product => (
                  <ProductCard key={product.id} product={product} brand={brand} onSelect={onProductClick} />
                ))
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '5rem 0', gridColumn: '1 / -1' }}>
                <h3>No products found</h3>
                <button onClick={() => setSearchQuery('')} className="btn" style={{ marginTop: '1rem' }}>Clear Search</button>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
