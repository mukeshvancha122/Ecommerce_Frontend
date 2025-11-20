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
  >
    ‹
  </button>

  {/* content wrapper */}
  <div className="homePage-heroBanner">
    <div className="homePage-heroInner">
      {/* LEFT COPY */}
      <div className="homePage-heroCopy">
        <div className="homePage-heroHeadline">
          Unlock Alexa+ with our new AI-powered devices
        </div>

        <div className="homePage-heroSub">alexa+</div>

        <div className="homePage-heroCTAInfo">
          1 order lowers fees for next delivery
        </div>
      </div>

      {/* RIGHT PROMO CARD */}
      <div className="homePage-heroPromoWrapper">
        <div className="homePage-heroPromoCard" />
      </div>
    </div>
  </div>

  {/* right arrow */}
  <button
    className="homePage-heroArrow homePage-heroArrow--right"
    aria-label="Next"
  >
    ›
  </button>
</section>

      {/* MAIN CONTENT GRID UNDER HERO */}
      <section className="homePage-contentRow">
        {/* COLUMN 1: Featured Products */}
        <div className="merchCard">
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
                  <a className="merchTile-imgWrap" href={`/product/${slug}`}>
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
                  <a className="merchTile-imgWrap" href={`/product/${slug}`}>
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
            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=Toys"
                  alt="Toys"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">Toys</div>
            </div>

            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=Home+%26+Kitchen"
                  alt="Home & kitchen"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">Home &amp; kitchen</div>
            </div>

            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=Electronics"
                  alt="Electronics"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">Electronics</div>
            </div>

            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=Sports+%26+Outdoors"
                  alt="Sports & Outdoors"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">Sports &amp; outdoors</div>
            </div>
          </div>

          <a className="merchCard-footerLink" href="#">
            Discover more for Holiday ›
          </a>
        </div>

        <div className="sideRail">
  {/* Sign-in promo card */}
  <div className="signInCard">
    <div className="signInCard-heading">
      Sign in for the best experience
    </div>
    <button className="signInCard-btnFullWidth">
      Sign in securely
    </button>
  </div>

  {/* Fidelity Ad card */}
  <div className="adCardBox">
    <div className="adCard-body">
      <div className="adCard-left">
        <div className="adCard-headline">Fidelity Go®</div>

        <div className="adCard-title">
          Invest your money. Not your time.
        </div>

        <div className="adCard-desc">
          No advisory fees under $25K.
        </div>

        <button className="adCard-ctaBtn">Get started</button>

        <div className="adCard-legal">
          Fidelity Brokerage Services LLC, Member NYSE, SIPC
        </div>
      </div>

      <div className="adCard-right">
        <div className="adCard-imagePlaceholder" />
      </div>
    </div>

    <div className="adCard-footerRow">
      <span className="adCard-sponsoredText">Sponsored • i</span>
    </div>
  </div>
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
        ? saleCategories.map(c => ({
            img: c.category_image,
            label: c.category_name,
          }))
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