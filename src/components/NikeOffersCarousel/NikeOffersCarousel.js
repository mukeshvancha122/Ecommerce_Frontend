import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./NikeOffersCarousel.css";
import { getImageUrl } from "../../utils/imageUtils";
import { formatCurrency as formatCurrencyUtil } from "../../utils/currency";

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
  }
  return null;
};

export default function NikeOffersCarousel() {
  const history = useHistory();
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Trending Nike shoes from online offers - hardcoded trending products
    const trendingNikeShoes = [
      {
        id: 1,
        product_name: "Nike Air Max 90",
        product_discount: 35,
        product_variations: [{
          product_price: 10999,
          get_discounted_price: { final_price: 7149, active_discount_percentage: 35 },
          product_images: [{ product_image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80" }]
        }],
        brand: { brand_name: "Nike" },
        slug: "nike-air-max-90",
        deal: "Best Seller • Limited Stock"
      },
      {
        id: 2,
        product_name: "Nike Air Force 1 '07",
        product_discount: 30,
        product_variations: [{
          product_price: 8999,
          get_discounted_price: { final_price: 6299, active_discount_percentage: 30 },
          product_images: [{ product_image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80" }]
        }],
        brand: { brand_name: "Nike" },
        slug: "nike-air-force-1-07",
        deal: "Trending Now • Free Shipping"
      },
      {
        id: 4,
        product_name: "Nike React Infinity Run",
        product_discount: 40,
        product_variations: [{
          product_price: 11999,
          get_discounted_price: { final_price: 7199, active_discount_percentage: 40 },
          product_images: [{ product_image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80" }]
        }],
        brand: { brand_name: "Nike" },
        slug: "nike-react-infinity-run",
        deal: "Flash Sale • Save Big"
      }
    ];
    
    setProducts(trendingNikeShoes);
  }, []);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  useEffect(() => {
    if (products.length > 0) {
      const interval = setInterval(goNext, 5000);
      return () => clearInterval(interval);
    }
  }, [products.length]);

  const handleProductClick = (product) => {
    if (product?.slug) {
      history.push(`/product/${product.slug}`);
    }
  };

  const handleShopNow = (e) => {
    e.stopPropagation(); // Prevent triggering product click
    const confirmed = window.confirm(
      "You are about to leave HyderNexa and visit Nike's official website. Do you want to continue?"
    );
    if (confirmed) {
      window.open("https://www.nike.com/in", "_blank");
    }
  };

  if (products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex];
  const variation = currentProduct?.product_variations?.[0];
  const rawImage = variation?.product_images?.[0]?.product_image;
  const image = rawImage ? getImageUrl(rawImage) : "/images/NO_IMG.png";
  
  const discount = parseNumber(
    variation?.get_discounted_price?.active_discount_percentage
  ) ?? parseNumber(currentProduct?.product_discount) ?? 0;
  
  let price = null;
  const discountedPriceValue = variation?.get_discounted_price;
  if (discountedPriceValue !== null && discountedPriceValue !== undefined) {
    if (typeof discountedPriceValue === 'object' && 'final_price' in discountedPriceValue) {
      price = parseNumber(discountedPriceValue.final_price);
    } else {
      price = parseNumber(discountedPriceValue);
    }
  }
  price = price ?? parseNumber(variation?.product_price) ?? parseNumber(currentProduct?.min_price) ?? 0;
  
  const original = parseNumber(variation?.product_price) ?? parseNumber(currentProduct?.min_price) ?? price;

  return (
    <section className="nikeOffersSection">
      <div className="nikeOffersContainer">
        <button
          className="nikeOffersArrow nikeOffersArrow--left"
          onClick={goPrev}
          aria-label="Previous offer"
        >
          ‹
        </button>

        <div className="nikeOffersContent" onClick={() => handleProductClick(currentProduct)}>
          <div className="nikeOffersInfo">
            <div className="nikeOffersBrandRow">
              <div className="nikeOffersBrand">Nike</div>
            </div>
            <h3 className="nikeOffersTitle">{currentProduct.product_name}</h3>
            <div className="nikeOffersPriceRow">
              <span className="nikeOffersPrice">{formatCurrencyUtil(price)}</span>
              {original > price && (
                <>
                  <span className="nikeOffersOriginal">{formatCurrencyUtil(original)}</span>
                  <span className="nikeOffersSavings">
                    Save {formatCurrencyUtil(original - price)}
                  </span>
                </>
              )}
            </div>
            {currentProduct.deal && (
              <div className="nikeOffersDeal">{currentProduct.deal}</div>
            )}
            <button className="nikeOffersCTA" onClick={handleShopNow}>Shop Now</button>
          </div>
          
          <div className="nikeOffersCenterLogo">
            <svg width="80" height="30" viewBox="0 0 69 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M68.56 4L18.4 25.36Q12.16 28 7.92 28q-4.8 0-6.96-3.36-1.36-2.16-.8-5.48t2.96-7.08q2-3.04 6.56-8-1.6 2.56-2.6 5.04-.88 2.16-1.04 3.84-.16 1.68.4 2.88.56 1.2 1.84 1.92 1.28.72 3.04.72 2.24 0 5.04-.72l14.32-4.16L68.56 4z" fill="currentColor"/>
            </svg>
          </div>
          
          <div className="nikeOffersImage">
            <img
              src={getImageUrl(image)}
              alt={currentProduct.product_name}
              onError={(e) => {
                e.target.src = "/images/NO_IMG.png";
              }}
            />
            {discount > 0 && (
              <div className="nikeOffersBadge">{discount.toFixed(0)}% OFF</div>
            )}
          </div>
        </div>

        <button
          className="nikeOffersArrow nikeOffersArrow--right"
          onClick={goNext}
          aria-label="Next offer"
        >
          ›
        </button>
      </div>

      {products.length > 1 && (
        <div className="nikeOffersDots">
          {products.map((_, index) => (
            <button
              key={index}
              className={`nikeOffersDot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

