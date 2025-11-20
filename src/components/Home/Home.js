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

const GIFT_PANEL_DATA = [
  {
    id: "gifts-everyone",
    title: "Find gifts for everyone",
    footerLabel: "Discover more for Holiday ›",
    footerParams: { product_name: "holiday gifts" },
    tiles: [
      { label: "For her", image: "https://via.placeholder.com/200x140?text=For+Her", params: { product_name: "women fashion" } },
      { label: "For him", image: "https://via.placeholder.com/200x140?text=For+Him", params: { product_name: "mens fashion" } },
      { label: "For kids", image: "https://via.placeholder.com/200x140?text=For+Kids", params: { product_name: "kids gifts" } },
      { label: "For teens", image: "https://via.placeholder.com/200x140?text=For+Teens", params: { product_name: "teen gifts" } },
    ],
  },
  {
    id: "holiday-collections",
    title: "Shop holiday collections",
    footerLabel: "Find Holiday Gifts for all",
    footerParams: { product_name: "holiday collections" },
    tiles: [
      { label: "New arrivals", image: "https://via.placeholder.com/200x140?text=Arrivals", params: { product_name: "new arrivals" } },
      { label: "White elephant", image: "https://via.placeholder.com/200x140?text=White+Elephant", params: { product_name: "white elephant" } },
      { label: "Premium picks", image: "https://via.placeholder.com/200x140?text=Premium", params: { product_name: "premium gifts" } },
      { label: "Trending gifts", image: "https://via.placeholder.com/200x140?text=Trending", params: { product_name: "trending gifts" } },
    ],
  },
  {
    id: "gift-price",
    title: "Shop gifts by price",
    footerLabel: "Discover more for Holiday",
    footerParams: { product_name: "deals" },
    tiles: [
      { label: "Under ₹1,000", image: "https://via.placeholder.com/200x140?text=Under+1000", params: { product_name: "budget gifts", max_price: 1000 } },
      { label: "Under ₹2,000", image: "https://via.placeholder.com/200x140?text=Under+2000", params: { max_price: 2000 } },
      { label: "Under ₹5,000", image: "https://via.placeholder.com/200x140?text=Under+5000", params: { max_price: 5000 } },
      { label: "Deals", image: "https://via.placeholder.com/200x140?text=Deals", params: { product_name: "deals" } },
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
    const id = setInterval(goNextHero, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const fp = await getFeaturedProducts(1);
        setFeaturedProducts(Array.isArray(fp?.results) ? fp.results : []);
      } catch (err) {
        console.error("featured load", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const products = await getMostSoldProducts();
        setMostSoldProducts(products || []);
        const imgs = (products || [])
          .map((p) => p?.product_variations?.[0]?.product_images?.[0]?.product_image)
          .filter(Boolean);
        setBestSellerImages(imgs);
      } catch (err) {
        console.error("most sold load", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const sc = await getSaleCategories();
        setSaleCategories(Array.isArray(sc) ? sc : []);
      } catch (err) {
        console.error("sale categories load", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const all = await getAllProducts(1);
        setHistoryProducts(Array.isArray(all?.results) ? all.results : []);
      } catch (err) {
        console.error("history products load", err);
      }
    })();
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
          { label: "Toys", img: "https://via.placeholder.com/200x140?text=Toys", params: { category: "toys" } },
          { label: "Home & kitchen", img: "https://via.placeholder.com/200x140?text=Home+%26+Kitchen", params: { category: "home-kitchen" } },
          { label: "Electronics", img: "https://via.placeholder.com/200x140?text=Electronics", params: { category: "electronics" } },
          { label: "Sports & outdoors", img: "https://via.placeholder.com/200x140?text=Sports+%26+Outdoors", params: { category: "sports-fitness" } },
        ],
      },
    ],
    [featuredProducts, mostSoldProducts]
  );

  const saleCards = useMemo(
    () =>
      saleCategories.map((cat, idx) => ({
        id: cat.id || idx,
        title: cat.category_name,
        description: cat.description,
        image: cat.category_image,
        params: { product_name: cat.category_name },
      })),
    [saleCategories]
  );

  const historyCards = useMemo(
    () => (historyProducts || []).slice(0, 8),
    [historyProducts]
  );

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
                src="https://via.placeholder.com/320x200?text=Luna+Gaming"
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
                    const img =
                      variation?.product_images?.[0]?.product_image ||
                      "https://via.placeholder.com/200x140?text=Loading";
                    const name = p?.product_name || "Loading…";
                    const price =
                      variation?.get_discounted_price || variation?.product_price || "";
                    const slug = p?.slug || "#";

                    return (
                      <div className="merchTile" key={p?.id || idx}>
                        <a className="merchTile-imgWrap" href={`/product/${p?.id ?? slug}`}>
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
            ? bestSellerImages
            : ["https://via.placeholder.com/240x180?text=Loading"]
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
              const img =
                variation?.product_images?.[0]?.product_image ||
                "https://via.placeholder.com/200x140?text=Loading";
              const price =
                variation?.get_discounted_price || variation?.product_price || "";
              const name = product?.product_name || "Loading…";
              const slug = product?.slug || `history-${idx}`;

              return (
                <a className="historyCard" key={slug} href={`/product/${slug}`}>
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
              <img
                src="/img/movember-card.png"
                alt="Movember"
                style={{ maxWidth: "100%", maxHeight: "120px", objectFit: "contain" }}
              />
            ),
          },
          {
            title: "Save 5% with Subscribe & Save",
            sponsored: true,
            children: (
              <img
                src="/img/subscribe-save.png"
                alt="Subscribe & Save"
                style={{ maxWidth: "100%", maxHeight: "120px", objectFit: "contain" }}
              />
            ),
          },
          {
            title: "Shop holiday activities",
            sponsored: false,
            children: (
              <img
                src="/img/holiday-activities.png"
                alt="Holiday activities"
                style={{ maxWidth: "100%", maxHeight: "120px", objectFit: "contain" }}
              />
            ),
          },
          {
            title: "Save more on deals",
            sponsored: false,
            children: (
              <img
                src="/img/save-more-deals.png"
                alt="Deals"
                style={{ maxWidth: "100%", maxHeight: "120px", objectFit: "contain" }}
              />
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