import React from "react";
import "./Home.css";
import CategoryCarousel from "../CategoryCarousel/CategoryCarousel";
import SectionHeaderWithSponsored from "../SectionHeaderWithSponsored/SectionHeaderWithSponsored";
import SectionWrapper from "../SectionWrapper/SectionWrapper";
import BestSellersStrip from "../BestSellersStrip/BestSellersStrip";
import PromoGridRow from "../PromoGridRow/PromoGridRow";
import RecommendationPrompt from "../RecommendationPrompt/RecommendationPrompt";
import Footer from "../Footer/Footer";

function Home() {
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
        {/* COLUMN 1: Shop gifts by price */}
        <div className="merchCard">
          <div className="merchCard-header">Shop gifts by price</div>

          <div className="merchCard-grid">
            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=Under+%2410"
                  alt="Under $10"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">Under $10</div>
            </div>

            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=Under+%2425"
                  alt="Under $25"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">Under $25</div>
            </div>

            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=Under+%2450"
                  alt="Under $50"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">Under $50</div>
            </div>

            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=Deals"
                  alt="Deals"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">Deals</div>
            </div>
          </div>

          <a className="merchCard-footerLink" href="#">
            Discover more for Holiday ›
          </a>
        </div>

        {/* COLUMN 2: Find gifts for everyone */}
        <div className="merchCard">
          <div className="merchCard-header">Find gifts for everyone</div>

          <div className="merchCard-grid">
            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=For+her"
                  alt="For her"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">For her</div>
            </div>

            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=For+him"
                  alt="For him"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">For him</div>
            </div>

            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=For+kids"
                  alt="For kids"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">For kids</div>
            </div>

            <div className="merchTile">
              <div className="merchTile-imgWrap">
                <img
                  src="https://via.placeholder.com/200x140?text=For+teens"
                  alt="For teens"
                  className="merchTile-img"
                />
              </div>
              <div className="merchTile-label">For teens</div>
            </div>
          </div>

          <a className="merchCard-footerLink" href="#">
            Discover more for Holiday ›
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

    {/* 1. Category / Christmas carousel */}
<SectionWrapper>
  <SectionHeaderWithSponsored
    title="Here comes Christmas!"
    sponsored={true}
  />
  <CategoryCarousel
    items={[
      { img: "/img/pillow.png", label: "Festive deals" },
      { img: "/img/stocking.png", label: "The Holiday Shop" },
      { img: "/img/tree.png", label: "Decor" },
      { img: "/img/reindeer-board.png", label: "Hosting essentials" },
      { img: "/img/red-top.png", label: "Festive looks" },
      { img: "/img/games.png", label: "Holiday activities" },
      { img: "/img/wrap.png", label: "Gift wrap" },
    ]}
  />
</SectionWrapper>

{/* 2. Best Sellers strip */}
<BestSellersStrip
  title="Best Sellers in Computers & Accessories"
  items={[
    "/img/ipad-bundle.png",
    "/img/charger.png",
    "/img/case.png",
    "/img/pencil.png",
    "/img/power.png",
    "/img/bag.png",
    "/img/protector.png",
  ]}
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