/**
 * Mock API Interceptor
 * 
 * Intercepts axios requests when USE_DUMMY_DATA is true
 * and returns dummy data instead of making real API calls
 */

import axios from "axios";
import { USE_DUMMY_DATA } from "../config/apiConfig";
import {
  DUMMY_CATEGORIES,
  DUMMY_SUBCATEGORIES,
  DUMMY_PRODUCTS,
  DUMMY_FEATURED,
  DUMMY_TOP_SELLING,
  DUMMY_WEEKLY_DROPS,
  DUMMY_MOST_SOLD,
  DUMMY_SALE_CATEGORIES,
  DUMMY_PROFILE,
  DUMMY_WISHLIST,
  DUMMY_ORDERS,
  DUMMY_ADDRESSES,
  DUMMY_PAYMENT_METHODS,
  getDummySearchResults,
  delay
} from "../data/dummyData";

/**
 * Get mock data for a given URL
 */
const getMockData = async (url, config) => {
  // Simulate network delay
  await delay(300 + Math.random() * 200);
  
  const params = config?.params || {};
  
  // Normalize URL - handle both absolute and relative paths
  const normalizedUrl = url.startsWith('http') ? new URL(url).pathname : url;
  const method = (config?.method || 'get').toLowerCase();
  
  if (normalizedUrl.includes('/api/v1/products/category-view') || normalizedUrl.includes('category-view')) {
    return DUMMY_CATEGORIES;
  }
  
  if (normalizedUrl.includes('/api/v1/products/category-subcategory-view') || normalizedUrl.includes('category-subcategory-view')) {
    return DUMMY_SUBCATEGORIES;
  }
  
  if (normalizedUrl.includes('/api/v1/products/featured-product') || normalizedUrl.includes('featured-product')) {
    return DUMMY_FEATURED;
  }
  
  if (normalizedUrl.includes('/api/v1/products/top-selling') || normalizedUrl.includes('top-selling')) {
    return DUMMY_TOP_SELLING;
  }
  
  if (normalizedUrl.includes('/api/v1/products/weekly-drops') || normalizedUrl.includes('weekly-drops')) {
    return DUMMY_WEEKLY_DROPS;
  }
  
  if (normalizedUrl.includes('/api/v1/products/most-sold-product') || normalizedUrl.includes('most-sold-product')) {
    return DUMMY_MOST_SOLD;
  }
  
  if (normalizedUrl.includes('/api/v1/products/sale-category-view') || normalizedUrl.includes('sale-category-view')) {
    return DUMMY_SALE_CATEGORIES;
  }
  
  if (normalizedUrl.includes('/api/v1/products/search-product-view') || normalizedUrl.includes('search-product-view')) {
    return getDummySearchResults(params.product_name || '', params);
  }
  
  if (normalizedUrl.includes('/api/v1/products/product-view') || normalizedUrl.includes('product-view')) {
    const productId = params?.id || params?.slug;
    return DUMMY_PRODUCTS.find(p => 
      p.id === Number(productId) || p.slug === productId
    ) || DUMMY_PRODUCTS[0];
  }
  
  if (normalizedUrl.includes('/api/v1/products/wishlist') || normalizedUrl.includes('wishlist')) {
    return DUMMY_WISHLIST;
  }
  
  if (normalizedUrl.includes('/api/v1/user/profile') || normalizedUrl.includes('/api/v1/account/profile') || normalizedUrl.includes('profile')) {
    return DUMMY_PROFILE;
  }
  
  if (normalizedUrl.includes('/api/v1/orders') || normalizedUrl.includes('orders')) {
    return DUMMY_ORDERS;
  }
  
  if (normalizedUrl.includes('/api/v1/checkout/addresses') || normalizedUrl.includes('/api/v1/addresses') || normalizedUrl.includes('addresses')) {
    return DUMMY_ADDRESSES;
  }
  
  if ((normalizedUrl.includes('/api/v1/payment/cards') || normalizedUrl.includes('/api/v1/payment-methods/cards')) && normalizedUrl.includes('cards')) {
    return DUMMY_PAYMENT_METHODS;
  }
  
  if (normalizedUrl.includes('/api/v1/checkout/shipping-quote') || normalizedUrl.includes('shipping-quote')) {
    return {
      itemsTotal: 0,
      shipping: 0,
      tax: 0,
      importCharges: 0
    };
  }

  // Mock POST endpoints for checkout so local dev can proceed without backend
  if (method === 'post') {
    if (normalizedUrl.includes('/api/v1/checkout/payment-intent') || normalizedUrl.includes('payment-intent')) {
      // Return a fake payment intent response
      return {
        amount: 5000,
        currency: 'usd',
        clientSecret: 'pi_test_client_secret_mocked_12345',
        orderId: Date.now()
      };
    }

    if (normalizedUrl.includes('/api/v1/checkout/place-order') || normalizedUrl.includes('place-order')) {
      // Return a fake order placement response
      return {
        orderId: Date.now(),
        status: 'succeeded',
        message: 'Order placed (mock)'
      };
    }
  }
  
  // Return null if no mock data available
  return null;
};

