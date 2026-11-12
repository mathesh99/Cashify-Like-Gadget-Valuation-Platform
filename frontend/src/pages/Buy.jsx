import React from 'react';
import { useShop } from '../context/ShopContext';
import CategoryHub from '../components/CategoryHub';
import RefurbishedCard from '../components/RefurbishedCard';
import SkeletonCard from '../components/SkeletonCard';

const Buy = () => {
  const { refurbishedProducts, productsData, selectedCategory, setSelectedCategory, loading, placeOrder, orderSuccess, setOrderSuccess } = useShop();

  const [buyingProduct, setBuyingProduct] = React.useState(null);
  const [checkoutForm, setCheckoutForm] = React.useState({ address: '', mobile: '' });

  const handleCheckout = async (e) => {
    e.preventDefault();
    await placeOrder({
      productId: buyingProduct.id,
      productName: buyingProduct.name,
      totalPrice: buyingProduct.refurbishedPrice,
      address: checkoutForm.address,
      mobile: checkoutForm.mobile
    });
  };

  if (orderSuccess) {
    return (
      <div className="section fade-in" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🎉</div>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Order Placed!</h1>
        <p className="subtitle">Our team will verify your request and contact you for delivery details.</p>
        <button className="btn" style={{ marginTop: '2rem' }} onClick={() => { setOrderSuccess(false); setBuyingProduct(null); }}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="fade-in section">
      <div className="buy-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>Premium Refurbished Store</h1>
        <p className="subtitle" style={{ maxWidth: '800px', margin: '0 auto' }}>
          Ecologically sustainable, professionally verified, and wallet-friendly.
          Get your favorite electronics at a fraction of the cost.
        </p>
      </div>

      {!buyingProduct ? (
        <>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
              {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ width: '120px', height: '45px', borderRadius: '50px' }}></div>)}
            </div>
          ) : (
            <CategoryHub
              categories={Object.keys(productsData)}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}

          <div className="refurbished-grid">
            {loading ? (
              [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
            ) : (
              refurbishedProducts
                .filter(p => p.category === selectedCategory)
                .map(product => (
                  <RefurbishedCard key={product.id} product={product} onBuy={setBuyingProduct} />
                ))
            )}
          </div>
        </>
      ) : (
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
          <button onClick={() => setBuyingProduct(null)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginBottom: '1rem' }}>← Back to Store</button>
          <h2 style={{ marginBottom: '2rem' }}>Complete Your Order</h2>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '15px' }}>
            <img src={buyingProduct.image} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            <div>
              <h4 style={{ margin: 0 }}>{buyingProduct.name}</h4>
              <p style={{ margin: '0.3rem 0', opacity: 0.6 }}>Grade {buyingProduct.grade} • {buyingProduct.brand}</p>
              <div style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '1.2rem' }}>₹{buyingProduct.refurbishedPrice.toLocaleString()}</div>
            </div>
          </div>

          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                className="form-input"
                rows="3"
                style={{ resize: 'none', fontFamily: 'inherit' }}
                placeholder="House No, Street, City, ZIP..."
                required
                value={checkoutForm.address}
                onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
              ></textarea>
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                className="form-input"
                type="tel"
                placeholder="Local Contact Number"
                required
                value={checkoutForm.mobile}
                onChange={e => setCheckoutForm({ ...checkoutForm, mobile: e.target.value })}
              />
            </div>
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Confirm Buy Request</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Buy;
