import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Home.css";
import BestSellersStrip from "../BestSellersStrip/BestSellersStrip";
import PromoGridRow from "../PromoGridRow/PromoGridRow";
import RecommendationPrompt from "../RecommendationPrompt/RecommendationPrompt";
import Footer from "../Footer/Footer";
import { getFeaturedProducts } from "../../api/products/FeaturedProductService";
import { getMostSoldProducts } from "../../api/products/MostSoldProductService";
import { getSaleCategories } from "../../api/products/SaleCategoryService";
import { getAllProducts } from "../../api/products/CategoryProductsService";
import { searchProducts } from "../../api/products/searchProduct/SearchProductService";
import { selectUser } from "../../features/auth/AuthSlice";
import { getProductImageUrl, getCategoryImageUrl, formatImageUrl } from "../../utils/imageUtils";
import { getDiscountedPrice } from "../../utils/productNormalization";
import { LoadingSpinner, ProductCardSkeleton } from "../Loading/LoadingSpinner";

const GIFT_PANEL_DATA = [
  {
    id: "gifts-everyone",
    title: "Find gifts for everyone",
    footerLabel: "Discover more for Holiday ›",
    footerParams: { product_name: "holiday gifts" },
    tiles: [
      { label: "For her", image: "/images/NO_IMG.png", params: { product_name: "women fashion" } },
      { label: "For him", image: "/images/NO_IMG.png", params: { product_name: "mens fashion" } },
      { label: "For kids", image: "/images/NO_IMG.png", params: { product_name: "kids gifts" } },
      { label: "For teens", image: "/images/NO_IMG.png", params: { product_name: "teen gifts" } },
    ],
  },
  {
    id: "holiday-collections",
    title: "Shop holiday collections",
    footerLabel: "Find Holiday Gifts for all",
    footerParams: { product_name: "holiday collections" },
    tiles: [
      { label: "New arrivals", image: "/images/NO_IMG.png", params: { product_name: "new arrivals" } },
      { label: "White elephant", image: "/images/NO_IMG.png", params: { product_name: "white elephant" } },
      { label: "Premium picks", image: "/images/NO_IMG.png", params: { product_name: "premium gifts" } },
      { label: "Trending gifts", image: "/images/NO_IMG.png", params: { product_name: "trending gifts" } },
    ],
  },
  {
    id: "gift-price",
    title: "Shop gifts by price",
    footerLabel: "Discover more for Holiday",
    footerParams: { product_name: "deals" },
    tiles: [
      { label: "Under ₹1,000", image: "/images/NO_IMG.png", params: { product_name: "budget gifts", max_price: 1000 } },
      { label: "Under ₹2,000", image: "/images/NO_IMG.png", params: { max_price: 2000 } },
      { label: "Under ₹5,000", image: "/images/NO_IMG.png", params: { max_price: 5000 } },
      { label: "Deals", image: "/images/NO_IMG.png", params: { product_name: "deals" } },
    ],
  },
];

