import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './index.css';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

const API_URL = 'http://127.0.0.1:3000/api';

const getBrandLogo = (brand) => {
  if (brand.logoPath) return <img src={brand.logoPath} alt={brand.name} style={{ width: 44, height: 44, objectFit: 'contain' }} />;

  // High-quality SVG Fallbacks for major brands
  const name = brand.name.toLowerCase();
  if (name === 'apple') return <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 44, height: 44 }}><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.3.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>;
  if (name === 'google') return <svg viewBox="0 0 24 24" style={{ width: 44, height: 44 }}><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>;
  if (name === 'samsung') return <span className="brand-wordmark" style={{ letterSpacing: '3px', fontSize: '0.9rem' }}>SAMSUNG</span>;
  if (name === 'oneplus') return <span className="brand-wordmark" style={{ fontSize: '2.2rem', letterSpacing: '-2px' }}>1+</span>;
  if (name === 'sony') return <span className="brand-wordmark" style={{ letterSpacing: '6px', fontSize: '1.1rem' }}>SONY</span>;
  if (name === 'dell') return <span className="brand-wordmark" style={{ letterSpacing: '3px', fontSize: '1.3rem', fontStyle: 'italic' }}>DELL</span>;
  if (name === 'hp') return <span className="brand-wordmark" style={{ fontSize: '1.8rem', letterSpacing: '2px', fontWeight: 900 }}>hp</span>;
  if (name === 'lenovo') return <span className="brand-wordmark" style={{ letterSpacing: '2px', fontSize: '1rem' }}>LENOVO</span>;
  if (name === 'xiaomi') return <span className="brand-wordmark" style={{ fontSize: '1rem', letterSpacing: '2px' }}>XIAOMI</span>;
  if (name === 'lg') return <span className="brand-wordmark" style={{ fontSize: '1.8rem', letterSpacing: '3px' }}>LG</span>;

  return <div style={{ width: 44, height: 44, borderRadius: '50%', background: brand.accentColor || '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{brand.name.charAt(0).toUpperCase()}</div>;
};

function App() {
  const location = useLocation();

  // Helper for safe localStorage parsing
  const safeParseLocalStorage = (key, defaultValue) => {
    try {
      const val = localStorage.getItem(key);
      if (val === null || val === undefined || val === 'undefined') return defaultValue;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  };

  if (location.pathname === '/admin') return <AdminLogin />;
  if (location.pathname.startsWith('/admin/')) return <AdminDashboard />;

  const [productsData, setProductsData] = useState({});
  const [refurbishedProducts, setRefurbishedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(localStorage.getItem('selectedCategory') || 'Mobiles');

  const [brands, setBrands] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(safeParseLocalStorage('selectedProduct', null));
  const [selectedBrand, setSelectedBrand] = useState(localStorage.getItem('selectedBrand') || null);
  const [step, setStep] = useState(localStorage.getItem('step') || 'home'); // 'home', 'specs', 'quiz', 'quote', 'login', 'howItWorks', 'partner', 'sell'
  const [sellStage, setSellStage] = useState(localStorage.getItem('sellStage') || 'category'); // 'category', 'brand', 'product'
  const [sellSearch, setSellSearch] = useState('');
  const [homeSearch, setHomeSearch] = useState('');
  const [homeBrandFilter, setHomeBrandFilter] = useState('All');
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  const [conditions, setConditions] = useState({});
  const [quote, setQuote] = useState(null);
  const [quizError, setQuizError] = useState('');

  // Repair state
  const [repairServices, setRepairServices] = useState([]);
  const [selectedRepair, setSelectedRepair] = useState(safeParseLocalStorage('selectedRepair', null));
  const [selectedRepairBrand, setSelectedRepairBrand] = useState(safeParseLocalStorage('selectedRepairBrand', null));
  const [repairStep, setRepairStep] = useState(localStorage.getItem('repairStep') || 'list'); // 'list', 'brand', 'confirm'
  const [repairForm, setRepairForm] = useState({ address: '', mobile: '', visitDate: '' });
  const [repairSuccess, setRepairSuccess] = useState(false);

  // Auth state
  const [user, setUser] = useState(null);
  const [authStep, setAuthStep] = useState('login'); // 'login' or 'signup'
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');

  // Pickup state
  const [pickupForm, setPickupForm] = useState({ address: '', mobile: '', pickupDate: '' });
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, body: '' });
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState({});
  const [expandedFaq, setExpandedFaq] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => setProductsData(data))
      .catch(err => console.error("Error fetching products:", err));

    fetch(`${API_URL}/refurbished`)
      .then(res => res.json())
      .then(data => setRefurbishedProducts(data))
      .catch(err => console.error("Error fetching refurbished products:", err));

    fetch(`${API_URL}/repair-services`)
      .then(res => res.json())
      .then(data => setRepairServices(data))
      .catch(err => console.error("Error fetching repair services:", err));

    fetch(`${API_URL}/brands`)
      .then(res => res.json())
      .then(data => {
        setBrands(data.map(b => ({
          ...b,
          accent: b.accentColor // ensure consistency with marquee styles
        })));
      })
      .catch(err => console.error("Error fetching brands:", err));

    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
          else localStorage.removeItem('token');
        })
        .catch(() => localStorage.removeItem('token'));
    }

    // Fetch reviews
    fetch(`${API_URL}/reviews`)
      .then(res => res.json())
      .then(data => setReviews(Array.isArray(data) ? data : []))
      .catch(() => { });

    // Fetch site settings
    fetch(`${API_URL}/settings`)
      .then(res => res.json())
      .then(data => setSiteSettings(data))
      .catch(() => { });
  }, []);

  // Scroll to top on navigation change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step, repairStep, sellStage]);

  // Sync states to localStorage
  useEffect(() => {
    localStorage.setItem('step', step);
    localStorage.setItem('selectedCategory', selectedCategory);
    localStorage.setItem('sellStage', sellStage);
    if (selectedProduct) localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
    else localStorage.removeItem('selectedProduct');
    if (selectedBrand) localStorage.setItem('selectedBrand', selectedBrand);
    else localStorage.removeItem('selectedBrand');
    if (selectedRepair) localStorage.setItem('selectedRepair', JSON.stringify(selectedRepair));
    else localStorage.removeItem('selectedRepair');
    if (selectedRepairBrand) localStorage.setItem('selectedRepairBrand', JSON.stringify(selectedRepairBrand));
    else localStorage.removeItem('selectedRepairBrand');
    localStorage.setItem('repairStep', repairStep);
  }, [step, selectedCategory, sellStage, selectedProduct, selectedBrand, selectedRepair, selectedRepairBrand, repairStep]);

  // Browser History Sync (Back/Forward Button Support)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.step) {
        setStep(event.state.step);
        if (event.state.sellStage) setSellStage(event.state.sellStage);
        if (event.state.selectedCategory) setSelectedCategory(event.state.selectedCategory);
        if (event.state.selectedProduct) setSelectedProduct(event.state.selectedProduct);
        if (event.state.selectedBrand) setSelectedBrand(event.state.selectedBrand);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Replace initial state so we don't start with a null state
    window.history.replaceState({
      step: localStorage.getItem('step') || 'home',
      sellStage: localStorage.getItem('sellStage') || 'category',
      selectedCategory: localStorage.getItem('selectedCategory') || 'Mobiles'
    }, '', '');

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const currentState = window.history.state;
    // Only push if the state actually changed to avoid redundant entries
    if (!currentState || currentState.step !== step || currentState.sellStage !== sellStage) {
      window.history.pushState({
        step,
        sellStage,
        selectedCategory,
        selectedProduct,
        selectedBrand
      }, '', '');
    }
  }, [step, sellStage, selectedCategory, selectedProduct, selectedBrand]);

  // Flat list of all products for search and spotlight showcase
  const allProductsList = React.useMemo(() => {
    if (!productsData) return [];
    return Object.values(productsData).flatMap(brandObj =>
      brandObj ? Object.values(brandObj).flat() : []
    ).filter(Boolean);
  }, [productsData]);

  // Curated spotlight devices
  const spotlightDevices = React.useMemo(() => {
    if (!allProductsList.length) return [];
    const picks = [
      allProductsList.find(p => p.name.includes('iPhone 15 Pro')),
      allProductsList.find(p => p.name.includes('MacBook Pro') || p.category === 'Laptops'),
      allProductsList.find(p => p.name.includes('Galaxy S23') || p.brand === 'Samsung'),
      allProductsList.find(p => p.category === 'Accessories' || p.category === 'Earbuds')
    ].filter(Boolean);

    const seen = new Set();
    const unique = [];
    for (const item of picks) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }
    return unique.length > 0 ? unique : allProductsList.slice(0, 4);
  }, [allProductsList]);

  const activeSpotlight = spotlightDevices[spotlightIndex] || spotlightDevices[0] || allProductsList[0];

  // Live search results
  const homeSearchResults = React.useMemo(() => {
    if (!homeSearch.trim()) return [];
    const q = homeSearch.toLowerCase().trim();
    return allProductsList.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [homeSearch, allProductsList]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setConditions({}); // Reset to empty to force full completion
    setQuizError('');
    setSelectedCategory(product.category);
    setSelectedBrand(product.brand);

    // Only go to specs if there's actually something to select
    const hasVariants = product.ramGB || product.storageGB || product.watchVariant;
    if (hasVariants && (product.category === 'Mobiles' || product.category === 'Laptops' || product.category === 'Accessories')) {
      setStep('specs');
    } else {
      setStep('quiz');
    }
  };

  const calculateQuote = async () => {
    // Determine required keys based on category
    let required = [];
    if (selectedCategory === 'Mobiles') {
      required = ['storageGB', 'turnsOn'];
      if (conditions.turnsOn === true) required = ['storageGB', 'turnsOn', 'screen', 'body', 'age', 'batteryHealth', 'hasBox', 'hasBill'];
    } else if (selectedCategory === 'Laptops') {
      required = ['ramGB', 'storageGB', 'turnsOn'];
      if (conditions.turnsOn === true) required = ['ramGB', 'storageGB', 'turnsOn', 'screen', 'keyboard', 'body', 'age', 'batteryHealth', 'hasBill'];
    } else if (selectedCategory === 'Earbuds') {
      required = ['hasCase', 'bothWork', 'age'];
    } else if (selectedCategory === 'Accessories') {
      required = ['watchVariant', 'turnsOn'];
      if (conditions.turnsOn === true) required = ['watchVariant', 'turnsOn', 'screen', 'strap', 'age'];
    }

    const missing = required.filter(k => conditions[k] === undefined);
    if (missing.length > 0) {
      setQuizError(`Please answer all ${required.length} questions to get your exact quote.`);
      return;
    }

    setQuizError('');
    try {
      const res = await fetch(`${API_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id, conditions })
      });
      const data = await res.json();
      setQuote(data);
      setStep('quote');
    } catch (err) {
      console.error("Error evaluating price:", err);
    }
  };

  const handleConditionChange = (key, value) => {
    setConditions(prev => ({ ...prev, [key]: value }));
  };

  const handleRepairSelect = (service) => {
    setSelectedRepair(service);
    setRepairStep('brand');
    setStep('repair');
  };

  const handleRepairBrandSelect = (brand) => {
    setSelectedRepairBrand(brand);
    setRepairStep('confirm');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setStep('home');
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (err) {
      setAuthError('Connection error to server');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setStep('home');
      } else {
        setAuthError(data.error || 'Signup failed');
      }
    } catch (err) {
      setAuthError('Connection error to server');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setStep('home');
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/pickups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...pickupForm,
          productName: quote.productName,
          predictedPrice: quote.predictedPrice,
          conditions: conditions
        })
      });
      const data = await res.json();
      if (res.ok) {
        setScheduleSuccess(true);
      } else {
        setAuthError(data.error || 'Scheduling failed');
      }
    } catch (err) {
      setAuthError('Connection error: ' + err.message);
    }
  };

  const handleRepairSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/repairs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...repairForm,
          serviceName: selectedRepair.name,
          brandName: selectedRepairBrand.name
        })
      });
      const data = await res.json();
      if (res.ok) {
        setRepairSuccess(true);
      } else {
        setAuthError(data.error || 'Repair booking failed');
      }
    } catch (err) {
      setAuthError('Connection error: ' + err.message);
    }
  };

  const renderQuizQuestions = () => {
    if (selectedCategory === 'Laptops') {
      return (
        <>
          <div className="quiz-question">
            <h4>1. Does your Laptop turn on and function normally?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.turnsOn === true ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', true)}>Yes, flawless</div>
              <div className={`option-card ${conditions.turnsOn === false ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', false)}>No / Dead</div>
            </div>
          </div>
          {conditions.turnsOn && (
            <>
              <div className="quiz-question">
                <h4>2. What is the screen condition?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.screen === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'perfect')}>Flawless</div>
                  <div className={`option-card ${conditions.screen === 'scratches' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'scratches')}>Scratches</div>
                  <div className={`option-card ${conditions.screen === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'broken')}>Cracked/Spots</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>3. What is the Keyboard / Trackpad condition?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.keyboard === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('keyboard', 'perfect')}>Perfect</div>
                  <div className={`option-card ${conditions.keyboard === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('keyboard', 'broken')}>Missing keys/Faulty</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>4. How old is your Laptop?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.age === 'under_1' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'under_1')}>Under 1 Year</div>
                  <div className={`option-card ${conditions.age === '1_year' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '1_year')}>1 - 2 Years</div>
                  <div className={`option-card ${conditions.age === '2_years' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '2_years')}>2 - 3 Years</div>
                  <div className={`option-card ${conditions.age === 'more_than_2' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'more_than_2')}>3+ Years</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>5. Battery Health</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.batteryHealth === 'good' ? 'selected' : ''}`} onClick={() => handleConditionChange('batteryHealth', 'good')}>Good (80%+)</div>
                  <div className={`option-card ${conditions.batteryHealth === 'poor' ? 'selected' : ''}`} onClick={() => handleConditionChange('batteryHealth', 'poor')}>Poor (&lt;80%)</div>
                  <div className={`option-card ${conditions.batteryHealth === 'dead' ? 'selected' : ''}`} onClick={() => handleConditionChange('batteryHealth', 'dead')}>Dead / Drains Instantly</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>6. Do you have the original bill with matching Serial Number?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.hasBill === true ? 'selected' : ''}`} onClick={() => handleConditionChange('hasBill', true)}>Yes, original bill</div>
                  <div className={`option-card ${conditions.hasBill === false ? 'selected' : ''}`} onClick={() => handleConditionChange('hasBill', false)}>No / Missing</div>
                </div>
              </div>
            </>
          )}
        </>
      );
    } else if (selectedCategory === 'Earbuds') {
      return (
        <>
          <div className="quiz-question">
            <h4>1. Do you have the original charging case?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.hasCase === true ? 'selected' : ''}`} onClick={() => handleConditionChange('hasCase', true)}>Yes</div>
              <div className={`option-card ${conditions.hasCase === false ? 'selected' : ''}`} onClick={() => handleConditionChange('hasCase', false)}>No</div>
            </div>
          </div>
          <div className="quiz-question">
            <h4>2. Do both earbuds work clearly?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.bothWork === true ? 'selected' : ''}`} onClick={() => handleConditionChange('bothWork', true)}>Yes</div>
              <div className={`option-card ${conditions.bothWork === false ? 'selected' : ''}`} onClick={() => handleConditionChange('bothWork', false)}>No / One is dead</div>
            </div>
          </div>
          <div className="quiz-question">
            <h4>3. How old are your earbuds?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.age === 'under_1' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'under_1')}>Under 1 Year</div>
              <div className={`option-card ${conditions.age === '1_year' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '1_year')}>1+ Year</div>
            </div>
          </div>
        </>
      );
    } else if (selectedCategory === 'Accessories') {
      return (
        <>
          <div className="quiz-question">
            <h4>1. Does the smartwatch power on?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.turnsOn === true ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', true)}>Yes</div>
              <div className={`option-card ${conditions.turnsOn === false ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', false)}>No</div>
            </div>
          </div>
          {conditions.turnsOn && (
            <>
              <div className="quiz-question">
                <h4>2. Screen Condition?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.screen === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'perfect')}>Flawless</div>
                  <div className={`option-card ${conditions.screen === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'broken')}>Cracked/Broken</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>3. Strap & Body Condition?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.strap === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('strap', 'perfect')}>Working/Original</div>
                  <div className={`option-card ${conditions.strap === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('strap', 'broken')}>Broken/Damaged</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>4. How old is the watch?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.age === 'under_1' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'under_1')}>Under 1 Year</div>
                  <div className={`option-card ${conditions.age === '1_year' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '1_year')}>1+ Year</div>
                </div>
              </div>
            </>
          )}
        </>
      );
    } else { // Mobiles
      return (
        <>
          <div className="quiz-question">
            <h4>1. Does your device turn on and function normally?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.turnsOn === true ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', true)}>Yes, flawless</div>
              <div className={`option-card ${conditions.turnsOn === false ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', false)}>No</div>
            </div>
          </div>
          {conditions.turnsOn && (
            <>
              <div className="quiz-question">
                <h4>2. Screen Condition</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.screen === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'perfect')}>Flawless</div>
                  <div className={`option-card ${conditions.screen === 'scratches' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'scratches')}>Minor Scratches</div>
                  <div className={`option-card ${conditions.screen === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'broken')}>Cracked/Broken</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>3. Back Panel & Body</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.body === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('body', 'perfect')}>Flawless</div>
                  <div className={`option-card ${conditions.body === 'scratches' ? 'selected' : ''}`} onClick={() => handleConditionChange('body', 'scratches')}>Scratches</div>
                  <div className={`option-card ${conditions.body === 'dents' ? 'selected' : ''}`} onClick={() => handleConditionChange('body', 'dents')}>Dented</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>4. How old is your Mobile?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.age === 'under_1' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'under_1')}>Under 1 Year</div>
                  <div className={`option-card ${conditions.age === '1_year' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '1_year')}>1 - 2 Years</div>
                  <div className={`option-card ${conditions.age === '2_years' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '2_years')}>2 - 3 Years</div>
                  <div className={`option-card ${conditions.age === 'more_than_2' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'more_than_2')}>3+ Years</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>5. Battery Health</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.batteryHealth === 'good' ? 'selected' : ''}`} onClick={() => handleConditionChange('batteryHealth', 'good')}>Good (80%+)</div>
                  <div className={`option-card ${conditions.batteryHealth === 'poor' ? 'selected' : ''}`} onClick={() => handleConditionChange('batteryHealth', 'poor')}>Poor (&lt;80%)</div>
                  <div className={`option-card ${conditions.batteryHealth === 'dead' ? 'selected' : ''}`} onClick={() => handleConditionChange('batteryHealth', 'dead')}>Dead / Drains Fast</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>6. Do you have the original box?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.hasBox === true ? 'selected' : ''}`} onClick={() => handleConditionChange('hasBox', true)}>Yes, have box</div>
                  <div className={`option-card ${conditions.hasBox === false ? 'selected' : ''}`} onClick={() => handleConditionChange('hasBox', false)}>No</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>7. Do you have the original bill with matching IMEI?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.hasBill === true ? 'selected' : ''}`} onClick={() => handleConditionChange('hasBill', true)}>Yes, original bill</div>
                  <div className={`option-card ${conditions.hasBill === false ? 'selected' : ''}`} onClick={() => handleConditionChange('hasBill', false)}>No / Missing</div>
                </div>
              </div>
            </>
          )}
        </>
      );
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="brand" onClick={() => setStep('home')} style={{ cursor: 'pointer', textDecoration: 'none' }}>
          <div className="nav-brand-logo">
            <div className="brand-logo-icon">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="cmpGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                  <linearGradient id="cmpBoltNav" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#ecfeff" />
                  </linearGradient>
                </defs>
                <rect width="40" height="40" rx="12" fill="url(#cmpGradNav)" />
                <path d="M4 14C4 9.02944 8.02944 5 13 5H27C31.9706 5 36 9.02944 36 14C36 14 30 18 20 18C10 18 4 14 4 14Z" fill="white" fillOpacity="0.2" />
                <rect x="10" y="8" width="20" height="24" rx="4" stroke="white" strokeWidth="1.8" strokeOpacity="0.9" fill="none" />
                <line x1="16.5" y1="10.5" x2="23.5" y2="10.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.8" />
                <path d="M21.5 13L15.5 21H20L18.5 28L25.5 19.5H20.5L21.5 13Z" fill="url(#cmpBoltNav)" />
                <circle cx="20" cy="29" r="1" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <div className="brand-logo-text">
              <div className="brand-title-wrap">
                <span className="brand-title-cell">Cell</span>
                <span className="brand-title-master">Master</span>
                <span className="brand-badge-pro"><span className="badge-pro-dot">•</span>PRO</span>
              </div>
              <span className="brand-tagline">SMART RE-COMMERCE</span>
            </div>
          </div>
        </div>

        <div className="nav-links">
          <a className={step === 'home' ? 'active' : ''} onClick={() => setStep('home')}>Home</a>
          <a className={step === 'sell' ? 'active' : ''} onClick={() => { setStep('sell'); setSellStage('category'); }}>Sell Devices</a>
          <a className={step === 'buy' ? 'active' : ''} onClick={() => setStep('buy')}>Buy Refurbished</a>
          <a className={step === 'repair' ? 'active' : ''} onClick={() => { setStep('repair'); setRepairStep('list'); }}>Repair Service</a>
          <a onClick={() => {
            if (step !== 'home') setStep('home');
            setTimeout(() => {
              const el = document.getElementById('how-it-works');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}>How it Works</a>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>Welcome, {user.name}</span>
              <button
                className="btn"
                style={{
                  padding: '0.6rem 1.4rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: '50px',
                  background: 'var(--primary-gradient)',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                  border: 'none'
                }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="btn"
              style={{
                padding: '0.6rem 1.4rem',
                fontSize: '0.9rem',
                fontWeight: 700,
                borderRadius: '50px',
                background: 'var(--primary-gradient)',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                border: 'none'
              }}
              onClick={() => setStep('login')}
            >
              Login
            </button>
          )}
        </div>
      </nav>

      {/* --- HOMEPAGE/CATALOG VIEW --- */}
      {step === 'home' && (
        <div className="fade-in">
          {/* --- ULTRA-MODERN BENTO HERO & VALUATION PORTAL --- */}
          <section className="hero-modern-section">
            <div className="hero-modern-grid">
              {/* Left Column: Valuation Desk */}
              <div className="hero-content-col">
                <div className="hero-pill-badge">
                  <span className="live-pulse-dot"></span>
                  <span className="hero-pill-live">LIVE IN MUMBAI</span>
                  <span className="hero-pill-dot">•</span>
                  <span className="hero-pill-stat">₹3.8 Cr+ Paid Out to Sellers</span>
                </div>

                <h1 className="hero-modern-title">
                  Turn Your Old Tech Into <br />
                  <span className="hero-title-gradient">Instant Doorstep Cash.</span>
                </h1>

                <p className="hero-modern-subtitle">
                  AI-graded valuations in 45 seconds. Sell your smartphone, laptop, or smartwatch with zero inspection fees, free doorstep pickup, and instant UPI payment right before our technician leaves.
                </p>

                {/* Instant Device Search with Autocomplete */}
                <div className="hero-search-wrapper">
                  <div className="hero-search-bar">
                    <span className="hero-search-icon">🔍</span>
                    <input
                      type="text"
                      className="hero-search-input"
                      placeholder="Search device e.g. iPhone 15 Pro, MacBook, S23..."
                      value={homeSearch}
                      onChange={(e) => setHomeSearch(e.target.value)}
                    />
                    {homeSearch && (
                      <button
                        className="hero-search-clear-btn"
                        onClick={() => setHomeSearch('')}
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                    <button
                      className="hero-search-action-btn"
                      onClick={() => {
                        const el = document.getElementById('catalog-hub-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Browse All
                    </button>
                  </div>

                  {/* Autocomplete Dropdown */}
                  {homeSearch.trim() && (
                    <div className="hero-search-dropdown">
                      {homeSearchResults.length > 0 ? (
                        homeSearchResults.map((prod) => (
                          <div
                            key={prod.id}
                            className="hero-search-item"
                            onClick={() => {
                              setHomeSearch('');
                              handleProductSelect(prod);
                            }}
                          >
                            <img src={prod.image} alt={prod.name} className="search-item-thumb" />
                            <div className="search-item-info">
                              <span className="search-item-name">{prod.name}</span>
                              <span className="search-item-meta">{prod.brand} · {prod.category}</span>
                            </div>
                            <div className="search-item-price-tag">
                              <span className="search-item-price">Up to ₹{prod.basePrice?.toLocaleString('en-IN')}</span>
                              <span className="search-item-cta">Sell ➔</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="search-empty-state">
                          <span>No devices found matching "{homeSearch}". Try browsing our categories below.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Trending Quick-Tags */}
                <div className="hero-trending-row">
                  <span className="trending-title">🔥 Trending:</span>
                  {['iPhone 15 Pro', 'MacBook Pro 16', 'Galaxy S23 Ultra', 'Apple Watch Series 8'].map((tName) => {
                    const match = allProductsList.find(p => p.name.toLowerCase().includes(tName.toLowerCase()));
                    return (
                      <button
                        key={tName}
                        className="trending-tag-pill"
                        onClick={() => {
                          if (match) handleProductSelect(match);
                          else setHomeSearch(tName);
                        }}
                      >
                        {tName}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Category Action Cards */}
                <div className="hero-quick-cats">
                  {Object.keys(productsData).map((cat) => {
                    const count = productsData[cat]
                      ? Object.values(productsData[cat]).flat().length
                      : 0;
                    return (
                      <div
                        key={cat}
                        className="hero-cat-card"
                        onClick={() => {
                          setSelectedCategory(cat);
                          setHomeBrandFilter('All');
                          const el = document.getElementById('catalog-hub-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <span className="hero-cat-icon">
                          {cat === 'Mobiles' && '📱'}
                          {cat === 'Laptops' && '💻'}
                          {cat === 'Earbuds' && '🎧'}
                          {cat === 'Accessories' && '⌚'}
                        </span>
                        <span className="hero-cat-name">{cat}</span>
                        <span className="hero-cat-count">{count} models</span>
                      </div>
                    );
                  })}
                </div>

                {/* Trust Micro-Strip */}
                <div className="hero-trust-strip">
                  <div className="trust-strip-item">
                    <span className="trust-strip-icon">⚡</span>
                    <div>
                      <strong>45s AI Quote</strong>
                      <span>Real-time price lock</span>
                    </div>
                  </div>
                  <div className="trust-strip-item">
                    <span className="trust-strip-icon">💸</span>
                    <div>
                      <strong>Instant UPI Payout</strong>
                      <span>Paid at your doorstep</span>
                    </div>
                  </div>
                  <div className="trust-strip-item">
                    <span className="trust-strip-icon">🔒</span>
                    <div>
                      <strong>100% Data Destruction</strong>
                      <span>DoD certified privacy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Live Valuation Spotlight Showcase */}
              <div className="hero-spotlight-col">
                <div className="hero-spotlight-card">
                  <div className="spotlight-card-header">
                    <div className="spotlight-header-badge">
                      <span className="spotlight-radar-dot"></span>
                      <span>TOP VALUATION TODAY</span>
                    </div>
                    <span className="spotlight-location-tag">📍 Mumbai Area</span>
                  </div>

                  {/* Device Switcher Tabs */}
                  {spotlightDevices.length > 0 && (
                    <div className="spotlight-nav-tabs">
                      {spotlightDevices.map((dev, idx) => (
                        <button
                          key={dev.id}
                          className={`spotlight-tab-btn ${spotlightIndex === idx ? 'active' : ''}`}
                          onClick={() => setSpotlightIndex(idx)}
                        >
                          {dev.name.split(' ')[0]} {dev.name.split(' ')[1] || ''}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Spotlight Stage Display */}
                  {activeSpotlight && (
                    <div className="spotlight-stage">
                      <div className="spotlight-floating-badge-top">
                        <span>🔥</span> High Demand Device
                      </div>
                      <div className="spotlight-floating-badge-bot">
                        <span>⚡</span> 2-Hour Pickup Ready
                      </div>

                      <img
                        src={activeSpotlight.image}
                        alt={activeSpotlight.name}
                        className="spotlight-device-img"
                      />
                    </div>
                  )}

                  {/* Spotlight Valuation Details */}
                  {activeSpotlight && (
                    <div className="spotlight-valuation-details">
                      <div className="spotlight-device-title-row">
                        <div>
                          <span className="spotlight-brand-tag">{activeSpotlight.brand}</span>
                          <h3 className="spotlight-device-name">{activeSpotlight.name}</h3>
                        </div>
                        <div className="spotlight-rating-tag">
                          <span>⭐ 4.9</span>
                        </div>
                      </div>

                      <div className="spotlight-price-box">
                        <span className="spotlight-price-label">Maximum Estimated Payout</span>
                        <div className="spotlight-price-val">
                          ₹{activeSpotlight.basePrice?.toLocaleString('en-IN')}*
                        </div>
                        <span className="spotlight-price-sub">Zero hidden charges · Free doorstep inspection</span>
                      </div>

                      {/* Specs Tags */}
                      <div className="spotlight-specs-row">
                        {activeSpotlight.storageGB && (
                          <span className="spotlight-spec-chip">📦 {activeSpotlight.storageGB.split(',')[0]} Storage</span>
                        )}
                        {activeSpotlight.ramGB && (
                          <span className="spotlight-spec-chip">💾 {activeSpotlight.ramGB.split(',')[0]} RAM</span>
                        )}
                        <span className="spotlight-spec-chip">✨ Flawless Grade</span>
                      </div>

                      {/* Primary CTA Button */}
                      <button
                        className="spotlight-cta-btn"
                        onClick={() => handleProductSelect(activeSpotlight)}
                      >
                        Sell This Device Now ➔
                      </button>

                      <div className="spotlight-guarantee-note">
                        🔒 Best Price Guarantee in Mumbai or ₹1,000 credit
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* BRANDS MARQUEE */}
          <section className="brands-section">
            <p className="brands-label">📦 Top Brands We Accept & Value</p>
            <div className="brands-track-outer">
              <div className="brands-track">
                {[...brands, ...brands].map((b, i) => (
                  <div key={i} className="brand-chip" style={{ '--baccent': b.accent }}>
                    <div className="brand-chip-logo">
                      {getBrandLogo(b)}
                    </div>
                    <span className="brand-chip-name">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- CATALOG SECTION --- */}
          <section id="catalog-hub-section" className="section" style={{ paddingTop: '2rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem' }}>
              <span className="section-eyebrow-badge">HARDWARE CATALOG</span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0.6rem 0 0.8rem', letterSpacing: '-1px' }}>
                Select Your Device to Sell
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
                Choose your category and brand below to preview real-time AI valuations and start your 45-second diagnostic quiz.
              </p>
            </div>

            {/* Category Hub Switcher */}
            <div className="category-hub">
              {Object.keys(productsData).map(cat => {
                const count = productsData[cat] ? Object.values(productsData[cat]).flat().length : 0;
                return (
                  <button
                    key={cat}
                    className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setHomeBrandFilter('All');
                    }}
                  >
                    <span>
                      {cat === 'Mobiles' && '📱'}
                      {cat === 'Laptops' && '💻'}
                      {cat === 'Earbuds' && '🎧'}
                      {cat === 'Accessories' && '⌚'}
                    </span>
                    <span>{cat}</span>
                    <span className="cat-count-pill">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Brand Sub-Filter Pills */}
            {productsData[selectedCategory] && (
              <div className="catalog-brand-pills">
                {['All', ...Object.keys(productsData[selectedCategory])].map((b) => (
                  <button
                    key={b}
                    className={`brand-pill-btn ${homeBrandFilter === b ? 'active' : ''}`}
                    onClick={() => setHomeBrandFilter(b)}
                  >
                    {b === 'All' ? '✨ All Brands' : b}
                  </button>
                ))}
              </div>
            )}

            {/* Product Cards Grid */}
            <div className="product-grid">
              {productsData[selectedCategory] && Object.entries(productsData[selectedCategory])
                .filter(([brand]) => homeBrandFilter === 'All' || homeBrandFilter === brand)
                .map(([brand, models]) => (
                  models && models.map(product => (
                    <div
                      key={product.id}
                      className="product-card-modern"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="product-card-price-badge">
                        Up to ₹{product.basePrice?.toLocaleString('en-IN')}
                      </div>

                      <div className="product-card-img-wrap">
                        <img src={product.image} alt={product.name} className="product-image" />
                      </div>

                      <div className="product-card-body">
                        <span className="product-card-brand">{brand}</span>
                        <h3 className="product-card-title">{product.name}</h3>

                        {/* Specs Display */}
                        {(product.ramGB || product.storageGB || product.watchVariant) && (
                          <div className="product-card-specs">
                            {product.ramGB && product.category !== 'Mobiles' && product.category !== 'Earbuds' && (
                              <span className="spec-tag-ram">💾 {product.ramGB.includes(',') ? product.ramGB.split(',').length + ' RAM variants' : product.ramGB + ' GB'}</span>
                            )}
                            {product.storageGB && product.category !== 'Earbuds' && (
                              <span className="spec-tag-storage">📦 {product.storageGB.includes(',') ? product.storageGB.split(',').length + ' Storage tiers' : product.storageGB + ' GB'}</span>
                            )}
                            {product.watchVariant && product.category === 'Accessories' && (
                              <span className="spec-tag-watch">📡 {product.watchVariant.includes(',') ? product.watchVariant.split(',').length + ' Models' : product.watchVariant}</span>
                            )}
                          </div>
                        )}

                        <div className="product-card-footer">
                          <button className="product-card-cta-btn">
                            Sell For Cash ➔
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ))}
            </div>
          </section>

          {/* --- INSTANT VALUE SECTION --- */}
          <section className="section" style={{ paddingTop: '4rem', paddingBottom: '3rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '3.2rem', fontWeight: 900, lineHeight: 1.2, marginBottom: '1.5rem' }}>
                Check Your <span style={{ background: 'linear-gradient(to right, #10b981, var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Device Resale Value</span> Instantly
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1.7, marginBottom: '3rem' }}>
                Unlock the true market value of your electronics with our high-fidelity pricing engine. By analyzing your device's unique specs, physical condition, and real-time market trends, we provide a guaranteed, transparent valuation in seconds—paving the way for a seamless doorstep pickup experience.
              </p>

              <style>
                {`
                  @media (max-width: 768px) {
                    .stats-container {
                      flex-direction: column;
                      gap: 2rem;
                    }

                    .stat-divider {
                      width: 60px;
                      height: 1px;
                    }
                  }

                  /* ===================== */
                  /* REVIEW SECTION STYLES */
                  /* ===================== */

                  .review-card-modern {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 2rem;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    overflow: hidden;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
                  }

                  .review-card-modern:hover {
                    transform: translateY(-10px);
                    background: #ffffff;
                    border-color: rgba(124, 58, 237, 0.3);
                    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
                  }

                  .review-card-modern::before {
                    content: '"';
                    position: absolute;
                    top: -10px;
                    left: 20px;
                    font-size: 8rem;
                    color: rgba(0, 0, 0, 0.04);
                    font-family: serif;
                    pointer-events: none;
                  }

                  .review-avatar-glow {
                    width: 50px;
                    height: 50px;
                    background: var(--primary-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    color: white;
                    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
                    border: 2px solid #ffffff;
                    border-radius: 50%;
                  }

                  .review-stars {
                    color: #fbbf24;
                    font-size: 1.1rem;
                    letter-spacing: 2px;
                  }

                  .review-user-info {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-top: auto;
                    padding-top: 1.5rem;
                    border-top: 1px solid #f1f5f9;
                  }

                  .review-submit-btn {
                    background: var(--primary-gradient);
                    border: none;
                    padding: 1rem 2.5rem;
                    border-radius: 50px;
                    color: white;
                    font-weight: 800;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.25);
                  }

                  .review-submit-btn:hover {
                    transform: translateY(-2px) scale(1.05);
                    box-shadow: 0 12px 28px rgba(124, 58, 237, 0.35);
                  }

                  .review-form-container {
                    max-width: 520px;
                    margin: 0 auto;
                    padding: 1.5rem;
                    border-radius: 24px;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.05);
                  }

                  .review-input-group {
                    display: block;
                    margin-bottom: 1rem;
                  }

                  .review-label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                    display: block;
                  }

                  .review-input-minimal {
                    background: #f8fafc;
                    border: 1px solid #cbd5e1;
                    border-radius: 12px;
                    padding: 0.8rem 1rem;
                    color: #0f172a;
                    width: 100%;
                    outline: none;
                    transition: all 0.2s;
                    font-size: 0.95rem;
                    font-family: inherit;
                    box-sizing: border-box;
                  }

                  .review-input-minimal:focus {
                    border-color: var(--primary);
                    background: #ffffff;
                    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
                  }


                  .reviews-vertical-container {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-auto-columns: 1fr;
                    gap: 1.5rem;
                    height: 700px;
                    max-width: 1200px;
                    margin: 2rem auto;
                    overflow: hidden;
                    position: relative;
                    mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
                    -webkit-mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
                    padding: 0 1rem;
                  }

                  .review-col {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                  }

                  .scroll-up { animation: scrollUp 45s linear infinite; }
                  .scroll-down { animation: scrollDown 45s linear infinite; }
                  
                  .review-col:hover { animation-play-state: paused; }

                  @keyframes scrollUp {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                  }

                  @keyframes scrollDown {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(0); }
                  }

                  .review-card-proper {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    transition: all 0.3s ease;
                    position: relative;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
                  }

                  .review-card-proper:hover {
                    background: #ffffff;
                    border-color: rgba(124, 58, 237, 0.3);
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.07);
                  }

                  .review-badge-google { background: rgba(37, 99, 235, 0.1); color: #2563eb; }
                  .review-badge-play { background: rgba(16, 185, 129, 0.1); color: #059669; }
                  .review-badge-apple { background: rgba(100, 116, 139, 0.1); color: #475569; }

                  .review-badge-pill {
                    font-size: 0.6rem;
                    font-weight: 800;
                    padding: 2px 10px;
                    border-radius: 50px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                  }

                  @media (max-width: 1200px) {
                    .reviews-vertical-container {
                      grid-template-columns: repeat(3, 1fr);
                      gap: 1rem;
                    }
                  }

                  @media (max-width: 900px) {
                    .reviews-vertical-container {
                      grid-template-columns: repeat(2, 1fr);
                    }
                    .hide-on-small-tablet { display: none; }
                  }

                  @media (max-width: 600px) {
                    .reviews-vertical-container {
                      grid-template-columns: 1fr;
                      height: 500px;
                    }
                    .hide-on-mobile { display: none; }
                  }
                `}
              </style>

              <div className="stats-container">
                <div className="stat-item">
                  <span className="stat-value">5,000+</span>
                  <span className="stat-label">Supported Devices</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-value">10,000+</span>
                  <span className="stat-label">Daily Calculations</span>
                </div>
              </div>
            </div>
          </section>

          {/* --- WHY PEOPLE TRUST US BENTO GRID --- */}
          <section className="section" style={{ paddingTop: '3.5rem', paddingBottom: '4rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="section-eyebrow-badge">THE CELL MASTER PRO ADVANTAGE</span>
              <h2 style={{ fontSize: '2.8rem', fontWeight: 900, margin: '0.6rem 0 1rem', letterSpacing: '-1px' }}>
                Why Mumbai <span style={{ background: 'linear-gradient(to right, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Trusts Us</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
                Built from the ground up to replace shady pawnshops and risky classified ads with transparent, certified, doorstep re-commerce.
              </p>
            </div>

            <div className="bento-trust-grid">
              <div className="bento-trust-card bento-accent-card">
                <div className="bento-card-top">
                  <div className="bento-icon-box" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
                    🤖
                  </div>
                  <span className="bento-badge" style={{ background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>AI PRICING</span>
                </div>
                <h3 className="bento-title">Real-Time Fair Market Valuation</h3>
                <p className="bento-desc">
                  Our proprietary pricing algorithm analyzes 15,000+ daily secondary market transactions across India, ensuring you receive the highest guaranteed payout without haggling.
                </p>
                <div className="bento-footer-stat">
                  <span>⚡ 98.4% quotes accepted on the spot</span>
                </div>
              </div>

              <div className="bento-trust-card">
                <div className="bento-card-top">
                  <div className="bento-icon-box" style={{ background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>
                    🚚
                  </div>
                  <span className="bento-badge" style={{ background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>DOORSTEP CONVENIENCE</span>
                </div>
                <h3 className="bento-title">Free 2-Hour Doorstep Pickup</h3>
                <p className="bento-desc">
                  Background-verified tech specialists arrive at your Mumbai home or office at your exact selected time slot. Zero travel, zero waiting, and 100% free inspection.
                </p>
                <div className="bento-footer-stat">
                  <span>📍 Covering all Mumbai pincodes</span>
                </div>
              </div>

              <div className="bento-trust-card">
                <div className="bento-card-top">
                  <div className="bento-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                    💸
                  </div>
                  <span className="bento-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>INSTANT SETTLEMENT</span>
                </div>
                <h3 className="bento-title">Direct UPI / Bank Transfer</h3>
                <p className="bento-desc">
                  Payment is transferred to your UPI or bank account right on the spot before our technician leaves your premises. What we quote is what lands in your account.
                </p>
                <div className="bento-footer-stat">
                  <span>⚡ Instant SMS & Bank Notification</span>
                </div>
              </div>

              <div className="bento-trust-card">
                <div className="bento-card-top">
                  <div className="bento-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
                    🔒
                  </div>
                  <span className="bento-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>MILITARY-GRADE WIPE</span>
                </div>
                <h3 className="bento-title">Certified DoD 5220.22-M Data Wipe</h3>
                <p className="bento-desc">
                  Every device undergoes certified multi-pass sanitization. Your personal photos, documents, and banking credentials are wiped permanently with zero recovery possibility.
                </p>
                <div className="bento-footer-stat">
                  <span>🛡️ 100% Privacy Guarantee Certificate</span>
                </div>
              </div>
            </div>
          </section>

          {/* --- HOW IT WORKS SECTION --- */}
          <section id="how-it-works" className="section" style={{ paddingTop: '6rem', paddingBottom: '2rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 3rem' }}>
              <h1 className="how-page-title">
                How <span className="text-gradient">Cell Master Pro</span> Works
              </h1>
              <p className="how-page-subtitle">
                Experience the future of device trade-ins. Get a quote, book a slot, and get paid
                instantly — all from your doorstep.
              </p>
            </div>

            <div className="how-it-works-grid">
              <div className="how-step-card">
                <div className="how-icon-box"><img src="/assets/how/step1.png" alt="Check Price" className="how-icon-image" /></div>
                <div className="how-step-info"><div className="how-step-badge">STEP 01</div><h3>Check Price</h3></div>
                <p>Select your device & tell us about its condition, and our AI tech will tailor make the perfect price for you.</p>
              </div>
              <div className="how-step-card">
                <div className="how-icon-box"><img src="/assets/how/step2.png" alt="Schedule" className="how-icon-image" /></div>
                <div className="how-step-info"><div className="how-step-badge">STEP 02</div><h3>Schedule Pickup</h3></div>
                <p>Book a free pickup from your home or work at a time slot that best suits your convenience.</p>
              </div>
              <div className="how-step-card">
                <div className="how-icon-box"><img src="/assets/how/step3.png" alt="Get Paid" className="how-icon-image" /></div>
                <div className="how-step-info"><div className="how-step-badge">STEP 03</div><h3>Get Paid</h3></div>
                <p>You get paid as soon as our executive picks up your device. It's instant payment all the way!</p>
              </div>
            </div>

            <div className="faq-section">
              <h2 className="faq-title">Frequently Asked Questions</h2>
              <div className="faq-list">
                {[
                  { q: "How does Cell Master Pro calculate my device value?", a: "Our proprietary AI engine analyzes your device model, age, and physical condition against live market trends to provide the highest quote instantly." },
                  { q: "Is the doorstep pickup truly free?", a: "Yes! Zero hidden fees. We provide free doorstep pickup from your home or office at your chosen time slot." },
                  { q: "When will I receive my payment?", a: "As soon as our executive verifies the device at your doorstep, the payment is initiated instantly via Bank Transfer or UPI." },
                  { q: "What all items do you buy?", a: "We buy premium Smartphones, Laptops, Earbuds, and Smartwatches. We are constantly expanding our catalog." },
                  { q: "Is my personal data safe?", a: "Safety is our priority. We recommend a factory reset, but our experts also perform a secure data wiping process for 100% privacy." },
                  { q: "Can I sell a dead device?", a: "Yes! We buy non-functional devices for salvageable hardware parts, helping you recycle responsibly and earn cash." },
                  { q: "Do I need the original box?", a: "Not mandatory, but providing original accessories, boxes, and bills can significantly increase your final quote." },
                  { q: "What if I disagree with the evaluation?", a: "Our executive checks in front of you. If you're not satisfied with the final price, you can cancel for free on the spot." },
                  { q: "Do you offer corporate trade-ins?", a: "Yes! Reach out to our support team for specialized bulk services and dedicated account management." },
                  { q: "Will I receive a receipt?", a: "Yes. Once the transaction is successful, a digital 'Sale Receipt' is instantly sent to your registered email address." }
                ].map((faq, idx) => (
                  <div key={idx} className={`faq-item ${expandedFaq === idx ? 'active' : ''}`}>
                    <button className="faq-question" onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}>
                      {faq.q}
                      <span className="faq-icon">▼</span>
                    </button>
                    <div className="faq-answer-wrapper">
                      <div className="faq-answer">{faq.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="coverage-section" id="coverage">
              <h3 className="coverage-title">Operational Coverage</h3>
              <div className="mumbai-display">
                <div className="location-marker">📍</div>
                <h2 className="mumbai-badge">MUMBAI</h2>
                <p className="serving-text">Currently Serving <span>Exclusively</span> in the Financial Capital</p>
                <div className="mumbai-stats">
                  <div className="stat-pill"><span>⚡</span> 60s Evaluation</div>
                  <div className="stat-pill"><span>🚚</span> 2hr Pickup</div>
                  <div className="stat-pill"><span>💰</span> Instant Cash</div>
                </div>
              </div>
            </div>
          </section>

          {/* ── REVIEWS SECTION ── */}
          <section className="section" style={{ paddingTop: '0', paddingBottom: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '3.2rem', fontWeight: 900, background: 'linear-gradient(135deg, #0f172a 20%, var(--primary) 70%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.8rem' }}>
                What Our Customers Say
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>Real reviews from real people who've trusted Cell Master Pro.</p>
            </div>

            {reviews.length > 0 ? (
              <div className="reviews-vertical-container">
                {/* Column 1 */}
                <div className="review-col scroll-up">
                  {[...reviews, ...reviews, ...reviews, ...reviews].map((r, i) => (
                    <div key={`c1-${i}`} className="review-card-proper">
                      <div style={{ color: '#fbbf24', fontSize: '0.9rem', letterSpacing: '2px' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div className="review-avatar-glow" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{r.userName}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`review-badge-pill ${i % 3 === 0 ? 'review-badge-google' : i % 3 === 1 ? 'review-badge-play' : 'review-badge-apple'}`}>
                              {i % 3 === 0 ? 'Google' : i % 3 === 1 ? 'Play Store' : 'App Store'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{r.createdAt.split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        "{r.body}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Column 2 */}
                <div className="review-col scroll-down">
                  {[...reviews, ...reviews, ...reviews, ...reviews].reverse().map((r, i) => (
                    <div key={`c2-${i}`} className="review-card-proper">
                      <div style={{ color: '#fbbf24', fontSize: '0.9rem', letterSpacing: '2px' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div className="review-avatar-glow" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{r.userName}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`review-badge-pill ${i % 2 === 0 ? 'review-badge-google' : 'review-badge-play'}`}>
                              {i % 2 === 0 ? 'Google' : 'Play Store'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{r.createdAt.split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        "{r.body}"
                      </p>
                    </div>
                  ))}
                </div>

                {/* Column 3 */}
                <div className="review-col scroll-up hide-on-small-tablet">
                  {[...reviews, ...reviews, ...reviews, ...reviews].sort((a, b) => b.id - a.id).map((r, i) => (
                    <div key={`c3-${i}`} className="review-card-proper">
                      <div style={{ color: '#fbbf24', fontSize: '0.9rem', letterSpacing: '2px' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <div className="review-avatar-glow" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                          {r.userName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{r.userName}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`review-badge-pill ${i % 2 === 0 ? 'review-badge-apple' : 'review-badge-google'}`}>
                              {i % 2 === 0 ? 'App Store' : 'Google'}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{r.createdAt.split(',')[0]}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ color: '#334155', fontSize: '0.92rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                        "{r.body}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
                No reviews yet — be the first to share your experience! ✨
              </div>
            )}

            {/* Enhanced 'Leave a Review' Form */}
            <div className="review-form-container">
              <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}>
                <span style={{ marginRight: '8px' }}>✍️</span> Share Your Experience
              </h3>

              {reviewSuccess ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📬</div>
                  <h4 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem' }}>Review Published!</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Your feedback helps the community grow.</p>
                  <button className="btn" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }} onClick={() => { setReviewSuccess(false); setReviewForm({ rating: 5, body: '' }); }}>Add Another</button>
                </div>
              ) : (
                <>
                  {!user && (
                    <div style={{ background: 'rgba(124, 58, 237, 0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '0.8rem', marginBottom: '1rem', color: '#6d28d9', fontSize: '0.85rem', textAlign: 'center' }}>
                      Login required to post a review. <button style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setStep('login')}>Sign In</button>
                    </div>
                  )}

                  {reviewError && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '0.6rem', marginBottom: '1rem', color: '#f87171', fontSize: '0.85rem' }}>{reviewError}</div>
                  )}

                  <div className="review-input-group">
                    <label className="review-label">Your Rating</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '1.5rem', color: star <= reviewForm.rating ? '#fbbf24' : '#cbd5e1',
                            transition: 'all 0.2s'
                          }}
                        >★</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label className="review-label">Your Testimonial</label>
                    <textarea
                      className="review-input-minimal"
                      placeholder="Share your experience with Cell Master Pro..."
                      rows={4}
                      style={{ resize: 'none' }}
                      value={reviewForm.body}
                      onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                    />
                  </div>

                  <button
                    className="review-submit-btn"
                    style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', fontWeight: 700 }}
                    disabled={reviewLoading}
                    onClick={async () => {
                      if (!user) { setStep('login'); return; }
                      if (!reviewForm.body) { setReviewError('Please write your review'); return; }
                      setReviewError('');
                      setReviewLoading(true);
                      try {
                        const res = await fetch(`${API_URL}/reviews`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                          body: JSON.stringify(reviewForm)
                        });
                        const data = await res.json();
                        if (res.ok) { setReviews(prev => [data, ...prev]); setReviewSuccess(true); }
                        else setReviewError(data.error || 'Failed to submit review');
                      } catch { setReviewError('Network error'); }
                      finally { setReviewLoading(false); }
                    }}
                  >
                    {reviewLoading ? '🚀 Sending...' : '✨ Publish Review'}
                  </button>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {step === 'sell' && (
        <div className="fade-in section" style={{ maxWidth: '1200px', paddingTop: '0' }}>
          <div className="sell-layout">
            {/* SIDEBAR: CATEGORIES */}
            <div className="sell-sidebar">
              {Object.keys(productsData).map(cat => (
                <div
                  key={cat}
                  className={`sell-sidebar-item ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => { setSelectedCategory(cat); setSellStage('brand'); setSelectedBrand(null); setSellSearch(''); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>
                      {cat === 'Mobiles' && '📱'}
                      {cat === 'Laptops' && '💻'}
                      {cat === 'Earbuds' && '🎧'}
                      {cat === 'Accessories' && '⌚'}
                    </span>
                    {cat.endsWith('s') ? cat.slice(0, -1) : cat}
                  </div>
                  <span>❯</span>
                </div>
              ))}
            </div>

            {/* MAIN CONTENT: BRANDS OR PRODUCTS */}
            <div className="sell-main">
              {sellStage !== 'product' ? (
                <div className="fade-in">
                  <h2 className="sell-brand-title">Top Brands</h2>
                  <div className="sell-brand-grid">
                    {productsData[selectedCategory] && Object.keys(productsData[selectedCategory]).map(brandName => {
                      const brandObj = brands.find(b => b.name.toLowerCase() === brandName.toLowerCase()) || { name: brandName };
                      return (
                        <div
                          key={brandName}
                          className={`sell-brand-item ${selectedBrand === brandName ? 'active' : ''}`}
                          onClick={() => { setSelectedBrand(brandName); setSellStage('product'); setSellSearch(''); }}
                        >
                          <div style={{ height: '50px', display: 'flex', alignItems: 'center', marginBottom: '0.8rem' }}>
                            {getBrandLogo(brandObj)}
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{brandName}</span>
                        </div>
                      );
                    })}
                  </div>
                  {sellStage === 'brand' && (
                    <button className="btn btn-secondary" onClick={() => setSellStage('category')} style={{ marginTop: '2rem' }}>Back to Categories</button>
                  )}
                </div>
              ) : (
                <div className="fade-in">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                    <button
                      className="btn-secondary"
                      style={{
                        padding: '0.6rem 1.2rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        borderColor: 'var(--primary)',
                        color: 'var(--primary)',
                        background: 'rgba(124, 58, 237, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        fontWeight: 600
                      }}
                      onClick={() => { setSellStage('brand'); setSellSearch(''); }}
                    >
                      ← Brands
                    </button>
                    <h2 className="sell-brand-title" style={{ marginBottom: 0, marginTop: 0 }}>Select {selectedBrand} Model</h2>
                  </div>

                  <div className="search-bar-container">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder={`Search your ${selectedBrand} ${selectedCategory.endsWith('s') ? selectedCategory.slice(0, -1) : selectedCategory}...`}
                      className="search-input"
                      value={sellSearch}
                      onChange={(e) => setSellSearch(e.target.value)}
                    />
                  </div>

                  <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem', marginTop: 0 }}>
                    {productsData[selectedCategory] && productsData[selectedCategory][selectedBrand] &&
                      productsData[selectedCategory][selectedBrand]
                        .filter(product => product.name.toLowerCase().includes(sellSearch.toLowerCase()))
                        .map(product => (
                          <div key={product.id} className="glass-panel product-card" style={{ padding: '1.5rem' }} onClick={() => handleProductSelect(product)}>
                            <img src={product.image} alt={product.name} className="product-image" style={{ height: '130px', marginBottom: '1rem' }} />
                            <h4 style={{ margin: '0.5rem 0', fontSize: '1.1rem', fontWeight: 600 }}>{product.name}</h4>

                            {/* Status badges */}
                            {(product.ramGB || product.storageGB || product.watchVariant) && (
                              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                {product.ramGB && selectedCategory !== 'Mobiles' && selectedCategory !== 'Earbuds' && (
                                  <span style={{
                                    display: 'inline-block', background: 'rgba(124, 58, 237, 0.08)',
                                    border: '1px solid rgba(124, 58, 237, 0.2)', borderRadius: '6px',
                                    color: '#6d28d9', fontSize: '0.65rem', fontWeight: 700,
                                    padding: '0.1rem 0.4rem', letterSpacing: '0.2px'
                                  }}>{product.ramGB.includes(',') ? product.ramGB.split(',').length + ' RAM Options' : product.ramGB + ' GB RAM'}</span>
                                )}
                                {product.storageGB && selectedCategory !== 'Earbuds' && (
                                  <span style={{
                                    display: 'inline-block', background: 'rgba(13, 148, 136, 0.08)',
                                    border: '1px solid rgba(13, 148, 136, 0.25)', borderRadius: '6px',
                                    color: '#0f766e', fontSize: '0.65rem', fontWeight: 700,
                                    padding: '0.1rem 0.4rem', letterSpacing: '0.2px'
                                  }}>{product.storageGB.includes(',') ? product.storageGB.split(',').length + ' Storage' : product.storageGB + ' GB'}</span>
                                )}
                                {product.watchVariant && selectedCategory === 'Accessories' && (
                                  <span style={{
                                    display: 'inline-block', background: 'rgba(2, 132, 199, 0.08)',
                                    border: '1px solid rgba(2, 132, 199, 0.25)', borderRadius: '6px',
                                    color: '#0369a1', fontSize: '0.65rem', fontWeight: 700,
                                    padding: '0.1rem 0.4rem', letterSpacing: '0.2px'
                                  }}>📡 {product.watchVariant.includes(',') ? product.watchVariant.split(',').length + ' Models' : product.watchVariant}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* --- BUY REFURBISHED VIEW --- */}

      {step === 'buy' && (
        <div className="fade-in section" style={{ paddingTop: '1rem' }}>
          <div className="buy-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 900 }}>Premium Refurbished Store</h1>
            <p className="subtitle" style={{ maxWidth: '800px', margin: '0 auto' }}>
              Ecologically sustainable, professionally verified, and wallet-friendly.
              Get your favorite electronics at a fraction of the cost.
            </p>
          </div>

          <div className="category-hub" style={{ marginBottom: '3rem' }}>
            {Object.keys(productsData).map(cat => (
              <button
                key={cat}
                className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'Mobiles' && '📱'}
                {cat === 'Laptops' && '💻'}
                {cat === 'Earbuds' && '🎧'}
                {cat === 'Accessories' && '⌚'} {cat}
              </button>
            ))}
          </div>

          <div className="refurbished-grid">
            {refurbishedProducts
              .filter(p => p.category === selectedCategory)
              .map(product => (
                <div key={product.id} className="glass-panel refurbished-card">
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
                    {/* Spec badges row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', margin: '0.5rem 0' }}>
                      {(product.category === 'Laptops') && product.ramGB && (
                        <span style={{
                          background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)',
                          borderRadius: '6px', color: '#6d28d9', fontSize: '0.7rem', fontWeight: 700,
                          padding: '0.15rem 0.55rem', letterSpacing: '0.3px'
                        }}>💾 {product.ramGB.includes(',') ? product.ramGB.split(',').length + ' Variants' : product.ramGB + ' GB'}</span>
                      )}
                      {(product.category === 'Mobiles' || product.category === 'Laptops') && product.storageGB && (
                        <span style={{
                          background: 'rgba(13, 148, 136, 0.08)', border: '1px solid rgba(13, 148, 136, 0.25)',
                          borderRadius: '6px', color: '#0f766e', fontSize: '0.7rem', fontWeight: 700,
                          padding: '0.15rem 0.55rem', letterSpacing: '0.3px'
                        }}>📦 {product.storageGB.includes(',') ? product.storageGB.split(',').length + ' Storage' : (parseInt(product.storageGB) >= 1024 ? parseInt(product.storageGB) / 1024 + ' TB' : product.storageGB + ' GB')}</span>
                      )}
                      {product.category === 'Accessories' && product.watchVariant && (
                        <span style={{
                          background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.25)',
                          borderRadius: '6px', color: '#0369a1', fontSize: '0.7rem', fontWeight: 700,
                          padding: '0.15rem 0.55rem', letterSpacing: '0.3px'
                        }}>📡 {product.watchVariant.includes(',') ? product.watchVariant.split(',').length + ' Variants' : product.watchVariant}</span>
                      )}
                    </div>

                    <div className="price-container">
                      <div className="price-group">
                        <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        <span className="discount-tag">-{product.discount}% OFF</span>
                      </div>
                      <div className="final-price">₹{product.refurbishedPrice.toLocaleString('en-IN')}</div>
                    </div>

                    <button className="btn btn-buy" style={{ width: '100%', marginTop: '1.5rem' }}>
                      Buy This {selectedCategory.slice(0, -1)}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* --- REPAIR SECTION VIEW --- */}
      {step === 'repair' && (
        <div className="fade-in section" style={{ paddingTop: '1rem' }}>
          {repairStep === 'list' && (
            <>
              <div className="repair-step-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 900 }}>Professional Repair Services</h1>
                <p className="subtitle">High-quality repairs with authentic parts and instant doorstep service.</p>
              </div>
              <div className="repair-grid">
                {repairServices.map(service => (
                  <div key={service.id} className="repair-card" onClick={() => handleRepairSelect(service)}>
                    <div className="repair-icon-box">{service.icon}</div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <div className="repair-footer">
                      <div className="repair-price-info">
                        <span className="repair-label">Starting From</span>
                        <span className="repair-price-value">₹{service.basePrice.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="repair-time-badge">
                        <span>⏱️</span> {service.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="repair-quality-badges" style={{ marginTop: '4rem' }}>
                <div className="quality-badge glass-panel">
                  <div className="q-icon">🛡️</div>
                  <div className="q-info">
                    <h4>6 Months Warranty</h4>
                    <p>Guaranteed peace of mind post-repair</p>
                  </div>
                </div>
                <div className="quality-badge glass-panel">
                  <div className="q-icon">🔧</div>
                  <div className="q-info">
                    <h4>OEM Quality Parts</h4>
                    <p>Authentic components for longevity</p>
                  </div>
                </div>
                <div className="quality-badge glass-panel">
                  <div className="q-icon">👨‍🔧</div>
                  <div className="q-info">
                    <h4>Certified Experts</h4>
                    <p>Repaired by skilled professionals</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {repairStep === 'brand' && selectedRepair && (
            <div className="repair-step-container">
              <div className="repair-step-header">
                <button className="btn btn-secondary" style={{ marginBottom: '2rem', padding: '0.4rem 1rem' }} onClick={() => setRepairStep('list')}>← Back to Services</button>
                <h2>Select Your Brand</h2>
                <p className="subtitle">Choose the manufacturer for your {selectedRepair.name.toLowerCase()}.</p>
              </div>
              <div className="brand-selection-grid">
                {brands.map(brand => (
                  <div
                    key={brand.name}
                    className={`brand-repair-card ${selectedRepairBrand?.name === brand.name ? 'selected' : ''}`}
                    onClick={() => handleRepairBrandSelect(brand)}
                  >
                    <div className="brand-chip-logo" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', height: '40px', color: 'var(--text-main)' }}>
                      {getBrandLogo(brand)}
                    </div>
                    <span className="brand-chip-name">{brand.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {repairStep === 'confirm' && selectedRepair && selectedRepairBrand && (
            <div className="repair-step-container fade-in">
              <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto', padding: '0', overflow: 'hidden', borderTop: '4px solid #2dd4bf', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>

                <div style={{ padding: '2rem 1.5rem 1rem', textAlign: 'center' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(45, 212, 191, 0.1)', color: '#2dd4bf', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', margin: '0 auto 1rem', border: '1px solid rgba(45, 212, 191, 0.3)' }}>
                    ✓
                  </div>
                  <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.3rem 0', fontWeight: 900 }}>Ready to Repair</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Review your booking details below</p>
                </div>

                <div style={{ padding: '0 1.2rem 1.5rem' }}>
                  <div className="invoice-card">
                    <div className="invoice-row">
                      <div className="invoice-label">Brand</div>
                      <div className="invoice-value">
                        {getBrandLogo(selectedRepairBrand)}
                        {selectedRepairBrand.name}
                      </div>
                    </div>
                    <div className="invoice-row">
                      <div className="invoice-label">Service</div>
                      <div className="invoice-value">{selectedRepair.name}</div>
                    </div>

                    <div className="invoice-divider"></div>

                    <div className="invoice-total-row">
                      <div className="invoice-total-label">Estimated Price</div>
                      <div className="invoice-total-value">₹{selectedRepair.basePrice.toLocaleString('en-IN')}</div>
                    </div>

                    <div className="invoice-footer-note">
                      <span style={{ color: '#fbbf24', fontSize: '0.85rem', marginRight: '6px' }}>⚠️</span> Subject to physical diagnosis.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', padding: '0.8rem 0' }} onClick={() => setRepairStep('brand')}>Change</button>
                    <button className="btn" style={{ flex: 2, fontSize: '0.85rem', padding: '0.8rem 0' }} onClick={() => {
                      if (!user) { setStep('login'); setAuthError('Please login to book a repair'); }
                      else setStep('scheduleRepair');
                    }}>{user ? 'Schedule Visit' : 'Login to Book'} ➔</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- SCHEDULE REPAIR VIEW --- */}
      {step === 'scheduleRepair' && selectedRepair && selectedRepairBrand && (
        <div className="fade-in section" style={{ paddingTop: '1rem' }}>
          <div className="glass-panel form-container" style={{ padding: '2.5rem' }}>
            {repairSuccess ? (
              <div style={{ padding: '3rem 1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🛠️</div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Booking Confirmed!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                  Your repair for <strong>{selectedRepairBrand.name} {selectedRepair.name}</strong> has been booked. Our technician will contact you shortly at <strong>{repairForm.mobile}</strong>.
                </p>
                <button className="btn" onClick={() => { setStep('home'); setRepairSuccess(false); setRepairForm({ address: '', mobile: '' }); }}>Back to Home</button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Repair Details</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Please provide your contact info for the technician visit.</p>

                {authError && <div className="auth-error">{authError}</div>}

                <form onSubmit={handleRepairSubmit}>
                  <div className="form-group">
                    <label>Visit Address</label>
                    <textarea
                      className="form-input"
                      style={{ minHeight: '100px', resize: 'vertical', paddingTop: '1rem' }}
                      placeholder="Where should we send the technician?" required
                      value={repairForm.address}
                      onChange={(e) => setRepairForm({ ...repairForm, address: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="10-digit mobile number" required
                      pattern="[0-9]{10}"
                      value={repairForm.mobile}
                      onChange={(e) => setRepairForm({ ...repairForm, mobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Visit Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={repairForm.visitDate}
                      onChange={(e) => setRepairForm({ ...repairForm, visitDate: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep('repair')}>Back</button>
                    <button type="submit" className="btn" style={{ flex: 2 }}>Complete Booking</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- SELECT SPECS VIEW --- */}
      {step === 'specs' && selectedProduct && (
        <div className="fade-in section" style={{ paddingTop: '1rem' }}>
          <div className="glass-panel quiz-container" style={{ padding: '2.5rem' }}>
            <div className="quiz-header" style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                <div>
                  <h2 style={{ fontSize: '2rem', margin: 0 }}>{selectedProduct.name}</h2>
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Select your exact variant to continue</p>
                </div>
              </div>
            </div>

            {selectedCategory === 'Laptops' && (
              <div className="quiz-question">
                <h4>What is the RAM of your Laptop?</h4>
                <div className="options-grid">
                  {(selectedProduct.ramGB ? selectedProduct.ramGB.split(',').map(s => s.trim()) : ['4', '8', '12', '16', '32', '64']).map(r => (
                    <div key={r} className={`option-card ${conditions.ramGB === r ? 'selected' : ''}`} onClick={() => handleConditionChange('ramGB', r)}>{r} GB</div>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'Accessories' && (
              <div className="quiz-question">
                <h4>Connectivity / Model Variant?</h4>
                <div className="options-grid">
                  {(selectedProduct.watchVariant ? selectedProduct.watchVariant.split(',').map(s => s.trim()) : ['GPS', 'GPS + Cellular', 'Bluetooth']).map(v => (
                    <div key={v} className={`option-card ${conditions.watchVariant === v ? 'selected' : ''}`} onClick={() => handleConditionChange('watchVariant', v)}>{v}</div>
                  ))}
                </div>
              </div>
            )}

            {(selectedCategory === 'Mobiles' || selectedCategory === 'Laptops') && (
              <div className="quiz-question">
                <h4>What is the Storage Capacity?</h4>
                <div className="options-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                  {(selectedProduct.storageGB ? selectedProduct.storageGB.split(',').map(s => s.trim()) : (selectedCategory === 'Laptops' ? ['128', '256', '512', '1024', '2048'] : ['32', '64', '128', '256', '512', '1024'])).map(s => (
                    <div key={s} className={`option-card ${conditions.storageGB === s ? 'selected' : ''}`} onClick={() => handleConditionChange('storageGB', s)}>
                      {parseInt(s) >= 1024 ? parseInt(s) / 1024 + ' TB' : s + ' GB'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {quizError && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', textAlign: 'center' }}>
                ⚠️ {quizError}
              </div>
            )}

            <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => {
                setStep('sell');
                setSellStage('product');
              }}>Back to Catalog</button>
              <button className="btn" onClick={() => {
                const needsRam = selectedCategory === 'Laptops';
                const needsVariant = selectedCategory === 'Accessories';
                const needsStorage = selectedCategory === 'Mobiles' || selectedCategory === 'Laptops';

                if ((needsRam && !conditions.ramGB) || (needsStorage && !conditions.storageGB) || (needsVariant && !conditions.watchVariant)) {
                  let msg = 'Please select your variant to continue.';
                  if (needsRam && needsStorage) msg = 'Please select both RAM and Storage.';
                  else if (needsVariant) msg = 'Please select your Connectivity variant.';
                  setQuizError(msg);
                } else {
                  setQuizError('');
                  setStep('quiz');
                }
              }}>Continue to Evaluation</button>
            </div>
          </div>
        </div>
      )}

      {/* --- QUIZ VIEW --- */}
      {step === 'quiz' && selectedProduct && (
        <div className="fade-in section" style={{ paddingTop: '1rem' }}>
          <div className="glass-panel quiz-container" style={{ padding: '2.5rem' }}>
            <div className="quiz-header">
              <h2 style={{ fontSize: '2rem' }}>Evaluate your {selectedProduct.name}</h2>
              <p style={{ color: 'var(--text-muted)' }}>Answer exactly to get the best {selectedCategory.toLowerCase()} quote.</p>
            </div>

            {renderQuizQuestions()}

            {quizError && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                textAlign: 'center',
                fontSize: '0.95rem'
              }}>
                ⚠️ {quizError}
              </div>
            )}

            <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => {
                const hasVariants = selectedProduct.ramGB || selectedProduct.storageGB || selectedProduct.watchVariant;
                if (hasVariants && (selectedCategory === 'Mobiles' || selectedCategory === 'Laptops' || selectedCategory === 'Accessories')) {
                  setStep('specs');
                } else {
                  setStep('sell');
                  setSellStage('product');
                }
              }}>Back</button>
              <button className="btn" onClick={calculateQuote}>Calculate Exact Value</button>
            </div>
          </div>
        </div>
      )}

      {/* --- QUOTE VIEW --- */}
      {step === 'quote' && quote && (
        <div className="fade-in section" style={{ paddingTop: '0.5rem' }}>
          <div className="glass-panel" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', padding: '2rem 2rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{quote.deadDevice ? 'Parts & Scrap Offer' : 'Your Instant Value'}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>For {quote.productName} ({quote.category})</p>

            {quote.deadDevice && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '2rem',
                marginTop: '1.5rem',
                textAlign: 'left',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '2rem' }}>⚠️</div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', color: '#f87171' }}>Limited Functional Value</h4>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Since this device does not power on, we are offering a <b>minimum scrap value</b> for its usable components.
                    Dead devices cannot be refurbished and are recycled for parts.
                  </p>
                </div>
              </div>
            )}

            <div className="quote-value" style={{ margin: quote.deadDevice ? '1.5rem 0' : '2.5rem 0' }}>
              ₹{quote.predictedPrice.toLocaleString('en-IN')}
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '2rem',
              fontSize: '0.9rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '1.2rem' }}>📝</span>
              <span>
                <b>Note:</b> This is an **approximate** estimation. Our expert staff will perform a physical inspection to calculate the final exact value at the time of doorstep pickup.
              </span>
            </div>

            <p style={{ marginBottom: '3rem', color: 'var(--text-muted)' }}>Price includes free doorstep pickup & immediate bank transfer during handover.</p>

            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={() => setStep('quiz')}>Edit Answers</button>
              <button className="btn btn-secondary" onClick={() => { setStep('sell'); setSellStage('category'); }}>Sell Another Device</button>
              <button className="btn" onClick={() => user ? setStep('schedule') : setStep('login')}>
                {user ? 'Schedule Pickup' : 'Login to Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}




      {/* --- AUTHENTICATION VIEW --- */}
      {step === 'login' && (
        <div className="fade-in section">
          <div className="glass-panel form-container">
            <div className="auth-toggle">
              <button
                className={`auth-toggle-btn ${authStep === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthStep('login'); setAuthError(''); }}
              >
                Login
              </button>
              <button
                className={`auth-toggle-btn ${authStep === 'signup' ? 'active' : ''}`}
                onClick={() => { setAuthStep('signup'); setAuthError(''); }}
              >
                Create Account
              </button>
            </div>

            {authStep === 'login' ? (
              <>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Login to manage your pickups and track device statuses.</p>

                {authError && <div className="auth-error">{authError}</div>}

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your email" required
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••" required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Start Session</button>
                </form>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Join the Trade</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>One account for all your device evaluations and sales.</p>

                {authError && <div className="auth-error">{authError}</div>}

                <form onSubmit={handleSignup}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. John Doe" required
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@example.com" required
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Choose a password" required
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem' }}>Create Account</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {/* --- SCHEDULE PICKUP VIEW --- */}
      {step === 'schedule' && quote && (
        <div className="fade-in section">
          <div className="glass-panel form-container">
            {scheduleSuccess ? (
              <div style={{ padding: '3rem 1rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🗓️</div>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Pickup Scheduled!</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                  Thank you! Our agent will call you soon to confirm the pickup for <strong>{pickupForm.pickupDate}</strong> at your address.
                </p>
                <button className="btn" onClick={() => { setStep('home'); setScheduleSuccess(false); setPickupForm({ address: '', mobile: '', pickupDate: '' }); }}>Back to Home</button>
              </div>
            ) : (
              <>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Schedule Your Pickup</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Enter your details to confirm the doorstep evaluation.</p>

                {authError && <div className="auth-error">{authError}</div>}

                <form onSubmit={handleScheduleSubmit}>
                  <div className="form-group">
                    <label>Pickup Address</label>
                    <textarea
                      className="form-input"
                      style={{ minHeight: '100px', resize: 'vertical', paddingTop: '1rem' }}
                      placeholder="Enter full address with landmark" required
                      value={pickupForm.address}
                      onChange={(e) => setPickupForm({ ...pickupForm, address: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="10-digit mobile number" required
                      pattern="[0-9]{10}"
                      title="Please enter a 10-digit mobile number"
                      value={pickupForm.mobile}
                      onChange={(e) => setPickupForm({ ...pickupForm, mobile: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Pickup Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={pickupForm.pickupDate}
                      onChange={(e) => setPickupForm({ ...pickupForm, pickupDate: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep('quote')}>Back</button>
                    <button type="submit" className="btn" style={{ flex: 2 }}>Confirm Pickup</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}


      {/* --- SITE FOOTER --- */}
      <footer className="main-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="nav-brand-logo" onClick={() => setStep('home')} style={{ marginBottom: '1.25rem', cursor: 'pointer' }}>
              <div className="brand-logo-icon">
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="40" height="40" rx="12" fill="url(#cmpGradNav)" />
                  <path d="M4 14C4 9.02944 8.02944 5 13 5H27C31.9706 5 36 9.02944 36 14C36 14 30 18 20 18C10 18 4 14 4 14Z" fill="white" fillOpacity="0.2" />
                  <rect x="10" y="8" width="20" height="24" rx="4" stroke="white" strokeWidth="1.8" strokeOpacity="0.9" fill="none" />
                  <line x1="16.5" y1="10.5" x2="23.5" y2="10.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.8" />
                  <path d="M21.5 13L15.5 21H20L18.5 28L25.5 19.5H20.5L21.5 13Z" fill="#ffffff" />
                  <circle cx="20" cy="29" r="1" fill="white" fillOpacity="0.9" />
                </svg>
              </div>
              <div className="brand-logo-text">
                <div className="brand-title-wrap">
                  <span className="brand-title-cell">Cell</span>
                  <span className="brand-title-master">Master</span>
                  <span className="brand-badge-pro"><span className="badge-pro-dot">•</span>PRO</span>
                </div>
                <span className="brand-tagline">SMART RE-COMMERCE</span>
              </div>
            </div>
            <p className="footer-bio">
              Mumbai's premier digital sanctuary for precision device repair and verified high-performance tech. Trusted by 50k+ urban users for unmatched speed and engineering excellence.
            </p>
            <div className="footer-socials">
              <div className="social-link x" title="X / Twitter">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644z"/></svg>
              </div>
              <div className="social-link fb" title="Facebook">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
              </div>
              <div className="social-link ig" title="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </div>
              <div className="social-link ln" title="LinkedIn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.924 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
              </div>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Navigation</h4>
            <ul className="footer-links">
              <li className="footer-link" onClick={() => setStep('home')}>Homepage</li>
              <li className="footer-link" onClick={() => { setStep('home'); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}>How It Works</li>
              <li className="footer-link" onClick={() => { setStep('home'); setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}>Community FAQ</li>
              <li className="footer-link" onClick={() => { setStep('home'); setTimeout(() => document.getElementById('coverage')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}>Service Area</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Core Services</h4>
            <ul className="footer-links">
              <li className="footer-link" onClick={() => setStep('repair')}>Repair Center</li>
              <li className="footer-link" onClick={() => setStep('sell')}>Trade-in Desk</li>
              <li className="footer-link" onClick={() => setStep('buy')}>Refurbished Store</li>
              <li className="footer-link">B2B Solutions</li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support Central</h4>
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                Tech Hub 4, BKC, Mumbai
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                +91 98765 43210
              </div>
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                help@cellmasterpro.com
              </div>
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                Language: ENG | HIN | MAR
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2026 Cell Master Pro. Engineered for Mumbai. All Rights Reserved.</div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            <span style={{ cursor: 'pointer' }}>Security</span>
            <span style={{ cursor: 'pointer' }}>Privacy</span>
            <span style={{ cursor: 'pointer' }}>Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
