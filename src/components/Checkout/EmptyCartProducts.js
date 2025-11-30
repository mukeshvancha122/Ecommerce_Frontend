import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./EmptyCartProducts.css";
import { getTopSellingProducts } from "../../api/products/TopSellingService";
import { getExcitingDeals } from "../../api/ExcitingDealsService";
import { getMostSoldProducts } from "../../api/products/MostSoldProductService";
import { getImageUrl } from "../../utils/imageUtils";
import { formatCurrency } from "../../utils/currency";

const parseNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === "object") {
    if ("final_price" in value) return parseNumber(value.final_price);
    if ("amount" in value) return parseNumber(value.amount);
    if ("price" in value) return parseNumber(value.price);
    if ("discounted_price" in value) return parseNumber(value.discounted_price);
  }
  return null;
};

export default function EmptyCartProducts() {
  const history = useHistory();
  const [topDeals, setTopDeals] = useState([]);
  const [excitingDeals, setExcitingDeals] = useState([]);
  const [mostSold, setMostSold] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        // Fetch Top Deals (Top Selling Products)
        const topSellingResponse = await getTopSellingProducts(1);
        const topDealsData = Array.isArray(topSellingResponse) 
          ? topSellingResponse 
          : Array.isArray(topSellingResponse?.results) 
          ? topSellingResponse.results 
          : Array.isArray(topSellingResponse?.data) 
          ? topSellingResponse.data 
          : [];
        
        // Fetch Exciting Deals
        const excitingResponse = await getExcitingDeals(1);
        const excitingData = Array.isArray(excitingResponse?.data) 
          ? excitingResponse.data 
          : [];

        // Fetch Most Sold Products
        const mostSoldResponse = await getMostSoldProducts();
        const mostSoldData = Array.isArray(mostSoldResponse) 
          ? mostSoldResponse 
          : [];

        // Get Recently Viewed from localStorage
        let recentData = [];
        try {
          const stored = localStorage.getItem("recentlyViewed");
          if (stored) {
            const parsed = JSON.parse(stored);
            recentData = Array.isArray(parsed) ? parsed : [];
          }
        } catch (err) {
          console.error("Error reading recently viewed:", err);
        }

        if (isMounted) {
          setTopDeals(topDealsData.slice(0, 5));
          setExcitingDeals(excitingData.slice(0, 5));
          setMostSold(mostSoldData.slice(0, 5));
          setRecentlyViewed(recentData.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching products for empty cart:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProductClick = (product) => {
    const identifier = product?.slug || product?.id;
    if (identifier) {
      history.push(`/product/${identifier}`);
    }
  };

  const renderProduct = (product, idx) => {
    const variation = product?.product_variations?.[0];
    const rawImage =
      variation?.product_images?.[0]?.product_image ||
      product?.product_category?.category_image ||
      null;
    const image = rawImage ? getImageUrl(rawImage) : "/images/NO_IMG.png";
    
    // Handle price
    let price = null;
    const discountedPriceValue = variation?.get_discounted_price;
    if (discountedPriceValue !== null && discountedPriceValue !== undefined) {
      if (typeof discountedPriceValue === 'object' && 'final_price' in discountedPriceValue) {
        price = parseNumber(discountedPriceValue.final_price);
      } else {
        price = parseNumber(discountedPriceValue);
      }
    }
    price = price ?? parseNumber(variation?.product_price) ?? parseNumber(product?.min_price) ?? 0;
    
    // Original price
    const original = parseNumber(variation?.product_price) ?? parseNumber(product?.min_price) ?? price;
    
    // Discount percentage
    const discount = parseNumber(
      variation?.get_discounted_price?.active_discount_percentage
    ) ?? parseNumber(product?.product_discount) ?? 0;

    return (
      <div
        key={product.id || idx}
        className="emptyCartProduct"
        onClick={() => handleProductClick(product)}
      >
        <div className="emptyCartProductImage">
          <img
            src={image}
            alt={product.product_name || "Product"}
            onError={(e) => {
              if (e.target.src !== "/images/NO_IMG.png") {
                e.target.src = "/images/NO_IMG.png";
              }
            }}
          />
          {discount > 0 && (
            <span className="emptyCartProductBadge">{discount.toFixed(0)}% off</span>
          )}
        </div>
        <div className="emptyCartProductInfo">
          <div className="emptyCartProductName">{product.product_name || "Product"}</div>
          <div className="emptyCartProductPrice">
            <span className="emptyCartProductCurrentPrice">{formatCurrency(price)}</span>
            {original > price && (
              <span className="emptyCartProductOriginalPrice">{formatCurrency(original)}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="emptyCartProductsLoading">Loading products...</div>;
  }

  const allProducts = [
    ...topDeals,
    ...excitingDeals,
    ...mostSold,
    ...recentlyViewed,
  ];

  // Remove duplicates based on product ID
  const uniqueProducts = allProducts.filter((product, index, self) =>
    index === self.findIndex((p) => (p.id || p.slug) === (product.id || product.slug))
  ).slice(0, 15); // Limit to 15 products

  if (uniqueProducts.length === 0) {
    return null;
  }

  return (
    <div className="emptyCartProducts">
      <h3 className="emptyCartProductsTitle">You might also like</h3>
      <div className="emptyCartProductsGrid">
        {uniqueProducts.map((product, idx) => renderProduct(product, idx))}
      </div>
    </div>
  );
}

