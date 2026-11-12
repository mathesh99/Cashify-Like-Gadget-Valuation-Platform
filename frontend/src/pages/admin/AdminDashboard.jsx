import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_API = `http://${window.location.hostname}:3000/api/admin`;
const CATS = ['Mobiles', 'Laptops', 'Earbuds', 'Accessories'];
const CAT_EMOJI = { Mobiles: '📱', Laptops: '💻', Earbuds: '🎧', Accessories: '⌚' };

// ── Tiny reusable pieces ──────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${color}` }}>
      <div style={{ ...s.statIcon, background: color + '20', color }}>{icon}</div>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.type === 'success';
  return (
    <div style={{ ...s.toast, background: ok ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)' }}>
      {ok ? '✓' : '✕'}  {toast.message}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [pickups, setPickups] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const [siteLogoPreview, setSiteLogoPreview] = useState('');
  const [siteLogoFile, setSiteLogoFile] = useState(null);
  const siteLogoRef = useRef();

  // Brand form
  const [brandForm, setBrandForm] = useState({ name: '', accentColor: '#8b5cf6' });
  const [brandImg, setBrandImg] = useState(null);
  const [brandImgPreview, setBrandImgPreview] = useState(null);
  const brandFileRef = useRef();

  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [editBrandForm, setEditBrandForm] = useState({ name: '', accentColor: '#8b5cf6' });
  const [editBrandImg, setEditBrandImg] = useState(null);
  const [editBrandImgPreview, setEditBrandImgPreview] = useState(null);
  const editBrandFileRef = useRef();

  // Product form / modal
  const [showModal, setShowModal] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [prodForm, setProdForm] = useState({ name: '', category: 'Mobiles', brand: '', basePrice: '', ramList: '', storageList: '', variantList: '' });
  const [prodImg, setProdImg] = useState(null);
  const [prodImgPreview, setProdImgPreview] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('adminToken');
  const ah = { Authorization: `Bearer ${token}` };
  const jh = { ...ah, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!token) { navigate('/admin'); return; }
    loadAll();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const apiFetch = async (url, opts = {}) => {
    const res = await fetch(url, opts);
    if (res.status === 401 || res.status === 403) {
      if (window.location.pathname !== '/admin') navigate('/admin');
    }
    return res;
  };

  const loadSettings = async () => {
    try {
      const r = await fetch(`http://${window.location.hostname}:3000/api/settings`);
      if (r.ok) {
        const data = await r.json();
        if (data.companyLogo) setSiteLogoPreview(`http://${window.location.hostname}:3000${data.companyLogo}`);
      }
    } catch { }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadBrands(), loadProducts(), loadPickups(), loadRepairs(), loadCustomers(), loadReviews(), loadSettings()]);
    setLoading(false);
  };

  const loadPickups = async () => {
    try {
      const r = await apiFetch(`${ADMIN_API}/pickups`, { headers: ah });
      if (r?.ok) setPickups(await r.json());
    } catch { }
  };

  const loadRepairs = async () => {
    try {
      const r = await apiFetch(`${ADMIN_API}/repairs`, { headers: ah });
      if (r?.ok) setRepairs(await r.json());
    } catch { }
  };

  const updateRepairStatus = async (id, status) => {
    try {
      const r = await apiFetch(`${ADMIN_API}/repairs/${id}/status`, {
        method: 'PUT',
        headers: jh,
        body: JSON.stringify({ status })
      });
      if (r?.ok) {
        setRepairs(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        showToast('success', `Status updated to ${status}`);
      } else {
        const d = await r.json();
        showToast('error', d.error || 'Failed to update status');
      }
    } catch { showToast('error', 'Network error'); }
  };

  const loadCustomers = async () => {
    try {
      const r = await apiFetch(`${ADMIN_API}/customers`, { headers: ah });
      if (r?.ok) setCustomers(await r.json());
    } catch { }
  };

  const loadReviews = async () => {
    try {
      const r = await apiFetch(`${ADMIN_API}/reviews`, { headers: ah });
      if (r?.ok) setReviews(await r.json());
    } catch { }
  };

  const deleteReview = async (id) => {
    try {
      const r = await apiFetch(`${ADMIN_API}/reviews/${id}`, { method: 'DELETE', headers: ah });
      if (r?.ok) {
        setReviews(prev => prev.filter(rv => rv.id !== id));
        showToast('success', 'Review deleted');
      } else {
        const d = await r.json();
        showToast('error', d.error || 'Failed to delete review');
      }
    } catch { showToast('error', 'Network error'); }
  };

  const handleSiteLogoUpload = async () => {
    if (!siteLogoFile) return showToast('error', 'Please select an image first.');
    const formData = new FormData();
    formData.append('isSetting', 'true');
    formData.append('logo', siteLogoFile);
    try {
      const r = await apiFetch(`${ADMIN_API}/settings/logo`, { method: 'POST', headers: ah, body: formData });
      if (r?.ok) {
        showToast('success', 'Site logo updated successfully!');
        setSiteLogoFile(null);
        loadSettings();
      } else {
        const data = await r.json();
        showToast('error', data.error || 'Failed to update logo');
      }
    } catch { showToast('error', 'Connection failed'); }
  };

  const handleSiteLogoDelete = async () => {
    try {
      const r = await apiFetch(`${ADMIN_API}/settings/logo`, { method: 'DELETE', headers: ah });
      if (r?.ok) {
        showToast('success', 'Site logo removed successfully!');
        setSiteLogoPreview('');
        setSiteLogoFile(null);
        loadSettings();
      } else {
        const data = await r.json();
        showToast('error', data.error || 'Failed to remove logo');
      }
    } catch { showToast('error', 'Connection failed'); }
  };

  const updatePickupStatus = async (id, status) => {
    try {
      const r = await apiFetch(`${ADMIN_API}/pickups/${id}/status`, {
        method: 'PUT',
        headers: jh,
        body: JSON.stringify({ status })
      });
      if (r?.ok) {
        setPickups(prev => prev.map(p => p.id === id ? { ...p, status } : p));
        showToast('success', `Status updated to ${status}`);
      } else {
        const d = await r.json();
        showToast('error', d.error || 'Failed to update status');
      }
    } catch { showToast('error', 'Network error'); }
  };

  const loadStats = async () => {
    try {
      const r = await apiFetch(`${ADMIN_API}/stats`, { headers: ah });
      if (r?.ok) setStats(await r.json());
    } catch { }
  };

  const loadBrands = async () => {
    try {
      const r = await apiFetch(`${ADMIN_API}/brands`, { headers: ah });
      if (r?.ok) setBrands(await r.json());
    } catch { }
  };

  const loadProducts = async () => {
    try {
      const r = await apiFetch(`${ADMIN_API}/products`, { headers: ah });
      if (r?.ok) setProducts(await r.json());
    } catch { }
  };

  // ── Brand handlers ──────────────────────────────────────────
  const addBrand = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', brandForm.name);
    fd.append('accentColor', brandForm.accentColor);
    if (brandImg) fd.append('image', brandImg);

    try {
      const r = await apiFetch(`${ADMIN_API}/brands`, { method: 'POST', headers: ah, body: fd });
      const d = await r.json();
      if (r.ok) {
        setBrands(prev => [...prev, d].sort((a, b) => a.name.localeCompare(b.name)));
        setBrandForm({ name: '', accentColor: '#8b5cf6' });
        setBrandImg(null);
        setBrandImgPreview(null);
        setStats(st => st ? { ...st, totalBrands: st.totalBrands + 1 } : st);
        showToast('success', `Brand "${d.name}" added!`);
      } else showToast('error', d.error);
    } catch { showToast('error', 'Failed to add brand'); }
  };

  const openEditBrandModal = (b) => {
    setEditBrand(b);
    setEditBrandForm({ name: b.name, accentColor: b.accentColor });
    setEditBrandImg(null);
    setEditBrandImgPreview(b.logoPath || null);
    setShowBrandModal(true);
  };

  const closeBrandModal = () => {
    setShowBrandModal(false);
    setEditBrand(null);
  };

  const updateBrand = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', editBrandForm.name);
    fd.append('accentColor', editBrandForm.accentColor);
    if (editBrandImg) fd.append('image', editBrandImg);

    try {
      const r = await apiFetch(`${ADMIN_API}/brands/${editBrand.id}`, { method: 'PUT', headers: ah, body: fd });
      if (!r) throw new Error('Network error: No response from server');

      let d;
      const text = await r.text();
      try {
        d = JSON.parse(text);
      } catch (e) {
        console.error('[Admin] Non-JSON response:', text);
        throw new Error(`Server error: Invalid response (Status ${r.status})`);
      }

      if (r.ok) {
        setBrands(prev => prev.map(b => b.id === d.id ? d : b).sort((a, b) => a.name.localeCompare(b.name)));
        showToast('success', 'Brand updated!');
        closeBrandModal();
      } else {
        showToast('error', d.error || `Update failed (Error ${r.status})`);
      }
    } catch (err) {
      console.error('[Admin] Brand update exception:', err);
      showToast('error', err.message || 'Failed to update brand');
    }
  };

  const deleteBrand = async (id, name) => {
    try {
      const r = await apiFetch(`${ADMIN_API}/brands/${id}`, { method: 'DELETE', headers: ah });
      if (r?.ok) {
        setBrands(prev => prev.filter(b => b.id !== id));
        setStats(st => st ? { ...st, totalBrands: Math.max(0, st.totalBrands - 1) } : st);
        showToast('success', 'Brand deleted');
      }
    } catch { showToast('error', 'Failed to delete'); }
  };

  // ── Product handlers ────────────────────────────────────────
  const onImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setProdImg(f);
    const reader = new FileReader();
    reader.onload = ev => setProdImgPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const openAddModal = () => {
    setEditProd(null);
    setProdForm({ name: '', category: 'Mobiles', brand: '', basePrice: '', ramList: '', storageList: '', variantList: '' });
    setProdImg(null); setProdImgPreview(null);
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditProd(p);
    setProdForm({ name: p.name, category: p.category, brand: p.brand, basePrice: p.basePrice, ramList: p.ramGB || '', storageList: p.storageGB || '', variantList: p.watchVariant || '' });
    setProdImg(null);
    setProdImgPreview(p.imageUrl || null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditProd(null); };

  const saveProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', prodForm.name);
    fd.append('category', prodForm.category);
    fd.append('brand', prodForm.brand);
    fd.append('basePrice', prodForm.basePrice);
    fd.append('ramGB', prodForm.ramList); 
    fd.append('storageGB', prodForm.storageList);
    fd.append('watchVariant', prodForm.variantList);
    if (prodImg) fd.append('image', prodImg);
    const url = editProd ? `${ADMIN_API}/products/${editProd.id}` : `${ADMIN_API}/products`;
    const method = editProd ? 'PUT' : 'POST';
    try {
      const r = await apiFetch(url, { method, headers: ah, body: fd });
      const d = await r.json();
      if (r.ok) {
        if (editProd) {
          setProducts(prev => prev.map(p => p.id === d.id ? d : p));
          showToast('success', 'Product updated!');
        } else {
          setProducts(prev => [...prev, d]);
          setStats(st => st ? { ...st, totalProducts: st.totalProducts + 1 } : st);
          showToast('success', `"${d.name}" added!`);
        }
        closeModal();
      } else showToast('error', d.error);
    } catch { showToast('error', 'Failed to save product'); }
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      const r = await apiFetch(`${ADMIN_API}/products/${id}`, { method: 'DELETE', headers: ah });
      if (r?.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
        setStats(st => st ? { ...st, totalProducts: Math.max(0, st.totalProducts - 1) } : st);
        showToast('success', 'Product deleted');
      }
    } catch { showToast('error', 'Failed to delete'); }
  };

  const filteredProducts = products
    .filter(p => filterCat === 'all' || p.category === filterCat)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));

  // ── Render ──────────────────────────────────────────────────
  return (
    <div style={s.root}>
      <Toast toast={toast} />

      {/* Brand Edit Modal */}
      {showBrandModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeBrandModal()}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>✏️ Edit Brand</h2>
              <button style={s.closeBtn} onClick={closeBrandModal}>✕</button>
            </div>

            <div style={s.uploadZone} onClick={() => editBrandFileRef.current.click()}>
              {editBrandImgPreview
                ? <img src={editBrandImgPreview} alt="preview" style={s.imgPreview} />
                : <div style={s.uploadPH}>📸 Click to upload logo</div>
              }
            </div>
            <input ref={editBrandFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
              const f = e.target.files[0];
              if (f) {
                setEditBrandImg(f);
                const reader = new FileReader();
                reader.onload = ev => setEditBrandImgPreview(ev.target.result);
                reader.readAsDataURL(f);
              }
            }} />

            <form onSubmit={updateBrand}>
              <div style={s.fg}>
                <label style={s.lbl}>Brand Name</label>
                <input style={s.inp} value={editBrandForm.name} onChange={e => setEditBrandForm({ ...editBrandForm, name: e.target.value })} required />
              </div>
              <div style={s.fg}>
                <label style={s.lbl}>Accent Color</label>
                <div style={s.colorRow}>
                  <input type="color" style={s.colorPicker} value={editBrandForm.accentColor} onChange={e => setEditBrandForm({ ...editBrandForm, accentColor: e.target.value })} />
                  <input style={{ ...s.inp, flex: 1 }} value={editBrandForm.accentColor} onChange={e => setEditBrandForm({ ...editBrandForm, accentColor: e.target.value })} />
                </div>
              </div>
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={closeBrandModal}>Cancel</button>
                <button type="submit" style={s.primaryBtn}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editProd ? '✏️ Edit Product' : '➕ New Product'}</h2>
              <button style={s.closeBtn} onClick={closeModal}>✕</button>
            </div>

            {/* Image upload zone */}
            <div style={s.uploadZone} onClick={() => fileRef.current.click()}>
              {prodImgPreview
                ? <img src={prodImgPreview} alt="preview" style={s.imgPreview} onError={e => e.target.style.display = 'none'} />
                : <div style={s.uploadPH}><span style={{ fontSize: '2.5rem' }}>📸</span><span style={{ color: '#71717a', marginTop: '0.5rem' }}>Click to upload image</span><span style={{ color: '#52525b', fontSize: '0.8rem' }}>PNG, JPG – up to 5 MB</span></div>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onImageChange} />

            <form onSubmit={saveProduct}>
              <div style={s.grid2}>
                <div style={s.fg}>
                  <label style={s.lbl}>Product Name *</label>
                  <input style={s.inp} placeholder="e.g. iPhone 16 Pro" value={prodForm.name} onChange={e => setProdForm({ ...prodForm, name: e.target.value })} required />
                </div>
                <div style={s.fg}>
                  <label style={s.lbl}>Brand *</label>
                  <input style={s.inp} placeholder="e.g. Apple" list="bl" value={prodForm.brand} onChange={e => setProdForm({ ...prodForm, brand: e.target.value })} required />
                  <datalist id="bl">{brands.map(b => <option key={b.id} value={b.name} />)}</datalist>
                </div>
                <div style={s.fg}>
                  <label style={s.lbl}>Category *</label>
                  <select style={s.inp} value={prodForm.category} onChange={e => setProdForm({ ...prodForm, category: e.target.value, ramGB: '', watchVariant: '' })}>
                    <option value="" style={{ background: '#ffffff', color: '#0f172a' }}>Select Category</option>
                    {CATS.map(c => <option key={c} value={c} style={{ background: '#ffffff', color: '#0f172a' }}>{CAT_EMOJI[c]} {c}</option>)}
                  </select>
                </div>
                <div style={s.fg}>
                  <label style={s.lbl}>Base Price (₹) *</label>
                  <input style={s.inp} type="number" placeholder="e.g. 84999" min="1" value={prodForm.basePrice} onChange={e => setProdForm({ ...prodForm, basePrice: e.target.value })} required />
                </div>
                {prodForm.category === 'Laptops' && (
                  <div style={{ ...s.fg, gridColumn: '1 / -1' }}>
                    <label style={s.lbl}>Available RAM Options (Comma separated) *</label>
                    <input style={s.inp} placeholder="e.g. 8, 16, 32" value={prodForm.ramList} onChange={e => setProdForm({ ...prodForm, ramList: e.target.value })} />
                  </div>
                )}
                {(prodForm.category === 'Mobiles' || prodForm.category === 'Laptops') && (
                  <div style={{ ...s.fg, gridColumn: '1 / -1' }}>
                    <label style={s.lbl}>Available Storage Options (Comma separated) *</label>
                    <input style={s.inp} placeholder="e.g. 64, 128, 256, 512" value={prodForm.storageList} onChange={e => setProdForm({ ...prodForm, storageList: e.target.value })} />
                  </div>
                )}
                {prodForm.category === 'Accessories' && (
                  <div style={{ ...s.fg, gridColumn: '1 / -1' }}>
                    <label style={s.lbl}>Available Connectivity/Variants (Comma separated) *</label>
                    <input style={s.inp} placeholder="e.g. Bluetooth, GPS, GPS + Cellular" value={prodForm.variantList} onChange={e => setProdForm({ ...prodForm, variantList: e.target.value })} />
                  </div>
                )}
              </div>
              <div style={s.modalActions}>
                <button type="button" style={s.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" style={s.primaryBtn}>{editProd ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoIcon}>⚡</div>
          <div>
            <div style={s.logoText}>Cell Master Pro</div>
            <div style={s.logoSub}>Admin Panel</div>
          </div>
        </div>

        <nav style={s.nav}>
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'requests', icon: '📩', label: 'Sell Requests' },
            { id: 'repairs', icon: '🛠️', label: 'Repair Requests' },
            { id: 'customers', icon: '👥', label: 'Customers' },
            { id: 'brands', icon: '🏷️', label: 'Brands' },
            { id: 'products', icon: '📱', label: 'Products' },
            { id: 'reviews', icon: '⭐', label: 'Reviews' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map(item => (
            <button key={item.id} style={{ ...s.navBtn, ...(tab === item.id ? s.navBtnActive : {}) }} onClick={() => setTab(item.id)}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div style={s.sidebarFoot}>
          <div style={s.onlineDot} />
          <span style={{ color: '#52525b', fontSize: '0.78rem' }}>admin@cellmasterpro.com</span>
          <button style={s.logoutBtn} onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin'); }}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={s.main}>
        <div style={s.topbar}>
          <div>
            <h1 style={s.pageH}>
              {tab === 'overview' ? '📊 Overview' : tab === 'requests' ? '📩 Sell Requests' : tab === 'repairs' ? '🛠️ Repair Requests' : tab === 'customers' ? '👥 Customer Directory' : tab === 'brands' ? '🏷️ Brand Management' : tab === 'reviews' ? '⭐ Customer Reviews' : tab === 'settings' ? '⚙️ Global Settings' : '📱 Product Management'}
            </h1>
            <p style={s.pageSub}>
              {tab === 'overview' && 'Platform health at a glance'}
              {tab === 'requests' && `${pickups.length} new sell request${pickups.length !== 1 ? 's' : ''} to review`}
              {tab === 'repairs' && `${repairs.length} repair request${repairs.length !== 1 ? 's' : ''} to manage`}
              {tab === 'customers' && `${customers.length} registered user${customers.length !== 1 ? 's' : ''}`}
              {tab === 'brands' && `${brands.length} brand${brands.length !== 1 ? 's' : ''} registered`}
              {tab === 'products' && `${products.length} products in the catalog`}
              {tab === 'reviews' && `${reviews.length} customer review${reviews.length !== 1 ? 's' : ''}`}
              {tab === 'settings' && 'Manage site configuration and custom logos'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              style={{ ...s.logoutBtn, padding: '0.6rem 1.2rem', borderColor: '#f87171', color: '#f87171', fontWeight: 600 }} 
              onClick={() => { localStorage.removeItem('adminToken'); navigate('/admin'); }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        <div style={s.content}>
          {loading && <div style={s.loader}>Loading...</div>}

          {/* ── OVERVIEW ── */}
          {!loading && tab === 'overview' && (
            <>
              <div style={s.statsRow}>
                <StatCard icon="📱" label="Total Products" value={stats?.totalProducts ?? 0} color="#8b5cf6" />
                <StatCard icon="🏷️" label="Brands" value={stats?.totalBrands ?? 0} color="#ec4899" />
                <StatCard icon="📦" label="Pickups Booked" value={stats?.totalPickups ?? 0} color="#2dd4bf" />
                <StatCard icon="🗂️" label="Categories" value={CATS.length} color="#f59e0b" />
              </div>

              <div style={s.twoCol}>
                <div style={s.card}>
                  <h3 style={s.cardH}>By Category</h3>
                  <div style={s.catGrid}>
                    {CATS.map(c => {
                      const cnt = stats?.byCategory?.find(x => x.category === c)?.count || 0;
                      return (
                        <div key={c} style={s.catChip}>
                          <div style={s.catEmoji}>{CAT_EMOJI[c]}</div>
                          <div style={s.catName}>{c}</div>
                          <div style={s.catCnt}>{cnt}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={s.card}>
                  <h3 style={s.cardH}>Recent Products</h3>
                  {products.slice(-6).reverse().map(p => (
                    <div key={p.id} style={s.recentRow}>
                      <img src={p.imageUrl} alt={p.name} style={s.recentImg} onError={e => { e.target.src = ''; e.target.style.background = '#f1f5f9'; }} />
                      <div style={{ flex: 1 }}>
                        <div style={s.recentName}>{p.name}</div>
                        <div style={s.recentMeta}>{p.brand} • {p.category}</div>
                      </div>
                      <div style={s.recentPrice}>₹{parseInt(p.basePrice).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── BRANDS ── */}
          {!loading && tab === 'brands' && (
            <>
              <div style={s.card}>
                <h3 style={s.cardH}>➕ Add New Brand</h3>
                <form onSubmit={addBrand}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    {/* Brand Image Upload */}
                    <div
                      style={{
                        width: '80px', height: '80px', borderRadius: '12px', border: '1px dashed #cbd5e1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
                        flexShrink: 0, background: '#f8fafc'
                      }}
                      onClick={() => brandFileRef.current.click()}
                    >
                      {brandImgPreview ? (
                        <img src={brandImgPreview} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Brand Logo" />
                      ) : (
                        <span style={{ fontSize: '1.5rem' }}>➕</span>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={brandFileRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setBrandImg(file);
                          const reader = new FileReader();
                          reader.onload = ev => setBrandImgPreview(ev.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />

                    <div style={{ ...s.brandFormRow, flex: 1, margin: 0 }}>
                      <div style={{ ...s.fg, flex: 2 }}>
                        <label style={s.lbl}>Brand Name</label>
                        <input style={s.inp} placeholder="e.g. Nothing, Realme, Vivo" value={brandForm.name} onChange={e => setBrandForm({ ...brandForm, name: e.target.value })} required />
                      </div>
                      <div style={{ ...s.fg, flex: 1 }}>
                        <label style={s.lbl}>Accent Colour</label>
                        <div style={s.colorRow}>
                          <input type="color" style={s.colorPicker} value={brandForm.accentColor} onChange={e => setBrandForm({ ...brandForm, accentColor: e.target.value })} />
                          <input style={{ ...s.inp, flex: 1 }} value={brandForm.accentColor} onChange={e => setBrandForm({ ...brandForm, accentColor: e.target.value })} placeholder="#8b5cf6" />
                        </div>
                      </div>
                      <div style={s.fg}>
                        <label style={s.lbl}>&nbsp;</label>
                        <button type="submit" style={s.primaryBtn}>Add Brand</button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div style={s.card}>
                <h3 style={s.cardH}>🏷️ All Brands ({brands.length})</h3>
                {brands.length === 0
                  ? <div style={s.empty}>No brands yet. Add one above!</div>
                  : (
                    <div style={s.brandsGrid}>
                      {brands.map(b => (
                        <div key={b.id} style={{ ...s.brandCard, border: `1px solid ${b.accentColor}30` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                            {b.logoPath ? (
                              <img src={b.logoPath} alt={b.name} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                            ) : (
                              <div style={{ ...s.brandDot, background: b.accentColor }} />
                            )}
                            <div style={s.brandName}>{b.name}</div>
                          </div>
                          <div style={s.brandDate}>{b.createdAt}</div>
                          <div style={s.brandActions}>
                            <button style={{ ...s.delBtn, background: 'rgba(124,58,237,0.08)', color: '#6d28d9', position: 'static' }} onClick={() => openEditBrandModal(b)}>✏️</button>
                            <button style={{ ...s.delBtn, position: 'static' }} onClick={() => deleteBrand(b.id, b.name)}>🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            </>
          )}

          {/* ── PRODUCTS ── */}
          {!loading && tab === 'products' && (
            <>
              <div style={s.toolbar}>
                <div style={s.toolLeft}>
                  <input style={{ ...s.inp, width: '240px', margin: 0 }} placeholder="🔍 Search name or brand..." value={search} onChange={e => setSearch(e.target.value)} />
                  <select style={{ ...s.inp, width: '180px', margin: 0 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
                    <option value="all" style={{ background: '#ffffff', color: '#0f172a' }}>All Categories</option>
                    {CATS.map(c => <option key={c} value={c} style={{ background: '#ffffff', color: '#0f172a' }}>{CAT_EMOJI[c]} {c}</option>)}
                  </select>
                </div>
                <button style={s.primaryBtn} onClick={openAddModal}>+ Add Product</button>
              </div>

              <div style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ 
                    margin: 0, 
                    fontSize: '1.3rem', 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #0f172a, var(--primary))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-0.5px'
                  }}>📱 Products Inventory ({filteredProducts.length})</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button style={{ ...s.primaryBtn, padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={loadProducts}>🔄 Sync</button>
                  </div>
                </div>
                {filteredProducts.length === 0
                  ? <div style={s.empty}>No products match the current filter.</div>
                  : (
                    <div style={s.productGrid}>
                      {filteredProducts.map(p => (
                        <div key={p.id} style={s.prodCard}>
                          <div style={s.prodImgWrap}>
                            <img src={p.imageUrl} alt={p.name} style={s.prodImg} onError={e => { e.target.style.display = 'none'; }} />
                          </div>
                          <div style={s.prodInfo}>
                            <div style={s.prodCatBadge}>{CAT_EMOJI[p.category]} {p.category}</div>
                            <div style={s.prodName}>{p.name}</div>
                            <div style={s.prodBrand}>{p.brand}</div>
                            <div style={s.prodPrice}>₹{parseInt(p.basePrice).toLocaleString('en-IN')}</div>
                          </div>
                          <div style={s.prodActions}>
                            <button style={s.editBtn} onClick={() => openEditModal(p)}>✏️ Edit</button>
                            <button style={s.delBtn} onClick={() => deleteProduct(p.id, p.name)}>🗑️</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            </>
          )}

          {/* ── SELL REQUESTS ── */}
          {!loading && tab === 'requests' && (
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.3rem', 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0f172a, var(--primary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}>✨ Active Pickup Requests</h3>
                <button style={{ ...s.primaryBtn, padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={loadPickups}>🔄 Refresh</button>
              </div>

              {pickups.length === 0 ? (
                <div style={s.empty}>No pickup requests found.</div>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Customer / Contact</th>
                        <th style={s.th}>Device Details</th>
                        <th style={s.th}>Address & Schedule</th>
                        <th style={s.th}>Offer Range</th>
                        <th style={s.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pickups.map(p => (
                        <tr key={p.id} style={s.tr}>
                          <td style={s.td}>
                            <div style={s.tdMain}>{p.userName}</div>
                            <div style={s.tdSub}>📞 {p.mobile}</div>
                          </td>
                          <td style={s.td}>
                            <div style={s.tdMain}>{p.productName}</div>
                            <div style={s.tdSub}>{p.conditionSummary || 'Standard Condition'}</div>
                          </td>
                          <td style={s.td}>
                            <div style={s.tdMain}>📅 {p.pickupDate}</div>
                            <div style={s.tdSub}>📍 {p.address}</div>
                          </td>
                          <td style={s.td}>
                            <div style={{ ...s.tdMain, color: '#2dd4bf' }}>₹{parseInt(p.predictedPrice).toLocaleString('en-IN')}</div>
                            <div style={s.tdSub}>ID: #{p.id}</div>
                          </td>
                          <td style={s.td}>
                            <select
                              style={{
                                ...s.statusSelect,
                                background: p.status === 'Completed' ? 'rgba(16,185,129,0.15)' :
                                  p.status === 'Cancelled' ? 'rgba(239,68,68,0.15)' :
                                    p.status === 'Confirmed' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                                color: p.status === 'Completed' ? '#10b981' :
                                  p.status === 'Cancelled' ? '#f87171' :
                                    p.status === 'Confirmed' ? '#60a5fa' : '#fbbf24',
                                borderColor: p.status === 'Completed' ? 'rgba(16,185,129,0.3)' :
                                  p.status === 'Cancelled' ? 'rgba(239,68,68,0.3)' :
                                    p.status === 'Confirmed' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'
                              }}
                              value={p.status || 'Pending'}
                              onChange={e => updatePickupStatus(p.id, e.target.value)}
                            >
                              {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(st => (
                                <option key={st} value={st} style={{ background: '#ffffff', color: '#0f172a' }}>{st}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {/* ── REPAIR REQUESTS ── */}
          {!loading && tab === 'repairs' && (
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '1.3rem', 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0f172a, var(--primary))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}>🛠️ Active Repair Requests</h3>
                <button style={{ ...s.primaryBtn, padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={loadRepairs}>🔄 Refresh</button>
              </div>

              {repairs.length === 0 ? (
                <div style={s.empty}>No repair requests found.</div>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>Customer</th>
                        <th style={s.th}>Service Detail</th>
                        <th style={s.th}>Address & Contact</th>
                        <th style={s.th}>Scheduled Visit</th>
                        <th style={s.th}>Booking Time</th>
                        <th style={s.th}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {repairs.map(r => (
                        <tr key={r.id} style={s.tr}>
                          <td style={s.td}>
                            <div style={s.tdMain}>{r.userName}</div>
                            <div style={s.tdSub}>ID: #{r.id}</div>
                          </td>
                          <td style={s.td}>
                            <div style={s.tdMain}>{r.brandName} {r.serviceName}</div>
                          </td>
                          <td style={s.td}>
                            <div style={s.tdMain}>{r.mobile}</div>
                            <div style={{ ...s.tdSub, maxWidth: '200px' }}>{r.address}</div>
                          </td>
                          <td style={s.td}>
                            <div style={s.tdMain}>📅 {r.visitDate || 'N/A'}</div>
                          </td>
                          <td style={s.td}>
                            <div style={s.tdSub}>{r.scheduledAt}</div>
                          </td>
                          <td style={s.td}>
                            <select
                              style={{
                                ...s.statusSelect,
                                background: r.status === 'Completed' ? 'rgba(16,185,129,0.15)' :
                                  r.status === 'Cancelled' ? 'rgba(239,68,68,0.15)' :
                                    r.status === 'Confirmed' ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                                color: r.status === 'Completed' ? '#10b981' :
                                  r.status === 'Cancelled' ? '#f87171' :
                                    r.status === 'Confirmed' ? '#60a5fa' : '#fbbf24',
                                borderColor: r.status === 'Completed' ? 'rgba(16,185,129,0.3)' :
                                  r.status === 'Cancelled' ? 'rgba(239,68,68,0.3)' :
                                    r.status === 'Confirmed' ? 'rgba(59,130,246,0.3)' : 'rgba(245,158,11,0.3)'
                              }}
                              value={r.status || 'Pending'}
                              onChange={e => updateRepairStatus(r.id, e.target.value)}
                            >
                              {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(st => (
                                <option key={st} value={st} style={{ background: '#ffffff', color: '#0f172a' }}>{st}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── CUSTOMERS ── */}
          {!loading && tab === 'customers' && (
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ ...s.cardH, margin: 0 }}>Registered Customers</h3>
                <button style={{ ...s.primaryBtn, padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={loadCustomers}>🔄 Refresh</button>
              </div>
              {customers.length === 0 ? (
                <div style={s.empty}>No registered customers found.</div>
              ) : (
                <div style={s.tableWrap}>
                  <table style={s.table}>
                    <thead>
                      <tr>
                        <th style={s.th}>User Details</th>
                        <th style={s.th}>Email Address</th>
                        <th style={s.th}>Signup Date</th>
                        <th style={s.th}>Last Activity</th>
                        <th style={s.th}>System ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map(c => (
                        <tr key={c.id} style={s.tr}>
                          <td style={s.td}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div style={s.tdMain}>{c.name}</div>
                            </div>
                          </td>
                          <td style={s.td}><div style={{ ...s.tdSub, color: '#e4e4e7' }}>{c.email}</div></td>
                          <td style={s.td}><div style={s.tdSub}>{c.signupDate || 'N/A'}</div></td>
                          <td style={s.td}><div style={{ ...s.tdSub, color: '#2dd4bf', fontWeight: 600 }}>{c.lastSeen || 'N/A'}</div></td>
                          <td style={s.td}><div style={{ ...s.tdSub, fontSize: '0.75rem', opacity: 0.6 }}>#{c.id}</div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── REVIEWS ── */}
          {!loading && tab === 'reviews' && (
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, background: 'linear-gradient(135deg, #0f172a, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>⭐ Customer Reviews</h3>
                <button style={{ ...s.primaryBtn, padding: '0.6rem 1.2rem', fontSize: '0.85rem' }} onClick={loadReviews}>🔄 Refresh</button>
              </div>
              {reviews.length === 0 ? (
                <div style={s.empty}>No reviews yet.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ background: '#f8fafc', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ color: '#fbbf24', fontSize: '1.1rem', letterSpacing: '2px' }}>
                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                          </div>
                          <div style={{ ...s.tdMain, marginTop: '0.3rem', wordBreak: 'break-word' }}>{r.title}</div>
                        </div>
                        <button style={{ ...s.delBtn, flexShrink: 0 }} onClick={() => deleteReview(r.id)} title="Delete review">🗑️</button>
                      </div>
                      <p style={{ ...s.tdSub, lineHeight: 1.6, margin: 0, wordBreak: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>"{r.body}"</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#fff' }}>
                            {r.userName.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ ...s.tdMain, fontSize: '0.85rem' }}>{r.userName}</span>
                        </div>
                        <span style={{ ...s.tdSub, fontSize: '0.72rem' }}>{r.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {!loading && tab === 'settings' && (
            <div style={s.card}>
              <h3 style={s.cardH}>Site Branding</h3>
              <p style={{...s.pageSub, marginBottom: '1.5rem'}}>Upload a custom logo to replace the "Cell Master Pro" text on the customer storefront.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '2rem' }}>
                <div 
                  style={{ ...s.uploadZone, border: siteLogoFile ? '2px dashed #10b981' : '2px dashed rgba(255,255,255,0.12)' }} 
                  onClick={() => siteLogoRef.current.click()}
                >
                  {(siteLogoPreview || siteLogoFile) ? (
                    <img src={siteLogoFile ? URL.createObjectURL(siteLogoFile) : siteLogoPreview} alt="Logo Preview" style={s.imgPreview} />
                  ) : (
                    <div style={s.uploadPH}>
                      <span style={{ fontSize: '1.5rem' }}>📸</span>
                      <span style={{ fontSize: '0.85rem', color: '#a1a1aa' }}>Click to select logo</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={siteLogoRef} style={{ display: 'none' }} accept="image/*" onChange={(e) => setSiteLogoFile(e.target.files[0])} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                  <button style={s.primaryBtn} onClick={handleSiteLogoUpload} disabled={!siteLogoFile}>🚀 Save Changes</button>
                  {(siteLogoPreview && !siteLogoFile) && (
                    <button style={{ ...s.cancelBtn, color: '#f87171', borderColor: 'rgba(248,113,113,0.3)', fontWeight: 700 }} onClick={handleSiteLogoDelete}>
                      🗑️ Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────
const s = {
  root: { display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter',-apple-system,sans-serif", color: '#0f172a', position: 'relative' },
  toast: { position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999, padding: '0.9rem 1.6rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', backdropFilter: 'blur(10px)', animation: 'slideIn 0.3s ease' },

  // Sidebar
  sidebar: { width: '240px', flexShrink: 0, background: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '2rem 1rem', position: 'sticky', top: 0, height: '100vh', overflow: 'auto' },
  logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.5rem' },
  logoIcon: { width: '40px', height: '40px', background: 'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 },
  logoText: { fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 },
  logoSub: { fontSize: '0.72rem', color: '#64748b', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' },
  nav: { display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 },
  navBtn: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '10px', border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left' },
  navBtnActive: { background: 'rgba(124,58,237,0.08)', color: '#7c3aed', fontWeight: 600 },
  sidebarFoot: { display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' },
  onlineDot: { width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block', marginRight: '0.35rem' },
  logoutBtn: { background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', padding: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', marginTop: '0.25rem', transition: 'all 0.2s' },

  // Main
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' },
  topbar: { padding: '0.75rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(10px)', sticky: 'top', zIndex: 10 },
  pageH: { fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#0f172a' },
  pageSub: { color: '#64748b', margin: '0.25rem 0 0', fontSize: '0.95rem' },
  content: { padding: '0.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  loader: { color: '#64748b', padding: '3rem', textAlign: 'center' },

  // Table Styles
  tableWrap: { overflowX: 'auto', margin: '0 -1.75rem -1.75rem', padding: '0 1.75rem 1.75rem' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
  tr: { borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' },
  td: { padding: '1.25rem 1rem', verticalAlign: 'top' },
  tdMain: { fontWeight: 700, fontSize: '0.92rem', color: '#0f172a', marginBottom: '0.25rem' },
  tdSub: { fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 },
  statusSelect: { padding: '0.4rem 0.75rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid transparent', cursor: 'pointer', outline: 'none', appearance: 'none', textAlign: 'center', minWidth: '110px' },
  statusBadge: { background: 'rgba(13,148,136,0.1)', color: '#0d9488', border: '1px solid rgba(13,148,136,0.2)', padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700 },

  // Stats row
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem' },
  statCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  statIcon: { width: '42px', height: '42px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '0.25rem' },
  statValue: { fontSize: '2.2rem', fontWeight: 800, lineHeight: 1, color: '#0f172a' },
  statLabel: { color: '#64748b', fontSize: '0.85rem', fontWeight: 500 },

  // Overview two-col
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' },
  catGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' },
  catChip: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', textAlign: 'center' },
  catEmoji: { fontSize: '1.8rem', marginBottom: '0.5rem' },
  catName: { fontSize: '0.85rem', color: '#64748b', fontWeight: 500 },
  catCnt: { fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#0f172a' },
  recentRow: { display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' },
  recentImg: { width: '44px', height: '44px', objectFit: 'contain', borderRadius: '8px', background: '#f8fafc' },
  recentName: { fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' },
  recentMeta: { color: '#64748b', fontSize: '0.8rem' },
  recentPrice: { color: '#7c3aed', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' },

  // Card
  card: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  cardH: { margin: '0 0 1.25rem', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' },
  empty: { color: '#64748b', textAlign: 'center', padding: '2.5rem', fontSize: '0.95rem' },

  // Brand form
  brandFormRow: { display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' },
  colorRow: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  colorPicker: { width: '44px', height: '44px', border: '1px solid #cbd5e1', borderRadius: '10px', cursor: 'pointer', background: 'none', padding: '2px' },
  brandsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.25rem' },
  brandCard: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.2rem', position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  brandDot: { width: '14px', height: '14px', borderRadius: '50%', marginBottom: '0.3rem' },
  brandName: { fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' },
  brandDate: { color: '#64748b', fontSize: '0.78rem' },
  brandActions: { position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.4rem' },
  delBtn: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', padding: '0.25rem 0.5rem', color: '#dc2626', transition: 'all 0.2s' },

  // Toolbar
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' },
  toolLeft: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' },

  // Product grid
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginTop: '0.5rem' },
  prodCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s', cursor: 'default', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  prodImgWrap: { background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px', padding: '1rem' },
  prodImg: { maxHeight: '130px', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.08))' },
  prodInfo: { padding: '1rem', flex: 1 },
  prodCatBadge: { fontSize: '0.72rem', fontWeight: 700, color: '#7c3aed', letterSpacing: '0.5px', marginBottom: '0.35rem', textTransform: 'uppercase' },
  prodName: { fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, marginBottom: '0.25rem', color: '#0f172a' },
  prodBrand: { color: '#64748b', fontSize: '0.82rem', marginBottom: '0.35rem' },
  specBadge: { display: 'inline-block', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '6px', color: '#6d28d9', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', marginBottom: '0.4rem', letterSpacing: '0.3px' },
  prodPrice: { color: '#0d9488', fontWeight: 800, fontSize: '1rem' },
  prodActions: { display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem', borderTop: '1px solid #f1f5f9' },
  editBtn: { flex: 1, background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px', color: '#6d28d9', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', padding: '0.45rem', transition: 'all 0.2s' },

  // Shared form
  fg: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: '140px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' },
  lbl: { fontSize: '0.82rem', color: '#334155', marginBottom: '0.4rem', fontWeight: 600 },
  inp: { padding: '0.8rem 1rem', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#0f172a', fontSize: '0.95rem', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'inherit' },
  primaryBtn: { background: 'linear-gradient(135deg,#7c3aed,#ec4899)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 700, fontSize: '0.95rem', padding: '0.8rem 1.4rem', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(124,58,237,0.25)', transition: 'all 0.2s', alignSelf: 'flex-end' },
  cancelBtn: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', color: '#64748b', fontWeight: 600, fontSize: '0.95rem', padding: '0.8rem 1.4rem', cursor: 'pointer' },

  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(6px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  modal: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '24px', width: '100%', maxWidth: '600px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.15)', color: '#0f172a' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' },
  modalTitle: { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' },
  closeBtn: { background: '#f1f5f9', border: 'none', borderRadius: '8px', color: '#64748b', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalActions: { display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' },
  uploadZone: { border: '2px dashed #cbd5e1', borderRadius: '14px', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s', overflow: 'hidden', marginBottom: '0.25rem', background: '#f8fafc' },
  uploadPH: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '2rem' },
  imgPreview: { maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', padding: '1rem' },
};