/**
 * Setup mock interceptor for axios
 * Call this in axios.js after creating the API instance
 */
export const setupMockInterceptor = (apiInstance) => {
  if (!USE_DUMMY_DATA) {
    console.log('⚠️ Mock interceptor not set up - USE_DUMMY_DATA is false');
    console.log(`   REACT_APP_USE_DUMMY_DATA env: ${process.env.REACT_APP_USE_DUMMY_DATA}`);
    return; // Don't setup interceptor if not using dummy data
  }

  console.log('✅ Mock interceptor set up - all API calls will use dummy data');
  console.log(`   REACT_APP_USE_DUMMY_DATA env: ${process.env.REACT_APP_USE_DUMMY_DATA}`);

  // Override the default adapter to intercept ALL requests
  apiInstance.defaults.adapter = async (config) => {
    const method = (config.method || 'get').toLowerCase();
    
    // Mock GET and specific POST requests
    if (method === 'get' || method === 'post') {
      // Get full URL (baseURL + url)
      const baseURL = config.baseURL || '';
      const url = config.url || '';
      const fullUrl = baseURL + url;
      
      console.log(`🔍 Interceptor checking: ${method.toUpperCase()} ${fullUrl}`);
      
      const mockData = await getMockData(fullUrl, config);

      if (mockData !== null) {
        console.log(`🎭 Mocking API call: ${method.toUpperCase()} ${fullUrl}`);
        // Return mock data directly, preventing network call
        return Promise.resolve({
          data: mockData,
          status: 200,
          statusText: 'OK',
          headers: {},
          config
        });
      } else {
        console.warn(`⚠️ No mock data available for: ${fullUrl}`);
      }
    }
    
    // For non-GET requests or unmatched URLs, prevent real requests in dummy mode
    console.error(`❌ Blocking real request in dummy mode: ${config.method || 'GET'} ${config.url || ''}`);
    return Promise.reject(new Error(`No mock data available for ${config.method || 'GET'} ${config.url || ''}. Dummy data mode is active.`));
  };
  
  // Also add a request interceptor as backup
  apiInstance.interceptors.request.use(
    async (config) => {
      if (USE_DUMMY_DATA) {
        const method = (config.method || 'get').toLowerCase();
        if (method === 'get' || method === 'post') {
          const baseURL = config.baseURL || '';
          const url = config.url || '';
          const fullUrl = baseURL + url;
          
          // Check if we have mock data
          const mockData = await getMockData(fullUrl, config);
          if (mockData !== null) {
            // Set adapter to return mock data
            config.adapter = async () => {
              return Promise.resolve({
                data: mockData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config
              });
            };
          }
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

