import React, { useEffect, useState } from "react";
import "./Home.css";
import CategoryCarousel from "../CategoryCarousel/CategoryCarousel";
import SectionHeaderWithSponsored from "../SectionHeaderWithSponsored/SectionHeaderWithSponsored";
import SectionWrapper from "../SectionWrapper/SectionWrapper";
import BestSellersStrip from "../BestSellersStrip/BestSellersStrip";
import PromoGridRow from "../PromoGridRow/PromoGridRow";
import RecommendationPrompt from "../RecommendationPrompt/RecommendationPrompt";
import Footer from "../Footer/Footer";
import { getFeaturedProducts } from "../../api/products/FeaturedProductService";
import { getMostSoldProducts } from "../../api/products/MostSoldProductService";
import { getSaleCategories } from "../../api/products/SaleCategoryService";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [mostSoldProducts, setMostSoldProducts] = useState([]);
  const [bestSellerImages, setBestSellerImages] = useState([]);
  const [saleCategories, setSaleCategories] = useState([]);
  // ---- HERO CAROUSEL STATE ----
  const heroSlides = [
    {
      headline: "Fast, free shipping plus streaming",
      sub: "Join Prime",
      ctaInfo: "Terms apply.",
      image: "/images/banner/Banner_1.webp",
    },
    {
      headline: "Shop holiday collections",
      sub: "New arrivals · White elephant",
      ctaInfo: "Explore holiday deals",
      image: "/images/banner/Banner_2.webp",
    },
    {
      headline: "Buy again from your past items",
      sub: "Handpicked for you",
      ctaInfo: "See recommendations",
      image: "https://t3.ftcdn.net/jpg/04/65/46/52/360_F_465465254_1pN9MGrA831idD6zIBL7q8rnZZpUCQTy.jpg",
    },
  ];
  const [heroIndex, setHeroIndex] = useState(0);
  const goPrevHero = () => setHeroIndex((i) => (i - 1 + heroSlides.length) % heroSlides.length);
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
      } catch {}
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
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const sc = await getSaleCategories();
        setSaleCategories(Array.isArray(sc) ? sc : []);
      } catch {}
    })();
  }, []);

  return (
    <div className="homePage">
      {/* HERO / TOP BANNER */}
      <section className="homePage-heroArea">
  {/* left arrow */}
  <button
    className="homePage-heroArrow homePage-heroArrow--left"
    aria-label="Previous"
    onClick={goPrevHero}
  >
    ‹
  </button>

  {/* content wrapper */}
  <div className="homePage-heroBanner">
    <div className="homePage-heroInner">
      {/* LEFT COPY */}
      <div className="homePage-heroCopy">
        <div className="homePage-heroHeadline">
          {heroSlides[heroIndex].headline}
        </div>

        <div className="homePage-heroSub">{heroSlides[heroIndex].sub}</div>

        <div className="homePage-heroCTAInfo">
          {heroSlides[heroIndex].ctaInfo}
        </div>
      </div>

      {/* RIGHT PROMO CARD */}
      <div className="homePage-heroPromoWrapper">
        <div
          className="homePage-heroPromoCard"
          style={{
            backgroundImage: `url(${heroSlides[heroIndex].image})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
      </div>
    </div>
  </div>

  {/* right arrow */}
  <button
    className="homePage-heroArrow homePage-heroArrow--right"
    aria-label="Next"
    onClick={goNextHero}
  >
    ›
  </button>
</section>

      {/* MAIN CONTENT GRID UNDER HERO */}
      <section className="homePage-contentRow ">
        {/* COLUMN 1: Featured Products */}
        <div className="merchCard mt-5">
          <div className="merchCard-header">Featured Products</div>

          <div className="merchCard-grid">
            {(featuredProducts.length ? featuredProducts : [null, null, null, null]).map((p, idx) => {
              const v = p?.product_variations?.[0];
              const img = v?.product_images?.[0]?.product_image || "https://via.placeholder.com/200x140?text=Loading";
              const name = p?.product_name || "Loading…";
              const price = v?.get_discounted_price || v?.product_price || "";
              const slug = p?.slug || "#";
              return (
                <div className="merchTile" key={p?.id || idx}>
                  <a className="merchTile-imgWrap" href={`/product/${p?.id ?? slug}`}>
                    <img
                      src={img}
                      alt={name}
                      className="merchTile-img"
                    />
                  </a>
                  <div className="merchTile-label" title={name}>
                    {name.length > 26 ? name.slice(0, 24) + "…" : name}
                  </div>
                  {price !== "" && (
                    <div className="merchTile-price">₹{price}</div>
                  )}
                </div>
              );
            })}
          </div>

          <a className="merchCard-footerLink" href="#">
            Browse featured ›
          </a>
        </div>

        {/* COLUMN 2: Most Sold Products */}
        <div className="merchCard">
          <div className="merchCard-header">Most Sold Products</div>

          <div className="merchCard-grid">
            {(mostSoldProducts.length ? mostSoldProducts : [null, null, null, null]).map((p, idx) => {
              const v = p?.product_variations?.[0];
              const img = v?.product_images?.[0]?.product_image || "https://via.placeholder.com/200x140?text=Loading";
              const name = p?.product_name || "Loading…";
              const price = v?.get_discounted_price || v?.product_price || "";
              const slug = p?.slug || "#";
              return (
                <div className="merchTile" key={p?.id || idx}>
                  <a className="merchTile-imgWrap" href={`/product/${p?.id ?? slug}`}>
                    <img
                      src={img}
                      alt={name}
                      className="merchTile-img"
                    />
                  </a>
                  <div className="merchTile-label" title={name}>
                    {name.length > 26 ? name.slice(0, 24) + "…" : name}
                  </div>
                  {price !== "" && (
                    <div className="merchTile-price">₹{price}</div>
                  )}
                </div>
              );
            })}
          </div>

          <a className="merchCard-footerLink" href="#">
            See more top sellers ›
          </a>
        </div>

        {/* COLUMN 3: Shop gifts by category */}
        <div className="merchCard">
          <div className="merchCard-header">Shop gifts by category</div>

          <div className="merchCard-grid">
            {[
              { label: "Toys", img: "https://via.placeholder.com/200x140?text=Toys", href: "/products?category=electronics&label=Toys" },
              { label: "Home & kitchen", img: "https://via.placeholder.com/200x140?text=Home+%26+Kitchen", href: "/products?category=home-kitchen&label=Home%20%26%20kitchen" },
              { label: "Electronics", img: "https://via.placeholder.com/200x140?text=Electronics", href: "/products?category=electronics&label=Electronics" },
              { label: "Sports & outdoors", img: "https://via.placeholder.com/200x140?text=Sports+%26+Outdoors", href: "/products?category=sports-fitness&label=Sports%20%26%20outdoors" },
            ].map((t, idx) => (
              <div className="merchTile" key={idx}>
                <a className="merchTile-imgWrap" href={t.href}>
                  <img
                    src={t.img}
                    alt={t.label}
                    className="merchTile-img"
                  />
                </a>
                <div className="merchTile-label">{t.label}</div>
              </div>
            ))}
          </div>

          <a className="merchCard-footerLink" href="#">
            Discover more for Holiday ›
          </a>
        </div>

        <div className="sideRail">
          {/* Card: Our Top 100+ Christmas decor */}
          <div className="merchCard merchCard--compact">
            <div className="merchCard-header">Our Top 100+ Christmas decor</div>
            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/320x180?text=Christmas+Decor"
                  alt="Christmas decor"
                  className="merchTile-img"
                />
              </div>
            </div>
            <a className="merchCard-footerLink" href="#">
              Shop all
            </a>
          </div>
          <div className="merchCard merchCard--compact">
            <div className="merchCard-header">Our Top 100+ Christmas decor</div>
            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/320x180?text=Christmas+Decor"
                  alt="Christmas decor"
                  className="merchTile-img"
                />
              </div>
            </div>
            <a className="merchCard-footerLink" href="#">
              Shop all
            </a>
          </div>

          {/* Amazon Business Ad card (sponsored) */}
         
        </div>

      </section>

    {/* 1. Sale categories carousel */}
<SectionWrapper>
  <SectionHeaderWithSponsored
    title="Sale Categories"
    sponsored={true}
  />
  <CategoryCarousel
    items={
      saleCategories.length
        ? saleCategories.map(c => {
            const name = c.category_name || "";
            let categorySlug = "";
            if (/electronics/i.test(name)) categorySlug = "electronics";
            else if (/home/i.test(name)) categorySlug = "home-kitchen";
            else if (/fashion/i.test(name)) categorySlug = "mens-fashion";
            else if (/footwear/i.test(name)) categorySlug = "mens-fashion";
            const href = categorySlug
              ? `/products?category=${encodeURIComponent(categorySlug)}&label=${encodeURIComponent(name)}`
              : undefined;
            return {
              img: c.category_image,
              label: name,
              href
            };
          })
        : [
            { img: "https://via.placeholder.com/120?text=Loading", label: "Loading" },
            { img: "https://via.placeholder.com/120?text=…", label: "…" },
            { img: "https://via.placeholder.com/120?text=…", label: "…" },
            { img: "https://via.placeholder.com/120?text=…", label: "…" },
          ]
    }
  />
</SectionWrapper>

{/* 2. Best Sellers strip */}
<BestSellersStrip
  title="Best Sellers in Computers & Accessories"
  items={
    bestSellerImages.length
      ? bestSellerImages
      : ["https://via.placeholder.com/240x180?text=Loading"]
  }
/>

{/* 3. Promo grid row */}
<PromoGridRow
  cards={[
    {
      title: "Support Movember",
      sponsored: false,
      children: (
        <img
          src="/img/movember-card.png"
          alt="Movember"
          style={{
            maxWidth: "100%",
            maxHeight: "120px",
            objectFit: "contain",
          }}
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
          style={{
            maxWidth: "100%",
            maxHeight: "120px",
            objectFit: "contain",
          }}
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
          style={{
            maxWidth: "100%",
            maxHeight: "120px",
            objectFit: "contain",
          }}
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
          style={{
            maxWidth: "100%",
            maxHeight: "120px",
            objectFit: "contain",
          }}
        />
      ),
    },
  ]}
/>
      <RecommendationPrompt isLoggedIn={false} />
      <Footer />

    </div>
  );
}

export default Home;