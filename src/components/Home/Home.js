import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Home.css";
import RecommendationPrompt from "../RecommendationPrompt/RecommendationPrompt";
import Footer from "../Footer/Footer";
import FeaturedProductsCarousel from "../FeaturedProductsCarousel/FeaturedProductsCarousel";
import DiscountDealsCarousel from "../DiscountDealsCarousel/DiscountDealsCarousel";
import ExcitingDealsCarousel from "../ExcitingDealsCarousel/ExcitingDealsCarousel";
import HolidayCategoryCarousel from "../HolidayCategoryCarousel/HolidayCategoryCarousel";
import CategoryHolidayCarousel from "../CategoryHolidayCarousel/CategoryHolidayCarousel";
import NikeOffersCarousel from "../NikeOffersCarousel/NikeOffersCarousel";
import RecentlyViewedCarousel from "../RecentlyViewedCarousel/RecentlyViewedCarousel";
import { getFeaturedProducts } from "../../api/products/FeaturedProductService";
import { getTopSellingProducts } from "../../api/products/TopSellingService";
import { getSaleCategories } from "../../api/products/SaleCategoryService";
import { getExcitingDeals } from "../../api/ExcitingDealsService";
import { getAllProducts, getProductsByCategory } from "../../api/products/CategoryProductsService";
import { searchProducts } from "../../api/products/searchProduct/SearchProductService";
import { getAllCategories } from "../../api/products/CategoryService";
import { selectUser } from "../../features/auth/AuthSlice";
import { getImageUrl } from "../../utils/imageUtils";
import { formatCurrency } from "../../utils/currency";

const toNumber = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return Number.isNaN(value) ? null : value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof value === "object") {
    if ("final_price" in value) return toNumber(value.final_price);
    if ("amount" in value) return toNumber(value.amount);
    if ("price" in value) return toNumber(value.price);
    if ("discounted_price" in value) return toNumber(value.discounted_price);
  }
  return null;
};

const GIFT_PANEL_DATA = [
  {
    id: "gifts-everyone",
    title: "Find gifts for everyone",
    footerLabel: "Discover more for Holiday ›",
    footerParams: { product_name: "holiday gifts" },
    tiles: [],
  },
  {
    id: "holiday-collections",
    title: "Shop holiday collections",
    footerLabel: "Find Holiday Gifts for all",
    footerParams: { product_name: "holiday collections" },
    tiles: [],
  },
  {
    id: "gift-price",
    title: "Shop gifts by price",
    footerLabel: "Discover more for Holiday",
    footerParams: { product_name: "deals" },
    tiles: [],
  },
];