function Home() {
  const history = useHistory();
  const user = useSelector(selectUser);
  const isLoggedIn = Boolean(user);

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [mostSoldProducts, setMostSoldProducts] = useState([]);
  const [bestSellerImages, setBestSellerImages] = useState([]);
  const [saleCategories, setSaleCategories] = useState([]);
  const [historyProducts, setHistoryProducts] = useState([]);
  const [ctaLoading, setCtaLoading] = useState("");
  const [ctaError, setCtaError] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

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
  const goNextHero = useCallback(() => setHeroIndex((i) => (i + 1) % heroSlides.length), []);

  useEffect(() => {
    const id = setInterval(goNextHero, 6000);
    return () => clearInterval(id);
  }, [goNextHero]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const fp = await getFeaturedProducts(1);
        if (isMounted) {
          setFeaturedProducts(Array.isArray(fp?.results) ? fp.results : []);
          setLoadedCount(prev => prev + 1);
        }
      } catch (err) {
        console.error("featured load", err);
        if (isMounted) setLoadedCount(prev => prev + 1);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const products = await getMostSoldProducts();
        if (isMounted) {
          // Handle both array and paginated object responses
          const productsArray = Array.isArray(products) 
            ? products 
            : (products?.results || []);
          setMostSoldProducts(productsArray);
          const imgs = productsArray
            .map((p) => p?.product_variations?.[0]?.product_images?.[0]?.product_image)
            .filter(Boolean);
          setBestSellerImages(imgs);
          setLoadedCount(prev => prev + 1);
        }
      } catch (err) {
        console.error("most sold load", err);
        if (isMounted) setLoadedCount(prev => prev + 1);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const sc = await getSaleCategories();
        if (isMounted) {
          setSaleCategories(Array.isArray(sc) ? sc : []);
          setLoadedCount(prev => prev + 1);
        }
      } catch (err) {
        console.error("sale categories load", err);
        if (isMounted) setLoadedCount(prev => prev + 1);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const all = await getAllProducts(1);
        if (isMounted) {
          setHistoryProducts(Array.isArray(all?.results) ? all.results : []);
          setLoadedCount(prev => prev + 1);
        }
      } catch (err) {
        console.error("history products load", err);
        if (isMounted) setLoadedCount(prev => prev + 1);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  // Set initial load to false once at least 2 API calls complete
  useEffect(() => {
    if (loadedCount >= 2) {
      setIsInitialLoad(false);
    }
  }, [loadedCount]);

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

  const productPanels = useMemo(
    () => [
      {
        id: "featured",
        title: "Featured products",
        items: featuredProducts,
        ctaLabel: "Browse featured ›",
      },
      {
        id: "top-sellers",
        title: "Most sold products",
        items: mostSoldProducts,
        ctaLabel: "See more top sellers ›",
      },
      {
        id: "shop-by-category",
        title: "Shop gifts by category",
        items: [],
        ctaLabel: "Discover more for Holiday ›",
        tiles: [
          { label: "Toys", img: "/images/NO_IMG.png", params: { category: "toys" } },
          { label: "Home & kitchen", img: "/images/NO_IMG.png", params: { category: "home-kitchen" } },
          { label: "Electronics", img: "/images/NO_IMG.png", params: { category: "electronics" } },
          { label: "Sports & outdoors", img: "/images/NO_IMG.png", params: { category: "sports-fitness" } },
        ],
      },
    ],
    [featuredProducts, mostSoldProducts]
  );

  const saleCards = useMemo(
    () =>
      saleCategories.map((cat, idx) => ({
        id: cat.id || idx,
        title: typeof cat.category_name === 'object' ? cat.category_name.en || cat.category_name : cat.category_name,
        description: cat.description,
        image: getCategoryImageUrl(cat),
        params: { product_name: typeof cat.category_name === 'object' ? cat.category_name.en || cat.category_name : cat.category_name },
      })),
    [saleCategories]
  );

  const historyCards = useMemo(
    () => (historyProducts || []).slice(0, 8),
    [historyProducts]
  );

  // Show loading spinner during initial data load
  if (isInitialLoad) {
    return <LoadingSpinner size="large" message="Loading HyderNexa..." fullScreen />;
  }

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

      <section className="homeGiftLayout">
        <div className="homeGiftGrid">
          {GIFT_PANEL_DATA.map((panel) => (
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
                      <img src={tile.image} alt={tile.label} />
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
              <img
                src="/images/NO_IMG.png"
                alt="Luna Gaming"
              />
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

      <section className="homeProductPanels">
        {productPanels.map((panel) => (
          <article className="merchCard" key={panel.id}>
            <div className="merchCard-header">{panel.title}</div>

            {panel.tiles ? (
              <div className="merchCard-grid">
                {panel.tiles.map((tile, idx) => (
                  <button
                    type="button"
                    className="merchTile"
                    key={tile.label}
                    onClick={() =>
                      navigateToSearch({
                        id: `${panel.id}-${idx}`,
                        title: tile.label,
                        params: tile.params,
                      })
                    }
                  >
                    <div className="merchTile-imgWrap">
                      <img src={tile.img} alt={tile.label} className="merchTile-img" />
                    </div>
                    <div className="merchTile-label">{tile.label}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="merchCard-grid">
                {(panel.items.length ? panel.items : new Array(4).fill(null)).map(
                  (p, idx) => {
                    const variation = p?.product_variations?.[0];
                    const img = getProductImageUrl(p, "/images/NO_IMG.png");
                    const name = p?.product_name || "Loading…";
                    const price =
                      getDiscountedPrice(variation) || variation?.product_price || "";
                    const slug = p?.slug || "#";

                    return (
                      <div className="merchTile" key={p?.id || idx}>
                        <a 
                          className="merchTile-imgWrap" 
                          href={`/product/${p?.id ?? slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            history.push(`/product/${p?.id ?? slug}`);
                          }}
                        >
                          <img src={img} alt={name} className="merchTile-img" />
                        </a>
                        <div className="merchTile-label" title={name}>
                          {name.length > 26 ? name.slice(0, 24) + "…" : name}
                        </div>
                        {price !== "" && (
                          <div className="merchTile-price">₹{price}</div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}

            <button
              type="button"
              className="merchCard-footerLink"
              disabled={ctaLoading === panel.id}
              onClick={() =>
                navigateToSearch({
                  id: panel.id,
                  title: panel.title,
                  params: panel.tiles ? { product_name: panel.title } : undefined,
                  fallbackItems: panel.items,
                })
              }
            >
              {renderCtaLabel(panel.id, panel.ctaLabel)}
            </button>
          </article>
        ))}
      </section>

      <section className="saleCategoriesSection">
        <div className="saleCategoriesHeader">
          <div>
            <p className="saleCategoriesEyebrow">Sponsored</p>
            <h2>Sale categories</h2>
          </div>
          <button
            type="button"
            className="saleCategoriesSeeAll"
            onClick={() =>
              navigateToSearch({
                id: "sale-categories",
                title: "Sale categories",
                params: { product_name: "sale" },
              })
            }
          >
            See all deals
          </button>
        </div>
        <div className="saleCategoriesGrid">
          {(saleCards.length ? saleCards : new Array(6).fill(null)).map(
            (cat, idx) => {
              if (!cat) {
                return (
                  <div className="saleCategoryCard" key={`placeholder-${idx}`}>
                    <div className="saleCategoryThumb placeholder" />
                    <div className="saleCategoryBody">
                      <h3>Loading…</h3>
                      <p>Fetching sale details</p>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  type="button"
                  className="saleCategoryCard"
                  key={cat.id || cat.slug || `sale-${idx}`}
                  onClick={() =>
                    navigateToSearch({
                      id: `sale-${cat.id}`,
                      title: cat.title,
                      params: cat.params,
                    })
                  }
                >
                  <div className="saleCategoryThumb">
                    <img src={cat.image} alt={cat.title} />
                  </div>
                  <div className="saleCategoryBody">
                    <h3>{cat.title}</h3>
                    <p>{cat.description}</p>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </section>

      <BestSellersStrip
        title="Best sellers in computers & accessories"
        items={
          bestSellerImages.length
            ? bestSellerImages.map(img => formatImageUrl(img, "/images/NO_IMG.png"))
            : ["/images/NO_IMG.png"]
        }
      />

      <section className="historySection">
        <header className="historySectionHeader">
          <h2>Customers who viewed items in your browsing history also viewed</h2>
        </header>

        <div className="historyGrid">
          {(historyCards.length ? historyCards : new Array(8).fill(null)).map(
            (product, idx) => {
              const variation = product?.product_variations?.[0];
              const img = product ? getProductImageUrl(product, "/images/NO_IMG.png") : "/images/NO_IMG.png";
              const price = product ? getDiscountedPrice(variation) || variation?.product_price || "" : "";
              const name = product?.product_name || "Loading…";
              const slug = product?.slug || `history-${idx}`;

              return (
                <a 
                  className="historyCard" 
                  key={slug} 
                  href={`/product/${slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    history.push(`/product/${slug}`);
                  }}
                >
                  <div className="historyCard-image">
                    <img src={img} alt={name} />
                  </div>
                  <div className="historyCard-name">{name}</div>
                  {price && <div className="historyCard-price">₹{price}</div>}
                </a>
              );
            }
          )}
        </div>
      </section>

      <PromoGridRow
        cards={[
          {
            title: "Support Movember",
            sponsored: false,
            children: (
              <div style={{ 
                width: "100%", 
                height: "120px", 
                backgroundColor: "#f0f0f0", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                borderRadius: "4px"
              }}>
                <span style={{ color: "#666" }}>Movember Campaign</span>
              </div>
            ),
          },
          {
            title: "Save 5% with Subscribe & Save",
            sponsored: true,
            children: (
              <div style={{ 
                width: "100%", 
                height: "120px", 
                backgroundColor: "#f0f0f0", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                borderRadius: "4px"
              }}>
                <span style={{ color: "#666" }}>Subscribe & Save</span>
              </div>
            ),
          },
          {
            title: "Shop holiday activities",
            sponsored: false,
            children: (
              <div style={{ 
                width: "100%", 
                height: "120px", 
                backgroundColor: "#f0f0f0", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                borderRadius: "4px"
              }}>
                <span style={{ color: "#666" }}>Holiday Activities</span>
              </div>
            ),
          },
          {
            title: "Save more on deals",
            sponsored: false,
            children: (
              <div style={{ 
                width: "100%", 
                height: "120px", 
                backgroundColor: "#f0f0f0", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                borderRadius: "4px"
              }}>
                <span style={{ color: "#666" }}>Save More Deals</span>
              </div>
            ),
          },
        ]}
      />

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