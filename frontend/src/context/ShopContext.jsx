import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [productsData, setProductsData] = useState({});
  const [refurbishedProducts, setRefurbishedProducts] = useState([]);
  const [repairServices, setRepairServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection/State
  const [selectedCategory, setSelectedCategory] = useState('Mobiles');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [conditions, setConditions] = useState({});
  const [quote, setQuote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Repair Flow
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [selectedRepairBrand, setSelectedRepairBrand] = useState(null);
  const [repairStep, setRepairStep] = useState('list');

  // Order Flow
  const [pickupForm, setPickupForm] = useState({ address: '', mobile: '', pickupDate: '' });
  const [orders, setOrders] = useState([]);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, refurbished, repairs] = await Promise.all([
          api.get('/products'),
          api.get('/refurbished'),
          api.get('/repair-services')
        ]);
        setProductsData(products);
        setRefurbishedProducts(refurbished);
        setRepairServices(repairs);
      } catch (err) {
        console.error("ShopContext error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    const initialConditions = {
      Mobiles: { turnsOn: true, screen: 'perfect', body: 'perfect', age: 'under_1' },
      Laptops: { turnsOn: true, screen: 'perfect', keyboard: 'perfect', body: 'perfect', age: 'under_1' },
      Earbuds: { hasCase: true, bothWork: true, age: 'under_1' },
      Accessories: { turnsOn: true, screen: 'perfect', strap: 'perfect', age: 'under_1' }
    };
    setConditions(initialConditions[product.category] || { age: 'under_1' });
    setQuote(null);
    setScheduleSuccess(false);
  };

  const getQuote = async () => {
    try {
      const data = await api.post('/evaluate', { productId: selectedProduct.id, conditions });
      setQuote(data);
      return data;
    } catch (err) {
      console.error("Evaluation error:", err);
      throw err;
    }
  };

  const schedulePickup = async () => {
    try {
      await api.post('/pickups', {
        ...pickupForm,
        productName: quote.productName,
        predictedPrice: quote.predictedPrice,
        conditions: conditions
      });
      setScheduleSuccess(true);
    } catch (err) {
      console.error("Pickup scheduling error:", err);
      throw err;
    }
  };

  const placeOrder = async (orderDetails) => {
    try {
      const data = await api.post('/orders', orderDetails);
      setOrderSuccess(true);
      return data;
    } catch (err) {
      console.error("Ordering error:", err);
      throw err;
    }
  };

  const fetchOrders = async () => {
    try {
      const data = await api.get('/admin/orders');
      setOrders(data);
    } catch (err) {
      console.error("Fetch orders error:", err);
    }
  };

  const filteredProducts = () => {
    if (!searchQuery) return productsData[selectedCategory] || {};
    
    const results = {};
    Object.keys(productsData).forEach(cat => {
      Object.keys(productsData[cat]).forEach(brand => {
        productsData[cat][brand].forEach(product => {
          if (product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            if (!results[brand]) results[brand] = [];
            results[brand].push(product);
          }
        });
      });
    });
    return results;
  };

  return (
    <ShopContext.Provider value={{
      productsData,
      refurbishedProducts,
      repairServices,
      loading,
      selectedCategory, setSelectedCategory,
      selectedProduct, handleProductSelect,
      conditions, setConditions,
      quote, getQuote,
      searchQuery, setSearchQuery,
      filteredProducts: filteredProducts(),
      
      selectedRepair, setSelectedRepair,
      selectedRepairBrand, setSelectedRepairBrand,
      repairStep, setRepairStep,
      
      pickupForm, setPickupForm,
      scheduleSuccess, setScheduleSuccess,
      schedulePickup,
      
      orders, fetchOrders,
      orderSuccess, setOrderSuccess,
      placeOrder
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => useContext(ShopContext);