function Home() {
  const history = useHistory();
  const user = useSelector(selectUser);
  const isLoggedIn = Boolean(user);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [excitingDeals, setExcitingDeals] = useState([]);
  const [saleCategories, setSaleCategories] = useState([]);
  const [mensSpecials, setMensSpecials] = useState([]);
  const [womensSpecials, setWomensSpecials] = useState([]);
  const [historyProducts, setHistoryProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [ctaLoading, setCtaLoading] = useState("");
  const [ctaError, setCtaError] = useState("");

  const heroSlides = [
    {
      headline: "The List: Holiday edition",
      sub: "Shop our editors' gift picks",
      ctaInfo: "Holiday Deals · Prime shipping · New arrivals",
      image: "/images/banner/Banner_1.webp",
    },
    {
      headline: "Black Friday week starts now",
      sub: "Early deals on electronics & home",
      ctaInfo: "Top picks · Limited time offers",
      image: "/images/banner/Banner_2.webp",
    },
    {
      headline: "Buy again from your past items",
      sub: "Handpicked for you",
      ctaInfo: "Sign in to view personalised ideas",
      image: "https://t3.ftcdn.net/jpg/04/65/46/52/360_F_465465254_1pN9MGrA831idD6zIBL7q8rnZZpUCQTy.jpg",
    },
  ];

  const [heroIndex, setHeroIndex] = useState(0);
  const goPrevHero = () =>
    setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
  const goNextHero = () => setHeroIndex((i) => (i + 1) % heroSlides.length);

  useEffect(() => {
    // Only auto-play hero carousel if page is visible (performance optimization)
    if (document.hidden) return;
    
    const id = setInterval(() => {
      if (!document.hidden) {
        goNextHero();
      }
    }, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const [pageOne, pageTwo] = await Promise.all([
          getFeaturedProducts(1),
          getFeaturedProducts(2),
        ]);
        if (!isMounted) return;
        
        const extractProducts = (payload) => {
          if (Array.isArray(payload?.data)) return payload.data;
          if (Array.isArray(payload?.results)) return payload.results;
          if (Array.isArray(payload)) return payload;
          return [];
        };
        const products = [
          ...extractProducts(pageOne),
          ...extractProducts(pageTwo),
        ];
        if (isMounted) {
          setFeaturedProducts(products);
        }
      } catch (err) {
        console.error("featured load", err);
        if (isMounted) {
          setFeaturedProducts([]);
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Fetch top-selling products from API
    (async () => {
      try {
        const topSelling = await getTopSellingProducts(1);
        if (isMounted) {
          setDiscountedProducts(Array.isArray(topSelling) ? topSelling.slice(0, 10) : []);
        }
      } catch (err) {
        console.error("top-selling products load", err);
        if (isMounted) {
          // Fallback: filter from featured products if API fails
          const fallback = (featuredProducts || [])
            .filter((p) => p?.is_top_selling === true)
            .slice(0, 10);
          setDiscountedProducts(fallback);
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, [featuredProducts]);

  useEffect(() => {
    let isMounted = true;
    
    const loadCategorySpecials = async (slug, setter) => {
      try {
        const response = await getProductsByCategory(slug, 1);
        if (!isMounted) return;
        const items = (Array.isArray(response?.results) ? response.results : []).slice(
          0,
          10
        );
        if (isMounted) {
          setter(items);
        }
      } catch (err) {
        console.error(`category specials load ${slug}`, err);
      }
    };
    loadCategorySpecials("mens-clothing", setMensSpecials);
    loadCategorySpecials("womens-clothing", setWomensSpecials);
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const sc = await getSaleCategories();
        if (isMounted) {
          setSaleCategories(Array.isArray(sc) ? sc : []);
        }
      } catch (err) {
        console.error("sale categories load", err);
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const all = await getAllProducts(1);
        if (isMounted) {
          setHistoryProducts(Array.isArray(all?.results) ? all.results : []);
        }
      } catch (err) {
        console.error("history products load", err);
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch exciting deals
  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        const response = await getExcitingDeals(1);
        if (!isMounted) return;
        
        const deals = Array.isArray(response?.data) ? response.data : [];
        if (isMounted) {
          setExcitingDeals(deals);
        }
      } catch (err) {
        console.error("Error loading exciting deals:", err);
        if (isMounted) {
          setExcitingDeals([]);
        }
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    (async () => {
      try {
        console.log("Home.js - Fetching categories...");
        const cats = await getAllCategories();
        if (!isMounted) return;
        
        console.log("Home.js - Raw categories response:", cats);
        console.log("Home.js - Categories type:", typeof cats);
        console.log("Home.js - Is Array?", Array.isArray(cats));
        
        // Handle different response structures
        let categoriesArray = [];
        if (Array.isArray(cats)) {
          categoriesArray = cats;
        } else if (cats?.data && Array.isArray(cats.data)) {
          categoriesArray = cats.data;
        } else if (cats?.results && Array.isArray(cats.results)) {
          categoriesArray = cats.results;
        }
        
        console.log("Home.js - Processed categories array:", categoriesArray);
        
        // Log first category to check structure
        if (categoriesArray.length > 0) {
          console.log("Home.js - First category structure:", categoriesArray[0]);
          console.log("Home.js - First category image field:", categoriesArray[0]?.category_image);
        }
        
        if (isMounted) {
          // Store all categories for the holiday carousel
          setAllCategories(categoriesArray);
        
          const limitedCategories = categoriesArray.slice(0, 16);
          console.log("Home.js - All categories for panels:", limitedCategories);
          setCategories(limitedCategories);
        }
      } catch (err) {
        console.error("categories load", err);
      }
    })();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const navigateToSearch = useCallback(
    async ({ id, title, params = {}, fallbackItems = [] }) => {
      if (!title) return;
      setCtaError("");
      setCtaLoading(id);
      try {
        let items = Array.isArray(fallbackItems) ? fallbackItems : [];
        if (!items.length) {
          const response = await searchProducts(params);
          items = response?.results || [];
        }

        history.push("/search", {
          mode: "text",
          query: title,
          category: params?.category || "all",
          results: items,
          total: items.length,
        });
      } catch (error) {
        console.error("CTA navigation error:", error);
        setCtaError("Unable to load products right now. Please try again.");
      } finally {
        setCtaLoading("");
      }
    },
    [history]
  );

  const renderCtaLabel = useCallback(
    (id, label) => (ctaLoading === id ? "Loading…" : label),
    [ctaLoading]
  );

  const handleSignIn = useCallback(() => {
    history.push("/login");
  }, [history]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const saleCards = useMemo(
    () =>
      saleCategories.map((cat, idx) => ({
        id: cat.id || idx,
        title: cat.category_name,
        description: cat.description,
        image: getImageUrl(cat.category_image),
        params: { product_name: cat.category_name },
      })),
    [saleCategories]
  );

  // Carousel state for sale categories
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const itemsPerPage = 3; // 3 columns

  const totalPages = Math.ceil(saleCards.length / itemsPerPage);
  const currentPageCards = saleCards.slice(
    carouselIndex * itemsPerPage,
    (carouselIndex + 1) * itemsPerPage
  );

  const handleCarouselPrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleCarouselNext = () => {
    setCarouselIndex((prev) => Math.min(totalPages - 1, prev + 1));
  };

  const historyCards = useMemo(
    () => (historyProducts || []).slice(0, 8),
    [historyProducts]
  );

  // Select 13 random categories for the holiday carousel
  const randomCategories = useMemo(() => {
    if (allCategories.length === 0) return [];
    const shuffled = [...allCategories].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 13);
  }, [allCategories]);

  const giftPanelData = useMemo(() => {
    // Convert all categories to tiles format
    const allCategoryTiles = categories.map((cat) => ({
      label: cat.category_name,
      image: cat.category_image ? getImageUrl(cat.category_image) : "/images/NO_IMG.png",
      params: { category: cat.slug },
    }));

    // Split categories into 3 groups of 4 for gift panels
    const firstFour = allCategoryTiles.slice(0, 4);
    const nextFour = allCategoryTiles.slice(4, 8);
    const lastFour = allCategoryTiles.slice(8, 12);

    return GIFT_PANEL_DATA.map((panel) => {
      if (panel.id === "gifts-everyone") {
        return {
          ...panel,
          tiles: firstFour.length > 0 ? firstFour : panel.tiles,
        };
      }
      if (panel.id === "holiday-collections") {
        return {
          ...panel,
          tiles: nextFour.length > 0 ? nextFour : panel.tiles,
        };
      }
      if (panel.id === "gift-price") {
        return {
          ...panel,
          tiles: lastFour.length > 0 ? lastFour : panel.tiles,
        };
      }
      return panel;
    });
  }, [categories]);

  return (
    <div className="homePage" id="pageTop">
      <section className="homeHeroArea">
        <button
          className="homePage-heroArrow homePage-heroArrow--left"
          aria-label="Previous"
          onClick={goPrevHero}
          type="button"
        >
          ‹
        </button>

        <div className="homeHeroContent">
          <div className="homeHeroCopy">
            <p className="homeHeroEyebrow">Holiday Deals</p>
            <h1>{heroSlides[heroIndex].headline}</h1>
            <p className="homeHeroSub">{heroSlides[heroIndex].sub}</p>
            <p className="homeHeroMeta">{heroSlides[heroIndex].ctaInfo}</p>
          </div>

          <div
            className="homeHeroImage"
            style={{
              backgroundImage: `url(${heroSlides[heroIndex].image})`,
            }}
          />
        </div>

        <button
          className="homePage-heroArrow homePage-heroArrow--right"
          aria-label="Next"
          onClick={goNextHero}
          type="button"
        >
          ›
        </button>
      </section>

      {/* All Categories Holiday Carousel - Positioned on top */}
      {randomCategories.length > 0 && (
        <CategoryHolidayCarousel categories={randomCategories} />
      )}

      <section className="homeGiftLayout">
        <div className="homeGiftGrid">
          {giftPanelData.map((panel) => (
            <article className="giftPanel" key={panel.id}>
              <div className="giftPanel-header">{panel.title}</div>
              <div className="giftPanel-grid">
                {panel.tiles.map((tile, idx) => (
                  <button
                    key={tile.label}
                    type="button"
                    className="giftTile"
                    onClick={() =>
                      navigateToSearch({
                        id: `${panel.id}-${idx}`,
                        title: tile.label,
                        params: tile.params,
                      })
                    }
                  >
                    <div className="giftTile-thumb">
                      <img 
                        src={tile.image} 
                        alt={tile.label} 
                        loading="lazy"
                        onError={(e) => {
                          // Prevent infinite loop if fallback also fails
                          if (e.target.src !== "/images/NO_IMG.png" && !e.target.src.includes("NO_IMG")) {
                            e.target.src = "/images/NO_IMG.png";
                            e.target.onerror = null; // Remove error handler to prevent loop
                          }
                        }}
                      />
                    </div>
                    <span>{tile.label}</span>
                  </button>
                ))}
              </div>
              {panel.footerLabel && (
                <button
                  type="button"
                  className="giftPanel-footerLink"
                  disabled={ctaLoading === panel.id}
                  onClick={() =>
                    navigateToSearch({
                      id: panel.id,
                      title: panel.title,
                      params: panel.footerParams,
                    })
                  }
                >
                  {renderCtaLabel(panel.id, panel.footerLabel)}
                </button>
              )}
            </article>
          ))}
        </div>

        <aside className="homeSideRail">
          {!isLoggedIn && (
            <div className="signInSummaryCard">
              <div className="signInSummaryCard-title">
                Sign in for the best experience
              </div>
              <button
                className="signInSummaryCard-btn"
                type="button"
                onClick={handleSignIn}
              >
                Sign in securely
              </button>
            </div>
          )}

          <div className="homeAdCard">
            <p className="homeAdCard-label">Sponsored</p>
            <h3>Here to play</h3>
            <p>Must-play games included with Prime.</p>
            <div className="homeAdCard-image">
              <img src="/images/banner/Banner_3.webp" alt="Luna Gaming" />
            </div>
            <button
              type="button"
              onClick={() =>
                navigateToSearch({
                  id: "luna",
                  title: "Gaming",
                  params: { product_name: "gaming" },
                })
              }
            >
              Discover more
            </button>
          </div>
        </aside>
      </section>

      {mensSpecials.length > 0 && (
        <section className="holidayCategorySection">
          <HolidayCategoryCarousel
            title="Here come Holiday Specials"
            subtitle="Explore now"
            items={mensSpecials}
            onSeeMore={() =>
              history.push(
                `/products?category=mens-clothing&label=${encodeURIComponent("Men's Clothing")}`
              )
            }
          />
        </section>
      )}

      {womensSpecials.length > 0 && (
        <section className="holidayCategorySection">
          <HolidayCategoryCarousel
            title="Trending in Women's Clothing"
            subtitle="See more"
            items={womensSpecials}
            onSeeMore={() =>
              history.push(
                `/products?category=womens-clothing&label=${encodeURIComponent("Women's Clothing")}`
              )
            }
          />
        </section>
      )}

      {/* Best deals section - Top selling products */}
      <DiscountDealsCarousel products={discountedProducts} />

      <section className="saleCategoriesSection">
        <div className="saleCategoriesHeader">
          <div>
            <p className="saleCategoriesEyebrow">Sponsored</p>
            <h2>Sale categories</h2>
          </div>
        </div>
        <div className="saleCategoriesCarousel">
          <button
            type="button"
            className="saleCategoriesArrow saleCategoriesArrow--prev"
            onClick={handleCarouselPrev}
            disabled={carouselIndex === 0}
            aria-label="Previous categories"
          >
            ‹
          </button>
          <div className="saleCategoriesGrid" ref={carouselRef}>
            {saleCards.length === 0 ? (
              // Loading state
              new Array(3).fill(null).map((_, idx) => (
                <div className="saleCategoryCard" key={`placeholder-${idx}`}>
                  <div className="saleCategoryThumb placeholder" />
                  <div className="saleCategoryBody">
                    <h3>Loading…</h3>
                    <p>Fetching sale details</p>
                  </div>
                </div>
              ))
            ) : (
              // Display current page cards (3 at a time)
              currentPageCards.map((cat) => (
                <button
                  type="button"
                  className="saleCategoryCard"
                  key={cat.id}
                  onClick={() =>
                    navigateToSearch({
                      id: `sale-${cat.id}`,
                      title: cat.title,
                      params: cat.params,
                    })
                  }
                >
                  <div className="saleCategoryThumb">
                    <img 
                      src={cat.image} 
                      alt={cat.title}
                      loading="lazy"
                      onError={(e) => {
                        // Prevent infinite loop if fallback also fails
                        if (e.target.src !== "/images/NO_IMG.png" && !e.target.src.includes("NO_IMG")) {
                          e.target.src = "/images/NO_IMG.png";
                          e.target.onerror = null; // Remove error handler to prevent loop
                        }
                      }}
                    />
                  </div>
                  <div className="saleCategoryBody">
                    <h3>{cat.title}</h3>
                    <p>{cat.description}</p>
                  </div>
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            className="saleCategoriesArrow saleCategoriesArrow--next"
            onClick={handleCarouselNext}
            disabled={carouselIndex >= totalPages - 1}
            aria-label="Next categories"
          >
            ›
          </button>
        </div>
        {totalPages > 1 && (
          <div className="saleCategoriesPagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`saleCategoriesDot ${i === carouselIndex ? "active" : ""}`}
                onClick={() => setCarouselIndex(i)}
                aria-label={`Go to page ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Exciting Deals Carousel */}
      <ExcitingDealsCarousel products={excitingDeals} />

      {/* Featured Products Carousel */}
      <FeaturedProductsCarousel products={featuredProducts} />

      {/* Recently Viewed & Searched Products Carousel */}
      <RecentlyViewedCarousel products={historyProducts} />

      {/* Nike Offers Carousel Advertisement */}
      <NikeOffersCarousel />

      {ctaError && <div className="ctaErrorBanner">{ctaError}</div>}

      <RecommendationPrompt isLoggedIn={isLoggedIn} onSignIn={handleSignIn} />

      <div className="backToTopBar">
        <button type="button" onClick={scrollToTop}>
          Back to top
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default Home;